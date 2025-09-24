"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  Wifi,
  Eye,
  CheckCircle,
  AlertCircle,
  Signal,
  Smartphone,
  Camera,
  MessageSquare,
  TrendingUp,
} from "lucide-react"
import { BLEScannerWidget } from "@/components/ble/ble-scanner-widget"
import { FaceScanner } from "@/components/face-recognition/face-scanner"
import { attendanceAPI } from "@/lib/api"
import type { FaceVerificationResult } from "@/lib/face-recognition"

interface StudentDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [bleStatus, setBleStatus] = useState<"scanning" | "connected" | "disconnected">("disconnected")
  const [faceVerified, setFaceVerified] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState<"present" | "absent" | "pending">("pending")
  const [signalStrength, setSignalStrength] = useState(-45)
  const [showFaceScanner, setShowFaceScanner] = useState(false)

  const handleBeaconDetected = async (beaconId: string, rssi: number) => {
    setBleStatus("connected")
    setSignalStrength(rssi)

    // Automatically mark attendance when beacon is detected
    if (attendanceStatus === "pending") {
      try {
        await attendanceAPI.markAttendance({
          student_id: user.id,
          session_id: "session_1",
          status: "present",
          duration_seconds: 0,
          verified_by: "ble",
        })
        setAttendanceStatus("present")

        // Log beacon data
        await attendanceAPI.logBeaconData({
          student_id: user.id,
          session_id: "session_1",
          beacon_id: beaconId,
          rssi: rssi,
          timestamp: new Date(),
        })
      } catch (error) {
        console.error("Failed to mark attendance:", error)
      }
    }
  }

  const handleFaceVerification = (result: FaceVerificationResult) => {
    if (result.verified) {
      setFaceVerified(true)
      setShowFaceScanner(false)

      // Update attendance with face verification
      attendanceAPI
        .markAttendance({
          student_id: user.id,
          session_id: "session_1",
          status: "present",
          duration_seconds: 0,
          verified_by: "face",
        })
        .catch((error) => {
          console.error("Failed to update attendance with face verification:", error)
        })
    }
  }

  const triggerFaceVerification = () => {
    setShowFaceScanner(true)
  }

  const attendanceRate = 85 // Mock attendance rate

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}</h1>
            <p className="text-muted-foreground">Computer Science 101 - Room 204</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Status</CardTitle>
              <CheckCircle
                className={`h-4 w-4 ${attendanceStatus === "present" ? "text-green-500" : "text-gray-400"}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={attendanceStatus === "present" ? "default" : "secondary"}>
                  {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {attendanceStatus === "present" ? "Marked present via BLE" : "Not yet marked"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BLE Connection</CardTitle>
              <Wifi className={`h-4 w-4 ${bleStatus === "connected" ? "text-green-500" : "text-gray-400"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={bleStatus === "connected" ? "default" : "outline"}>
                  {bleStatus.charAt(0).toUpperCase() + bleStatus.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Signal: {signalStrength} dBm</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verification</CardTitle>
              <Eye className={`h-4 w-4 ${faceVerified ? "text-green-500" : "text-gray-400"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={faceVerified ? "default" : "outline"}>{faceVerified ? "Verified" : "Pending"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {faceVerified ? "Face recognition complete" : "Face verification required"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <BLEScannerWidget onBeaconDetected={handleBeaconDetected} targetBeaconId="beacon_001" />

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Today's Session</CardTitle>
                <CardDescription>Current class attendance tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {attendanceStatus === "pending" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please ensure Bluetooth is enabled and you're within range of the classroom beacon.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">BLE Detection</p>
                        <p className="text-sm text-muted-foreground">Automatic presence detection</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={bleStatus === "connected" ? "default" : "outline"}>{bleStatus}</Badge>
                    </div>
                  </div>

                  {bleStatus === "connected" && (
                    <div className="p-4 border border-border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Signal className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Connected to Classroom Beacon</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Beacon ID:</span>
                          <span className="ml-2 font-mono">beacon_001</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Signal Strength:</span>
                          <span className="ml-2">{signalStrength} dBm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Face Verification</p>
                        <p className="text-sm text-muted-foreground">AI-powered identity confirmation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!faceVerified && (
                        <Button onClick={triggerFaceVerification} size="sm" variant="outline">
                          Verify Face
                        </Button>
                      )}
                      <Badge variant={faceVerified ? "default" : "outline"}>
                        {faceVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Class Schedule
                </CardTitle>
                <CardDescription>Your upcoming classes and sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Computer Science 101</p>
                        <p className="text-sm text-muted-foreground">Room 204 • Dr. Emily Rodriguez</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">9:00 - 10:30 AM</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Data Structures</p>
                        <p className="text-sm text-muted-foreground">Room 301 • Prof. Michael Chen</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">2:00 - 3:30 PM</p>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            {showFaceScanner ? (
              <FaceScanner onVerificationComplete={handleFaceVerification} mode="verification" studentId={user.id} />
            ) : (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>Complete additional verification if requested</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col bg-transparent"
                      onClick={triggerFaceVerification}
                      disabled={faceVerified}
                    >
                      <Camera className="w-6 h-6 mb-2" />
                      {faceVerified ? "Face Verified" : "Start Face Scan"}
                    </Button>

                    <Button variant="outline" className="h-20 flex-col bg-transparent">
                      <MessageSquare className="w-6 h-6 mb-2" />
                      Quiz Challenge
                    </Button>
                  </div>

                  {faceVerified && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Face verification completed successfully. Your identity has been confirmed.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Attendance History
                </CardTitle>
                <CardDescription>Your attendance record and statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{attendanceRate}%</p>
                    <p className="text-sm text-muted-foreground">Overall Attendance Rate</p>
                  </div>
                  <Progress value={attendanceRate} className="w-32" />
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Recent Sessions</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-border rounded">
                      <span className="text-sm">Today - CS 101</span>
                      <Badge variant="default">Present</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded">
                      <span className="text-sm">Yesterday - CS 101</span>
                      <Badge variant="default">Present</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded">
                      <span className="text-sm">Dec 20 - CS 101</span>
                      <Badge variant="secondary">Absent</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
