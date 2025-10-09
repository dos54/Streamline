import { describe, it, expect } from 'vitest'
import {
  importData,
  validateImportData,
  type ExportData,
  type ImportResult
} from './dataExportImport'

describe('dataExportImport types and validation', () => {
  it('should handle invalid JSON format', async () => {
    const result = await importData('invalid json')
    expect(result.success).toBe(false)
    expect(result.errors).toContain('Invalid JSON format')
  })

  it('should handle invalid data format', async () => {
    const invalidData = JSON.stringify({ invalid: 'data' })
    const result = await importData(invalidData)
    expect(result.success).toBe(false)
    expect(result.errors[0]).toContain('Invalid data format')
  })

  it('should handle unsupported format version', async () => {
    const futureVersionData = {
      formatVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      projects: []
    }
    const result = await importData(JSON.stringify(futureVersionData))
    expect(result.success).toBe(false)
    expect(result.errors[0]).toContain('Unsupported format version: 2.0.0')
  })

  it('should validate correct export data format', async () => {
    const validExportData: ExportData = {
      formatVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: []
    }

    const result = await validateImportData(JSON.stringify(validExportData))
    expect(result.success).toBe(true)
    expect(result.projectsImported).toBe(0)
  })

  it('should have correct ImportResult interface', () => {
    const result: ImportResult = {
      success: true,
      projectsImported: 1,
      projectsSkipped: 0,
      errors: []
    }
    
    expect(result.success).toBe(true)
    expect(typeof result.projectsImported).toBe('number')
    expect(typeof result.projectsSkipped).toBe('number')
    expect(Array.isArray(result.errors)).toBe(true)
  })
})