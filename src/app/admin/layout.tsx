
'use client'; // Add 'use client' because we need usePathname hook

import { type PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    ShoppingBag,
    Settings,
    Users,
    Tag,
    LogOut,
    MessageSquareText,
    Package,
    Image as ImageIcon,
    Folders,
    PercentSquare,
    AppWindow,
    BarChart3,
    FileText, // Import FileText for Pages
    Home, // Import Home for Homepage Editor
    Ticket // Import Ticket for Ticket Management
} from 'lucide-react';
import Link from 'next/link';
import { AdminLogoutButton } from '@/components/admin/admin-logout-button';


// TODO: Implement active link highlighting based on current path

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // Don't render the sidebar on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Render the layout with sidebar for all other admin pages
  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="right" collapsible="icon" variant="sidebar"> {/* Changed side to right */}
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
              پنل ادمین
            </h2>
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="داشبورد">
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  <span>داشبورد</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Management Group */}
            <SidebarGroup>
              <SidebarGroupLabel>مدیریت محتوا و فروش</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="صفحه اصلی">
                    <Link href="/admin/homepage-editor">
                      <Home />
                      <span>صفحه اصلی</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="سفارشات">
                    <Link href="/admin/orders">
                      <ShoppingBag />
                      <span>سفارشات</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="محصولات">
                    <Link href="/admin/products">
                      <Package />
                      <span>محصولات</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="دسته‌بندی‌ها">
                    <Link href="/admin/categories">
                      <Folders />
                      <span>دسته‌بندی‌ها</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="کوپن‌ها">
                       <Link href="/admin/coupons">
                         <Tag />
                         <span>کوپن‌ها</span>
                       </Link>
                   </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="بنرها و اسلایدر">
                    <Link href="/admin/banners">
                      <ImageIcon />
                      <span>بنرها</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="لندینگ پیج‌ها">
                    <Link href="/admin/landing-pages">
                      <AppWindow />
                      <span>لندینگ‌ها</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem> {/* Added Pages Link */}
                  <SidebarMenuButton asChild tooltip="صفحات اطلاعاتی">
                    <Link href="/admin/pages">
                      <FileText />
                      <span>صفحات</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

             {/* User & Marketing Group */}
             <SidebarGroup>
              <SidebarGroupLabel>کاربران و پشتیبانی</SidebarGroupLabel>
               <SidebarGroupContent>
                   <SidebarMenuItem>
                       <SidebarMenuButton asChild tooltip="کاربران">
                           <Link href="/admin/users">
                             <Users />
                             <span>کاربران</span>
                           </Link>
                       </SidebarMenuButton>
                   </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton asChild tooltip="ارسال پیامک">
                       <Link href="/admin/marketing/sms">
                         <MessageSquareText />
                         <span>ارسال پیامک</span>
                       </Link>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton asChild tooltip="تیکت‌های پشتیبانی">
                       <Link href="/admin/tickets">
                         <Ticket />
                         <span>تیکت‌ها</span>
                       </Link>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* Link to Commissions settings within the main Settings page */}
                   <SidebarMenuItem>
                     <SidebarMenuButton asChild tooltip="تنظیمات پورسانت">
                       <Link href="/admin/settings#commissions"> {/* Link to settings fragment */}
                         <PercentSquare />
                         <span>پورسانت‌ها</span>
                       </Link>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
               </SidebarGroupContent>
             </SidebarGroup>

             <SidebarSeparator />

              {/* Reports Group - Placeholder */}
             {/* <SidebarGroup>
                <SidebarGroupLabel>گزارشات</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="گزارش پرداخت‌ها">
                      <Link href="/admin/reports/payments">
                        <BarChart3 />
                        <span>پرداخت‌ها</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarGroupContent>
             </SidebarGroup> */}

             {/* <SidebarSeparator /> */}

             {/* Settings */}
             <SidebarMenuItem>
               <SidebarMenuButton asChild tooltip="تنظیمات">
                 <Link href="/admin/settings">
                   <Settings />
                   <span>تنظیمات کلی</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <AdminLogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

    