export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-page mx-auto px-6 py-12">
      {children}
    </div>
  )
}
