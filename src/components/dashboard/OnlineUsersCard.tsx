'use client';

import { useState } from 'react';
import { KpiCard } from './KpiCard';
import { OnlineUsersModal } from './OnlineUsersModal';
import { LucideIcon, Activity } from 'lucide-react';

interface OnlineUsersCardProps {
    title: string;
    value: string | number;
    trend?: string;
    className?: string;
}

export function OnlineUsersCard(props: OnlineUsersCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div 
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <KpiCard icon={Activity} {...props} />
            </div>

            <OnlineUsersModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}
