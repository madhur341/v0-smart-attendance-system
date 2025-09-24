"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Wifi, Eye, MessageSquare, Play, Square, Download, Bell, Activity, Signal } from "lucide-react"
import { attendanceAPI } from "@/lib/api"
import type { Student, Session, Attendance } from "@/lib/database"
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"

export function FacultyDashboard() {
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [beaconEnabled, setBeaconEnabled] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [studentsData, sessionsData, attendanceData] = await Promise.all([
        attendanceAPI.getStudents(),
        attendanceAPI.getSessions(),
        attendanceAPI.getAttendance("session_1"),
      ])
      setStudents(studentsData)
      setActiveSession(sessionsData.find((s) => s.status === "active") || null)
      setAttendance(attendanceData)
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  const startSession = async () => {
    try {
      const session = await attendanceAPI.startSession("class_1", "beacon_001")
      setActiveSession(session)
      setBeaconEnabled(true)
    } catch (error) {
      console.error("Failed to start session:", error)
    }
  }

  const endSession = async () => {
    if (!activeSession) return
    try {
      await attendanceAPI.endSession(activeSession._id)
      setActiveSession(null)
      setBeaconEnabled(false)
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  const attendanceRate =
    attendance.length > 0 ? (attendance.filter((a) => a.status === "present").length / attendance.length) * 100 : 0

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 gradient-flow opacity-10 rounded-full blur-3xl animate-flow"></div>
        <div
          className="absolute bottom-0 left-0 w-80 h-80 gradient-flow-subtle opacity-15 rounded-full blur-2xl animate-flow"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">FACULTY CONTROL CENTER</h1>
            <p className="text-lg text-iridescent-cyan font-medium">Computer Science 101 - Room 204</p>
            <div className="w-32 h-1 gradient-flow rounded-full mt-2"></div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="glass border-gradient glow-cyan hover:scale-105 transition-all bg-transparent"
            >
              <Download className="w-4 h-4 mr-2 text-iridescent-cyan" />
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass border-gradient glow-magenta hover:scale-105 transition-all bg-transparent"
            >
              <Bell className="w-4 h-4 mr-2 text-iridescent-magenta" />
              Notifications
            </Button>
          </div>
        </div>

        <Card className="glass-card border-gradient glow-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient">
              <Activity className="w-5 h-5 text-iridescent-purple" />
              Session Control Matrix
            </CardTitle>
            <CardDescription>Start or stop attendance tracking session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${activeSession ? "bg-iridescent-cyan animate-pulse" : "bg-muted"} glow-cyan`}
                  />
                  <span className="font-medium text-foreground">
                    {activeSession ? "Session Active" : "No Active Session"}
                  </span>
                </div>
                {activeSession && (
                  <Badge variant="secondary" className="glass border-gradient">
                    Started {new Date(activeSession.start_time).toLocaleTimeString()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeSession ? (
                  <Button onClick={endSession} className="bg-destructive hover:bg-destructive/80 glow-magenta">
                    <Square className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                ) : (
                  <Button onClick={startSession} className="gradient-flow glow-cyan hover:scale-105 transition-all">
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-gradient glow-purple hover:scale-105 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Students</CardTitle>
              <Users className="h-5 w-5 text-iridescent-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">{students.length}</div>
              <p className="text-xs text-muted-foreground">Enrolled in class</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gradient glow-cyan hover:scale-105 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Present Today</CardTitle>
              <Activity className="h-5 w-5 text-iridescent-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-iridescent-cyan">
                {attendance.filter((a) => a.status === "present").length}
              </div>
              <p className="text-xs text-muted-foreground">{attendanceRate.toFixed(1)}% attendance rate</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gradient glow-blue hover:scale-105 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">BLE Signals</CardTitle>
              <Wifi className="h-5 w-5 text-iridescent-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-iridescent-blue">{beaconEnabled ? students.length : 0}</div>
              <p className="text-xs text-muted-foreground">Active beacon connections</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gradient glow-magenta hover:scale-105 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Verified</CardTitle>
              <Eye className="h-5 w-5 text-iridescent-magenta" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-iridescent-magenta">
                {attendance.filter((a) => a.verified_by === "face").length}
              </div>
              <p className="text-xs text-muted-foreground">Face verification complete</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass border-gradient p-1">
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-iridescent-purple data-[state=active]:text-white"
            >
              Live Attendance
            </TabsTrigger>
            <TabsTrigger
              value="beacon"
              className="data-[state=active]:bg-iridescent-cyan data-[state=active]:text-white"
            >
              BLE Monitoring
            </TabsTrigger>
            <TabsTrigger
              value="verification"
              className="data-[state=active]:bg-iridescent-magenta data-[state=active]:text-white"
            >
              Verification
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-iridescent-blue data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="glass-card border-gradient">
              <CardHeader>
                <CardTitle className="text-gradient">Real-time Attendance Matrix</CardTitle>
                <CardDescription>Live attendance tracking with verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => {
                    const studentAttendance = attendance.find((a) => a.student_id === student._id)
                    return (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-4 glass border-gradient rounded-lg hover:glow-purple transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 gradient-flow rounded-full flex items-center justify-center glow-purple">
                            <span className="text-sm font-bold text-white">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={studentAttendance?.status === "present" ? "default" : "secondary"}
                            className={
                              studentAttendance?.status === "present" ? "bg-iridescent-cyan text-white" : "glass"
                            }
                          >
                            {studentAttendance?.status || "Not marked"}
                          </Badge>
                          <Badge variant="outline" className="glass border-gradient">
                            {studentAttendance?.verified_by || "Unverified"}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Signal className="w-4 h-4 text-iridescent-cyan animate-pulse" />
                            <span className="text-sm text-muted-foreground">-45 dBm</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beacon" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  BLE Beacon Control
                </CardTitle>
                <CardDescription>Manage Bluetooth beacon broadcasting and monitor signal strength</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Beacon Broadcasting</p>
                    <p className="text-sm text-muted-foreground">Enable to start detecting student devices</p>
                  </div>
                  <Switch checked={beaconEnabled} onCheckedChange={setBeaconEnabled} />
                </div>

                {beaconEnabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm font-medium">Beacon ID</p>
                        <p className="text-lg font-mono">beacon_001</p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm font-medium">Signal Range</p>
                        <p className="text-lg">~10 meters</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Signal Strength Distribution</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Strong (-30 to -50 dBm)</span>
                          <span>4 devices</span>
                        </div>
                        <Progress value={80} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span>Medium (-50 to -70 dBm)</span>
                          <span>2 devices</span>
                        </div>
                        <Progress value={40} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span>Weak (-70+ dBm)</span>
                          <span>0 devices</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Identity Verification
                </CardTitle>
                <CardDescription>Trigger face recognition and quiz challenges for students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Eye className="w-6 h-6 mb-2" />
                    Trigger Face Check
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Send Quiz Challenge
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Recent Verifications</p>
                  <div className="space-y-2">
                    {attendance
                      .filter((a) => a.verified_by === "face")
                      .map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
                          <span className="text-sm">{students.find((s) => s._id === record.student_id)?.name}</span>
                          <Badge variant="default">Face Verified</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
