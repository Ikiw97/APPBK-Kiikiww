import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Send, User, MessageCircle, Clock, Search, ArrowLeft, Check, CheckCheck, Trash2, Reply, X, Eye, EyeOff, Smile, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { supabase } from '@/lib/supabaseClient';

// --- Types ---
interface ChatSession {
    id: string;
    student_id: string;
    student_name: string;
    student_nis?: string;
    student_class?: string;
    last_message?: string;
    last_message_at?: string;
    unread_count_teacher: number;
    unread_count_student: number;
    is_anonymous?: boolean;
    student_avatar?: string;
}

interface ChatMessage {
    id: string;
    session_id: string;
    sender_role: 'student' | 'teacher';
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    reply_to_id?: string;
    reply_to_content?: string;
    reply_to_sender_role?: string;
}

// --- Main Container ---
interface CounselingChatProps {
    onBack?: () => void;
}

export default function CounselingChat({ onBack }: CounselingChatProps) {
    const { user } = useAuth();

    if (!user) return <div className="p-8 text-center">Silahkan login terlebih dahulu.</div>;

    const isStudent = user.role === 'student';

    return (
        <div className="h-[calc(100vh-100px)] min-h-[500px] bg-gray-50 flex flex-col">
            {isStudent ? <StudentChatView onBack={onBack} /> : <AdminChatView />}
        </div>
    );
}

