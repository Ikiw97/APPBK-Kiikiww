-- Create assessment_results table
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  answers JSONB NOT NULL,
  calculated_result JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX idx_assessment_results_student_name ON assessment_results(student_name);
CREATE INDEX idx_assessment_results_class ON assessment_results(class);
CREATE INDEX idx_assessment_results_created_at ON assessment_results(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Assessment results are publicly readable"
  ON assessment_results
  FOR SELECT
  USING (true);

-- Create policy to allow public insert
CREATE POLICY "Anyone can insert assessment results"
  ON assessment_results
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow public delete
CREATE POLICY "Anyone can delete assessment results"
  ON assessment_results
  FOR DELETE
  USING (true);

-- Create policy to allow public update
CREATE POLICY "Anyone can update assessment results"
  ON assessment_results
  FOR UPDATE
  USING (true);
  --
