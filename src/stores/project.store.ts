import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/db/dexie'
import { ProjectZ } from '@/schemas/project.schema'
import type { Project } from '@/types/project'
import type { GraphNode } from '@/types/graphNode'
import type { GraphEdge } from '@/types/graphEdge'
import { sampleNodes } from '@/data/sampleNodes'
import { reactive, toRefs, computed } from 'vue'

export type ProjectStore = ReturnType<typeof useProjectStore>




// ✅ Store state type for proper inference
type ProjectState = {
  current: Project
  projectLoaded: boolean
  flowResults: {
    target: string
    resourceId: string
    valid: boolean
    message: string
  }[]
  balanceMap: {
    nodeId: string
    resourceId: string
    supplied: number
    required: number
  }[]
}

// ✅ Port types aligned with GraphNodeZ schema
type InputPort = {
  resourceId: string
  unitId: string
  perCycle: number
}

type OutputPort = {
  id: string
  resourceId: string
  unitId: string
  perCycle: number
}

// 🧠 Normalize legacy node types into SmartNode format
export function normalizeToSmartNode(node: any): GraphNode {
  const modeMap: Record<string, 'producer' | 'consumer' | 'transformer'> = {
    producer: 'producer',
    consumer: 'consumer',
    source: 'producer',
    sink: 'consumer',
    machine: 'transformer'
  }

  const mode = modeMap[node.type] ?? 'transformer'

  const normalizedInputs: InputPort[] = (node.data?.inputs ?? node.inputs ?? []).map((i: any) => ({
    resourceId: i.resourceId,
    unitId: i.unitId,
    perCycle: i.perCycle
  }))

  const normalizedOutputs: OutputPort[] = (node.data?.outputs ?? node.outputs ?? []).map((o: any, i: number) => ({
    id: o.id ?? `output-${i}-${crypto.randomUUID()}`,
    resourceId: o.resourceId,
    unitId: o.unitId,
    perCycle: o.perCycle
  }))

  return {
    id: node.id,
    type: node.type ?? 'smart',
    mode,
    name: node.data?.label ?? node.name ?? 'Smart Node',
    enabled: node.enabled ?? true,
    position: node.position ?? { x: 0, y: 0 },
    count: node.count ?? 1,
    cycleTime: node.data?.cycleTime ?? node.cycleTime ?? 1,
    inputs: normalizedInputs,
    outputs: normalizedOutputs,
    tags: node.tags ?? [],
    ui: node.ui ?? {},
    templateId: node.templateId ?? undefined,
    data: {
      ...node.data,
      resources: node.data?.resources ?? [],
      label: node.data?.label ?? node.name ?? 'Smart'
    }
  }
}

