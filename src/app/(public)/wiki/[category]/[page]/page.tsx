export default function WikiDetailPage({
  params,
}: {
  params: { category: string; page: string }
}) {
  return (
    <article className="max-w-content mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-8">{params.page}</h1>
      <div className="text-sm text-text-secondary">加载中...</div>
    </article>
  )
}
