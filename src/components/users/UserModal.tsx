'use client';

import { useState, useEffect } from 'react';
import { X, Save, Key, User, Building, Briefcase } from 'lucide-react';
import { ServicePlan, UserManagementData } from '@/lib/dashboard-data'; // We can share types

// Define types locally if import issues arise with client components vs server lib
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserManagementData | null; // null = create mode
  services: ServicePlan[];
}

export function UserModal({ isOpen, onClose, onSuccess, user, services }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserManagementData>>({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    company: '',
    srvid: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '', // Don't show existing password
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        company: user.company || '',
        srvid: user.srvid,
      });
    } else {
      setFormData({
        username: '',
        password: '',
        firstname: '',
        lastname: '',
        company: '',
        srvid: services.length > 0 ? services[0].srvid : null,
      });
    }
    setError(null);
  }, [user, services, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.username) {
        setError('Username is required');
        setLoading(false);
        return;
    }
    if (!user && !formData.password) {
        setError('Password is required for new users');
        setLoading(false);
        return;
    }

    try {
      const url = user 
        ? `/api/users/${encodeURIComponent(user.username)}` 
        : '/api/users';
      
      const method = user ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 mb-4">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                disabled={!!user} // Cannot change username after creation
                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all ${user ? 'bg-slate-100 text-slate-500' : 'bg-white border-slate-200'}`}
                placeholder="Username (e.g. mobile number)"
                value={formData.username || ''}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
             {user && <p className="text-xs text-slate-400 mt-1">Username cannot be changed</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {user ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" // Using text to see password as per typical requirement for this admin tool, or password type
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder="Password"
                value={formData.password || ''}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                value={formData.firstname || ''}
                onChange={e => setFormData({...formData, firstname: e.target.value})}
              />
            </div>
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                value={formData.lastname || ''}
                onChange={e => setFormData({...formData, lastname: e.target.value})}
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                value={formData.company || ''}
                onChange={e => setFormData({...formData, company: e.target.value})}
              />
            </div>
          </div>

          {/* Service Plan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Plan</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                value={formData.srvid || ''}
                onChange={e => setFormData({...formData, srvid: Number(e.target.value)})}
              >
                {services.map(srv => (
                    <option key={srv.srvid} value={srv.srvid}>{srv.srvname}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (
                <>
                    <Save className="w-4 h-4" />
                    Save User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