// ✅ Generic form of defineStore with ProjectState
export const useProjectStore = defineStore('project', () => {

  const state = reactive<ProjectState>({
    current: createEmptyProject(),
    projectLoaded: false,
    flowResults: [],
    balanceMap: []
  })

  const nodes = computed(() => state.current.nodes)
  const edges = computed(() => state.current.edges)
  const units = computed(() => state.current.units)
  const resources = computed(() => state.current.resources)
  const nodeById = (id: string) => state.current.nodes.find((n) => n.id === id)

  // ✅ All actions are now directly inside the return object
  async function load(id: string) {
    const p = await db.projects.get(id)
    console.log('Fetched from Dexie:', p)
    if (!p) throw new Error('Project not found')

    const normalized = {
      ...p,
      nodes: (p.nodes ?? []).map(normalizeToSmartNode)
    }

    const parsed = ProjectZ.parse(normalized)
    state.current = parsed
    state.projectLoaded = true
  }

  async function save() {
    if (!state.current) return
    const raw = toRaw(state.current)
    const next: Project =
      typeof structuredClone === 'function'
        ? structuredClone(raw)
        : JSON.parse(JSON.stringify(raw))
    next.updatedAt = new Date().toISOString()
    ProjectZ.parse(next)
    await db.projects.put(next)
    state.current = next
  }

  function injectNodes(newNodes: GraphNode[]) {
    console.log('🔍 Raw injected nodes:', newNodes)

    const normalizedNodes = newNodes.map(normalizeToSmartNode)
    console.log('🧠 Normalized nodes:', JSON.stringify(normalizedNodes, null, 2))

    state.current.nodes = normalizedNodes

    const allResources = normalizedNodes.flatMap(n => n.data?.resources ?? [])
    const uniqueResources = Array.from(new Map(allResources.map(r => [r.id, r])).values())
    console.log('📦 Extracted resources:', uniqueResources)

    state.current.resources = uniqueResources
    state.current.units = [] // Add unit extraction logic if needed

    state.projectLoaded = true
    validateResourceFlow()

    console.log('✅ Project loaded with', normalizedNodes.length, 'nodes')
  }

  function injectEdges(newEdges: GraphEdge[]) {
    state.current.edges = newEdges
  }

  function upsertNode(node: GraphNode) {
    const i = state.current.nodes.findIndex((n) => n.id === node.id)
    if (i === -1) state.current.nodes.push(node)
    else Object.assign(state.current.nodes[i], node)
  }

  function removeNode(id: string) {
    state.current.nodes = state.current.nodes.filter((n) => n.id !== id)
    state.current.edges = state.current.edges.filter((e) => e.source !== id && e.target !== id)
  }

  function upsertEdge(edge: GraphEdge) {
  const labeledEdge = {
    ...edge,
    label: `${edge.resourceId} (${edge.unitId})`
  }

  const i = state.current.edges.findIndex((e) => e.id === edge.id)
  if (i === -1) state.current.edges.push(labeledEdge)
  else Object.assign(state.current.edges[i], labeledEdge)
}


  function removeEdge(id: string) {
    state.current.edges = state.current.edges.filter((e) => e.id !== id)
  }

  function clearNodes() {
    state.current.nodes = []
    state.current.edges = []
    state.current.resources = []
    state.current.units = []
    state.projectLoaded = false
  }

  function injectTestEdge(resourceId: string = 'water') {
    const input: InputPort = {
      resourceId,
      unitId: 'liters',
      perCycle: 5
    }

    const output: OutputPort = {
      id: 'output-0',
      resourceId,
      unitId: 'liters',
      perCycle: 5
    }

    const testNode: GraphNode = {
      id: 'test-node',
      type: 'smart',
      mode: 'transformer',
      name: 'Test Node',
      enabled: true,
      position: { x: 100, y: 100 },
      count: 1,
      cycleTime: 1,
      inputs: [input],
      outputs: [output],
      tags: [],
      ui: {},
      templateId: undefined,
      data: {
        resources: [{ id: resourceId, name: 'Water', defaultUnitId: 'liters' }]
      }
    }

    upsertNode(testNode)

    const edgeExists = state.current.edges.some(e => e.id === 'edge-test')
    if (!edgeExists) {
      upsertEdge({
        id: 'edge-test',
        source: 'test-node',
        target: 'test-node',
        sourceHandle: 'output-0',
        targetHandle: 'input-0',
        resourceId,
        enabled: true
      })
      console.log('🔗 Injected test edge for resource:', resourceId)
    } else {
      console.log('⚠️ Edge already exists, skipping injection')
    }
  }

  function validateResourceFlow() {
    const results = []
    const balanceMap = []
    console.log('🚦 Running validateResourceFlow...')

    for (const node of state.current.nodes) {
      if (node.mode === 'consumer' || node.mode === 'transformer') {
        const inputs = node.inputs ?? []
        const messages = []

        console.log('🔍 Validating node:', node.id, 'mode:', node.mode)

        for (const input of inputs) {
          const matchingEdges = state.current.edges.filter(e =>
            e.target === node.id &&
            e.resourceId === input.resourceId &&
            e.enabled
          )

          const totalSupplied = matchingEdges.length * (input.perCycle ?? 0)
          const valid = totalSupplied >= (input.perCycle ?? 0)

          messages.push(valid
            ? `✅ ${input.resourceId} is sufficiently supplied`
            : `⚠️ ${input.resourceId} is under-supplied`)

          results.push({
            target: node.id,
            resourceId: input.resourceId,
            valid,
            message: messages[messages.length - 1]
          })

          balanceMap.push({
            nodeId: node.id,
            resourceId: input.resourceId,
            supplied: totalSupplied,
            required: input.perCycle ?? 0
          })
        }

        if (!node.data) node.data = {}
        node.data.statusMessages = messages
        node.data.statusColor = messages.every(m => m.startsWith('✅')) ? '#4caf50' : '#f44336'
        node.data.statusTypes = messages.map(m =>
          m.includes('under') ? 'under:' + m.split(' ')[1] :
          m.includes('sufficiently') ? 'exact:' + m.split(' ')[1] :
          'missing:' + m.split(' ')[1]
        )

        console.log('✅ Final node data:', node.id, node.data)
      }
    }

    state.flowResults = results
    state.balanceMap = balanceMap
  }

  return {
    ...toRefs(state),
    nodes,
    edges,
    units,
    resources,
    nodeById,
    load,
    save,
    injectNodes,
    injectEdges,
    upsertNode,
    removeNode,
    upsertEdge,
    removeEdge,
    clearNodes,
    injectTestEdge,
    validateResourceFlow
  }
})


function createEmptyProject(): Project {
  return {
    id: 'new-project',
    name: 'Untitled Project',
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      baseTimeUnitId: 's',
      defaultRateDisplay: 'per_s',
      resourceDefaultUnits: {},
      balancing: {
        mode: 'per_cycle',
        targetTimeUnitId: 's',
        tolerance: 0.01
      },
      ui: {
        snapToGrid: true,
        gridSize: 20,
        minimap: true
      }
    },
    nodes: [],
    edges: [],
    resources: [],
    units: []
  }
}