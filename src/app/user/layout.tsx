
import { type PropsWithChildren } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter, // Keep import if needed later
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    User,
    ShoppingBag,
    Wallet,
    Users,
    CheckSquare,
    Ticket as TicketIcon, // Renamed Mail to TicketIcon
    Heart,
    Lock,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
// Import a user logout button if available/needed for this specific layout
// import { UserLogoutButton } from '@/components/auth/user-logout-button';

// TODO: Implement active link highlighting based on current path

export default function UserDashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="right" collapsible="icon" variant="sidebar"> {/* Changed side to right */}
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
              پنل کاربری
            </h2>
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="داشبورد">
                <Link href="/user/dashboard">
                  <LayoutDashboard />
                  <span>داشبورد</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="ویرایش پروفایل">
                <Link href="/user/profile">
                  <User />
                  <span>ویرایش پروفایل</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="سفارشات من">
                <Link href="/user/orders">
                  <ShoppingBag />
                  <span>سفارشات من</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="کیف پول">
                <Link href="/user/wallet">
                  <Wallet />
                  <span>کیف پول</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="دعوت دوستان">
                <Link href="/user/invites">
                  <Users />
                  <span>دعوت دوستان</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="مدیریت چک‌ها">
                <Link href="/user/cheques">
                  <CheckSquare />
                  <span>مدیریت چک‌ها</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="تیکت‌های پشتیبانی">
                <Link href="/user/tickets"> {/* Updated href */}
                  <TicketIcon /> {/* Updated icon */}
                  <span>تیکت‌های پشتیبانی</span> {/* Updated text */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="علاقه‌مندی‌ها">
                <Link href="/user/favorites">
                  <Heart />
                  <span>علاقه‌مندی‌ها</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="تغییر رمز عبور">
                <Link href="/user/change-password">
                  <Lock />
                  <span>تغییر رمز عبور</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
         <SidebarFooter>
            {/* Placeholder for logout - Replace with actual component/logic */}
            <SidebarMenuButton variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center">
                <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
                <span className="group-data-[collapsible=icon]:hidden ml-2">خروج</span>
            </SidebarMenuButton>
            {/* <UserLogoutButton /> */}
         </SidebarFooter>
      </Sidebar>
      {/* Note: SidebarInset might need adjustment based on overall app structure */}
       <div className="flex-1 p-4 md:p-8"> {/* Added padding for content area */}
            {children}
       </div>
    </SidebarProvider>
  );
}
