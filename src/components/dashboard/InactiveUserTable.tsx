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

import { ExportButton } from '@/components/dashboard/ExportButton';


export function InactiveUserTable({ users }: InactiveUserTableProps) {
  return (
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
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
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
  );
}
