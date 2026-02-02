// Pemetaan kategori lama ke 4 bidang baru
const CATEGORY_TO_FIELD_MAPPING: { [key: string]: string } = {
  'Spiritual & Emosi': 'Bidang Pribadi',
  'Emosi': 'Bidang Pribadi',
  'Kepribadian': 'Bidang Pribadi',
  'Pemecahan Masalah': 'Bidang Pribadi',
  'Kesehatan': 'Bidang Pribadi',
  'Perilaku': 'Bidang Pribadi',
  'Ketergantungan': 'Bidang Pribadi',
  'Nilai Moral': 'Bidang Pribadi',
  'Sosial': 'Bidang Sosial',
  'Keluarga': 'Bidang Sosial',
  'Pergaulan & Persahabatan': 'Bidang Sosial',
  'Akademik': 'Bidang Belajar',
  'Karir': 'Bidang Karir',
  'Pemahaman Risiko': 'Bidang Karir',
  'Keuangan': 'Bidang Karir',
};

export interface AKPDResult {
  studentName: string;
  schoolClass: string;
  gender: string;
  totalProblems: number;
  problemPercentage: number;
  problemStatement: string;
  categoryScores: {
    categoryName: string;
    fieldName: string;
    problemCount: number;
    categoryPercentage: number;
  }[];
  fieldScores: {
    fieldName: string;
    problemCount: number;
    categoryPercentage: number;
  }[];
  answers: { [key: string]: string };
  submittedAt: Date;
}

export function calculateAKPDResult(
  studentName: string,
  schoolClass: string,
  gender: string,
  answers: { [key: string]: string },
  questions: { id: string; category: string; text: string }[]
): AKPDResult {
  let totalProblems = 0;

  // Count 'Ya' answers
  Object.values(answers).forEach((answer) => {
    if (answer === 'Ya') {
      totalProblems += 1;
    }
  });

  // Calculate percentage
  const problemPercentage = Math.round((totalProblems / questions.length) * 100);

  // Categorize problems by category and field
  const categoryMap = new Map<string, { problem: number; total: number }>();
  const fieldMap = new Map<string, { problem: number; total: number }>();

  questions.forEach((question) => {
    const category = question.category;
    const fieldName = CATEGORY_TO_FIELD_MAPPING[category] || category;

    // Update category map
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { problem: 0, total: 0 });
    }
    const categoryData = categoryMap.get(category)!;
    categoryData.total += 1;

    // Update field map
    if (!fieldMap.has(fieldName)) {
      fieldMap.set(fieldName, { problem: 0, total: 0 });
    }
    const fieldData = fieldMap.get(fieldName)!;
    fieldData.total += 1;

    if (answers[question.id] === 'Ya') {
      categoryData.problem += 1;
      fieldData.problem += 1;
    }
  });

  // Build category scores with field names
  const categoryScores = Array.from(categoryMap.entries()).map(([categoryName, data]) => ({
    categoryName,
    fieldName: CATEGORY_TO_FIELD_MAPPING[categoryName] || categoryName,
    problemCount: data.problem,
    categoryPercentage: Math.round((data.problem / data.total) * 100),
  }));

  // Build field scores
  const fieldScores = Array.from(fieldMap.entries()).map(([fieldName, data]) => ({
    fieldName,
    problemCount: data.problem,
    categoryPercentage: Math.round((data.problem / data.total) * 100),
  }));

  // Find the field with highest problem percentage for the problem statement
  const highestFieldScore = fieldScores.reduce((prev, current) =>
    (prev.categoryPercentage > current.categoryPercentage) ? prev : current
  );

  // Generate problem statement
  let problemStatement = `${studentName} memiliki ${totalProblems} masalah dari ${questions.length} pertanyaan`;
  if (problemPercentage > 50) {
    problemStatement += ` - Level masalah TINGGI ${highestFieldScore.fieldName} - Butuh perhatian khusus dari guru BK`;
  } else if (problemPercentage > 30) {
    problemStatement += ` - Level masalah SEDANG ${highestFieldScore.fieldName} - Perlu bimbingan lanjutan`;
  } else {
    problemStatement += ' - Level masalah RENDAH ✓';
  }

  return {
    studentName,
    schoolClass,
    gender,
    totalProblems,
    problemPercentage,
    problemStatement,
    categoryScores: categoryScores.sort((a, b) => b.problemCount - a.problemCount),
    fieldScores: fieldScores.sort((a, b) => b.problemCount - a.problemCount),
    answers,
    submittedAt: new Date(),
  };
}
