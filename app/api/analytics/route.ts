import { type NextRequest, NextResponse } from "next/server"

// Mock analytics data - in production, this would query your database
export async function GET(request: NextRequest) {
  try {
    const analyticsData = {
      totalStudents: 156,
      presentStudents: 142 + Math.floor(Math.random() * 10) - 5, // Simulate real-time changes
      attendanceRate: 91.0 + (Math.random() - 0.5) * 4,
      avgSessionDuration: 47,
      weeklyTrends: [
        { day: "Mon", attendance: 89, sessions: 12 },
        { day: "Tue", attendance: 94, sessions: 14 },
        { day: "Wed", attendance: 87, sessions: 11 },
        { day: "Thu", attendance: 92, sessions: 13 },
        { day: "Fri", attendance: 85, sessions: 10 },
        { day: "Sat", attendance: 78, sessions: 8 },
        { day: "Sun", attendance: 82, sessions: 9 },
      ],
      verificationMethods: [
        { method: "BLE + Face", count: 89, color: "hsl(var(--chart-1))" },
        { method: "BLE Only", count: 34, color: "hsl(var(--chart-2))" },
        { method: "Face Only", count: 19, color: "hsl(var(--chart-3))" },
        { method: "Manual", count: 14, color: "hsl(var(--chart-4))" },
      ],
      hourlyDistribution: [
        { hour: "8AM", students: 23 },
        { hour: "9AM", students: 45 },
        { hour: "10AM", students: 67 },
        { hour: "11AM", students: 89 },
        { hour: "12PM", students: 76 },
        { hour: "1PM", students: 54 },
        { hour: "2PM", students: 78 },
        { hour: "3PM", students: 92 },
        { hour: "4PM", students: 65 },
        { hour: "5PM", students: 34 },
      ],
      classPerformance: [
        { class: "Computer Science", rate: 94, total: 45 },
        { class: "Mathematics", rate: 89, total: 38 },
        { class: "Physics", rate: 87, total: 42 },
        { class: "Chemistry", rate: 91, total: 31 },
      ],
      recentActivity: [
        { time: "2 min ago", event: "John Doe verified via BLE + Face Recognition", type: "success" },
        { time: "5 min ago", event: "Session started for Computer Science 101", type: "info" },
        { time: "8 min ago", event: "Sarah Smith marked present via BLE beacon", type: "success" },
        { time: "12 min ago", event: "Face verification failed for unknown user", type: "warning" },
        { time: "15 min ago", event: "New beacon deployed in Room 204", type: "info" },
      ],
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
