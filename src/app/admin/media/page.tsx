import { MediaUploader } from '@/components/dashboard/MediaUploader'

export default function AdminMediaPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">媒体库</h1>
      <MediaUploader />
    </div>
  )
}
