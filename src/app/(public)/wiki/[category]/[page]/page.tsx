export const runtime = 'edge'

export default async function WikiDetailPage({
  params,
}: {
  params: Promise<{ category: string; page: string }>
}) {
  const { category, page } = await params
  return (
    <article className="max-w-content mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-8">{page}</h1>
      <div className="text-sm text-text-secondary">加载中...</div>
    </article>
  )
}
