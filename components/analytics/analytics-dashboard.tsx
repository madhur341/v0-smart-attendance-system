"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Clock, CheckCircle, Wifi } from "lucide-react"

interface AnalyticsData {
  totalStudents: number
  presentStudents: number
  attendanceRate: number
  avgSessionDuration: number
  weeklyTrends: Array<{ day: string; attendance: number; sessions: number }>
  verificationMethods: Array<{ method: string; count: number; color: string }>
  hourlyDistribution: Array<{ hour: string; students: number }>
  classPerformance: Array<{ class: string; rate: number; total: number }>
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalStudents: 156,
    presentStudents: 142,
    attendanceRate: 91.0,
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
      { method: "BLE + Face", count: 89, color: COLORS[0] },
      { method: "BLE Only", count: 34, color: COLORS[1] },
      { method: "Face Only", count: 19, color: COLORS[2] },
      { method: "Manual", count: 14, color: COLORS[3] },
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
  })

  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setAnalyticsData((prev) => ({
        ...prev,
        presentStudents: prev.presentStudents + Math.floor(Math.random() * 3) - 1,
        attendanceRate: Math.max(85, Math.min(95, prev.attendanceRate + (Math.random() - 0.5) * 2)),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time attendance insights and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-sm text-muted-foreground">{isLive ? "Live Updates" : "Static View"}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled this semester</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Now</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.presentStudents}</div>
            <p className="text-xs text-muted-foreground">Currently in sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.attendanceRate.toFixed(1)}%</div>
            <Progress value={analyticsData.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.avgSessionDuration}min</div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="verification">Verification Methods</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Distribution</TabsTrigger>
          <TabsTrigger value="performance">Class Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Weekly Attendance Trends</CardTitle>
              <CardDescription>Attendance rates and session counts over the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="attendance" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="sessions" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Verification Methods</CardTitle>
                <CardDescription>Distribution of attendance verification methods</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.verificationMethods}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.verificationMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Method Breakdown</CardTitle>
                <CardDescription>Detailed verification statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.verificationMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                      <span className="text-sm text-foreground">{method.method}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{method.count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {(
                          (method.count / analyticsData.verificationMethods.reduce((sum, m) => sum + m.count, 0)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Hourly Student Distribution</CardTitle>
              <CardDescription>Number of students present throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="students" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Class Performance</CardTitle>
              <CardDescription>Attendance rates by class/subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.classPerformance.map((classData, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{classData.class}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{classData.total} students</span>
                      <Badge
                        variant={classData.rate >= 90 ? "default" : classData.rate >= 80 ? "secondary" : "destructive"}
                      >
                        {classData.rate}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={classData.rate} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Activity Feed */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wifi className="h-4 w-4" />
            Live Activity Feed
          </CardTitle>
          <CardDescription>Recent attendance events and system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "2 min ago", event: "John Doe verified via BLE + Face Recognition", type: "success" },
              { time: "5 min ago", event: "Session started for Computer Science 101", type: "info" },
              { time: "8 min ago", event: "Sarah Smith marked present via BLE beacon", type: "success" },
              { time: "12 min ago", event: "Face verification failed for unknown user", type: "warning" },
              { time: "15 min ago", event: "New beacon deployed in Room 204", type: "info" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-green-500"
                      : activity.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.event}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
