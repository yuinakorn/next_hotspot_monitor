'use client';

// ... existing imports ...
import { ExportButton } from '@/components/dashboard/ExportButton';
import { useState } from 'react';
import { getInactiveUserDetails, InactiveUserDetails } from '@/app/actions/get-inactive-user-details';
import { X, Loader2, User, Building, Calendar, Wifi, Download, Upload } from 'lucide-react';

interface InactiveUser {
  username: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  lastLogin: string | null;
  daysInactive: number | null;
}

interface InactiveUserTableProps {
  users: InactiveUser[];
}

export function InactiveUserTable({ users }: InactiveUserTableProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<InactiveUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = async (username: string) => {
    setSelectedUser(username);
    setIsLoading(true);
    setUserDetails(null);
    
    try {
      const details = await getInactiveUserDetails(username);
      setUserDetails(details);
    } catch (error) {
      console.error("Failed to fetch user details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Inactive Users</h3>
            <span className="text-sm text-red-500 font-medium">&gt; 90 Days Inactive</span>
          </div>
          <ExportButton data={users} filename="inactive_users.csv" />
        </div>

        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-center">Days Inactive</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.username} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {user.firstname || user.lastname 
                          ? `${user.firstname || ''} ${user.lastname || ''}`.trim()
                          : user.username}
                      </p>
                      <p className="text-xs text-slate-500">{user.username}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.company || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                      : <span className="text-slate-400 italic">Never</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium">
                      {user.daysInactive !== null ? `${user.daysInactive} days` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleViewDetails(user.username)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
           <div className="p-8 text-center text-slate-500">
              No inactive users found.
           </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                User Details
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p>Loading user details...</p>
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* Header Profile */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {userDetails.firstname} {userDetails.lastname}
                      </h2>
                      <p className="text-slate-500 font-mono">{userDetails.username}</p>
                    </div>
                    {userDetails.lastLogin ? (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                        Inactive
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
                      <p className="font-medium text-slate-800 truncate" title={userDetails.company}>
                        {userDetails.company || '-'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Wifi className="h-3 w-3" /> Service Plan
                      </div>
                      <p className="font-medium text-slate-800 truncate" title={userDetails.srvname}>
                        {userDetails.srvname}
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
                                <p className="font-bold text-slate-800">{formatBytes(userDetails.totalDownload)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Upload className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Upload</p>
                                <p className="font-bold text-slate-800">{formatBytes(userDetails.totalUpload)}</p>
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
                                {userDetails.lastLogin ? new Date(userDetails.lastLogin).toLocaleString('en-GB') : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Last IP Address</span>
                            <span className="font-mono text-slate-700">{userDetails.lastIp || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">MAC Address</span>
                            <span className="font-mono text-slate-700">{userDetails.lastMac || 'N/A'}</span>
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
                  onClick={closeModal}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
