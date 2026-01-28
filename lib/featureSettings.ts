// Feature access control settings
export interface FeatureSettings {
  assessments: {
    akpd: boolean;
    aum: boolean;
    personality: boolean;
    emotional_intelligence: boolean;
    kecerdasan_majemuk: boolean;
    gaya_belajar: boolean;
    sma_smk: boolean;
    introvert_extrovert: boolean;
    stress_akademik: boolean;
    temperament: boolean;
    self_awareness: boolean;
    sdq: boolean;
    mbti: boolean;
    big_five: boolean;
    grit: boolean;
    holland_code: boolean;
    rmib: boolean;
    sociometry: boolean;
  };
  exercises: {
    psikotest: boolean;
    analogi: boolean;
    tiu: boolean;
  };
  games: {
    vocabulary: boolean;
    puzzle: boolean;
    kahoot: boolean;
  };
  system: {
    maintenanceMode: boolean;
    emailNotifications: boolean;
    systemAnnouncements: boolean;
    schoolName: string;
    adminEmail: string;
  };
  studentManagement: {
    studentEnrollment: boolean;
    classTracking: boolean;
    dataExport: boolean;
  };
  reporting: {
    progressTracking: boolean;
    assessmentReports: boolean;
    analyticsBoard: boolean;
  };
  dataManagement: {
    autoBackup: boolean;
    dataRetention: boolean;
    privacySettings: boolean;
  };
}

export interface StudentAccessFeatures {
  assessments: string[];
  exercises: string[];
  games: string[];
}

// Default settings (all features enabled for admin full access)
export const DEFAULT_SETTINGS: FeatureSettings = {
  // Assessment features
  assessments: {
    akpd: true,        // ✅ AKPD - Angket Kebutuhan Peserta Didik (ENABLED for admin)
    aum: true,         // ✅ AUM - Alat Ungkap Masalah (ENABLED for admin)
    personality: true, // ✅ Personality Assessment (ENABLED for admin)
    emotional_intelligence: true, // ✅ Emotional Intelligence Assessment (ENABLED for admin)
    kecerdasan_majemuk: true,
    gaya_belajar: true,
    sma_smk: true,
    introvert_extrovert: true,
    stress_akademik: true,
    temperament: true,
    self_awareness: true,
    sdq: true,         // ✅ SDQ - Strength and Difficulties Questionnaire (ENABLED for admin)
    mbti: true,        // ✅ MBTI - Myers-Briggs Type Indicator (ENABLED for admin)
    big_five: true,    // ✅ Big Five Personality (ENABLED for admin)
    grit: true,        // ✅ GRIT Assessment (ENABLED for admin)
    holland_code: true, // ✅ Holland Code (RIASEC) (ENABLED for admin)
    rmib: true,
    sociometry: true,  // ✅ Sociometry (New)
  },
  // Exercise features
  exercises: {
    psikotest: true,   // ✅ Psikotest Logika
    analogi: true,     // ✅ Test Analogi
    tiu: true,         // ✅ TIU - Tes Intelegensi Umum
  },
  // Game features
  games: {
    vocabulary: true,  // ✅ Vocabulary Game (ENABLED for admin)
    puzzle: true,      // ✅ Puzzle Game (ENABLED for admin)
    kahoot: true,      // ✅ Kahoot Game (ENABLED for admin)
  },
  // System configuration
  system: {
    maintenanceMode: false,    // ❌ Maintenance Mode (disabled by default)
    emailNotifications: true,  // ✅ Email Notifications (enabled)
    systemAnnouncements: true, // ✅ System Announcements (enabled)
    schoolName: '',            // School/Institution name
    adminEmail: '',            // Admin/Teacher email for notifications
  },
  // Student management features
  studentManagement: {
    studentEnrollment: true,   // ✅ Student Enrollment (enabled)
    classTracking: true,       // ✅ Class Tracking (enabled)
    dataExport: true,          // ✅ Data Export (enabled)
  },
  // Reporting and analytics
  reporting: {
    progressTracking: true,    // ✅ Progress Tracking (enabled)
    assessmentReports: true,   // ✅ Assessment Reports (enabled)
    analyticsBoard: true,      // ✅ Analytics Dashboard (enabled)
  },
  // Data management
  dataManagement: {
    autoBackup: true,          // ✅ Auto Backup (enabled)
    dataRetention: true,       // ✅ Data Retention Policy (enabled)
    privacySettings: true,     // ✅ Privacy Settings (enabled)
  },
};

// Storage key for admin settings
const SETTINGS_STORAGE_KEY = 'bk_admin_settings';

