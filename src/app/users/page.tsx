import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { UserManagementTable } from '@/components/users/UserManagementTable';
import { getAllUsers, getServices } from '@/lib/dashboard-data';

export const revalidate = 0; // Always fresh data

export default async function UsersPage() {
  const users = await getAllUsers();
  const services = await getServices();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-8 mt-16">
          <UserManagementTable initialUsers={users} services={services} />
        </main>
      </div>
    </div>
  );
}
