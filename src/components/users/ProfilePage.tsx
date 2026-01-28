'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/web-users';
import { User, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ user }: { user: any }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        setMessage(null);

        if (formData.get('password') !== formData.get('confirmPassword')) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            setIsSaving(false);
            return;
        }

        const res = await updateProfile(formData);
        
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            router.refresh();
        }
        setIsSaving(false);
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    My Profile
                </h1>
                <p className="text-slate-500">Manage your account settings</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <form action={handleSubmit} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${
                            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Username</label>
                            <input 
                                type="text" 
                                value={user.username}
                                disabled
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Role</label>
                            <input 
                                type="text" 
                                value={user.role === 'admin' ? 'Administrator' : 'User'}
                                disabled
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input 
                                type="text" 
                                name="fullname"
                                defaultValue={user.fullname}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Rank / Name"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-6">
                        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-slate-400" />
                            Change Password
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">New Password</label>
                                <input 
                                    type="password" 
                                    name="password"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
