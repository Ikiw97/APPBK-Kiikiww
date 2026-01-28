-- Create parent_guest_book table
CREATE TABLE IF NOT EXISTS parent_guest_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  student_class VARCHAR(50) NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  visit_purpose TEXT NOT NULL,
  problem_solution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_parent_guest_book_visit_date ON parent_guest_book(visit_date);
CREATE INDEX idx_parent_guest_book_student_class ON parent_guest_book(student_class);

-- Enable RLS
ALTER TABLE parent_guest_book ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Read" ON parent_guest_book FOR SELECT USING (true);
CREATE POLICY "Insert" ON parent_guest_book FOR INSERT WITH CHECK (true);
CREATE POLICY "Delete" ON parent_guest_book FOR DELETE USING (true);
CREATE POLICY "Update" ON parent_guest_book FOR UPDATE USING (true);