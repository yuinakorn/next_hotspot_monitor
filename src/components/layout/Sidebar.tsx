"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white flex flex-col font-sans z-50">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <Activity className="h-8 w-8 text-blue-400" />
        <span className="text-xl font-bold tracking-wide">Monitor Hub</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
            isActive('/') 
              ? "bg-slate-800 text-blue-400" 
              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          )}
        >
          <LayoutDashboard className={cn("h-5 w-5", isActive('/') ? "text-blue-400" : "text-slate-400 group-hover:text-slate-100")} />
          <span className="font-medium">Dashboard</span>
        </Link>
        
        <Link 
          href="/users" 
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
            isActive('/users') 
              ? "bg-slate-800 text-blue-400" 
              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          )}
        >
          <Users className={cn("h-5 w-5", isActive('/users') ? "text-blue-400" : "text-slate-400 group-hover:text-slate-100")} />
          <span className="font-medium">Users</span>
        </Link>

        <Link 
          href="/settings" 
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
            isActive('/settings') 
              ? "bg-slate-800 text-blue-400" 
              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          )}
        >
          <Settings className={cn("h-5 w-5", isActive('/settings') ? "text-blue-400" : "text-slate-400 group-hover:text-slate-100")} />
          <span className="font-medium">Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          &copy; 2026 Admin Dashboard
        </div>
      </div>
    </div>
  );
}

