import { getSession } from '@/lib/auth';
import { UserMenu } from './UserMenu';

export async function Navbar() {
  const session = await getSession();
  const user = session?.user || { fullname: 'Guest', role: 'guest' };

  return (
    <div className="h-16 bg-white border-b border-slate-200 fixed top-0 left-64 right-0 z-10 flex items-center justify-between px-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-800">
        Active / Inactive User Dashboard
      </h1>
      
      <div className="flex items-center gap-4">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
