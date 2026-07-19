import { NextResponse } from 'next/server'
import { getDB } from '@/server/db'
import { WikiRepository } from '@/server/repositories/wiki'
import { WikiService } from '@/server/services/wiki'

export const runtime = 'edge'

export async function GET() {
  const db = getDB()
  if (!db) {
    return NextResponse.json({ success: true, data: [] })
  }

  try {
    const repo = new WikiRepository(db)
    const service = new WikiService(repo)
    const categories = await service.getCategories()
    return NextResponse.json({ success: true, data: categories })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
