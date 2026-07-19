import { Divider } from '@/components/ui/Divider'

export function Footer() {
  return (
    <footer className="max-w-page mx-auto px-6 pb-12 pt-4">
      <Divider />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-4">
          <a href="/rss.xml" className="hover:text-text-primary transition-colors">
            RSS
          </a>
          <a
            href="https://github.com/cittan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
        <p>© {new Date().getFullYear()} cittan</p>
      </div>
    </footer>
  )
}
