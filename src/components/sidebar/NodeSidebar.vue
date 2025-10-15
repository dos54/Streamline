<template>
  <div class="node-sidebar">
    <div class="sidebar-header">
      <h3>Node Library</h3>
    </div>

    <div class="node-categories">
      <div v-for="category in nodeData.categories" :key="category.id" class="category">
        <h4>{{ category.name }}</h4>
        <div
          v-for="node in category.nodes"
          :key="node.id"
          class="sidebar-node"
          :class="node.type"
          :style="{ borderLeftColor: node.color }"
          :draggable="true"
          @dragstart="onDragStart($event, node)"
        >
          <div class="node-icon">{{ node.icon }}</div>
          <div class="node-info">
            <div class="node-title">{{ node.name }}</div>
            <div class="node-description">{{ node.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Selected Node Autofill -->
    <div v-if="node" class="selected-node-editor">
      <h4>Edit Selected Node</h4>

      <div class="field">
        <label>Name</label>
        <input v-model="node.name" />
      </div>

      <div class="field">
        <label>Cycle Time</label>
        <input type="number" v-model.number="node.cycleTime" min="1" />
      </div>

      <div class="field">
        <label>Mode</label>
        <select v-model="node.mode">
          <option value="producer">Producer</option>
          <option value="consumer">Consumer</option>
          <option value="transformer">Transformer</option>
        </select>
      </div>

      <div class="field">
        <label>Resources</label>
        <ul>
          <li v-for="r in node.data?.resources ?? []" :key="r.id">
            {{ r.name }} ({{ r.defaultUnitId }})
          </li>
        </ul>
      </div>

      <v-btn @click="saveNode" color="success" block class="mt-2">
        Save Node
      </v-btn>
    </div>

    <!-- ✅ Footer Buttons -->
    <div class="sidebar-footer">
      <v-btn @click="exportProject" color="primary" block class="mb-2">
        Export JSON
      </v-btn>
      <v-btn @click="showImportPanel" color="secondary" block>
        Import JSON
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import nodeTypesData from '@/data/nodeTypes.json'
import { useProjectStore } from '@/stores/project.store'
import { useUiStore } from '@/stores/ui.store'
import type { GraphNode } from '@/types/graphNode'

const props = defineProps<{
  node: GraphNode | null
}>()

const projectStore = useProjectStore()
const uiStore = useUiStore()

function saveNode() {
  if (props.node) {
    console.info('🧠 Saving node:', {
      id: props.node.id,
      name: props.node.name,
      cycleTime: props.node.cycleTime,
      mode: props.node.mode,
    })
    projectStore.upsertNode(props.node)
  }
}


function exportProject() {
  const data = projectStore.exportProject()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'project.json'
  link.click()
  URL.revokeObjectURL(url)
}

function showImportPanel() {
  uiStore.importPanelVisible = true
}

type NodeType = {
  id: string
  type: 'machine' | 'source' | 'sink'
  name: string
  description: string
  icon: string
  color: string
  defaultData: Record<string, unknown>
}

type Category = {
  id: string
  name: string
  nodes: NodeType[]
}

type NodeData = {
  categories: Category[]
}

const nodeData = ref<NodeData>({ categories: [] })

function onDragStart(event: DragEvent, node: NodeType) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify(node))
    event.dataTransfer.effectAllowed = 'move'
  }
}

onMounted(() => {
  nodeData.value = nodeTypesData as NodeData
})
</script>

<style scoped>
.node-sidebar {
  width: 250px;
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.node-categories {
  padding: 1rem;
  flex: 1;
}

.category {
  margin-bottom: 1.5rem;
}

.category h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.sidebar-node {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.sidebar-node:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
  transform: translateY(-1px);
}

.sidebar-node:active {
  cursor: grabbing;
  transform: translateY(0);
}

.sidebar-node.producer {
  border-left: 4px solid #4caf50;
}

.sidebar-node.consumer {
  border-left: 4px solid #ff9800;
}

.node-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.node-info {
  flex: 1;
}

.node-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.node-description {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.3;
}

.selected-node-editor {
  padding: 1rem;
  border-top: 1px solid #ddd;
  background-color: #fff;
}

.field {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.sidebar-footer {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
}
</style>
