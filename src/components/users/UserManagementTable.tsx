'use client';

import { useState } from 'react';
import { UserManagementData, ServicePlan } from '@/lib/dashboard-data';
import { Search, Edit, Trash2, Plus, Users, ArrowUpDown, ArrowUp, ArrowDown, Eye, X, Loader2, Building, Calendar, Wifi, Download, Upload } from 'lucide-react';
import { UserModal } from './UserModal';
import { getUserDetails, UserDetails } from '@/app/actions/get-user-details';

interface UserManagementTableProps {
  initialUsers: UserManagementData[];
  services: ServicePlan[];
}

export function UserManagementTable({ initialUsers, services }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserManagementData[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('__all__');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagementData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Detail Modal State
  const [detailUser, setDetailUser] = useState<UserDetails | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const companyOptions = Array.from(
    new Set(users.map(user => user.company).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

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

    const matchesCompany =
      companyFilter === '__all__' ? true :
      companyFilter === '__none__' ? !u.company :
      u.company === companyFilter;

    return matchesSearch && matchesService && matchesCompany;
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

  async function handleViewDetails(username: string) {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    setDetailUser(null);
    try {
        const details = await getUserDetails(username);
        setDetailUser(details);
    } catch (error) {
        console.error("Failed to load details", error);
    } finally {
        setIsDetailLoading(false);
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-blue-200 cursor-pointer"
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

            <div className="w-full md:w-auto">
                <select 
                    className="w-full md:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm text-slate-600"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                >
                    <option value="__all__">All Companies</option>
                    <option value="__none__">No Company</option>
                    {companyOptions.map(company => (
                        <option key={company} value={company}>{company}</option>
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
                            onClick={() => handleViewDetails(user.username)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(user.username)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Create/Edit User Modal */}
      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
        user={editingUser}
        services={services}
      />

      {/* View User Details Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                User Details
              </h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p>Loading user details...</p>
                </div>
              ) : detailUser ? (
                <div className="space-y-6">
                  {/* Header Profile */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {detailUser.firstname} {detailUser.lastname}
                      </h2>
                      <p className="text-slate-500 font-mono">{detailUser.username}</p>
                    </div>
                    {detailUser.lastLogin ? (
                       // Logic to check how long inactive? or just show Active
                       // For simplicity let's stick to simple badge or maybe date
                       <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        Has Logged In
                      </span>
                    ) : (
                       <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        Never Connected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Building className="h-3 w-3" /> Company
                      </div>
                      <p className="font-medium text-slate-800 truncate" title={detailUser.company}>
                        {detailUser.company || '-'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Wifi className="h-3 w-3" /> Service Plan
                      </div>
                      <p className="font-medium text-slate-800 truncate" title={detailUser.srvname}>
                        {detailUser.srvname}
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Usage Stats */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Usage Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <Download className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Download</p>
                                <p className="font-bold text-slate-800">{formatBytes(detailUser.totalDownload)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Upload className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Upload</p>
                                <p className="font-bold text-slate-800">{formatBytes(detailUser.totalUpload)}</p>
                            </div>
                        </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Last Session */}
                  <div>
                     <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Last Session</h4>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Last Connected
                            </span>
                            <span className="font-medium text-slate-800">
                                {detailUser.lastLogin ? new Date(detailUser.lastLogin).toLocaleString('en-GB') : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Last IP Address</span>
                            <span className="font-mono text-slate-700">{detailUser.lastIp || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">MAC Address</span>
                            <span className="font-mono text-slate-700">{detailUser.lastMac || 'N/A'}</span>
                        </div>
                     </div>
                  </div>

                </div>
              ) : (
                 <div className="text-center text-red-500 py-8">
                    Failed to load user details.
                 </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