// --- Student View ---
function StudentChatView({ onBack }: { onBack?: () => void }) {
    const { user } = useAuth();
    const [session, setSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAnonymousMode, setIsAnonymousMode] = useState(false); // Default to public

    useEffect(() => {
        const fetchOrCreateSession = async () => {
            if (!user) return;
            setLoading(true);
            try {
                console.log('🔍 Fetching session for student:', user.id, isAnonymousMode ? '(ANONYMOUS)' : '(PUBLIC)');

                // 1. Try to find existing session matching the mode
                const { data: sessions, error } = await supabase
                    .from('counseling_sessions')
                    .select('*')
                    .eq('student_id', user.id)
                    .eq('is_anonymous', isAnonymousMode)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (error) throw error;

                if (sessions && sessions.length > 0) {
                    setSession(sessions[0]);
                } else {
                    console.log('📝 Creating new session (Mode:', isAnonymousMode, ')');
                    // 2. Create new session if not exists for this mode
                    const { data: newSession, error: createError } = await supabase
                        .from('counseling_sessions')
                        .insert({
                            student_id: user.id,
                            student_name: user.name,
                            student_nis: user.email?.split('@')[0] || '',
                            last_message: 'Chat dimulai',
                            is_anonymous: isAnonymousMode,
                            student_avatar: user.avatarUrl,
                            updated_at: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (createError) throw createError;
                    setSession(newSession);
                }
            } catch (err) {
                console.error("Error init session:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrCreateSession();
    }, [user, isAnonymousMode]);

    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
    if (!session) return <div className="p-8 text-center text-red-500">Gagal memuat sesi chat. Hubungi admin.</div>;

    return (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Guru BK (Konselor)</h2>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>

                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-white justify-end">
                    <span className={`text-xs font-medium transition-colors ${isAnonymousMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isAnonymousMode ? 'Mode Anonim' : 'Mode Publik'}
                    </span>
                    <button
                        onClick={() => setIsAnonymousMode(!isAnonymousMode)}
                        className={`p-2 rounded-full transition-all ${isAnonymousMode ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        title={isAnonymousMode ? "Kembali ke mode publik" : "Mulai chat anonim baru"}
                    >
                        {isAnonymousMode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Chat Window */}
                <ChatWindow session={session} role="student" />
            </div>
        </div>
    );
}

// --- Admin/Teacher View ---
function AdminChatView() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch sessions list
    useEffect(() => {
        const fetchSessions = async () => {
            const { data, error } = await supabase
                .from('counseling_sessions')
                .select('*')
                .order('last_message_at', { ascending: false });

            if (data) {
                // Filter out empty sessions (those that only have "Chat dimulai")
                const activeSessions = data.filter(s => s.last_message !== 'Chat dimulai');
                setSessions(activeSessions);
            }
            setLoading(false);
        };

        fetchSessions();

        // Subscribe to session updates (new messages update the session row)
        const channel = supabase
            .channel('public:counseling_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'counseling_sessions' }, (payload) => {
                fetchSessions(); // Simple reload for now
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (!confirm('Hapus seluruh percakapan ini? Tindakan ini tidak dapat dibatalkan.')) return;

        try {
            const { error } = await supabase
                .from('counseling_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;

            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (selectedSessionId === sessionId) setSelectedSessionId(null);
        } catch (err) {
            console.error('Error deleting session:', err);
            alert('Gagal menghapus percakapan');
        }
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-lg text-slate-800 mb-4">Chat Masuk</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari siswa..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400">Memuat...</div>
                    ) : sessions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Belum ada chat.</div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => setSelectedSessionId(session.id)}
                                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative group ${selectedSessionId === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                {!session.is_anonymous && session.student_avatar ? (
                                                    <img src={session.student_avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${session.is_anonymous ? 'bg-slate-400' : 'bg-primary-500'}`}>
                                                        {session.is_anonymous ? '?' : session.student_name.substring(0, 1).toUpperCase()}
                                                    </div>
                                                )}
                                                <h3 className={`font-semibold text-sm ${selectedSessionId === session.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                                    {session.is_anonymous ? 'Siswa Anonim' : session.student_name}
                                                </h3>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {session.last_message_at ? new Date(session.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-1 truncate font-medium">
                                            {/!\[([^\]]*)\]\(([^)]*)\)/.test(session.last_message || '') ? '📷 Gambar' : session.last_message}
                                        </p>
                                        {session.unread_count_teacher > 0 && (
                                            <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {session.unread_count_teacher}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Delete Session Button */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDeleteSession(e, session.id)}
                                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                                        title="Hapus percakapan"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            < div className={`flex-1 bg-[#F8FAFC] flex flex-col ${!selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                {selectedSession ? (
                    <>
                        <div className="bg-white p-4 border-b border-slate-200 flex items-center gap-3 shadow-sm">
                            <button onClick={() => setSelectedSessionId(null)} className="md:hidden text-slate-500">
                                <ArrowLeft size={20} />
                            </button>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${selectedSession.is_anonymous ? 'bg-slate-400' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                {!selectedSession.is_anonymous && selectedSession.student_avatar ? (
                                    <img src={selectedSession.student_avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    selectedSession.is_anonymous ? '?' : selectedSession.student_name.substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800">{selectedSession.is_anonymous ? 'Siswa Anonim' : selectedSession.student_name}</h2>
                                <p className="text-xs text-slate-500">
                                    {selectedSession.is_anonymous ? 'Identitas disembunyikan' : `${selectedSession.student_nis || 'Siswa'} • ${selectedSession.id.slice(0, 8)}`}
                                </p>
                            </div>
                        </div>
                        <ChatWindow session={selectedSession} role="teacher" />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                        <MessageCircle size={48} className="mb-4 text-slate-300" />
                        <p>Pilih siswa untuk melihat percakapan</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Chat Window Component (Shared) ---
function ChatWindow({ session, role }: { session: ChatSession, role: 'student' | 'teacher' }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        console.log('🔍 Fetching messages for session:', session.id);
        const { data, error } = await supabase
            .from('counseling_messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ Error fetching messages:', error);
        }

        console.log('📨 Fetched messages:', data?.length || 0, 'messages');

        if (data) {
            setMessages(data);
            // Mark as read
            if (data.length > 0) {
                const unreadIds = data
                    .filter(m => !m.is_read && m.sender_role !== role)
                    .map(m => m.id);

                if (unreadIds.length > 0) {
                    await supabase
                        .from('counseling_messages')
                        .update({ is_read: true })
                        .in('id', unreadIds);

                    // Reset session counter
                    await supabase
                        .from('counseling_sessions')
                        .update({ [role === 'teacher' ? 'unread_count_teacher' : 'unread_count_student']: 0 })
                        .eq('id', session.id);
                }
            }
        }
        setLoading(false);
        setTimeout(scrollToBottom, 100);
    };

    // Fetch messages with intelligent merge (for polling - doesn't replace optimistic messages)
    const fetchMessagesPolling = async () => {
        const { data, error } = await supabase
            .from('counseling_messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ Polling error:', error);
            return;
        }

        if (data) {
            setMessages(prev => {
                // Merge: keep all server messages, but don't duplicate
                const serverIds = new Set(data.map(m => m.id));
                // Keep temp messages that haven't been confirmed yet
                const tempMessages = prev.filter(m => m.id.startsWith('temp-'));
                // Check if there are new messages from server
                const prevIds = new Set(prev.filter(m => !m.id.startsWith('temp-')).map(m => m.id));
                const hasNewMessages = data.some(m => !prevIds.has(m.id));

                if (hasNewMessages) {
                    console.log('📬 New messages detected via polling');
                    scrollToBottom();
                }

                return [...data, ...tempMessages.filter(t => !serverIds.has(t.id))];
            });

            // Mark as read
            const unreadIds = data
                .filter(m => !m.is_read && m.sender_role !== role)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                await supabase
                    .from('counseling_messages')
                    .update({ is_read: true })
                    .in('id', unreadIds);

                await supabase
                    .from('counseling_sessions')
                    .update({ [role === 'teacher' ? 'unread_count_teacher' : 'unread_count_student']: 0 })
                    .eq('id', session.id);
            }
        }
    };

    useEffect(() => {
        fetchMessages();

        // Polling fallback - fetch messages every 3 seconds
        const pollingInterval = setInterval(() => {
            fetchMessagesPolling();
        }, 3000);

        // Subscribe to new messages (realtime - may not work on all Supabase configs)
        const channel = supabase
            .channel(`session-${session.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'counseling_messages',
                filter: `session_id=eq.${session.id}`
            }, (payload) => {
                const newMsg = payload.new as ChatMessage;
                console.log('📥 Realtime message received:', newMsg.id);

                // Only add if not already in list (prevents duplicates from optimistic updates)
                setMessages(prev => {
                    const exists = prev.some(m => m.id === newMsg.id || m.content === newMsg.content && m.created_at === newMsg.created_at);
                    if (exists) {
                        console.log('⏭️ Message already exists, skipping');
                        return prev;
                    }
                    console.log('➕ Adding new message from realtime');
                    return [...prev, newMsg];
                });
                scrollToBottom();

                // Mark as read immediately if window is open
                if (newMsg.sender_role !== role) {
                    supabase.from('counseling_messages').update({ is_read: true }).eq('id', newMsg.id);
                    supabase.from('counseling_sessions').update({ [role === 'teacher' ? 'unread_count_teacher' : 'unread_count_student']: 0 }).eq('id', session.id);
                }
            })
            .subscribe((status) => {
                console.log('📡 Realtime subscription status:', status);
            });

        return () => {
            clearInterval(pollingInterval);
            supabase.removeChannel(channel);
        };
    }, [session.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (contentOverride?: string) => {
        const contentToSend = contentOverride || newMessage;
        if ((!contentToSend.trim() && tempImages.length === 0) || !user) return; // Allow sending if images exist

        let msgContent = contentToSend.trim();
        // Append images if exist
        if (tempImages.length > 0 && !contentOverride) {
            const imagesMarkdown = tempImages.map(url => `![Image](${url})`).join('\n');
            msgContent = (msgContent ? msgContent + '\n' : '') + imagesMarkdown;
        }

        if (!contentOverride) {
            setNewMessage('');
            setTempImages([]); // Clear temp images
        }
        const currentReply = replyingTo;
        setReplyingTo(null); // clear reply state

        // Create optimistic message to show immediately
        const optimisticMsg: ChatMessage = {
            id: `temp-${Date.now()}`, // Temporary ID
            session_id: session.id,
            sender_role: role,
            sender_id: user.id,
            content: msgContent,
            is_read: false,
            created_at: new Date().toISOString(),
            reply_to_id: currentReply?.id,
            reply_to_content: currentReply?.content,
            reply_to_sender_role: currentReply?.sender_role
        };

        // Add message to UI immediately (optimistic update)
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            console.log('📤 Sending message:', { session_id: session.id, role, content: msgContent });

            // 1. Insert Message
            const { data: insertData, error: msgError } = await supabase
                .from('counseling_messages')
                .insert({
                    session_id: session.id,
                    sender_role: role,
                    sender_id: user.id,
                    content: msgContent,
                    is_read: false,
                    reply_to_id: currentReply?.id,
                    reply_to_content: currentReply?.content,
                    reply_to_sender_role: currentReply?.sender_role
                })
                .select()
                .single();

            if (msgError) {
                console.error('❌ Error inserting message:', msgError);
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                throw msgError;
            }

            console.log('✅ Message inserted:', insertData);

            // Replace optimistic message with real one (to get correct ID)
            if (insertData) {
                setMessages(prev => prev.map(m =>
                    m.id === optimisticMsg.id ? insertData : m
                ));
            }

            // 2. Update Session (Last Message & Unread Count)
            const targetCounter = role === 'student' ? 'unread_count_teacher' : 'unread_count_student';

            // Need to increment counter atomically ideally, but for now we read-then-write or just hardcode match in SQL trigger? 
            // Supabase RPC is best for atomic increment, but let's try a simple fetch-update or just blind set (will be race condition prone but acceptable for MVP)
            // Actually, we can't do atomic increment easily without RPC. We'll just read the session fresh.

            const { data: currentSession } = await supabase.from('counseling_sessions').select(targetCounter).eq('id', session.id).single();
            const currentCount = currentSession ? (currentSession as any)[targetCounter] : 0;

            await supabase
                .from('counseling_sessions')
                .update({
                    last_message: msgContent,
                    last_message_at: new Date().toISOString(),
                    [targetCounter]: currentCount + 1
                })
                .eq('id', session.id);

        } catch (err) {
            console.error("Failed to send:", err);
            alert('Gagal mengirim pesan');
        }
    };

    // Delete message handler
    const handleDelete = async (messageId: string) => {
        if (!confirm('Hapus pesan ini?')) return;

        // Optimistic delete
        setMessages(prev => prev.filter(m => m.id !== messageId));

        try {
            const { error } = await supabase
                .from('counseling_messages')
                .delete()
                .eq('id', messageId);

            if (error) {
                console.error('❌ Error deleting message:', error);
                // Refetch on error to restore
                fetchMessages();
                alert('Gagal menghapus pesan');
            } else {
                console.log('🗑️ Message deleted:', messageId);
            }
        } catch (err) {
            console.error('Delete error:', err);
            fetchMessages();
        }
    };

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [tempImages, setTempImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onEmojiClick = (emojiObject: any) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (tempImages.length + files.length > 5) {
            alert('Maksimal 5 gambar per pesan');
            return;
        }

        setIsUploading(true);
        const newImages: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File ${file.name} terlalu besar (maks 10MB)`);
                    continue;
                }

                // Upload promise wrapper
                const uploadPromise = new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = async () => {
                        try {
                            const base64Str = reader.result as string;
                            const res = await fetch('/api/upload-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ image: base64Str }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.message || 'Upload failed');
                            resolve(data.url);
                        } catch (err) { reject(err); }
                    };
                    reader.onerror = reject;
                });

                const url = await uploadPromise;
                newImages.push(url);
            }

            setTempImages(prev => [...prev, ...newImages]);

        } catch (err) {
            console.error('Upload error:', err);
            alert('Gagal mengupload beberapa gambar');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownloadImage = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download error:', error);
            window.open(url, '_blank');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#e5ddd5] bg-opacity-30 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#4a5568 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 z-10 space-y-4">
                {loading ? (
                    <div className="text-center text-slate-400 mt-10">Memuat pesan...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-xl mx-auto max-w-sm mt-10 shadow-sm">
                        <p className="text-slate-600 font-medium">✨ Percakapan Baru</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {role === 'student'
                                ? 'Halo! Silahkan sampaikan keluh kesah atau pertanyaanmu kepada Ibu/Bapak Guru BK. Privasi terjaga.'
                                : 'Belum ada pesan dari siswa ini.'}
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_role === role;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm relative group ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>

                                    {/* Referenced Reply */}
                                    {msg.reply_to_content && (
                                        <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${isMe ? 'bg-white/20 border-white/50 text-white/90' : 'bg-slate-100 border-primary-500 text-slate-600'}`}>
                                            <p className="font-bold mb-0.5 opacity-80">
                                                {msg.reply_to_sender_role === 'student' ? (role === 'student' ? 'Anda' : 'Siswa') : (role === 'teacher' ? 'Anda' : 'Guru BK')}
                                            </p>
                                            <p className="line-clamp-2 italic">
                                                {/!\[([^\]]*)\]\(([^)]*)\)/.test(msg.reply_to_content || '') ? '📷 Gambar' : msg.reply_to_content}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons (Hover) */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? '-left-16' : '-right-10'}`}>
                                        {/* Reply Button */}
                                        <button
                                            onClick={() => setReplyingTo(msg)}
                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600"
                                            title="Balas pesan"
                                        >
                                            <Reply size={14} />
                                        </button>

                                        {/* Delete button - only for own messages */}
                                        {isMe && !msg.id.startsWith('temp-') && (
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full text-red-600"
                                                title="Hapus pesan"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content.split(/(!\[[^\]]*\]\([^)]*\))/g).map((part, i) => {
                                            const imgMatch = part.match(/!\[([^\]]*)\]\(([^)]*)\)/);
                                            if (imgMatch) {
                                                return (
                                                    <div key={i} className="relative group/image inline-block">
                                                        <img
                                                            src={imgMatch[2]}
                                                            alt={imgMatch[1] || "Sent image"}
                                                            className="max-h-64 max-w-[280px] w-full h-auto object-cover rounded-lg my-1.5 border border-slate-200"
                                                            loading="lazy"
                                                        />
                                                        <button
                                                            onClick={() => handleDownloadImage(imgMatch[2])}
                                                            className="absolute bottom-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity backdrop-blur-sm"
                                                            title="Download Gambar"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return <span key={i}>{part}</span>;
                                        })}
                                    </div>
                                    <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            <span>
                                                {msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 z-20">
                {/* Reply Preview */}
                {replyingTo && (
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex-1 border-l-4 border-primary-500 pl-3 py-1">
                            <p className="text-xs font-bold text-primary-600 mb-0.5">
                                Membalas {replyingTo.sender_role === 'student' ? 'Siswa' : 'Guru BK'}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-1">
                                {/!\[([^\]]*)\]\(([^)]*)\)/.test(replyingTo.content || '') ? '📷 Gambar' : replyingTo.content}
                            </p>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}



                {/* Image Preview List */}
                {tempImages.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {tempImages.map((img, idx) => (
                                <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 group">
                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setTempImages(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {tempImages.length < 5 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 flex-shrink-0 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{tempImages.length} / 5 Gambar terpilih</p>
                    </div>
                )}

                <div className="p-3 flex items-center gap-2 relative">
                    {/* Emoji Picker Popover */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-16 left-4 z-50">
                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                        </div>
                    )}

                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:bg-slate-100'}`}
                        title="Emoji"
                    >
                        <Smile size={24} />
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-full transition-colors ${isUploading ? 'bg-slate-100 text-slate-400 cursor-wait' : 'text-slate-400 hover:bg-slate-100'}`}
                        disabled={isUploading}
                        title="Upload Gambar"
                    >
                        {isUploading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                    />

                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Tulis pesan..."
                        className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-primary-300 transition-all outline-none text-sm"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!newMessage.trim() && tempImages.length === 0}
                        className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all shadow-md transform active:scale-95"
                    >
                        <Send size={18} className={newMessage.trim() ? 'ml-0.5' : ''} />
                    </button>
                </div>
            </div>
        </div >
    );
}
