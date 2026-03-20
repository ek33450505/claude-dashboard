import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSession } from '../api/useSessions'
import { timeAgo } from '../utils/time'
import type { LogEntry, ContentBlock } from '../types'

const TYPE_STYLES: Record<string, { dot: string; label: string; bg: string }> = {
  user: { dot: 'bg-blue-400', label: 'User', bg: 'bg-blue-500/10 border-blue-500/20' },
  assistant: { dot: 'bg-indigo-400', label: 'Assistant', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  tool_use: { dot: 'bg-amber-400', label: 'Tool Call', bg: 'bg-amber-500/10 border-amber-500/20' },
  tool_result: { dot: 'bg-emerald-400', label: 'Tool Result', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  progress: { dot: 'bg-gray-400', label: 'Progress', bg: 'bg-gray-500/10 border-gray-500/20' },
}

interface TimelineEntry {
  id: string
  type: 'user' | 'assistant' | 'tool_use' | 'tool_result' | 'progress'
  timestamp: string
  content: string
  toolName?: string
  model?: string
  isSidechain?: boolean
}

function parseEntry(entry: LogEntry): TimelineEntry[] {
  const results: TimelineEntry[] = []
  const content = entry.message?.content
  const model = entry.message?.model

  if (entry.type === 'progress') {
    results.push({
      id: entry.uuid,
      type: 'progress',
      timestamp: entry.timestamp,
      content: entry.data?.type || 'Progress update',
      isSidechain: entry.isSidechain,
    })
    return results
  }

  if (typeof content === 'string') {
    results.push({
      id: entry.uuid,
      type: entry.message?.role === 'user' ? 'user' : 'assistant',
      timestamp: entry.timestamp,
      content,
      model,
      isSidechain: entry.isSidechain,
    })
    return results
  }

  if (Array.isArray(content)) {
    for (const block of content as ContentBlock[]) {
      if (block.type === 'text' && block.text) {
        results.push({
          id: `${entry.uuid}-text-${results.length}`,
          type: entry.message?.role === 'user' ? 'user' : 'assistant',
          timestamp: entry.timestamp,
          content: block.text,
          model,
          isSidechain: entry.isSidechain,
        })
      } else if (block.type === 'tool_use') {
        const inputStr = block.input ? JSON.stringify(block.input, null, 2) : ''
        results.push({
          id: block.id || `${entry.uuid}-tool-${results.length}`,
          type: 'tool_use',
          timestamp: entry.timestamp,
          content: inputStr,
          toolName: block.name,
          model,
          isSidechain: entry.isSidechain,
        })
      } else if (block.type === 'tool_result') {
        results.push({
          id: `${entry.uuid}-result-${results.length}`,
          type: 'tool_result',
          timestamp: entry.timestamp,
          content: typeof block.text === 'string' ? block.text : 'Result received',
          isSidechain: entry.isSidechain,
        })
      }
    }
  }

  if (results.length === 0) {
    results.push({
      id: entry.uuid,
      type: entry.message?.role === 'user' ? 'user' : 'assistant',
      timestamp: entry.timestamp,
      content: 'Activity',
      isSidechain: entry.isSidechain,
    })
  }

  return results
}

function TimelineCard({ entry }: { entry: TimelineEntry }) {
  const style = TYPE_STYLES[entry.type] || TYPE_STYLES.assistant

  return (
    <div className={`rounded-xl border px-5 py-4 ${style.bg} ${entry.isSidechain ? 'ml-6 opacity-80' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${style.dot} shrink-0`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {style.label}
        </span>
        {entry.toolName && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-amber-300">
            {entry.toolName}
          </span>
        )}
        {entry.model && (
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            {entry.model}
          </span>
        )}
        {entry.isSidechain && (
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
            sidechain
          </span>
        )}
        <span className="ml-auto text-xs text-[var(--text-muted)]">
          {timeAgo(entry.timestamp)}
        </span>
      </div>
      <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap break-all font-mono leading-relaxed max-h-64 overflow-y-auto m-0">
        {entry.content.length > 1000 ? entry.content.slice(0, 1000) + '...' : entry.content}
      </pre>
    </div>
  )
}

export default function SessionDetailView() {
  const { project, sessionId } = useParams<{ project: string; sessionId: string }>()
  const { data: entries, isLoading, error } = useSession(project || '', sessionId || '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--bg-tertiary)]" />
                <div className="h-4 w-20 bg-[var(--bg-tertiary)] rounded" />
              </div>
              <div className="h-4 w-3/4 bg-[var(--bg-tertiary)] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !entries || entries.length === 0) {
    return (
      <div className="space-y-6">
        <Link to="/sessions" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </Link>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--error)]/30 px-5 py-4 text-sm text-[var(--error)]">
          Session not found
        </div>
      </div>
    )
  }

  // Parse all entries into timeline items
  const timeline = entries.flatMap(parseEntry)

  // Extract metadata from first entry
  const firstEntry = entries[0]
  const lastEntry = entries[entries.length - 1]
  const projectName = project ? decodeURIComponent(project).split('/').pop() : 'Unknown'

  // Count stats
  const userMessages = entries.filter(e => e.message?.role === 'user').length
  const assistantMessages = entries.filter(e => e.message?.role === 'assistant').length
  const toolCalls = entries.reduce((count, e) => {
    if (!Array.isArray(e.message?.content)) return count
    return count + (e.message!.content as ContentBlock[]).filter(b => b.type === 'tool_use').length
  }, 0)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/sessions" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline">
        <ArrowLeft className="w-4 h-4" /> Back to Sessions
      </Link>

      {/* Session header */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{projectName}</h1>
        <p className="text-xs font-mono text-[var(--text-muted)] mb-4">{sessionId}</p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-[var(--text-muted)]">Started: </span>
            <span className="text-[var(--text-secondary)]">{timeAgo(firstEntry.timestamp)}</span>
          </div>
          {lastEntry && (
            <div>
              <span className="text-[var(--text-muted)]">Last activity: </span>
              <span className="text-[var(--text-secondary)]">{timeAgo(lastEntry.timestamp)}</span>
            </div>
          )}
          {firstEntry.gitBranch && (
            <div>
              <span className="inline-block px-2 py-0.5 text-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-mono">
                {firstEntry.gitBranch}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-[var(--border)]">
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{userMessages}</span>
            <span className="text-xs text-[var(--text-muted)] ml-1.5">user messages</span>
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{assistantMessages}</span>
            <span className="text-xs text-[var(--text-muted)] ml-1.5">assistant messages</span>
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{toolCalls}</span>
            <span className="text-xs text-[var(--text-muted)] ml-1.5">tool calls</span>
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{entries.length}</span>
            <span className="text-xs text-[var(--text-muted)] ml-1.5">total entries</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {timeline.map((item) => (
          <TimelineCard key={item.id} entry={item} />
        ))}
      </div>
    </div>
  )
}
