import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/db/dexie'
import { ProjectZ } from '@/schemas/project.schema'
import type { Project } from '@/types/project'
import type { GraphNode } from '@/types/graphNode'
import type { GraphEdge } from '@/types/graphEdge'
import { sampleNodes } from '@/data/sampleNodes'

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
      resources: node.data?.resources ?? [],
      label: node.data?.label ?? node.name ?? 'Smart'
    }
  }
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    current: createEmptyProject(),
    projectLoaded: false,
    flowResults: [] as {
      target: string
      resourceId: string
      valid: boolean
      message: string
    }[],
    balanceMap: [] as {
      nodeId: string
      resourceId: string
      supplied: number
      required: number
    }[]
  }),

  getters: {
    nodes: (s) => s.current.nodes,
    edges: (s) => s.current.edges,
    units: (s) => s.current.units,
    resources: (s) => s.current.resources,
    nodeById: (s) => (id: string) => s.current.nodes.find((n) => n.id === id),
  },

  actions: {
    async load(id: string) {
      const p = await db.projects.get(id)
      console.log('Fetched from Dexie:', p)
      if (!p) throw new Error('Project not found')

      const normalized = {
        ...p,
        nodes: (p.nodes ?? []).map(normalizeToSmartNode)
      }

      const parsed = ProjectZ.parse(normalized)
      this.current = parsed
      this.projectLoaded = true
    },

    async save() {
      if (!this.current) return
      const raw = toRaw(this.current)
      const next: Project =
        typeof structuredClone === 'function'
          ? structuredClone(raw)
          : JSON.parse(JSON.stringify(raw))
      next.updatedAt = new Date().toISOString()
      ProjectZ.parse(next)
      await db.projects.put(next)
      this.current = next
    },

    upsertNode(node: GraphNode) {
      const i = this.current.nodes.findIndex((n) => n.id === node.id)
      if (i === -1) this.current.nodes.push(node)
      else Object.assign(this.current.nodes[i], node)
    },

    removeNode(id: string) {
      this.current.nodes = this.current.nodes.filter((n) => n.id !== id)
      this.current.edges = this.current.edges.filter((e) => e.source !== id && e.target !== id)
    },

    upsertEdge(edge: GraphEdge) {
      const i = this.current.edges.findIndex((e) => e.id === edge.id)
      if (i === -1) this.current.edges.push(edge)
      else Object.assign(this.current.edges[i], edge)
    },

    removeEdge(id: string) {
      this.current.edges = this.current.edges.filter((e) => e.id !== id)
    },

    injectNodes(newNodes: GraphNode[]) {
      console.log('🔍 Raw injected nodes:', newNodes)

      const normalizedNodes = newNodes.map(normalizeToSmartNode)
      console.log('🧠 Normalized nodes:', JSON.stringify(normalizedNodes, null, 2))

      this.current.nodes = normalizedNodes
      this.current.edges = []

      const allResources = normalizedNodes.flatMap(n => n.data?.resources ?? [])
      const uniqueResources = Array.from(new Map(allResources.map(r => [r.id, r])).values())
      console.log('📦 Extracted resources:', uniqueResources)

      this.current.resources = uniqueResources
      this.current.units = [] // Add unit extraction logic if needed

      this.projectLoaded = true
      console.log('✅ Project loaded with', normalizedNodes.length, 'nodes')
    },

    clearNodes() {
      this.current.nodes = []
      this.current.edges = []
      this.current.resources = []
      this.current.units = []
      this.projectLoaded = false
    },

    injectTestEdge(resourceId: string = 'water') {
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

      this.upsertNode(testNode)

      const edgeExists = this.current.edges.some(e => e.id === 'edge-test')
      if (!edgeExists) {
        this.upsertEdge({
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
    },

    validateResourceFlow() {
      const results = []
      const balanceMap = []

      for (const node of this.current.nodes) {
        if (node.mode === 'consumer' || node.mode === 'transformer') {
          const inputs = node.inputs ?? []
          const messages = []

          for (const input of inputs) {
            const matchingEdges = this.current.edges.filter(e =>
              e.target === node.id &&
              e.resourceId === input.resourceId &&
              e.enabled
            )

            const totalSupplied = matchingEdges.length * input.perCycle
            const valid = totalSupplied >= input.perCycle

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
              required: input.perCycle
            })
          }

          if (!node.data) node.data = {}
          node.data.statusMessages = messages
          node.data.statusColor = messages.every(m => m.startsWith('✅')) ? '#4caf50' : '#f44336'
        }
      }

      this.flowResults = results
      this.balanceMap = balanceMap
    }
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