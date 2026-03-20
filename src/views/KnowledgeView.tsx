import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Tabs from '../components/Tabs'
import { usePlans } from '../api/usePlans'
import { useProjectMemory, useAgentMemory } from '../api/useMemory'
import { useOutputs } from '../api/useOutputs'
import { timeAgo } from '../utils/time'
import type { PlanFile, MemoryFile, OutputFile } from '../types'

const mainTabs = [
  { id: 'plans', label: 'Plans' },
  { id: 'project-memory', label: 'Project Memory' },
  { id: 'agent-memory', label: 'Agent Memory' },
  { id: 'outputs', label: 'Outputs' },
]

const outputCategories = ['briefings', 'meetings', 'reports'] as const

function typeBadgeColor(type?: string): string {
  switch (type) {
    case 'user':
      return 'bg-[var(--accent)]/20 text-[var(--accent)]'
    case 'feedback':
      return 'bg-[var(--warning)]/20 text-[var(--warning)]'
    case 'project':
      return 'bg-[var(--success)]/20 text-[var(--success)]'
    case 'reference':
      return 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
    default:
      return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
  }
}

// --- Plans Tab ---

function PlansTab() {
  const { data: plans, isLoading } = usePlans()
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  const sorted = plans
    ? [...plans].sort(
        (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      )
    : []

  if (isLoading) return <SkeletonList count={5} />

  if (sorted.length === 0) return <EmptyState text="No plans found" />

  return (
    <div className="space-y-2">
      {sorted.map((plan: PlanFile) => {
        const isExpanded = expandedPlan === plan.filename
        return (
          <div
            key={plan.filename}
            className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden"
          >
            <button
              onClick={() => setExpandedPlan(isExpanded ? null : plan.filename)}
              className="w-full text-left px-5 py-4 hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">
                    {plan.title || plan.filename}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {plan.filename} &middot; {timeAgo(plan.modifiedAt)}
                  </p>
                </div>
                <span
                  className={`ml-3 text-[var(--text-muted)] transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown />
                </span>
              </div>
              {!isExpanded && plan.preview && (
                <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">
                  {plan.preview}
                </p>
              )}
            </button>
            {isExpanded && (
              <PlanContent filename={plan.filename} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlanContent({ filename }: { filename: string }) {
  const { data: plan, isLoading } = usePlanBody(filename)

  if (isLoading) {
    return (
      <div className="px-5 py-4 border-t border-[var(--border)]">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-[var(--border)] prose prose-invert prose-sm max-w-none text-[var(--text-secondary)]">
      <ReactMarkdown>{plan?.body || ''}</ReactMarkdown>
    </div>
  )
}

// Inline hook for fetching plan body — uses the existing usePlan hook
import { usePlan } from '../api/usePlans'
function usePlanBody(filename: string) {
  return usePlan(filename)
}

// --- Project Memory Tab ---

function ProjectMemoryTab() {
  const { data: memories, isLoading } = useProjectMemory()

  if (isLoading) return <SkeletonList count={4} />
  if (!memories || memories.length === 0) return <EmptyState text="No project memory found" />

  const grouped = groupBy(memories, (m) => m.agent)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([project, files]) => (
        <div key={project}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{project}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((file: MemoryFile) => (
              <MemoryCard key={file.path} file={file} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Agent Memory Tab ---

function AgentMemoryTab() {
  const { data: memories, isLoading } = useAgentMemory()

  if (isLoading) return <SkeletonList count={4} />
  if (!memories || memories.length === 0) return <EmptyState text="No agent memory found" />

  const grouped = groupBy(memories, (m) => m.agent)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([agent, files]) => (
        <div key={agent}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{agent}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((file: MemoryFile) => (
              <MemoryCard key={file.path} file={file} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MemoryCard({ file }: { file: MemoryFile }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden cursor-pointer hover:border-[var(--accent)] transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
            {file.name || file.path.split('/').pop()}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            {file.type && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeColor(
                  file.type
                )}`}
              >
                {file.type}
              </span>
            )}
            <span
              className={`text-[var(--text-muted)] transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown />
            </span>
          </div>
        </div>
        {file.description && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{file.description}</p>
        )}
        {!expanded && (
          <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-3">
            {file.body.slice(0, 200)}
          </p>
        )}
        <p className="text-xs text-[var(--text-muted)] mt-2">{timeAgo(file.modifiedAt)}</p>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 prose prose-invert prose-sm max-w-none text-[var(--text-secondary)]">
          <ReactMarkdown>{file.body}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

// --- Outputs Tab ---

function OutputsTab() {
  const [category, setCategory] = useState<(typeof outputCategories)[number]>('briefings')
  const { data: outputs, isLoading } = useOutputs(category)

  return (
    <div className="space-y-4">
      {/* Sub-category buttons */}
      <div className="flex gap-2">
        {outputCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              category === cat
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Output list */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : !outputs || outputs.length === 0 ? (
        <EmptyState text={`No ${category} found`} />
      ) : (
        <div className="space-y-2">
          {outputs.map((output: OutputFile) => (
            <div
              key={output.path}
              className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-[var(--text-primary)]">
                  {output.filename}
                </h4>
                <span className="text-xs text-[var(--text-muted)]">
                  {timeAgo(output.modifiedAt)}
                </span>
              </div>
              {output.preview && (
                <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">
                  {output.preview}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Shared components ---

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4"
        >
          <div className="h-4 w-1/3 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-[var(--bg-tertiary)] rounded animate-pulse mt-2" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-[var(--text-muted)] text-sm">{text}</div>
  )
}

// --- Utility ---

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of arr) {
    const key = keyFn(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
  }
  return result
}

// --- Main view ---

export default function KnowledgeView() {
  const [activeTab, setActiveTab] = useState('plans')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Plans, memory, and generated outputs
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={mainTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div>
        {activeTab === 'plans' && <PlansTab />}
        {activeTab === 'project-memory' && <ProjectMemoryTab />}
        {activeTab === 'agent-memory' && <AgentMemoryTab />}
        {activeTab === 'outputs' && <OutputsTab />}
      </div>
    </div>
  )
}
