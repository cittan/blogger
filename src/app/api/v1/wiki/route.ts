import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: true, data: [] })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    
    if (type === 'tree') {
      const tree = await service.getCategoryTree()
      return NextResponse.json({ success: true, data: tree })
    }
    
    const categories = await service.getAllCategories()
    return NextResponse.json({ success: true, data: categories })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
