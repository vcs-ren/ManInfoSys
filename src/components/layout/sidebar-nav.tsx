
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
  SidebarSeparator, // Import Separator
} from '@/components/ui/sidebar';
import type { IconName } from 'lucide-react'; // Import IconName type
import dynamic from 'next/dynamic'; // Import dynamic for icon loading
import { LogOut, Settings, LayoutDashboard as DefaultIcon } from 'lucide-react'; // Keep static icons, add Settings
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import * as React from 'react'; // Import React

interface NavItem {
  href: string;
  label: string;
  icon: IconName; // Expect icon name (string)
}

interface NavItemGroup {
    role: string;
    items: NavItem[];
}

interface SidebarNavProps {
  navItemGroups: NavItemGroup[]; // Accept grouped items
  currentUserRole: string; // Role of the currently logged-in user
}

// Helper to dynamically load icons
const Icon = ({ name, ...props }: { name: IconName } & React.ComponentProps<any>) => {
  // Fallback icon if the requested icon doesn't exist
  const LucideIcon = dynamic(
    () => import('lucide-react').then((mod) => mod[name] || mod['LayoutDashboard']), // Use LayoutDashboard as fallback
    {
        ssr: false,
        loading: () => <DefaultIcon {...props} /> // Render default icon while loading
    }
  );

  return <LucideIcon {...props} />;
};


export function SidebarNav({ navItemGroups, currentUserRole }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Retrieve username from localStorage when component mounts or currentUserRole changes
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername);
    }
  }, [currentUserRole]); // Re-run if currentUserRole changes, though username is more static per session

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('username'); // Clear username on logout
    }
    console.log("Logging out...");
    router.push('/login');
  };

  // Filter the nav items based on the current user's role
  const userNavGroup = navItemGroups.find(group => group.role === currentUserRole);
  const filteredNavItems = userNavGroup?.items.filter(item => item.label !== 'Settings') || []; // Exclude settings from main list
  const settingsNavItem = userNavGroup?.items.find(item => item.label === 'Settings'); // Find settings item

   // Helper function to determine if a nav item is active
  const checkIsActive = (itemHref: string, currentPathname: string): boolean => {
    // Handle exact match for root dashboard paths
    if (itemHref.endsWith('/dashboard')) {
        return currentPathname === itemHref;
    }
    // Handle other paths using startsWith, ensuring it's not just matching '/'
    return itemHref !== '/' && currentPathname.startsWith(itemHref);
    };

  const getLoggedInAsText = () => {
    if (currentUserRole === "Super Admin") {
        return "System - Super Admin";
    }
    if (currentUserRole === "Sub Admin" && username) {
        return `Sub Admin - ${username}`;
    }
    if (currentUserRole === "Teacher" && username) {
        return `Teacher - ${username}`;
    }
    if (currentUserRole === "Student" && username) {
        return `Student - ${username}`;
    }
    return currentUserRole; // Fallback if username is not yet available or role is unexpected
  };


  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 justify-between">
            <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">Management Information System</h2>
            {/* Sidebar trigger is automatically handled for mobile */}
          </div>
            <div className="p-2 pt-0 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                Logged in as: <strong>{getLoggedInAsText()}</strong>
            </div>
        </SidebarHeader>

        {/* Main Content Area */}
        <SidebarContent className="flex-1 overflow-y-auto p-2 flex flex-col justify-between"> {/* Use flex-col and justify-between */}
             {/* Main Navigation */}
             <SidebarMenu className="flex-1"> {/* Let main menu take available space */}
                {filteredNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref legacyBehavior>
                        <SidebarMenuButton
                        asChild
                        isActive={checkIsActive(item.href, pathname)}
                        tooltip={item.label} // Show label as tooltip when collapsed
                        className="justify-start"
                        >
                        <a>
                            {/* Dynamically render icon */}
                            <Icon name={item.icon} className="size-4 mr-2" />
                            <span>{item.label}</span>
                        </a>
                        </SidebarMenuButton>
                    </Link>
                    </SidebarMenuItem>
                ))}
             </SidebarMenu>

              {/* Settings and Logout Section at the bottom of the content */}
              <div className="mt-auto"> {/* Push this section to the bottom */}
                    <SidebarSeparator className="my-2" /> {/* Separator */}
                    <SidebarMenu>
                         {settingsNavItem && ( // Conditionally render settings if it exists
                           <SidebarMenuItem key={settingsNavItem.href}>
                                <Link href={settingsNavItem.href} passHref legacyBehavior>
                                    <SidebarMenuButton
                                    asChild
                                    isActive={checkIsActive(settingsNavItem.href, pathname)}
                                    tooltip={settingsNavItem.label}
                                    className="justify-start"
                                    >
                                    <a>
                                        <Icon name={settingsNavItem.icon} className="size-4 mr-2" />
                                        <span>{settingsNavItem.label}</span>
                                    </a>
                                    </SidebarMenuButton>
                                </Link>
                           </SidebarMenuItem>
                         )}
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout} className="justify-start w-full" tooltip="Logout">
                                <LogOut className="size-4 mr-2" />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
              </div>
        </SidebarContent>

        {/* Footer is now empty */}
        <SidebarFooter>
           {/* Intentionally empty */}
        </SidebarFooter>
      </Sidebar>

        {/* Mobile specific trigger placed in header/top bar */}
         <div className="md:hidden p-2 fixed top-0 left-0 z-20 bg-background/80 backdrop-blur-sm rounded-br-lg">
            <SidebarTrigger />
         </div>
    </>
  );
}
