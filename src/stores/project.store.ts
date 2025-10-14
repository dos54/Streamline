import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/db/dexie'
import { ProjectZ } from '@/schemas/project.schema'
import type { Project } from '@/types/project'
import type { GraphNode } from '@/types/graphNode'
import type { GraphEdge } from '@/types/graphEdge'

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
        tolerance: 0.01,
      },
      ui: {
        snapToGrid: true,
        gridSize: 20,
        minimap: true,
      },
    },
    nodes: [],
    edges: [],
    resources: [],
    units: [],
  }
}

// 🧠 Normalize legacy node types into SmartNode format
function normalizeToSmartNode(node: GraphNode): GraphNode {
  const modeMap: Record<string, 'producer' | 'consumer' | 'transformer'> = {
    producer: 'producer',
    consumer: 'consumer',
    source: 'producer',
    sink: 'consumer',
    machine: 'transformer',
  }

  const mode = modeMap[node.type] ?? 'transformer'

  return {
    id: node.id,
    type: 'producer',
    mode,
    name: node.name ?? 'Smart Node',
    enabled: node.enabled ?? true,
    position: node.position ?? { x: 0, y: 0 },
    count: node.count ?? 1,
    cycleTime: node.cycleTime ?? 1,
    inputs: node.inputs ?? [],
    outputs: node.outputs ?? [],
    tags: node.tags ?? [],
    ui: node.ui ?? {},
    templateId: node.templateId ?? undefined,
    data: {
      resources: node.data?.resources ?? [],
    },
  }
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    current: createEmptyProject(),
    projectLoaded: false,
  }),

  getters: {
    nodes: (s) => s.current.nodes,
    edges: (s) => s.current.edges,
    units: (s) => s.current.units,
    resources: (s) => s.current.resources,
    nodeById: (s) => (id: string) => s.current.nodes.find((n) => n.id === id),
  },

  actions: {
    async ensureExists(projectId: string) {
      // fast path: load if present
      const existing = await db.projects.get(projectId)
      if (existing) {
        const normalized: Project = {
          ...existing,
          nodes: (existing.nodes ?? []).map((n) => normalizeToSmartNode(n)),
        }
        const parsed = ProjectZ.parse(normalized)
        this.current = parsed
        this.projectLoaded = true
        return parsed
      }

      const created: Project = { ...createEmptyProject(), id: projectId }
      ProjectZ.parse(created)

      try {
        await db.projects.add(created)
      } catch (e) {
        const loaded = await db.projects.get(projectId)
        if (loaded) {
          const normalized: Project = {
            ...loaded,
            nodes: (loaded.nodes ?? []).map((n) => normalizeToSmartNode(n)),
          }
          const parsed = ProjectZ.parse(normalized)
          this.current = parsed
          this.projectLoaded = true
          return parsed
        }
        throw e
      }

      const saved = await db.projects.get(projectId)
      const parsed = ProjectZ.parse(saved as Project)
      this.current = parsed
      this.projectLoaded = true
      return parsed
    },

    async load(id: string) {
      const p = await db.projects.get(id)
      if (!p) throw new Error('Project not found')

      const normalized = { ...p, nodes: (p.nodes ?? []).map(normalizeToSmartNode) }
      const parsed = ProjectZ.parse(normalized)

      this.current = parsed
      this.projectLoaded = true
    },

    async save() {
      if (!this.projectLoaded) return this.current
      try {
        const raw = toRaw(this.current)
        const next: Project =
          typeof structuredClone === 'function'
            ? structuredClone(raw)
            : JSON.parse(JSON.stringify(raw))
        next.updatedAt = new Date().toISOString()
        ProjectZ.parse(next)
        const pk = await db.projects.put(next)
        const saved = await db.projects.get(next.id)

        this.current = saved ?? next

        console.info('Dexie put:', {
          pk,
          id: next.id,
          nodes: saved?.nodes.length,
          edges: saved?.edges.length,
        })
        return saved
      } catch (e) {
        console.error('save() failed', e)
        throw e
      }
    },

    async upsertNode(node: GraphNode) {
      const i = this.current.nodes.findIndex((n) => n.id === node.id)
      if (i === -1) this.current.nodes.push(node)
      else Object.assign(this.current.nodes[i], node)

      // keep resource catalog in sync
      const resources = node.data?.resources ?? []
      const map = new Map(this.current.resources.map((r) => [r.id, r]))
      for (const r of resources) map.set(r.id, r)
      this.current.resources = Array.from(map.values())

      await this.save()
    },

    async removeNode(id: string) {
      this.current.nodes = this.current.nodes.filter((n) => n.id !== id)
      this.current.edges = this.current.edges.filter((e) => e.source !== id && e.target !== id)
      await this.save()
    },

    async upsertEdge(edge: GraphEdge) {
      const i = this.current.edges.findIndex((e) => e.id === edge.id)
      if (i === -1) this.current.edges.push(edge)
      else Object.assign(this.current.edges[i], edge)
      await this.save()
    },

    async removeEdge(id: string) {
      this.current.edges = this.current.edges.filter((e) => e.id !== id)
      await this.save()
    },

    async upsertUnit(unit: Project['units'][number]) {
      const i = this.current.units.findIndex((u) => u.id === unit.id)
      if (i === -1) this.current.units.push(unit)
      else Object.assign(this.current.units[i], unit)
      await this.save()
    },

    async upsertResource(resource: Project['resources'][number]) {
      const i = this.current.resources.findIndex((r) => r.id === resource.id)
      if (i === -1) this.current.resources.push(resource)
      else Object.assign(this.current.resources[i], resource)
      await this.save()
    },

    async injectNodes(newNodes: GraphNode[]) {
      const normalizedNodes = newNodes.map(normalizeToSmartNode)
      this.current.nodes = normalizedNodes
      this.current.edges = []

      const allResources = normalizedNodes.flatMap((n) => n.data?.resources ?? [])
      const uniq = Array.from(new Map(allResources.map((r) => [r.id, r])).values())
      this.current.resources = uniq
      this.current.units = []

      this.projectLoaded = true
      await this.save()
    },

    async clearNodes() {
      this.current.nodes = []
      this.current.edges = []
      this.current.resources = []
      this.current.units = []
      this.projectLoaded = false
      await this.save()
    },

    async updateNodePosition(id: string, position: { x: number; y: number }) {
      const n = this.current.nodes.find((node) => node.id === id)
      if (!n) {
        console.info('Attempt to move nonexistent node')
        return
      }
      n.position = position
      console.info('Updating node position:', id)
      await this.save()
    },
  },
})
