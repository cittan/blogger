import { NextResponse } from 'next/server'
import { getDB } from '@/server/db'

export const runtime = 'edge'

export async function GET() {
  const db = getDB()
  return NextResponse.json({
    dbAvailable: db !== null,
    dbType: db ? typeof db : 'null',
    hasPrepare: db ? typeof (db as any).prepare === 'function' : false,
  })
}
