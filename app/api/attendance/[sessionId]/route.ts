import { NextResponse } from "next/server"
import type { Attendance } from "@/lib/database"

const mockAttendance: Attendance[] = [
  {
    _id: "1",
    student_id: "1",
    session_id: "session_1",
    date: new Date(),
    status: "present",
    duration_seconds: 5400,
    verified_by: "ble",
  },
  {
    _id: "2",
    student_id: "2",
    session_id: "session_1",
    date: new Date(),
    status: "present",
    duration_seconds: 5100,
    verified_by: "face",
  },
]

export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId
  const attendance = mockAttendance.filter((a) => a.session_id === sessionId)
  return NextResponse.json(attendance)
}
