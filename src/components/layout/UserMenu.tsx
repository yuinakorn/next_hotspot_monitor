'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';

interface UserMenuProps {
    user: {
        fullname?: string;
        role?: string;
        username?: string;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = user.fullname || user.username || 'User';
    const displayRole = user.role === 'admin' ? 'Administrator' : 'User';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 leading-tight">{displayName}</p>
                    <p className="text-xs text-slate-500">{displayRole}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                    {initial}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-semibold text-slate-800">My Account</p>
                        <p className="text-xs text-slate-500 truncate">{user.username}</p>
                    </div>
                    
                    <div className="p-1">

                        <Link 
                            href="/settings/profile"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </Link>
                        <form action={logout}>
                            <button 
                                type="submit"
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
