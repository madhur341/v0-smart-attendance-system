import { NextResponse } from "next/server"
import { mockSessions } from "@/lib/database"

export async function GET() {
  return NextResponse.json(mockSessions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newSession = {
    _id: Date.now().toString(),
    ...body,
    start_time: new Date(),
    status: "active" as const,
  }
  mockSessions.push(newSession)
  return NextResponse.json(newSession)
}
