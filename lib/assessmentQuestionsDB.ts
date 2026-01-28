// Assessment Questions Storage Helper with Supabase Integration
// Allows super admins and teachers to edit assessment questions via API

import { supabase } from './supabaseClient';
import { Question, assessmentQuestions as DEFAULT_ASSESSMENT_QUESTIONS } from './assessmentQuestions';
import { AKPDQuestion, AKPD_QUESTIONS } from './akpdQuestions';

// Generic function to get questions for any assessment type
export async function getAssessmentQuestions(type: string): Promise<Question[] | AKPDQuestion[]> {
  try {
    // Call the server-side API to avoid CORS issues
    const response = await fetch(`/api/get-assessment-questions?assessmentId=${type}`);
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      return result.data;
    }
  } catch (error) {
    console.warn(`Error loading ${type} questions via API:`, error);
  }

  // Fallback to defaults
  if (type === 'akpd') {
    return getAKPDQuestionsWithSupabase(); // Use existing logic/defaults for AKPD
  }

  // Generic fallback for other types
  const defaults = DEFAULT_ASSESSMENT_QUESTIONS[type];
  if (Array.isArray(defaults)) {
    return defaults;
  }

  return [];
}

// Load AUM Questions from Supabase (with fallback to localStorage and defaults)
export async function getAUMQuestionsWithSupabase(): Promise<Question[]> {
  const questions = await getAssessmentQuestions('aum');
  return questions as Question[];
}

// Load AKPD Questions from Supabase (with fallback to localStorage and defaults)
export async function getAKPDQuestionsWithSupabase(): Promise<AKPDQuestion[]> {
  try {
    // Try to load from Supabase
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('assessment_type', 'akpd')
      .order('question_id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.question_id,
        ...row.question_data
      }));
    }
  } catch (error) {
    console.warn('Error loading AKPD questions from Supabase:', error);
  }

  // Fallback to localStorage for migration
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('customAKPDQuestions');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          // Merge custom text with original questions to preserve structure
          return AKPD_QUESTIONS.map((original) => {
            const customQuestion = parsed.find((q: any) => q.id === original.id);
            if (customQuestion) {
              return {
                ...original,
                text: customQuestion.text,
              };
            }
            return original;
          });
        }
      }
    } catch (error) {
      console.warn('Error loading AKPD questions from localStorage:', error);
    }
  }

  return Array.isArray(AKPD_QUESTIONS) ? AKPD_QUESTIONS : [];
}

// Save assessment questions via API (Supabase)
export async function saveAssessmentQuestions(
  assessmentType: string,
  questions: any[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/assessment-questions/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessmentType,
        questions,
        currentUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save questions' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving assessment questions:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Wrapper for backward compatibility
export async function saveAUMQuestions(
  questions: Question[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  return saveAssessmentQuestions('aum', questions, currentUserId);
}

export async function saveAKPDQuestions(
  questions: AKPDQuestion[],
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  return saveAssessmentQuestions('akpd', questions, currentUserId);
}

