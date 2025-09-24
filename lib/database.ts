export interface Student {
  _id: string
  name: string
  email: string
  device_uid: string
  face_embedding_encrypted?: string
  reference_photo_url?: string
  reference_photo_hash?: string
  photo_enrollment_date?: Date
  photo_enrollment_status?: "pending" | "enrolled" | "failed"
  class_id: string
  createdAt: Date
}

export interface Faculty {
  _id: string
  name: string
  email: string
  role: "teacher" | "admin"
  createdAt: Date
}

export interface Class {
  _id: string
  subject: string
  faculty_id: string
  schedule: {
    day: string
    start_time: string
    end_time: string
  }[]
  location: string
}

export interface Session {
  _id: string
  class_id: string
  start_time: Date
  end_time?: Date
  teacher_beacon_id: string
  status: "active" | "ended"
}

export interface Attendance {
  _id: string
  student_id: string
  session_id: string
  date: Date
  status: "present" | "absent" | "late"
  duration_seconds: number
  verified_by: "ble" | "face" | "quiz" | "manual"
}

export interface BeaconLog {
  _id: string
  student_id: string
  session_id: string
  beacon_id: string
  rssi: number
  timestamp: Date
}

export interface Question {
  _id: string
  faculty_id: string
  class_id: string
  text: string
  timestamp: Date
}

export interface Response {
  _id: string
  student_id: string
  question_id: string
  text: string
  timestamp: Date
}

// Mock data for development
export const mockStudents: Student[] = [
  {
    _id: "1",
    name: "Alex Johnson",
    email: "alex@university.edu",
    device_uid: "device_001",
    class_id: "class_1",
    createdAt: new Date(),
  },
  {
    _id: "2",
    name: "Sarah Chen",
    email: "sarah@university.edu",
    device_uid: "device_002",
    class_id: "class_1",
    createdAt: new Date(),
  },
]

export const mockFaculty: Faculty[] = [
  {
    _id: "1",
    name: "Dr. Emily Rodriguez",
    email: "emily@university.edu",
    role: "teacher",
    createdAt: new Date(),
  },
]

export const mockClasses: Class[] = [
  {
    _id: "class_1",
    subject: "Computer Science 101",
    faculty_id: "1",
    schedule: [
      { day: "Monday", start_time: "09:00", end_time: "10:30" },
      { day: "Wednesday", start_time: "09:00", end_time: "10:30" },
    ],
    location: "Room 204",
  },
]

export const mockSessions: Session[] = [
  {
    _id: "session_1",
    class_id: "class_1",
    start_time: new Date(),
    teacher_beacon_id: "beacon_001",
    status: "active",
  },
]
