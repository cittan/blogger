export default function WikiCategoryPage({ params }: { params: { category: string } }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2 capitalize">{params.category}</h1>
      <div className="space-y-2">
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}