// Get current feature settings from API
export async function getFeatureSettings(): Promise<FeatureSettings> {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const response = await fetch(`/api/admin/get-feature-settings?t=${new Date().getTime()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      console.error('❌ Error fetching settings from API');
      return DEFAULT_SETTINGS;
    }

    const { success, data } = await response.json();

    if (success && data) {
      // Merge with defaults to ensure all fields exist
      const mergedSettings: FeatureSettings = {
        assessments: {
          akpd: data.assessments?.akpd ?? DEFAULT_SETTINGS.assessments.akpd,
          aum: data.assessments?.aum ?? DEFAULT_SETTINGS.assessments.aum,
          personality: data.assessments?.personality ?? DEFAULT_SETTINGS.assessments.personality,
          emotional_intelligence: data.assessments?.emotional_intelligence ?? DEFAULT_SETTINGS.assessments.emotional_intelligence,
          kecerdasan_majemuk: data.assessments?.kecerdasan_majemuk ?? DEFAULT_SETTINGS.assessments.kecerdasan_majemuk,
          gaya_belajar: data.assessments?.gaya_belajar ?? DEFAULT_SETTINGS.assessments.gaya_belajar,
          sma_smk: data.assessments?.sma_smk ?? DEFAULT_SETTINGS.assessments.sma_smk,
          introvert_extrovert: data.assessments?.introvert_extrovert ?? DEFAULT_SETTINGS.assessments.introvert_extrovert,
          stress_akademik: data.assessments?.stress_akademik ?? DEFAULT_SETTINGS.assessments.stress_akademik,
          temperament: data.assessments?.temperament ?? DEFAULT_SETTINGS.assessments.temperament,
          self_awareness: data.assessments?.self_awareness ?? DEFAULT_SETTINGS.assessments.self_awareness,
          sdq: data.assessments?.sdq ?? DEFAULT_SETTINGS.assessments.sdq,
          mbti: data.assessments?.mbti ?? DEFAULT_SETTINGS.assessments.mbti,
          big_five: data.assessments?.big_five ?? DEFAULT_SETTINGS.assessments.big_five,
          grit: data.assessments?.grit ?? DEFAULT_SETTINGS.assessments.grit,
          holland_code: data.assessments?.holland_code ?? DEFAULT_SETTINGS.assessments.holland_code,
          rmib: data.assessments?.rmib ?? DEFAULT_SETTINGS.assessments.rmib,
          sociometry: data.assessments?.sociometry ?? DEFAULT_SETTINGS.assessments.sociometry,
        },
        exercises: {
          psikotest: data.exercises?.psikotest ?? DEFAULT_SETTINGS.exercises.psikotest,
          analogi: data.exercises?.analogi ?? DEFAULT_SETTINGS.exercises.analogi,
          tiu: data.exercises?.tiu ?? DEFAULT_SETTINGS.exercises.tiu,
        },
        games: {
          vocabulary: data.games?.vocabulary ?? DEFAULT_SETTINGS.games.vocabulary,
          puzzle: data.games?.puzzle ?? DEFAULT_SETTINGS.games.puzzle,
          kahoot: data.games?.kahoot ?? DEFAULT_SETTINGS.games.kahoot,
        },
        system: {
          maintenanceMode: data.system?.maintenanceMode ?? DEFAULT_SETTINGS.system.maintenanceMode,
          emailNotifications: data.system?.emailNotifications ?? DEFAULT_SETTINGS.system.emailNotifications,
          systemAnnouncements: data.system?.systemAnnouncements ?? DEFAULT_SETTINGS.system.systemAnnouncements,
          schoolName: data.system?.schoolName ?? DEFAULT_SETTINGS.system.schoolName,
          adminEmail: data.system?.adminEmail ?? DEFAULT_SETTINGS.system.adminEmail,
        },
        studentManagement: {
          studentEnrollment: data.studentManagement?.studentEnrollment ?? DEFAULT_SETTINGS.studentManagement.studentEnrollment,
          classTracking: data.studentManagement?.classTracking ?? DEFAULT_SETTINGS.studentManagement.classTracking,
          dataExport: data.studentManagement?.dataExport ?? DEFAULT_SETTINGS.studentManagement.dataExport,
        },
        reporting: {
          progressTracking: data.reporting?.progressTracking ?? DEFAULT_SETTINGS.reporting.progressTracking,
          assessmentReports: data.reporting?.assessmentReports ?? DEFAULT_SETTINGS.reporting.assessmentReports,
          analyticsBoard: data.reporting?.analyticsBoard ?? DEFAULT_SETTINGS.reporting.analyticsBoard,
        },
        dataManagement: {
          autoBackup: data.dataManagement?.autoBackup ?? DEFAULT_SETTINGS.dataManagement.autoBackup,
          dataRetention: data.dataManagement?.dataRetention ?? DEFAULT_SETTINGS.dataManagement.dataRetention,
          privacySettings: data.dataManagement?.privacySettings ?? DEFAULT_SETTINGS.dataManagement.privacySettings,
        },
      };
      console.log('✅ Loaded settings from API:', mergedSettings);
      return mergedSettings;
    } else {
      console.log('⚠️ No settings found, using DEFAULT_SETTINGS');
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.error('❌ Error loading feature settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save feature settings to API
export async function saveFeatureSettings(settings: FeatureSettings): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch('/api/admin/save-feature-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      console.error('❌ Error saving settings to API');
      return false;
    }

    const { success } = await response.json();

    if (success) {
      console.log('✅ Settings saved to Supabase');
      return true;
    } else {
      console.error('❌ Failed to save settings');
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving feature settings:', error);
    return false;
  }
}

// Get student-accessible features based on settings
export function getStudentAccessibleFeatures(settings: FeatureSettings): StudentAccessFeatures {
  return {
    assessments: Object.entries(settings.assessments)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key),
    exercises: Object.entries(settings.exercises)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key),
    games: Object.entries(settings.games)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key),
  };
}

// Check if a specific feature is enabled
export async function isFeatureEnabled(
  feature: keyof FeatureSettings,
  subFeature: string
): Promise<boolean> {
  try {
    const settings = await getFeatureSettings();
    const category = settings[feature] as Record<string, boolean> | undefined;
    return !!(category && category[subFeature]);
  } catch (error) {
    console.error('Error checking feature enabled:', error);
    return false;
  }
}
