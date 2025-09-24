import { NextResponse } from "next/server"
import { mockSessions } from "@/lib/database"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id
  const session = mockSessions.find((s) => s._id === sessionId)

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  session.end_time = new Date()
  session.status = "ended"

  return NextResponse.json(session)
}
