'use client';

import { useState, useEffect } from 'react';
import { getWebUsers, createWebUser, updateWebUser, deleteWebUser, WebUser } from '@/app/actions/web-users';
import { Plus, Edit, Trash2, Shield, User, Lock, Loader2, X } from 'lucide-react';

export default function SystemUsersPage() {
    const [users, setUsers] = useState<WebUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<WebUser | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('user');
    const [status, setStatus] = useState('active');

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setIsLoading(true);
        try {
            const data = await getWebUsers();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    function handleAdd() {
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setFullname('');
        setRole('user');
        setStatus('active');
        setIsModalOpen(true);
    }

    function handleEdit(user: WebUser) {
        setEditingUser(user);
        setUsername(user.username);
        setPassword(''); // Don't show password
        setFullname(user.fullname);
        setRole(user.role);
        setStatus(user.status || 'active');
        setIsModalOpen(true);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const res = await deleteWebUser(id);
            if (res.error) {
                alert(res.error);
            } else {
                await loadUsers();
            }
        } catch (e) {
            alert('Failed to delete');
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('role', role);
        formData.append('status', status);
        if (password) formData.append('password', password);

        try {
            let res;
            if (editingUser) {
                formData.append('id', editingUser.id.toString());
                res = await updateWebUser(formData);
            } else {
                formData.append('username', username);
                res = await createWebUser(formData);
            }

            if (res.error) {
                alert(res.error);
            } else {
                setIsModalOpen(false);
                await loadUsers();
            }
        } catch (e) {
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        System Users
                     </h1>
                     <p className="text-slate-500">Manage admins and users access to this dashboard</p>
                </div>
                <button 
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-blue-200 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Full Name</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">{user.username}</td>
                                <td className="px-6 py-4 text-slate-600">{user.fullname}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.status === 'active' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                        {user.status === 'active' ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleEdit(user)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && users.length === 0 && (
                             <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    No system users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingUser ? 'Edit User' : 'Add User'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!editingUser && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Username</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="e.g. jdoe"
                                    />
                                </div>
                            )}
                             <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={fullname}
                                    onChange={e => setFullname(e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Role</label>
                                    <select 
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Status</label>
                                    <select 
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={status || 'active'}
                                        onChange={e => setStatus(e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 block">
                                    {editingUser ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <input 
                                    type="password" 
                                    required={!editingUser}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
                                />
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
