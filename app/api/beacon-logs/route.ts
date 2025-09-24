import { NextResponse } from "next/server"
import type { BeaconLog } from "@/lib/database"

const mockBeaconLogs: BeaconLog[] = []

export async function GET() {
  return NextResponse.json(mockBeaconLogs)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newBeaconLog: BeaconLog = {
    _id: Date.now().toString(),
    ...body,
    timestamp: new Date(body.timestamp),
  }
  mockBeaconLogs.push(newBeaconLog)
  return NextResponse.json(newBeaconLog)
}
