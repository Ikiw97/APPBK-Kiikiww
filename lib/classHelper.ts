export type SchoolMode = 'smp' | 'sma_smk';

export interface ClassOption {
  value: string;
  label: string;
  gradeLevel: string;
}

const smpGrades = ['VII', 'VIII', 'IX'];
const smaSmkGrades = ['X', 'XI', 'XII'];
const subClasses = ['1', '2', '3', '4'];

export function getGradesByMode(mode: SchoolMode): string[] {
  return mode === 'smp' ? smpGrades : smaSmkGrades;
}

export function generateClasses(mode: SchoolMode): ClassOption[] {
  const grades = getGradesByMode(mode);
  const classes: ClassOption[] = [];

  grades.forEach((grade) => {
    subClasses.forEach((subClass) => {
      const classValue = `${grade}-${subClass}`;
      classes.push({
        value: classValue,
        label: classValue,
        gradeLevel: grade,
      });
    });
  });

  return classes;
}

export function getGradeLabel(mode: SchoolMode): string {
  return mode === 'smp' ? 'Kelas SMP' : 'Kelas SMA/SMK';
}

export function getSchoolModeLabel(mode: SchoolMode): string {
  return mode === 'smp' ? 'SMP' : 'SMA/SMK';
}
