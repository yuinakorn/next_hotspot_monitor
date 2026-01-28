import ProfilePage from '@/components/users/ProfilePage';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'My Profile',
    description: 'Manage your account settings',
};

export default async function Page() {
    const session = await getSession();
    if (!session || !session.user) {
        redirect('/login');
    }

    return <ProfilePage user={session.user} />;
}
