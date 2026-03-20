import { Router } from 'express'
import { listSessions, loadSession } from '../parsers/sessions.js'

const router = Router()

router.get('/', (req, res) => {
  let sessions = listSessions()

  const project = req.query.project as string | undefined
  if (project) {
    sessions = sessions.filter(s => s.project === project)
  }

  const limit = Number(req.query.limit) || 50
  sessions = sessions.slice(0, limit)

  res.json(sessions)
})

router.get('/:projectEncoded/:sessionId', (req, res) => {
  const entries = loadSession(req.params.projectEncoded, req.params.sessionId)
  if (entries.length === 0) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json(entries)
})

export { router as sessionsRouter }
