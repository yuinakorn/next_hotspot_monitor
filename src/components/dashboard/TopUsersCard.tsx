'use client';

import { Download, Upload, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { getTopUsers } from '@/app/actions/get-top-users';
import type { TopDataUser } from '@/lib/dashboard-data';

interface TopUsersCardProps {
  users: TopDataUser[];
}

export function TopUsersCard({ users }: TopUsersCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<TopDataUser[]>([]);

  const handleViewReport = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
    
    if (reportData.length === 0) {
      setIsLoading(true);
      try {
        const data = await getTopUsers(50);
        setReportData(data);
      } catch (error) {
        console.error('Failed to load report data', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Top Data Consumers</h3>
          <p className="text-sm text-slate-500">Highest bandwidth usage (Last 30 Days)</p>
        </div>
        
        <div className="divide-y divide-slate-100">
          {users.map((user, index) => (
            <div key={user.username} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                  ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                    index === 1 ? 'bg-slate-200 text-slate-700' : 
                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}
                `}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    {user.firstname || user.lastname 
                      ? `${user.firstname || ''} ${user.lastname || ''}`.trim()
                      : user.username}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{user.username}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-sm text-slate-800">{user.totalUsage.toFixed(1)} GB</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-0.5"><Download className="h-3 w-3" /> {user.totalDownload.toFixed(1)}</span>
                  <span className="flex items-center gap-0.5"><Upload className="h-3 w-3" /> {user.totalUpload.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button 
            onClick={handleViewReport}
            className="block w-full py-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            View Full Report
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Top 50 Data Consumers</h3>
                <p className="text-sm text-slate-500">Comprehensive usage report for the last 30 days</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Rank</th>
                      <th className="px-6 py-3 font-medium">User</th>
                      <th className="px-6 py-3 font-medium text-right">Download</th>
                      <th className="px-6 py-3 font-medium text-right">Upload</th>
                      <th className="px-6 py-3 font-medium text-right">Total Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((user, index) => (
                      <tr key={user.username} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-500 font-mono">#{index + 1}</td>
                        <td className="px-6 py-3">
                          <div>
                            <p className="font-medium text-slate-900">
                              {user.firstname || user.lastname 
                                ? `${user.firstname || ''} ${user.lastname || ''}`.trim()
                                : user.username}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">{user.username}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600">{user.totalDownload.toFixed(2)} GB</td>
                        <td className="px-6 py-3 text-right text-slate-600">{user.totalUpload.toFixed(2)} GB</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-800">{user.totalUsage.toFixed(2)} GB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors cursor-pointer"
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
