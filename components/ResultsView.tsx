import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Download, ChevronRight, Sparkles, ClipboardCheck, ArrowRight, Activity } from 'lucide-react';
import { getAssessmentStats, getAssessmentResults } from '@/lib/supabaseClient';
import AUMResultsList from './AUMResultsList';
import AKPDResultsList from './AKPDResultsList';
import EmotionalIntelligenceResultsList from './EmotionalIntelligenceResultsList';
import LearningStyleResultsList from './LearningStyleResultsList';
import GenericResultsList from './GenericResultsList';

import { ASSESSMENT_TITLES } from '@/lib/assessmentConstants';

interface AssessmentStats {
  assessment_id: string;
  totalCompletions: number;
  completionsByClass: Record<string, number>;
}

// Color mapping for assessments
const ASSESSMENT_COLORS: Record<string, { gradient: string; bgLight: string; text: string }> = {
  akpd: { gradient: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50', text: 'text-blue-600' },
  aum: { gradient: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', text: 'text-violet-600' },
  personality_career: { gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', text: 'text-emerald-600' },
  emotional_intelligence: { gradient: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', text: 'text-rose-600' },
  gaya_belajar: { gradient: 'from-lime-500 to-green-600', bgLight: 'bg-lime-50', text: 'text-lime-600' },
  mbti: { gradient: 'from-pink-500 to-rose-600', bgLight: 'bg-pink-50', text: 'text-pink-600' },
  big_five: { gradient: 'from-indigo-500 to-blue-600', bgLight: 'bg-indigo-50', text: 'text-indigo-600' },
  grit: { gradient: 'from-yellow-500 to-amber-600', bgLight: 'bg-yellow-50', text: 'text-yellow-600' },
  sdq: { gradient: 'from-green-500 to-emerald-600', bgLight: 'bg-green-50', text: 'text-green-600' },
  default: { gradient: 'from-slate-500 to-slate-600', bgLight: 'bg-slate-50', text: 'text-slate-600' },
};

const getAssessmentColor = (id: string) => ASSESSMENT_COLORS[id] || ASSESSMENT_COLORS.default;

export default function ResultsView() {
  const [stats, setStats] = useState<AssessmentStats[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResults, setSelectedResults] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'aum' | 'akpd' | 'emotional_intelligence' | 'gaya_belajar'>('all');
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    // Only load once when component mounts
    if (!hasLoadedRef.current) {
      loadStats();
      hasLoadedRef.current = true;
    }
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const assessmentIds = Object.keys(ASSESSMENT_TITLES);

      // Fetch all assessment results in parallel for better performance
      const allResults = await Promise.all(
        assessmentIds.map(id => getAssessmentResults(id))
      );

      const allStats: AssessmentStats[] = assessmentIds.map((assessmentId, index) => {
        const results = allResults[index];
        const completionsByClass: Record<string, number> = {};

        results.forEach((result) => {
          const cls = result.class || 'Unknown';
          completionsByClass[cls] = (completionsByClass[cls] || 0) + 1;
        });

        return {
          assessment_id: assessmentId,
          totalCompletions: results.length,
          completionsByClass,
        };
      });

      setStats(allStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (assessmentId: string) => {
    try {
      const results = await getAssessmentResults(assessmentId);
      setSelectedResults(results);
      setSelectedAssessment(assessmentId);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedAssessment || selectedResults.length === 0) {
      alert('Tidak ada data untuk diunduh');
      return;
    }

    const headers = ['Nama Siswa', 'Kelas', 'Tanggal Selesai'];
    const rows = selectedResults.map((result) => [
      result.student_name,
      result.class,
      new Date(result.completed_at).toLocaleDateString('id-ID'),
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hasil-${selectedAssessment}.csv`;
    a.click();
    // Clean up: revoke the object URL to prevent memory leak
    window.URL.revokeObjectURL(url);
  };

  const totalAllCompletions = stats.reduce((sum, s) => sum + s.totalCompletions, 0);
  const activeAssessments = stats.filter(s => s.totalCompletions > 0).length;

  // Check if we're viewing a specific assessment - if so, don't show loading from parent
  if (viewMode === 'akpd') {
    return <AKPDResultsList onBack={() => setViewMode('all')} />;
  }

  if (viewMode === 'aum') {
    return <AUMResultsList onBack={() => setViewMode('all')} />;
  }

  if (viewMode === 'emotional_intelligence') {
    return (
      <EmotionalIntelligenceResultsList
        onBack={() => setViewMode('all')}
        onViewDetail={() => {
          // Handle viewing details if needed
        }}
      />
    );
  }

  if (viewMode === 'gaya_belajar') {
    return (
      <LearningStyleResultsList
        onBack={() => setViewMode('all')}
        onViewDetail={() => {
          // Handle viewing details if needed
        }}
      />
    );
  }

  if (selectedAssessment) {
    return (
      <GenericResultsList
        assessmentId={selectedAssessment}
        onBack={() => setSelectedAssessment(null)}
      />
    );
  }

  // Only show loading state when we're in 'all' view mode and actually loading
  if (loading && viewMode === 'all' && !selectedAssessment) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
          </div>
          <p className="text-slate-500 font-medium">Memuat data hasil asesmen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header - Modern Glassmorphism Design */}
      {/* Hero Header - Clean Light Design */}
      <div className="relative mb-8 p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Analisis Hasil</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Hasil Asesmen
          </h1>

          {/* Description */}
          <p className="text-slate-600 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
            Ringkasan dan detail hasil asesmen semua siswa
          </p>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Pengisian */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="text-blue-500" size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Pengisian</p>
                  <p className="text-2xl font-black text-slate-800">{totalAllCompletions}</p>
                </div>
              </div>
            </div>

            {/* Asesmen Aktif */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Activity className="text-emerald-500" size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Asesmen Aktif</p>
                  <p className="text-2xl font-black text-slate-800">{activeAssessments}</p>
                </div>
              </div>
            </div>

            {/* Rata-rata per Asesmen */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Users className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rata-rata per Asesmen</p>
                  <p className="text-2xl font-black text-slate-800">
                    {stats.length > 0 ? Math.round(totalAllCompletions / stats.length) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      {/* Assessment Results List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 px-1">Detail per Instrumen</h2>

        {stats.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="text-slate-400" size={28} />
            </div>
            <p className="text-slate-500 font-medium">Belum ada data asesmen yang tersimpan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {stats.map((stat, index) => {
              const completionPercentage = stat.totalCompletions > 0 ? Math.min(Math.round((stat.totalCompletions / 30) * 100), 100) : 0;
              const colors = getAssessmentColor(stat.assessment_id);

              return (
                <div
                  key={stat.assessment_id}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient Accent */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${colors.gradient}`}></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1.5 group-hover:text-slate-900">
                          {ASSESSMENT_TITLES[stat.assessment_id] || stat.assessment_id}
                        </h3>
                        <p className="text-slate-500 text-sm">
                          <span className="font-semibold text-slate-700">{stat.totalCompletions}</span> peserta telah menyelesaikan
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (stat.assessment_id === 'aum') {
                            setViewMode('aum');
                          } else if (stat.assessment_id === 'akpd') {
                            setViewMode('akpd');
                          } else if (stat.assessment_id === 'emotional_intelligence') {
                            setViewMode('emotional_intelligence');
                          } else if (stat.assessment_id === 'gaya_belajar') {
                            setViewMode('gaya_belajar');
                          } else {
                            handleViewDetails(stat.assessment_id);
                          }
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r ${colors.gradient} text-white shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-105`}
                      >
                        Lihat Hasil
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tingkat Partisipasi</span>
                        <span className={`text-sm font-bold ${colors.text}`}>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${colors.gradient} h-2.5 rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Class Breakdown */}
                    {Object.keys(stat.completionsByClass).length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Distribusi Kelas</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stat.completionsByClass).slice(0, 5).map(([cls, count]) => (
                            <span key={cls} className={`inline-flex items-center gap-1.5 text-xs font-medium ${colors.bgLight} ${colors.text} px-3 py-1.5 rounded-full`}>
                              Kelas {cls}: <span className="font-bold">{count}</span>
                            </span>
                          ))}
                          {Object.keys(stat.completionsByClass).length > 5 && (
                            <span className="text-xs text-slate-400 px-2 py-1.5">+{Object.keys(stat.completionsByClass).length - 5} lainnya</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

