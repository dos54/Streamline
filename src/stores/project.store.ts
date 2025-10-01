import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/db/dexie'
import { ProjectZ } from '@/schemas/project.schema'
import type { Project } from '@/types/project'
import type { GraphNode } from '@/types/graphNode'
import type { GraphEdge } from '@/types/graphEdge'

function createEmptyProject(): Project {
  return {
    nodes: [],
    edges: [],
    resources: [],
    units: [],
    createdAt: new Date().toISOString(),
    schemaVersion: '1.0'
  }
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    current: createEmptyProject(),
    projectLoaded: false
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
      const parsed = ProjectZ.parse(p)
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
      this.current.nodes = newNodes
      this.current.edges = []

      const allResources = newNodes.flatMap(n => n.data?.resources ?? [])
      const uniqueResources = Array.from(new Map(allResources.map(r => [r.id, r])).values())

      this.current.resources = uniqueResources
      this.current.units = [] // Add unit extraction logic if needed

      this.projectLoaded = true
    },

    clearNodes() {
      this.current.nodes = []
      this.current.edges = []
      this.current.resources = []
      this.current.units = []
      this.projectLoaded = false
    },
  },
})
