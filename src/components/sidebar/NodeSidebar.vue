<template>
  <div class="node-sidebar">
    <div class="sidebar-header">
      <h3>Node Library</h3>
    </div>

    <div class="node-categories">
      <div
        v-for="category in nodeData.categories"
        :key="category.id"
        class="category"
      >
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

    <!-- ✅ Action buttons at the bottom -->
    <div class="sidebar-actions">
      <button @click="$emit('show-import')" class="sidebar-button">📥 Show Import Panel</button>
      <button @click="$emit('reset-canvas')" class="sidebar-button">🧹 Reset Canvas</button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import nodeTypesData from '@/data/nodeTypes.json'

// ✅ Expanded type to include 'smart', 'producer', 'consumer'
type NodeType = {
  id: string
  type: 'machine' | 'source' | 'sink' | 'smart' | 'producer' | 'consumer'
  name: string
  description: string
  icon: string
  color: string
  defaultData: Record<string, any>
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
    const payload = {
      type: node.type,
      data: node.defaultData
    }
    event.dataTransfer.setData('application/vueflow', JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'move'
    console.log('🎯 Dragging:', JSON.stringify(payload, null, 2))
  }
}




onMounted(() => {
  console.log('✅ NodeSidebar mounted')
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

/* Drag state styles */
.sidebar-node[draggable="true"]:hover {
  cursor: grab;
}

.sidebar-node[draggable="true"]:active {
  cursor: grabbing;
  opacity: 0.7;
}

.sidebar-actions {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-button {
  padding: 0.5em 1em;
  background-color: #007bff; /* Primary blue */
  color: white;
  border: none;
  border-radius: 6px; /* Rounded corners */
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.sidebar-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}


</style>
