import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { AGENTS_DIR } from '../constants.js'
import type { AgentDefinition } from '../../src/types/index.js'

export function loadAgents(): AgentDefinition[] {
  if (!fs.existsSync(AGENTS_DIR)) return []

  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))
  const agents: AgentDefinition[] = []

  for (const file of files) {
    const filePath = path.join(AGENTS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)

    let tools: string[] = []
    if (data.tools) {
      if (Array.isArray(data.tools)) {
        tools = data.tools
      } else if (typeof data.tools === 'string') {
        tools = data.tools.split(',').map((t: string) => t.trim()).filter(Boolean)
      }
    }

    agents.push({
      name: data.name || path.basename(file, '.md'),
      description: data.description || '',
      model: data.model || 'sonnet',
      color: data.color || 'gray',
      tools,
      maxTurns: data.maxTurns ?? data.max_turns ?? 10,
      memory: data.memory || 'none',
      disallowedTools: data.disallowedTools || data.disallowed_tools || undefined,
      filePath,
    })
  }

  return agents
}
