import type { Student, Faculty, Class, Session, Attendance, BeaconLog } from "./database"

export class AttendanceAPI {
  private baseUrl = "/api"

  async getStudents(): Promise<Student[]> {
    const response = await fetch(`${this.baseUrl}/students`)
    return response.json()
  }

  async getFaculty(): Promise<Faculty[]> {
    const response = await fetch(`${this.baseUrl}/faculty`)
    return response.json()
  }

  async getClasses(): Promise<Class[]> {
    const response = await fetch(`${this.baseUrl}/classes`)
    return response.json()
  }

  async getSessions(): Promise<Session[]> {
    const response = await fetch(`${this.baseUrl}/sessions`)
    return response.json()
  }

  async startSession(classId: string, beaconId: string): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: classId, teacher_beacon_id: beaconId }),
    })
    return response.json()
  }

  async endSession(sessionId: string): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/end`, {
      method: "POST",
    })
    return response.json()
  }

  async logBeaconData(data: Omit<BeaconLog, "_id">): Promise<BeaconLog> {
    const response = await fetch(`${this.baseUrl}/beacon-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async getAttendance(sessionId: string): Promise<Attendance[]> {
    const response = await fetch(`${this.baseUrl}/attendance/${sessionId}`)
    return response.json()
  }

  async markAttendance(data: Omit<Attendance, "_id">): Promise<Attendance> {
    const response = await fetch(`${this.baseUrl}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  }
}

export const attendanceAPI = new AttendanceAPI()
