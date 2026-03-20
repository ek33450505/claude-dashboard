import { Router } from 'express'
import fs from 'fs'
import matter from 'gray-matter'
import { loadAgents } from '../parsers/agents.js'

const router = Router()

router.get('/', (_req, res) => {
  const agents = loadAgents()
  res.json(agents)
})

router.get('/:name', (req, res) => {
  const agents = loadAgents()
  const agent = agents.find(a => a.name === req.params.name)
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' })
    return
  }

  const raw = fs.readFileSync(agent.filePath, 'utf-8')
  const { content } = matter(raw)
  res.json({ ...agent, body: content })
})

export { router as agentsRouter }
