import html2canvas from 'html2canvas'
import type { Node } from '@vue-flow/core'

export interface ImageExportOptions {
  filename?: string
  backgroundColor?: string
  scale?: number
  quality?: number
  format?: 'png' | 'jpeg'
  width?: number
  height?: number
}

export interface ExportResult {
  success: boolean
  error?: string
  filename?: string
}

export async function exportCanvasAsImage(
  element: HTMLElement,
  options: ImageExportOptions = {},
): Promise<ExportResult> {
  const {
    filename = 'streamline-export',
    backgroundColor = '#ffffff',
    scale = 2,
    quality = 1,
    format = 'png',
    width,
    height,
  } = options

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS: true,
      allowTaint: false,
      width,
      height,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      windowWidth: width || element.scrollWidth,
      windowHeight: height || element.scrollHeight,
      ignoreElements: (element) => {
        // Ignore overlay elements that shouldn't be in the export
        return (
          element.classList.contains('overlay-root') ||
          element.classList.contains('toolbar') ||
          element.classList.contains('logo-wrapper') ||
          element.classList.contains('links-wrapper') ||
          element.classList.contains('node-sidebar') ||
          element.classList.contains('backdrop') ||
          element.classList.contains('modal') ||
          element.classList.contains('vue-flow__controls') ||
          element.classList.contains('vue-flow__minimap') ||
          element.closest('.overlay-root') !== null ||
          element.closest('.logo-wrapper') !== null ||
          element.closest('.links-wrapper') !== null ||
          element.closest('.node-sidebar') !== null ||
          element.closest('.backdrop') !== null ||
          element.closest('.modal') !== null
        )
      },
    })

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const dataUrl = canvas.toDataURL(mimeType, quality)

    const finalFilename = `${filename}.${format}`
    downloadImage(dataUrl, finalFilename)

    return {
      success: true,
      filename: finalFilename,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportVueFlowCanvas(
  vueFlowElement: HTMLElement,
  projectName?: string,
): Promise<ExportResult> {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = projectName ? `${projectName}-${timestamp}` : `canvas-export-${timestamp}`

  // Calculate the bounds of all nodes to ensure we capture everything
  const bounds = calculateCanvasBounds(vueFlowElement)

  return exportCanvasAsImage(vueFlowElement, {
    filename,
    backgroundColor: '#ffffff',
    scale: 2,
    format: 'png',
    width: bounds.width,
    height: bounds.height,
  })
}

export async function exportVueFlowCanvasWithBounds(
  vueFlowElement: HTMLElement,
  nodes: Node[],
  projectName?: string,
): Promise<ExportResult> {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = projectName ? `${projectName}-${timestamp}` : `canvas-export-${timestamp}`

  // Calculate bounds using Vue Flow node data
  const bounds = calculateNodeBounds(nodes, vueFlowElement)

  return exportCanvasAsImage(vueFlowElement, {
    filename,
    backgroundColor: '#ffffff',
    scale: 2,
    format: 'png',
    width: bounds.width,
    height: bounds.height,
  })
}

function calculateCanvasBounds(vueFlowElement: HTMLElement): { width: number; height: number } {
  // Find all nodes in the canvas
  const nodes = vueFlowElement.querySelectorAll('.vue-flow__node')

  if (nodes.length === 0) {
    // If no nodes, use the container size
    return {
      width: vueFlowElement.offsetWidth,
      height: vueFlowElement.offsetHeight,
    }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect()
    const containerRect = vueFlowElement.getBoundingClientRect()

    // Calculate relative position within the canvas
    const x = rect.left - containerRect.left + vueFlowElement.scrollLeft
    const y = rect.top - containerRect.top + vueFlowElement.scrollTop

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + rect.width)
    maxY = Math.max(maxY, y + rect.height)
  })

  // Add padding around the content
  const padding = 100
  const width = Math.max(maxX - minX + padding * 2, vueFlowElement.offsetWidth)
  const height = Math.max(maxY - minY + padding * 2, vueFlowElement.offsetHeight)

  return { width, height }
}

function calculateNodeBounds(
  nodes: Node[],
  vueFlowElement: HTMLElement,
): { width: number; height: number } {
  if (nodes.length === 0) {
    return {
      width: vueFlowElement.offsetWidth,
      height: vueFlowElement.offsetHeight,
    }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  // Estimate node size (typical node dimensions)
  const nodeWidth = 250
  const nodeHeight = 200

  nodes.forEach((node) => {
    const x = node.position.x
    const y = node.position.y

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + nodeWidth)
    maxY = Math.max(maxY, y + nodeHeight)
  })

  // Add generous padding around the content
  const padding = 200
  const width = Math.max(maxX - minX + padding * 2, vueFlowElement.offsetWidth)
  const height = Math.max(maxY - minY + padding * 2, vueFlowElement.offsetHeight)

  return { width, height }
}
