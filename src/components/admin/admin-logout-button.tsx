
'use client';

import { Button } from '@/components/ui/button';
import { logoutAdmin } from '@/app/actions'; // Import the consolidated server action
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function AdminLogoutButton() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        const result = await logoutAdmin();
        if (result.success) {
            toast({ title: "خروج موفقیت آمیز بود." });
            router.push('/admin/login');
        } else {
            toast({ title: "خطا در خروج", description: "مشکلی در فرآیند خروج رخ داد.", variant: "destructive" });
            setLoading(false);
        }
        // No need to set loading false on success as navigation occurs
    };

    return (
         <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center"
            onClick={handleLogout}
            disabled={loading}
            aria-label="خروج"
            title="خروج"
         >
             {loading ? (
                <Loader2 className="h-4 w-4 animate-spin group-data-[collapsible=icon]:mx-auto" />
             ) : (
                 <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
             )}
            <span className="group-data-[collapsible=icon]:hidden ml-2">خروج</span>
         </Button>
    );
}
