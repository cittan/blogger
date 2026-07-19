export function AsideNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden lg:block absolute right-[-280px] top-0 w-[250px] bg-accent-amber/5 border border-accent-amber/10 rounded-journal p-4 text-xs text-text-secondary leading-relaxed">
      {children}
    </aside>
  )
}
