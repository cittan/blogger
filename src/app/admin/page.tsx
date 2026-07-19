import { StatsCard } from '@/components/dashboard/StatsCard'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">仪表盘</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="文章数量" value="--" subtitle="已发布" />
        <StatsCard title="总浏览量" value="--" />
        <StatsCard title="追番数量" value="--" subtitle="在追 --" />
        <StatsCard title="知识库" value="--" subtitle="个分类" />
      </div>
      <div className="grid gap-6 mt-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-bold text-text-primary mb-3">最近发布</h2>
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">加载中...</p>
          </div>
        </section>
        <section>
          <h2 className="text-sm font-bold text-text-primary mb-3">热门文章</h2>
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">加载中...</p>
          </div>
        </section>
      </div>
    </div>
  )
}
