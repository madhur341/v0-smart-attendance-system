import { NextResponse } from "next/server"
import { mockStudents } from "@/lib/database"

export async function GET() {
  return NextResponse.json(mockStudents)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newStudent = {
    _id: Date.now().toString(),
    ...body,
    createdAt: new Date(),
  }
  mockStudents.push(newStudent)
  return NextResponse.json(newStudent)
}
