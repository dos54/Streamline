
<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import DropzoneBackground from './components/DropzoneBackground.vue'
import Sidebar from './components/Sidebar.vue'
import useDragAndDrop from './components/useDnD'
import CanvasView from './components/CanvasView.vue' 

const { onConnect, addEdges } = useVueFlow()

const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop()

const nodes = ref([])

onConnect(addEdges)

</script>


<div class="app-layout">
    <CanvasView v-model:nodes="nodes" :is-drag-over="isDragOver" @drop="onDrop"/>
    <Sidebar />
</div >

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}

.app-layout >:first-child {
  flex: 1;
}

.app-layout > :last-child {
  width: 250px;
  border-left: 1px solid #cc0909;
  background: #fff;
}
</style>
