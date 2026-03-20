import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Brain, Wrench } from 'lucide-react'
import { useAgent } from '../api/useAgents'

const MODEL_COLORS: Record<string, { bg: string; text: string }> = {
  sonnet: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  haiku: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  opus: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
}

function getModelStyle(model: string) {
  return MODEL_COLORS[model] ?? { bg: 'bg-[var(--bg-tertiary)]', text: 'text-[var(--text-secondary)]' }
}

export default function AgentDetailView() {
  const { name } = useParams<{ name: string }>()
  const { data: agent, isLoading, error } = useAgent(name || '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[var(--bg-tertiary)] animate-pulse" />
            <div className="h-7 w-48 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
          </div>
          <div className="space-y-2 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-[var(--bg-tertiary)] rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="space-y-6">
        <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline">
          <ArrowLeft className="w-4 h-4" /> Back to Agents
        </Link>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--error)]/30 px-5 py-4 text-sm text-[var(--error)]">
          Agent not found
        </div>
      </div>
    )
  }

  const modelStyle = getModelStyle(agent.model)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline">
        <ArrowLeft className="w-4 h-4" /> Back to Agents
      </Link>

      {/* Header card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
        {/* Name + color dot */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-block w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: agent.color }}
          />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{agent.name}</h1>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${modelStyle.bg} ${modelStyle.text}`}>
            {agent.model}
          </span>
          {agent.memory === 'local' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
              <Brain className="w-3 h-3" /> Local Memory
            </span>
          )}
          {agent.maxTurns > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              {agent.maxTurns} max turns
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] mb-4">{agent.description}</p>

        {/* Tools list */}
        {Array.isArray(agent.tools) && agent.tools.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> Tools ({agent.tools.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-block px-2 py-0.5 text-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-mono"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disallowed tools */}
        {Array.isArray(agent.disallowedTools) && agent.disallowedTools.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Disallowed Tools
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.disallowedTools.map((tool) => (
                <span
                  key={tool}
                  className="inline-block px-2 py-0.5 text-xs rounded bg-red-500/10 text-red-400 font-mono"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full markdown body */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Agent Definition
        </h2>
        <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)]">
          <ReactMarkdown>{agent.body}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
