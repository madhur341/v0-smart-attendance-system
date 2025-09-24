"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User, GraduationCap, UserCheck } from "lucide-react"

interface LoginFormProps {
  onLogin: (user: { id: string; name: string; email: string; role: "student" | "faculty" }) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    deviceId: "",
  })

  const handleLogin = async (role: "student" | "faculty") => {
    setIsLoading(true)
    setError("")

    try {
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all required fields")
      }

      // Mock successful login
      onLogin({
        id: Date.now().toString(),
        name: formData.name || formData.email.split("@")[0],
        email: formData.email,
        role,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 gradient-flow opacity-20 rounded-full blur-3xl animate-flow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 gradient-flow-subtle opacity-30 rounded-full blur-2xl animate-flow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-iridescent-purple opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient">SMART ATTENDANCE</h1>
          <p className="text-lg text-iridescent-cyan font-medium">BLE + AI Face Recognition Platform</p>
          <div className="w-24 h-1 gradient-flow mx-auto rounded-full"></div>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass p-1 border-gradient">
            <TabsTrigger
              value="student"
              className="flex items-center gap-2 data-[state=active]:bg-iridescent-purple data-[state=active]:text-white"
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </TabsTrigger>
            <TabsTrigger
              value="faculty"
              className="flex items-center gap-2 data-[state=active]:bg-iridescent-cyan data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4" />
              Faculty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card className="glass-card border-gradient glow-purple">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <GraduationCap className="w-5 h-5 text-iridescent-purple" />
                  Student Access Portal
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Access your attendance dashboard and class schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-iridescent-cyan" />
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="student@university.edu"
                      className="pl-10 glass border-gradient focus:glow-cyan"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password" className="text-foreground font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-iridescent-magenta" />
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 glass border-gradient focus:glow-magenta"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device-id" className="text-foreground font-medium">
                    Device ID
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-iridescent-orange" />
                    <Input
                      id="device-id"
                      placeholder="Auto-generated device identifier"
                      className="pl-10 glass border-gradient focus:glow-orange"
                      value={formData.deviceId}
                      onChange={(e) => handleInputChange("deviceId", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be automatically generated on mobile devices
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="glass-card border-destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => handleLogin("student")}
                  className="w-full gradient-flow text-white font-semibold py-3 glow-purple hover:scale-105 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Enter Student Portal"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-sm text-iridescent-cyan hover:text-iridescent-magenta transition-colors"
                  >
                    Need help with your account?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty">
            <Card className="glass-card border-gradient glow-cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <UserCheck className="w-5 h-5 text-iridescent-cyan" />
                  Faculty Control Center
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Access the faculty dashboard and manage attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty-email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-iridescent-cyan" />
                    <Input
                      id="faculty-email"
                      type="email"
                      placeholder="faculty@university.edu"
                      className="pl-10 glass border-gradient focus:glow-cyan"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty-password" className="text-foreground font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-iridescent-magenta" />
                    <Input
                      id="faculty-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 glass border-gradient focus:glow-magenta"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="glass-card border-destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => handleLogin("faculty")}
                  className="w-full bg-iridescent-cyan hover:bg-iridescent-blue text-white font-semibold py-3 glow-cyan hover:scale-105 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Enter Faculty Portal"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-sm text-iridescent-cyan hover:text-iridescent-magenta transition-colors"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-iridescent-cyan rounded-full animate-pulse"></span>
            Secure authentication with device binding and JWT tokens
            <span className="w-2 h-2 bg-iridescent-magenta rounded-full animate-pulse"></span>
          </p>
        </div>
      </div>
    </div>
  )
}
