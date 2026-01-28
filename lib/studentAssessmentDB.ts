// Helper functions for saving student assessment results to Supabase
import { supabase } from './supabaseClient';

export interface StudentAssessmentInput {
  studentId: string;
  studentName: string;
  assessmentType: string; // 'akpd', 'aum', 'personality', etc.
  assessmentTitle: string;
  score?: number;
  results: Record<string, any>; // Assessment specific results
}

/**
 * Save assessment result untuk seorang siswa ke Supabase
 */
export async function saveStudentAssessmentToDB(
  input: StudentAssessmentInput
) {
  try {
    const { data, error } = await supabase
      .from('student_assessments')
      .insert([
        {
          student_id: input.studentId,
          student_name: input.studentName,
          assessment_type: input.assessmentType,
          assessment_title: input.assessmentTitle,
          score: input.score,
          results: input.results,
          completed_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error saving assessment to DB:', error);
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('Failed to save assessment:', error);
    throw error;
  }
}

/**
 * Get semua assessment results untuk satu siswa
 */
export async function getStudentAssessments(studentId: string) {
  try {
    const { data, error } = await supabase
      .from('student_assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching student assessments:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return [];
  }
}

/**
 * Get specific assessment result untuk satu siswa
 */
export async function getStudentAssessmentResult(
  studentId: string,
  assessmentType: string
) {
  try {
    const { data, error } = await supabase
      .from('student_assessments')
      .select('*')
      .eq('student_id', studentId)
      .eq('assessment_type', assessmentType)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is okay
      console.error('Error fetching assessment result:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch assessment result:', error);
    return null;
  }
}

/**
 * Get all assessment results per student (untuk teacher view)
 */
export async function getAllStudentAssessmentResults() {
  try {
    const { data, error } = await supabase
      .from('student_assessments')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching all assessments:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch all assessments:', error);
    return [];
  }
}

/**
 * Get assessment results by type (untuk teacher statistics)
 */
export async function getAssessmentResultsByType(assessmentType: string) {
  try {
    const { data, error } = await supabase
      .from('student_assessments')
      .select('*')
      .eq('assessment_type', assessmentType)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessment results by type:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch assessment results by type:', error);
    return [];
  }
}

/**
 * Update assessment result (jika perlu edit)
 */
export async function updateStudentAssessmentResult(
  resultId: string,
  updates: Partial<StudentAssessmentInput>
) {
  try {
    const { data, error } = await supabase
      .from('student_assessments')
      .update({
        assessment_title: updates.assessmentTitle,
        score: updates.score,
        results: updates.results,
      })
      .eq('id', resultId)
      .select();

    if (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('Failed to update assessment:', error);
    throw error;
  }
}

/**
 * Delete assessment result
 */
export async function deleteStudentAssessmentResult(resultId: string) {
  try {
    const { error } = await supabase
      .from('student_assessments')
      .delete()
      .eq('id', resultId);

    if (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete assessment:', error);
    throw error;
  }
}

/**
 * Get assessment statistics by student
 */
export async function getStudentAssessmentStats(studentId: string) {
  try {
    const assessments = await getStudentAssessments(studentId);

    const stats = {
      totalAssessments: assessments.length,
      assessmentsByType: {} as Record<string, number>,
      averageScore: 0,
      lastCompleted: null as string | null,
    };

    assessments.forEach((assessment: any) => {
      stats.assessmentsByType[assessment.assessment_type] =
        (stats.assessmentsByType[assessment.assessment_type] || 0) + 1;
    });

    if (assessments.length > 0 && assessments[0].completed_at) {
      stats.lastCompleted = assessments[0].completed_at;
    }

    // Calculate average score
    const scoresCount = assessments.filter((a: any) => a.score).length;
    if (scoresCount > 0) {
      const totalScore = assessments.reduce(
        (sum: number, a: any) => sum + (a.score || 0),
        0
      );
      stats.averageScore = Math.round(totalScore / scoresCount);
    }

    return stats;
  } catch (error) {
    console.error('Failed to get assessment stats:', error);
    return null;
  }
}
