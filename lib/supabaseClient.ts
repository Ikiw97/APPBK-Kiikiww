import { createClient } from '@supabase/supabase-js';
import type { Question } from './assessmentQuestions';
import { calculateAUMResult } from './aumResultCalculator';
import { calculateAKPDResult } from './akpdResultCalculator';
import { calculateEIResult } from './eiResultCalculator';
import { ASSESSMENT_TITLES } from './assessmentConstants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Missing Supabase environment variables. ' +
    'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set. ' +
    'Supabase client may fail at runtime.'
  );
}

// Disable auto token refresh to prevent session issues on tab switch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Disable auto refresh to prevent re-auth on tab switch
    persistSession: true,
    detectSessionInUrl: false
  }
});

export interface AssessmentResult {
  id?: string;
  assessment_id: string;
  student_name: string;
  class: string;
  gender: string;
  answers: Record<string, string>;
  completed_at?: string;
  created_at?: string;
}

export async function submitAssessmentResult(
  assessmentId: string,
  formData: any,
  questions: any[]
): Promise<any> {
  const response = await fetch('/api/submit-assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessmentId, formData, questions }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to submit assessment');
  }

  // Trigger email notification (ran in background)
  const assessmentTitle = ASSESSMENT_TITLES[assessmentId] || assessmentId;
  fetch('/api/admin/send-assessment-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: String(formData.nama),
      assessmentTitle,
      className: String(formData.kelas),
    }),
  }).catch(err => console.error('Email notification error:', err));

  return result.data;
}

export async function getAssessmentResults(assessmentId: string) {
  try {
    console.log(`📥 Fetching assessment results for: ${assessmentId}`);

    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`❌ Error fetching results:`, error);
      throw error;
    }

    console.log(`✅ Fetched ${data?.length || 0} results:`, data?.map((d: any) => ({ id: d.id, name: d.student_name })));
    return data || [];
  } catch (error) {
    console.error(`❌ Exception in getAssessmentResults:`, error);
    throw error;
  }
}

export async function getAssessmentStats(assessmentId: string) {
  try {
    const results = await getAssessmentResults(assessmentId);
    const totalCompletions = results.length;

    const completionsByClass: Record<string, number> = {};
    results.forEach((result) => {
      const cls = result.class || 'Unknown';
      completionsByClass[cls] = (completionsByClass[cls] || 0) + 1;
    });

    return {
      totalCompletions,
      completionsByClass,
      // Note: completionPercentage would require knowing the total expected students
      // For now, we return totalCompletions which is more meaningful
      completionPercentage: totalCompletions,
    };
  } catch (error) {
    console.error('Error getting assessment stats:', error);
    return {
      totalCompletions: 0,
      completionsByClass: {},
      completionPercentage: 0,
    };
  }
}

export async function deleteAssessmentResult(resultId: string) {
  try {
    console.log('🗑️ Starting delete for resultId:', resultId);

    // First verify the record exists
    const { data: checkData, error: checkError } = await supabase
      .from('assessment_results')
      .select('id, student_name')
      .eq('id', resultId)
      .single();

    if (checkError) {
      console.warn('⚠️ Record not found to delete:', { resultId, error: checkError });
    } else {
      console.log('✓ Record found:', checkData);
    }

    // Now attempt the delete
    const { data, error, status, count } = await supabase
      .from('assessment_results')
      .delete()
      .eq('id', resultId);

    console.log('Delete response:', { status, count, error: error?.message });

    if (error) {
      console.error('❌ Delete error:', { error, code: error.code, message: error.message, resultId });
      throw new Error(`Failed to delete assessment result: ${error.message}`);
    }

    console.log('✅ Delete successful:', { resultId, deletedCount: count });
    return true;
  } catch (error) {
    console.error('❌ Exception in deleteAssessmentResult:', error);
    throw error;
  }
}
