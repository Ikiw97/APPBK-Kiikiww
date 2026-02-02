import React from 'react';
import { Hammer } from 'lucide-react';

interface ToolsComingSoonProps {
    onBack?: () => void;
}

export default function ToolsComingSoon({ onBack }: ToolsComingSoonProps) {
    return (
        <div className="px-6 md:px-8 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-primary-50 p-6 rounded-full mb-6 animate-bounce-slow">
                <Hammer size={64} className="text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Alat Bantu</h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto mb-8">
                Fitur ini sedang dalam pengembangan. Nantikan update selanjutnya!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium border border-yellow-200">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                Coming Soon
            </div>
        </div>
    );
}
