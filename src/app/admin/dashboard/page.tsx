
import { Button } from '@/components/ui/button';
// Logout functionality moved to AdminLogoutButton in layout
// import { logoutAdmin } from '@/app/admin/login/actions';
// import { redirect } from 'next/navigation';

// // Example server action form handler - No longer needed here
// async function handleLogout() {
//     'use server';
//     const result = await logoutAdmin();
//     if (result.success) {
//         redirect('/admin/login');
//     } else {
//         // Handle logout error - maybe show a toast on the client?
//         console.error("Admin logout failed");
//         // For now, redirect anyway or show an error state
//         redirect('/admin/login?logoutError=true');
//     }
// }


export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">داشبورد ادمین</h1>
         {/* Logout Button moved to AdminLayout's SidebarFooter */}
         {/* <form action={handleLogout}>
            <Button type="submit" variant="destructive">خروج</Button>
         </form> */}
      </div>
      <p>به داشبورد ادمین خوش آمدید!</p>
      {/* Add admin-specific content and components here */}
    </div>
  );
}
