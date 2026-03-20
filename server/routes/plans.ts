import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { loadPlans } from '../parsers/memory.js'
import { PLANS_DIR } from '../constants.js'

const router = Router()

router.get('/', (_req, res) => {
  const plans = loadPlans()
  res.json(plans)
})

router.get('/:filename', (req, res) => {
  const filePath = path.join(PLANS_DIR, req.params.filename)
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Plan not found' })
    return
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  res.type('text/markdown').send(content)
})

export { router as plansRouter }
