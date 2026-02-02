// Student Assessment Results Storage
// Stores results for each student by their ID and assessment type

export interface StudentAssessmentResult {
  studentId: string;
  studentName: string;
  assessmentType: string; // 'akpd', 'aum', 'personality', etc.
  assessmentTitle: string;
  score?: number;
  results: Record<string, any>; // Assessment specific results
  completedAt: string; // ISO timestamp
}

export interface StudentProfile {
  studentId: string;
  studentName: string;
  results: StudentAssessmentResult[];
}

const STUDENT_RESULTS_KEY = 'bk_student_results';

/**
 * Save assessment result for a student
 */
export function saveStudentAssessmentResult(
  studentId: string,
  studentName: string,
  assessmentType: string,
  assessmentTitle: string,
  results: Record<string, any>,
  score?: number
): StudentAssessmentResult {
  if (typeof window === 'undefined') return {} as StudentAssessmentResult;

  const result: StudentAssessmentResult = {
    studentId,
    studentName,
    assessmentType,
    assessmentTitle,
    score,
    results,
    completedAt: new Date().toISOString(),
  };

  try {
    // Get all results
    const allResults = getAllStudentResults();

    // Add new result
    allResults.push(result);

    // Save back to localStorage
    localStorage.setItem(STUDENT_RESULTS_KEY, JSON.stringify(allResults));

    return result;
  } catch (error) {
    console.error('Error saving assessment result:', error);
    throw error;
  }
}

/**
 * Get all results for a specific student
 */
export function getStudentResults(studentId: string): StudentAssessmentResult[] {
  if (typeof window === 'undefined') return [];

  try {
    const allResults = getAllStudentResults();
    return allResults.filter((result) => result.studentId === studentId);
  } catch (error) {
    console.error('Error getting student results:', error);
    return [];
  }
}

/**
 * Get all assessment results (all students)
 */
export function getAllStudentResults(): StudentAssessmentResult[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STUDENT_RESULTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading all results:', error);
  }

  return [];
}

/**
 * Get specific assessment result for a student
 */
export function getStudentAssessmentResult(
  studentId: string,
  assessmentType: string
): StudentAssessmentResult | undefined {
  const results = getStudentResults(studentId);
  return results.find((r) => r.assessmentType === assessmentType);
}

/**
 * Get all unique students (for teacher view)
 */
export function getAllStudents(): StudentProfile[] {
  const allResults = getAllStudentResults();
  const studentMap = new Map<string, StudentProfile>();

  for (const result of allResults) {
    if (!studentMap.has(result.studentId)) {
      studentMap.set(result.studentId, {
        studentId: result.studentId,
        studentName: result.studentName,
        results: [],
      });
    }

    const student = studentMap.get(result.studentId);
    if (student) {
      student.results.push(result);
    }
  }

  return Array.from(studentMap.values());
}

/**
 * Get assessment submission count by assessment type
 */
export function getAssessmentSubmissionCount(assessmentType: string): number {
  const allResults = getAllStudentResults();
  return allResults.filter((r) => r.assessmentType === assessmentType).length;
}

/**
 * Delete assessment result
 */
export function deleteAssessmentResult(
  studentId: string,
  assessmentType: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const allResults = getAllStudentResults();
    const filtered = allResults.filter(
      (r) => !(r.studentId === studentId && r.assessmentType === assessmentType)
    );
    localStorage.setItem(STUDENT_RESULTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting assessment result:', error);
  }
}

/**
 * Clear all results for a student
 */
export function clearStudentResults(studentId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const allResults = getAllStudentResults();
    const filtered = allResults.filter((r) => r.studentId !== studentId);
    localStorage.setItem(STUDENT_RESULTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error clearing student results:', error);
  }
}

/**
 * Export student results as JSON
 */
export function exportStudentResultsAsJSON(studentId: string): string {
  const results = getStudentResults(studentId);
  return JSON.stringify(results, null, 2);
}
