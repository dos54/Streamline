<script setup lang="ts">
import {ref} from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { NodeTypesObject, Node, Edge } from '@vue-flow/core'
import CanvasView from '@/components/CanvasView.vue';
import NodeSidebar from '@/components/sidebar/NodeSidebar.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import { useHead } from '@unhead/vue';
import useDragAndDrop from '@/useDnD';
useHead({ title: 'Editor' })

const { addNodes, addEdges, screenToFlowCoordinate, getNodes, getNodeTypes} = useVueFlow()
const { onDragOver, onDrop: onDropHandler } = useDragAndDrop()

function onDrop(event: DragEvent) {
  const newNode = onDropHandler(event, screenToFlowCoordinate)
  if (newNode) {
    addNodes([newNode])
  }
}

const edges = ref<Edge[]>([
  {
    id: 'e1',
    source: 'producer-1',
    target: 'consumer-1',
    label: 'Electricity',
    animated: true,
    style: { stroke: '#999' },
    labelStyle: { fill: '#333', fontSize: 12 }
  }
])

const nodes = ref<Node[]>([
  {
    id: 'producer-1',
    type: 'producer',
    position: { x: 100, y: 200 },
    data: {
      label: 'Iron Mine',
      direction: 'ltr',
      cycleTime: 5,
      inputs: [
        { resourceId: 'power', unitId: 'kWh', perCycle: 0.5 },
        { resourceId: 'steel', unitId: 'kg', perCycle: 2 }
      ],
outputs: [
  { resourceId: 'steel', unitId: 'kg', perCycle: 1 },
  { resourceId: 'power', unitId: 'kWh', perCycle: 2 }
]

,
      resources: [
        { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' },
        { id: 'steel', name: 'Steel', defaultUnitId: 'kg' }
      ]
    }
  },
  {
    id: 'consumer-1',
    type: 'consumer',
    position: { x: 400, y: 200 },
    data: {
      label: 'Smelter',
      direction: 'ltr',
      inputs: [
        { resourceId: 'power', unitId: 'kWh', perCycle: 1 }
      ],
      resources: [
        { id: 'power', name: 'Electricity', defaultUnitId: 'kWh' }
      ]
    }
  }
])


</script>

<template>
  <div class="editor-layout" @dragover="onDragOver" @drop="onDrop">
    <NodeSidebar />
    <CanvasView :nodes="nodes" :edges="edges" @connect="addEdges"/>
  </div>

  <SettingsModal />
</template>

<style scoped>
.editor-layout {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>

