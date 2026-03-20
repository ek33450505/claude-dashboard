import { Link } from 'react-router-dom'
import { Brain, Wrench } from 'lucide-react'
import { useAgents } from '../api/useAgents'
import type { AgentDefinition } from '../types'

const MODEL_COLORS: Record<string, { bg: string; text: string }> = {
  sonnet: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  haiku: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  opus: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
}

function getModelStyle(model: string) {
  return MODEL_COLORS[model] ?? { bg: 'bg-[var(--bg-tertiary)]', text: 'text-[var(--text-secondary)]' }
}

function AgentCard({ agent }: { agent: AgentDefinition }) {
  const modelStyle = getModelStyle(agent.model)

  return (
    <Link
      to={`/agents/${agent.name}`}
      className="block bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] transition-colors no-underline"
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="inline-block w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: agent.color }}
        />
        <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">
          {agent.name}
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${modelStyle.bg} ${modelStyle.text}`}>
          {agent.model}
        </span>
        {agent.tools.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <Wrench className="w-3 h-3" />
            {agent.tools.length} tools
          </span>
        )}
        {agent.memory === 'local' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
            <Brain className="w-3 h-3" />
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 m-0">
        {agent.description}
      </p>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-3 h-3 rounded-full bg-[var(--bg-tertiary)]" />
        <div className="h-5 w-32 bg-[var(--bg-tertiary)] rounded" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 bg-[var(--bg-tertiary)] rounded-full" />
        <div className="h-5 w-16 bg-[var(--bg-tertiary)] rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-[var(--bg-tertiary)] rounded" />
        <div className="h-4 w-3/4 bg-[var(--bg-tertiary)] rounded" />
      </div>
    </div>
  )
}

export default function AgentsView() {
  const { data: agents, isLoading } = useAgents()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        {agents && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {agents.length} installed
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : agents?.map((agent) => <AgentCard key={agent.name} agent={agent} />)
        }
      </div>
    </div>
  )
}
