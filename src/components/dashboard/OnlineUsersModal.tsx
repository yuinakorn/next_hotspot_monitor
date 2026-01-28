'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, Signal, Download, Upload, Clock, Monitor } from 'lucide-react';
import { getOnlineUsersDetails, OnlineUserDetail } from '@/app/actions/get-online-users';

interface OnlineUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OnlineUsersModal({ isOpen, onClose }: OnlineUsersModalProps) {
    const [users, setUsers] = useState<OnlineUserDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const data = await getOnlineUsersDetails();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch online users:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Signal className="w-6 h-6 text-green-500" />
                            Online Users
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Currently active sessions: <span className="font-semibold text-slate-900">{users.length}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">MAC / Device</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Data Usage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No users currently online
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{user.username}</div>
                                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Monitor className="w-3 h-3" />
                                                    {user.nas_ip}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {user.framedipaddress}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                                {user.mac_address}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {user.session_time || 'Just now'}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    Started: {new Date(user.started_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                                        <Download className="w-3 h-3" />
                                                        {user.download_mb.toFixed(1)} MB
                                                    </span>
                                                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                                        <Upload className="w-3 h-3" />
                                                        {user.upload_mb.toFixed(1)} MB
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                    <p>Auto-refreshing is not enabled. Close and reopen to update.</p>
                    <button onClick={fetchData} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Refresh Now
                    </button>
                </div>
            </div>
        </div>
    );
}
