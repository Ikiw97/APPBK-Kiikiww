import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContextSupabase';
import {
  createAdminAccount,
  getAllAdminUsers,
  getAllUserProfiles,
  updateUserRole,
  deactivateUserAccount,
  reactivateUserAccount,
  deleteAdminAccount,
  getUserCountByRole,
  isSuperAdmin as checkIsSuperAdmin,
} from '@/lib/adminManagement';
import { Users, Plus, Trash2, Edit2, Shield, AlertCircle, Check } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_super_admin: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface UserCounts {
  admin: number;
  teacher: number;
  student: number;
  total: number;
}

export default function AdminAccountManagement() {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userCounts, setUserCounts] = useState<UserCounts>({
    admin: 0,
    teacher: 0,
    student: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'admins' | 'users'>('admins');

  // Form state
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    fullName: string;
    isSuperAdmin: boolean;
    role: 'admin' | 'teacher';
  }>({
    email: '',
    password: '',
    fullName: '',
    isSuperAdmin: false,
    role: 'teacher',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Check if current user is super admin
      const isSA = await checkIsSuperAdmin(user.id);
      setIsSuperAdmin(isSA);

      // Load data for all authenticated users (removed isSA check)
      // Load admin users
      const admins = await getAllAdminUsers();
      setAdminUsers(admins);

      // Load all user profiles
      const profiles = await getAllUserProfiles();
      setAllUsers(profiles);

      // Load user counts
      const counts = await getUserCountByRole();
      setUserCounts(counts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      if (!formData.email || !formData.password || !formData.fullName) {
        throw new Error('Semua field harus diisi');
      }

      if (formData.password.length < 6) {
        throw new Error('Password harus minimal 6 karakter');
      }

      await createAdminAccount(
        formData.email,
        formData.password,
        formData.fullName,
        formData.isSuperAdmin,
        formData.role
      );

      setFormSuccess('✅ Admin account berhasil dibuat!');
      setFormData({ email: '', password: '', fullName: '', isSuperAdmin: false, role: 'teacher' });
      setShowCreateForm(false);

      // Reload data
      await loadData();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Gagal membuat admin account'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole as 'admin' | 'teacher' | 'student');
      await loadData();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menonaktifkan user ini?')) {
      try {
        await deactivateUserAccount(userId);
        await loadData();
      } catch (error) {
        console.error('Error deactivating user:', error);
      }
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await reactivateUserAccount(userId);
      await loadData();
    } catch (error) {
      console.error('Error reactivating user:', error);
    }
  };

  const handleDeleteAdmin = async (userId: string) => {
    if (confirm('Admin account akan DIHAPUS permanen. Lanjutkan?')) {
      try {
        await deleteAdminAccount(userId);
        await loadData();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-8">
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Removed isSuperAdmin check - all authenticated users can access

  return (
    <div className="px-6 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manajemen Akun Admin
        </h1>
        <p className="text-gray-600">
          Kelola admin accounts dan user roles
        </p>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-gray-600 text-sm mb-2">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{userCounts.total}</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 text-sm mb-2">Admins</p>
          <p className="text-3xl font-bold text-blue-600">{userCounts.admin}</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 text-sm mb-2">Teachers</p>
          <p className="text-3xl font-bold text-green-600">{userCounts.teacher}</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 text-sm mb-2">Students</p>
          <p className="text-3xl font-bold text-purple-600">{userCounts.student}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('admins')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${selectedTab === 'admins'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Shield className="inline mr-2" size={18} />
            Admin Accounts
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${selectedTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Users className="inline mr-2" size={18} />
            All Users
          </button>
        </div>

        {/* Admin Accounts Tab */}
        {selectedTab === 'admins' && (
          <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Admin Accounts ({adminUsers.length})
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Create Admin
              </button>
            </div>

            {/* Create Admin Form */}
            {showCreateForm && (
              <CreateAdminForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateAdmin}
                error={formError}
                success={formSuccess}
                submitting={submitting}
              />
            )}

            {/* Admin Users List */}
            <div className="space-y-4">
              {adminUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Tidak ada admin account</p>
              ) : (
                adminUsers.map((admin) => (
                  <div
                    key={admin.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {admin.full_name}
                          </h3>
                          {admin.is_super_admin && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                        <p className="text-xs text-gray-500">
                          Dibuat: {new Date(admin.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {admin.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                          title="Delete admin"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {selectedTab === 'users' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              All Users ({allUsers.length})
            </h2>

            <div className="space-y-4">
              {allUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Tidak ada users</p>
              ) : (
                allUsers.map((userProfile) => (
                  <div
                    key={userProfile.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {userProfile.full_name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${userProfile.role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : userProfile.role === 'teacher'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                              }`}
                          >
                            {userProfile.role}
                          </span>
                          {!userProfile.is_active && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{userProfile.email}</p>
                      </div>

                      {/* Role Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={userProfile.role}
                          onChange={(e) =>
                            handleUpdateUserRole(userProfile.id, e.target.value)
                          }
                          className="text-sm border border-gray-300 rounded px-3 py-1"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Status Toggle */}
                        {userProfile.is_active ? (
                          <button
                            onClick={() => handleDeactivateUser(userProfile.id)}
                            className="text-gray-600 hover:bg-gray-100 p-2 rounded transition-colors"
                            title="Deactivate user"
                          >
                            <Check size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateUser(userProfile.id)}
                            className="text-gray-400 hover:bg-gray-100 p-2 rounded transition-colors"
                            title="Reactivate user"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Create Admin Form Component
interface CreateAdminFormProps {
  formData: {
    email: string;
    password: string;
    fullName: string;
    isSuperAdmin: boolean;
    role: 'admin' | 'teacher';
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  error: string;
  success: string;
  submitting: boolean;
}

function CreateAdminForm({
  formData,
  setFormData,
  onSubmit,
  error,
  success,
  submitting,
}: CreateAdminFormProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tambah Admin Account Baru
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="admin@example.com"
            className="input-field w-full"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Minimal 6 karakter"
            className="input-field w-full"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Nama admin"
            className="input-field w-full"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Role
          </label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="roleTeacher"
                name="role"
                value="teacher"
                checked={formData.role === 'teacher'}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'teacher' | 'admin' })
                }
                disabled={submitting}
                className="w-4 h-4"
              />
              <label htmlFor="roleTeacher" className="text-gray-700 cursor-pointer">
                👨‍🏫 Teacher (Guru BK)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="roleAdmin"
                name="role"
                value="admin"
                checked={formData.role === 'admin'}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'teacher' | 'admin' })
                }
                disabled={submitting}
                className="w-4 h-4"
              />
              <label htmlFor="roleAdmin" className="text-gray-700 cursor-pointer">
                👨‍💼 Admin
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isSuperAdmin"
            checked={formData.isSuperAdmin}
            onChange={(e) =>
              setFormData({ ...formData, isSuperAdmin: e.target.checked })
            }
            disabled={submitting}
            className="w-4 h-4"
          />
          <label htmlFor="isSuperAdmin" className="text-gray-700">
            Set sebagai Super Admin (dapat manage admin lain)
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {submitting ? 'Membuat...' : 'Buat Admin'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: '',
                password: '',
                fullName: '',
                isSuperAdmin: false,
                role: 'teacher',
              });
            }}
            disabled={submitting}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
