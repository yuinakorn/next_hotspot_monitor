import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { NetworkChart } from '@/components/dashboard/NetworkChart';
import { TopUsersCard } from '@/components/dashboard/TopUsersCard';
import { InactiveUserTable } from '@/components/dashboard/InactiveUserTable';
import { OnlineUsersCard } from '@/components/dashboard/OnlineUsersCard';
import { getDashboardSummary, getLoginTrends, getInactiveUsers, getDailyNetworkUsage, getTopDataUsers } from '@/lib/dashboard-data';
import { Users, UserX, Activity } from 'lucide-react';

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function DashboardPage() {
  // Fetch data directly from the library (Server Component)
  const summary = await getDashboardSummary();
  const trends = await getLoginTrends(30);
  const inactiveUsers = await getInactiveUsers(90);
  const networkUsage = await getDailyNetworkUsage(30);
  const topUsers = await getTopDataUsers(5);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-8 mt-16">
          
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <OnlineUsersCard 
              title="Online Users" 
              value={summary.onlineUsers} 
              trend="now"
              className="border-green-100"
            />
            <KpiCard 
              title="Active Users" 
              value={summary.activeUsers} 
              icon={Activity} 
              trend={`${summary.activePercentage}% of total`}
              className="border-blue-100"
            />
            <KpiCard 
              title="Inactive Users" 
              value={summary.inactiveUsers} 
              icon={UserX}
              trend="> 90 days"
              className="border-red-100"
            />
            <KpiCard 
              title="Total Users" 
              value={summary.totalUsers} 
              icon={Users}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart Section */}
            <div className="lg:col-span-3 xl:col-span-2 space-y-8">
              <TrendChart data={trends} />
              <NetworkChart data={networkUsage} />
            </div>

            {/* Sidebar Widgets */}
            <div className="lg:col-span-1 space-y-8">
              <div className="hidden xl:block bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Security Insights</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {summary.inactiveUsers} users have not logged in for over 90 days. 
                  Consider reviewing these accounts.
                </p>
                <a 
                  href="/api/reports/inactive-users"
                  className="block w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm text-center"
                >
                  Generate Report
                </a>
              </div>

              <TopUsersCard users={topUsers} />
           </div>
          </div>

          {/* Table Section */}
          <div>
            <InactiveUserTable users={inactiveUsers} />
          </div>
          
        </main>
      </div>
    </div>
  );
}
