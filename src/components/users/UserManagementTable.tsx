'use client';

import { useState } from 'react';
import { UserManagementData, ServicePlan } from '@/lib/dashboard-data';
import { Search, Edit, Trash2, Plus, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { UserModal } from './UserModal';

interface UserManagementTableProps {
  initialUsers: UserManagementData[];
  services: ServicePlan[];
}

export function UserManagementTable({ initialUsers, services }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserManagementData[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagementData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(search.toLowerCase()) || 
      u.firstname.toLowerCase().includes(search.toLowerCase()) || 
      u.lastname.toLowerCase().includes(search.toLowerCase()) ||
      u.company?.toLowerCase().includes(search.toLowerCase());
    
    // Logic for service filter:
    // 'all' -> no filter
    // 'default' -> matches 'Default service' or null/undefined
    // other -> exact match on srvid
    const matchesService = 
      serviceFilter === 'all' ? true :
      serviceFilter === 'default' ? (u.srvname === 'Default service' || !u.srvname) :
      u.srvid === Number(serviceFilter);

    return matchesSearch && matchesService;
  }).sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    let aValue: any = a[key as keyof UserManagementData];
    let bValue: any = b[key as keyof UserManagementData];

    // Special handling for calculated/composite fields
    if (key === 'name') {
        aValue = `${a.firstname} ${a.lastname}`;
        bValue = `${b.firstname} ${b.lastname}`;
    }

    if (aValue === bValue) return 0;
    
    // Handle null/undefined - push to bottom usually, or standard comparison
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const compareResult = aValue < bValue ? -1 : 1;
    return direction === 'asc' ? compareResult : -compareResult;
  });

  const handleSort = (key: string) => {
    setSortConfig(current => {
        if (current?.key === key) {
            return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
      if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-slate-300" />;
      return sortConfig.direction === 'asc' 
        ? <ArrowUp className="w-4 h-4 text-blue-600" />
        : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  async function refreshData() {
    const res = await fetch('/api/users');
    if (res.ok) {
        const data = await res.json();
        setUsers(data);
    }
  }

  async function handleDelete(username: string) {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;

    setIsDeleting(username);
    try {
        const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            await refreshData();
        } else {
            alert('Failed to delete user');
        }
    } catch (e) {
        alert('Error deleting user');
    } finally {
        setIsDeleting(null);
    }
  }

  function handleAdd() {
    setEditingUser(null);
    setIsModalOpen(true);
  }

  function handleEdit(user: UserManagementData) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              User Management
           </h1>
           <p className="text-slate-500">Manage users, passwords, and service plans</p>
        </div>
        <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-blue-200"
        >
            <Plus className="w-4 h-4" />
            Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <div className="w-full md:w-auto">
                <select 
                    className="w-full md:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm text-slate-600"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                >
                    <option value="all">All Services</option>
                    <option value="default">Default</option>
                    {services.map(srv => (
                        <option key={srv.srvid} value={srv.srvid}>{srv.srvname}</option>
                    ))}
                </select>
            </div>

            <div className="text-sm text-slate-500 font-medium ml-auto">
                {filteredUsers.length} Users
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('username')}>
                    <div className="flex items-center gap-2">Username <SortIcon columnKey="username" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">Name <SortIcon columnKey="name" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('company')}>
                    <div className="flex items-center gap-2">Company <SortIcon columnKey="company" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('srvname')}>
                    <div className="flex items-center gap-2">Service <SortIcon columnKey="srvname" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('created')}>
                     <div className="flex items-center gap-2">Created <SortIcon columnKey="created" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('last_seen')}>
                     <div className="flex items-center gap-2">Last Seen <SortIcon columnKey="last_seen" /></div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const formatLastSeen = (dateString?: string | null) => {
                   if (!dateString) return '-';
                   const now = new Date();
                   const date = new Date(dateString);
                   const diffTime = Math.abs(now.getTime() - date.getTime());
                   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                   
                   if (diffDays <= 1) return 'Today';
                   return `${diffDays} days`;
                };

                return (
                <tr key={user.username} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.firstname} {user.lastname}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.company || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${(user.srvname || '').toLowerCase().includes('selfregis') ? 'bg-yellow-50 text-yellow-700' : 
                          (user.srvname || '').toLowerCase().includes('moph') ? 'bg-green-50 text-green-700' : 
                          (user.srvname || '').toLowerCase().includes('admin') ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'}`}>
                        {user.srvname === 'Default service' ? 'Default' : (user.srvname || 'Unknown')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.created ? new Date(user.created).toISOString().split('T')[0] : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                     {formatLastSeen(user.last_seen)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(user.username)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                            disabled={isDeleting === user.username}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                        {users.length === 0 ? 'No users found.' : 'No matches found.'}
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
        user={editingUser}
        services={services}
      />
    </div>
  );
}
