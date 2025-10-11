import { db } from '@/db/dexie'
import { ProjectZ } from '@/schemas/project.schema'
import type { Project } from '@/types/project'
import { z } from 'zod'

const EXPORT_FORMAT_VERSION = '1.0.0'
const SUPPORTED_VERSIONS = ['1.0.0']

export interface ExportData {
  formatVersion: string
  exportedAt: string
  projects: Project[]
  metadata?: {
    appVersion?: string
    totalProjects?: number
    [key: string]: unknown
  }
}

const ExportDataZ = z.object({
  formatVersion: z.string(),
  exportedAt: z.string(),
  projects: z.array(ProjectZ),
  metadata: z
    .object({
      appVersion: z.string().optional(),
      totalProjects: z.number().optional(),
    })
    .catchall(z.unknown())
    .optional(),
})

export async function exportAllData(): Promise<string> {
  try {
    const projects = await db.projects.toArray()

    const exportData: ExportData = {
      formatVersion: EXPORT_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      projects,
      metadata: {
        totalProjects: projects.length,
      },
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    throw new Error(
      `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export async function exportProject(projectId: string): Promise<string> {
  try {
    const project = await db.projects.get(projectId)
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`)
    }

    const exportData: ExportData = {
      formatVersion: EXPORT_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      projects: [project],
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    throw new Error(
      `Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export interface ImportResult {
  success: boolean
  projectsImported: number
  projectsSkipped: number
  errors: string[]
}

export async function importData(
  jsonData: string,
  options: {
    overwriteExisting?: boolean
    validateOnly?: boolean
  } = {},
): Promise<ImportResult> {
  const { overwriteExisting = false, validateOnly = false } = options
  const result: ImportResult = {
    success: true,
    projectsImported: 0,
    projectsSkipped: 0,
    errors: [],
  }

  try {
    let parsedData: unknown
    try {
      parsedData = JSON.parse(jsonData)
    } catch {
      result.success = false
      result.errors.push('Invalid JSON format')
      return result
    }

    const validationResult = ExportDataZ.safeParse(parsedData)
    if (!validationResult.success) {
      result.success = false
      result.errors.push(`Invalid data format: ${validationResult.error.message}`)
      return result
    }

    const exportData = validationResult.data

    if (!SUPPORTED_VERSIONS.includes(exportData.formatVersion)) {
      result.success = false
      result.errors.push(
        `Unsupported format version: ${exportData.formatVersion}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
      )
      return result
    }

    const migratedData = await migrateDataFormat(exportData)

    if (validateOnly) {
      result.projectsImported = exportData.projects.length
      return result
    }

    for (const project of migratedData.projects) {
      try {
        const existingProject = await db.projects.get(project.id)

        if (existingProject && !overwriteExisting) {
          result.projectsSkipped++
          result.errors.push(
            `Project "${project.name}" (${project.id}) already exists and overwrite is disabled`,
          )
          continue
        }

        const projectToSave = {
          ...project,
          updatedAt: new Date().toISOString(),
        }

        await db.projects.put(projectToSave)
        result.projectsImported++
      } catch (projectError) {
        result.projectsSkipped++
        result.errors.push(
          `Failed to import project "${project.name}": ${projectError instanceof Error ? projectError.message : 'Unknown error'}`,
        )
      }
    }

    if (result.errors.length > 0 && result.projectsImported === 0) {
      result.success = false
    }
  } catch (error) {
    result.success = false
    result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

export async function clearAllData(): Promise<void> {
  try {
    await db.projects.clear()
  } catch (error) {
    throw new Error(
      `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

async function migrateDataFormat(data: ExportData): Promise<ExportData> {
  if (data.formatVersion === EXPORT_FORMAT_VERSION) {
    return data
  }

  return { ...data }
}

export async function validateImportData(jsonData: string): Promise<ImportResult> {
  return importData(jsonData, { validateOnly: true })
}

export async function getDataStatistics(): Promise<{
  totalProjects: number
  projectNames: string[]
  lastExported?: string
}> {
  const projects = await db.projects.toArray()
  return {
    totalProjects: projects.length,
    projectNames: projects.map((p) => p.name),
    lastExported: undefined,
  }
}
