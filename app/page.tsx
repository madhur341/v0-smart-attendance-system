"use client"

import { useAuth, AuthProvider } from "@/components/auth/auth-provider"
import { LoginForm } from "@/components/auth/login-form"
import { FacultyDashboard } from "@/components/faculty-dashboard"
import { StudentDashboard } from "@/components/student/student-dashboard"
import { Loader2 } from "lucide-react"

function AppContent() {
  const { user, login, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={login} />
  }

  if (user.role === "faculty") {
    return <FacultyDashboard />
  }

  return <StudentDashboard user={user} />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
