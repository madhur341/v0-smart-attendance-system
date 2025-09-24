-- Smart Attendance System Database Schema
-- MongoDB equivalent structure represented as SQL for reference

-- Students Collection
CREATE TABLE IF NOT EXISTS students (
    _id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    device_uid VARCHAR(255) UNIQUE,
    face_embedding_encrypted TEXT,
    class_id VARCHAR(24),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Faculty Collection
CREATE TABLE IF NOT EXISTS faculty (
    _id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('faculty', 'admin') DEFAULT 'faculty',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes Collection
CREATE TABLE IF NOT EXISTS classes (
    _id VARCHAR(24) PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    faculty_id VARCHAR(24),
    schedule JSON, -- Store schedule as JSON
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(_id)
);

-- Sessions Collection
CREATE TABLE IF NOT EXISTS sessions (
    _id VARCHAR(24) PRIMARY KEY,
    class_id VARCHAR(24),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    teacher_beacon_id VARCHAR(255),
    status ENUM('active', 'ended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(_id)
);

-- Attendance Collection
CREATE TABLE IF NOT EXISTS attendance (
    _id VARCHAR(24) PRIMARY KEY,
    student_id VARCHAR(24),
    session_id VARCHAR(24),
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') DEFAULT 'absent',
    duration_seconds INT DEFAULT 0,
    verified_by ENUM('ble', 'face', 'quiz', 'manual') DEFAULT 'ble',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(_id),
    FOREIGN KEY (session_id) REFERENCES sessions(_id)
);

-- Beacon Logs Collection
CREATE TABLE IF NOT EXISTS beacon_logs (
    _id VARCHAR(24) PRIMARY KEY,
    student_id VARCHAR(24),
    session_id VARCHAR(24),
    beacon_id VARCHAR(255),
    rssi INT, -- Signal strength in dBm
    distance_meters DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(_id),
    FOREIGN KEY (session_id) REFERENCES sessions(_id)
);

-- Questions Collection (for quiz challenges)
CREATE TABLE IF NOT EXISTS questions (
    _id VARCHAR(24) PRIMARY KEY,
    faculty_id VARCHAR(24),
    class_id VARCHAR(24),
    text TEXT NOT NULL,
    options JSON, -- Store multiple choice options as JSON
    correct_answer VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(_id),
    FOREIGN KEY (class_id) REFERENCES classes(_id)
);

-- Responses Collection (student quiz responses)
CREATE TABLE IF NOT EXISTS responses (
    _id VARCHAR(24) PRIMARY KEY,
    student_id VARCHAR(24),
    question_id VARCHAR(24),
    text TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(_id),
    FOREIGN KEY (question_id) REFERENCES questions(_id)
);

-- Insert sample data
INSERT INTO faculty (_id, name, email, role) VALUES
('faculty_1', 'Dr. Sarah Johnson', 'sarah.johnson@university.edu', 'faculty'),
('faculty_2', 'Prof. Michael Chen', 'michael.chen@university.edu', 'faculty'),
('admin_1', 'Admin User', 'admin@university.edu', 'admin');

INSERT INTO classes (_id, subject, faculty_id, location) VALUES
('class_1', 'Computer Science 101', 'faculty_1', 'Room 204'),
('class_2', 'Advanced Algorithms', 'faculty_1', 'Room 301'),
('class_3', 'Database Systems', 'faculty_2', 'Room 205');

INSERT INTO students (_id, name, email, class_id, device_uid) VALUES
('student_1', 'John Doe', 'john.doe@student.edu', 'class_1', 'device_001'),
('student_2', 'Jane Smith', 'jane.smith@student.edu', 'class_1', 'device_002'),
('student_3', 'Bob Wilson', 'bob.wilson@student.edu', 'class_1', 'device_003'),
('student_4', 'Alice Brown', 'alice.brown@student.edu', 'class_1', 'device_004'),
('student_5', 'Charlie Davis', 'charlie.davis@student.edu', 'class_1', 'device_005');

-- Create indexes for better performance
CREATE INDEX idx_attendance_student_session ON attendance(student_id, session_id);
CREATE INDEX idx_beacon_logs_timestamp ON beacon_logs(timestamp);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_students_class ON students(class_id);
