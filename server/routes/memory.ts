import { Router } from 'express'
import { loadAgentMemory, loadProjectMemory } from '../parsers/memory.js'

const router = Router()

router.get('/agent', (_req, res) => {
  const memory = loadAgentMemory()
  res.json(memory)
})

router.get('/agent/:agentName', (req, res) => {
  const memory = loadAgentMemory().filter(m => m.agent === req.params.agentName)
  res.json(memory)
})

router.get('/project', (_req, res) => {
  const memory = loadProjectMemory()
  res.json(memory)
})

export { router as memoryRouter }
