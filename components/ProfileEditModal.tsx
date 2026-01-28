import React, { useState, useRef } from 'react';
import { X, Camera, User, Save, Loader2 } from 'lucide-react';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    onProfileUpdated: () => void;
}

export default function ProfileEditModal({
    isOpen,
    onClose,
    user,
    onProfileUpdated
}: ProfileEditModalProps) {
    const [name, setName] = useState(user.name);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
    const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB');
            return;
        }

        setError('');

        // Read file as base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAvatarPreview(base64);
            setNewAvatarBase64(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            let avatarUrl = user.avatarUrl;

            // Upload new avatar if selected
            if (newAvatarBase64) {
                setUploadProgress('Mengupload foto...');

                const uploadRes = await fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: newAvatarBase64 }),
                });

                const uploadData = await uploadRes.json();

                if (!uploadData.success) {
                    throw new Error(uploadData.error || 'Gagal mengupload foto');
                }

                avatarUrl = uploadData.url;
            }

            // Update profile
            setUploadProgress('Menyimpan profil...');

            const updateRes = await fetch('/api/admin/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    fullName: name,
                    avatarUrl: avatarUrl,
                }),
            });

            const updateData = await updateRes.json();

            if (!updateData.success) {
                throw new Error(updateData.error || 'Gagal menyimpan profil');
            }

            // Success - trigger refresh and close
            onProfileUpdated();
            onClose();

        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    const getInitials = () => {
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profil</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-3xl">
                                        {getInitials()}
                                    </span>
                                )}
                            </div>

                            {/* Camera overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="text-white" size={28} />
                            </button>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Ganti Foto
                        </button>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-400">Email tidak dapat diubah</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading || !name.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {uploadProgress || 'Menyimpan...'}
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Simpan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
