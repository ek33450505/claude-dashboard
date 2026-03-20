import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

const LiveView = lazy(() => import('./views/LiveView'))
const SessionsView = lazy(() => import('./views/SessionsView'))
const SessionDetailView = lazy(() => import('./views/SessionDetailView'))
const AgentsView = lazy(() => import('./views/AgentsView'))
const AgentDetailView = lazy(() => import('./views/AgentDetailView'))
const KnowledgeView = lazy(() => import('./views/KnowledgeView'))
const SystemView = lazy(() => import('./views/SystemView'))

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="p-8 text-[var(--text-muted)]">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LiveView />} />
          <Route path="/sessions" element={<SessionsView />} />
          <Route path="/sessions/:project/:sessionId" element={<SessionDetailView />} />
          <Route path="/agents" element={<AgentsView />} />
          <Route path="/agents/:name" element={<AgentDetailView />} />
          <Route path="/knowledge" element={<KnowledgeView />} />
          <Route path="/system" element={<SystemView />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
