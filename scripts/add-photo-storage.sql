-- Add photo storage fields to students table
ALTER TABLE students ADD COLUMN reference_photo_url TEXT;
ALTER TABLE students ADD COLUMN reference_photo_hash VARCHAR(255);
ALTER TABLE students ADD COLUMN photo_enrollment_date TIMESTAMP;
ALTER TABLE students ADD COLUMN photo_enrollment_status ENUM('pending', 'enrolled', 'failed') DEFAULT 'pending';

-- Update existing students to have pending photo enrollment status
UPDATE students SET photo_enrollment_status = 'pending' WHERE photo_enrollment_status IS NULL;

-- Add index for photo queries
CREATE INDEX idx_students_photo_status ON students(photo_enrollment_status);
