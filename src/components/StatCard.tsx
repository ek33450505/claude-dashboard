interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="border border-[var(--glass-border)] rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
      <div className="absolute top-5 right-5 text-[var(--text-muted)] opacity-60">
        {icon}
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="border border-[var(--glass-border)] rounded-xl p-6 flex flex-col gap-2 animate-pulse" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
      <div className="h-9 w-16 bg-[var(--bg-tertiary)] rounded" />
      <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded" />
    </div>
  )
}
