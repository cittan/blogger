import { Card } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
}

export function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <Card padding="md">
      <p className="text-xs text-text-secondary mb-2">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {subtitle && (
        <p className="text-xs text-text-secondary/60 mt-1">{subtitle}</p>
      )}
    </Card>
  )
}
