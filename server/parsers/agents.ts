import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { AGENTS_DIR } from '../constants.js'
import type { AgentDefinition } from '../../src/types/index.js'

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split(',').map(t => t.trim()).filter(Boolean)
  return []
}

export function loadAgents(): AgentDefinition[] {
  if (!fs.existsSync(AGENTS_DIR)) return []

  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))
  const agents: AgentDefinition[] = []

  for (const file of files) {
    const filePath = path.join(AGENTS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)

    const tools = normalizeStringArray(data.tools)

    agents.push({
      name: data.name || path.basename(file, '.md'),
      description: data.description || '',
      model: data.model || 'sonnet',
      color: data.color || 'gray',
      tools,
      maxTurns: data.maxTurns ?? data.max_turns ?? 10,
      memory: data.memory || 'none',
      disallowedTools: normalizeStringArray(data.disallowedTools || data.disallowed_tools),
      filePath,
    })
  }

  return agents
}
