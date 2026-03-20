import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  AGENT_MEMORY_DIR,
  PROJECTS_DIR,
  PLANS_DIR,
  BRIEFINGS_DIR,
  MEETINGS_DIR,
  REPORTS_DIR,
} from '../constants.js'
import type { MemoryFile, PlanFile, OutputFile } from '../../src/types/index.js'

export function loadAgentMemory(): MemoryFile[] {
  if (!fs.existsSync(AGENT_MEMORY_DIR)) return []

  const results: MemoryFile[] = []
  const agentDirs = fs.readdirSync(AGENT_MEMORY_DIR).filter(d =>
    fs.statSync(path.join(AGENT_MEMORY_DIR, d)).isDirectory()
  )

  for (const agentDir of agentDirs) {
    const dirPath = path.join(AGENT_MEMORY_DIR, agentDir)
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'))

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      const stat = fs.statSync(filePath)

      results.push({
        agent: agentDir,
        path: filePath,
        name: data.name || path.basename(file, '.md'),
        description: data.description || '',
        type: data.type || undefined,
        body: content.trim(),
        modifiedAt: stat.mtime.toISOString(),
      })
    }
  }

  return results
}

export function loadProjectMemory(): MemoryFile[] {
  if (!fs.existsSync(PROJECTS_DIR)) return []

  const results: MemoryFile[] = []
  const projectDirs = fs.readdirSync(PROJECTS_DIR).filter(d =>
    fs.statSync(path.join(PROJECTS_DIR, d)).isDirectory()
  )

  for (const projDir of projectDirs) {
    const memoryDir = path.join(PROJECTS_DIR, projDir, 'memory')
    if (!fs.existsSync(memoryDir) || !fs.statSync(memoryDir).isDirectory()) continue

    const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const filePath = path.join(memoryDir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      const stat = fs.statSync(filePath)

      results.push({
        agent: projDir,
        path: filePath,
        name: data.name || path.basename(file, '.md'),
        description: data.description || '',
        type: data.type || 'project',
        body: content.trim(),
        modifiedAt: stat.mtime.toISOString(),
      })
    }
  }

  return results
}

export function loadPlans(): PlanFile[] {
  if (!fs.existsSync(PLANS_DIR)) return []

  const files = fs.readdirSync(PLANS_DIR).filter(f => f.endsWith('.md'))
  const plans: PlanFile[] = []

  for (const file of files) {
    const filePath = path.join(PLANS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const stat = fs.statSync(filePath)

    // Extract title from first # heading
    const titleMatch = raw.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : path.basename(file, '.md')

    // Preview: first 200 chars of content after title
    const afterTitle = raw.replace(/^#\s+.+$/m, '').trim()
    const preview = afterTitle.slice(0, 200)

    plans.push({
      filename: file,
      title,
      date: stat.mtime.toISOString().split('T')[0],
      path: filePath,
      preview,
      modifiedAt: stat.mtime.toISOString(),
    })
  }

  plans.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
  return plans
}

const OUTPUT_DIRS: Record<string, string> = {
  briefings: BRIEFINGS_DIR,
  meetings: MEETINGS_DIR,
  reports: REPORTS_DIR,
}

export function loadOutputs(category: 'briefings' | 'meetings' | 'reports'): OutputFile[] {
  const dir = OUTPUT_DIRS[category]
  if (!dir || !fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'))
  const outputs: OutputFile[] = []

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (!stat.isFile()) continue

    let preview = ''
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      preview = raw.slice(0, 200)
    } catch {
      // skip
    }

    outputs.push({
      filename: file,
      category,
      path: filePath,
      preview,
      modifiedAt: stat.mtime.toISOString(),
    })
  }

  outputs.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
  return outputs
}
