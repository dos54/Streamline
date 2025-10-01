import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/db/dexie'
import { ProjectZ } from '@/schemas/project.schema'
import type { Project } from '@/types/project'
import type { GraphNode } from '@/types/graphNode'
import type { GraphEdge } from '@/types/graphEdge'

export const useProjectStore = defineStore('project', {
  state: () => ({ current: null as Project | null }),

  getters: {
    nodes: (s) => s.current?.nodes ?? [],
    edges: (s) => s.current?.edges ?? [],
    units: (s) => s.current?.units ?? [],
    resources: (s) => s.current?.resources ?? [],
    nodeById: (s) => (id: string) => s.current?.nodes.find((n) => n.id === id),
  },

  actions: {
    async load(id: string) {
      const p = await db.projects.get(id)
      console.log('Fetched from Dexie:', p)
      if (!p) throw new Error('Project not found')
      const parsed = ProjectZ.parse(p)
      this.current = parsed
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
      if (!this.current) throw new Error('No project loaded')
      const i = this.current.nodes.findIndex((n) => n.id === node.id)
      if (i === -1) this.current.nodes.push(node)
      else Object.assign(this.current.nodes[i], node)
    },

    removeNode(id: string) {
      if (!this.current) throw new Error('No project loaded')
      this.current.nodes = this.current.nodes.filter((n) => n.id !== id)
      this.current.edges = this.current.edges.filter((e) => e.source !== id && e.target !== id)
    },

    upsertEdge(edge: GraphEdge) {
      if (!this.current) throw new Error('No project loaded')
      const i = this.current.edges.findIndex((e) => e.id === edge.id)
      if (i === -1) this.current.edges.push(edge)
      else Object.assign(this.current.edges[i], edge)
    },

    removeEdge(id: string) {
      if (!this.current) throw new Error('No project loaded')
      this.current.edges = this.current.edges.filter((e) => e.id !== id)
    },

    injectNodes(newNodes: GraphNode[]) {
      if (!this.current) throw new Error('No project loaded')
      this.current.nodes = newNodes
      this.current.edges = []
    },

    clearNodes() {
      if (!this.current) throw new Error('No project loaded')
      this.current.nodes = []
      this.current.edges = []
    },
  },
})
