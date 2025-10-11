import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportCanvasAsImage, exportVueFlowCanvas } from './imageExport'

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: vi.fn(() => 'data:image/png;base64,test-image-data'),
    }),
  ),
}))

// Mock DOM methods
const mockLink = {
  click: vi.fn(),
  href: '',
  download: '',
}

const mockElement = {
  querySelectorAll: vi.fn(() => []),
  offsetWidth: 800,
  offsetHeight: 600,
  scrollWidth: 800,
  scrollHeight: 600,
}

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tag) => {
    if (tag === 'a') return mockLink
    if (tag === 'div') return mockElement
    return mockElement
  }),
  writable: true,
})

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
  writable: true,
})

describe('imageExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export canvas as image successfully', async () => {
    const result = await exportCanvasAsImage(mockElement as unknown as HTMLElement, {
      filename: 'test-export',
      format: 'png',
    })

    expect(result.success).toBe(true)
    expect(result.filename).toBe('test-export.png')
    expect(result.error).toBeUndefined()
  })

  it('should export Vue Flow canvas with project name', async () => {
    const projectName = 'My Project'

    const result = await exportVueFlowCanvas(mockElement as unknown as HTMLElement, projectName)

    expect(result.success).toBe(true)
    expect(result.filename).toContain('My Project')
    expect(result.filename).toContain('.png')
  })

  it('should use default filename when project name is not provided', async () => {
    const result = await exportVueFlowCanvas(mockElement as unknown as HTMLElement)

    expect(result.success).toBe(true)
    expect(result.filename).toContain('canvas-export')
    expect(result.filename).toContain('.png')
  })
})
