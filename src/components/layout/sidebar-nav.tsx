
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import type { LucideIcon } from 'lucide-react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  navItems: NavItem[];
  userRole: string; // e.g., "Admin", "Teacher", "Student"
}

export function SidebarNav({ navItems, userRole }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Add logout logic here (e.g., clear session, redirect)
    console.log("Logging out...");
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 justify-between">
            <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">CampusConnect</h2>
            {/* Sidebar trigger is automatically handled for mobile */}
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <User className="size-4" /> {userRole} Menu
            </SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))} // Highlight parent paths too
                      tooltip={item.label} // Show label as tooltip when collapsed
                      className="justify-start"
                    >
                      <a>
                        <item.icon className="size-4 mr-2" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="justify-start w-full" tooltip="Logout">
                    <LogOut className="size-4 mr-2" />
                    <span>Logout</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

        {/* Mobile specific trigger placed in header/top bar */}
         <div className="md:hidden p-2 fixed top-0 left-0 z-20">
            <SidebarTrigger />
         </div>
    </>
  );
}
