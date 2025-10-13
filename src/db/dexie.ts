import Dexie, { type Table } from 'dexie'
import type { Project } from '@/types/project'

class AppDB extends Dexie {
  projects!: Table<Project, string>
  constructor() {
    super('streamline-flow-db')
    this.version(1).stores({
      projects: 'id, schemaVersion, updatedAt',
    })
  }
}

export const db = new AppDB()
