import { Download, Upload } from 'lucide-react';

interface TopUser {
  username: string;
  firstname?: string;
  lastname?: string;
  totalDownload: number;
  totalUpload: number;
  totalUsage: number;
}

interface TopUsersCardProps {
  users: TopUser[];
}

export function TopUsersCard({ users }: TopUsersCardProps) {
  return (
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
        <button className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
          View Full Report
        </button>
      </div>
    </div>
  );
}
