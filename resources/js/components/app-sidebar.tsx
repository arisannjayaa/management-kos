import { Link, usePage } from '@inertiajs/react';
import dashboardController from '@/actions/App/Http/Controllers/DashboardController';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { sidebarMenus } from '@/configs/sidebar-menu';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const { url } = usePage();
    const permissions = auth.permissions || [];

    const isMenuActive = (patterns?: string[]) => {
        if (!patterns) {
            return false;
        }

        return patterns.some((pattern) => url.startsWith(pattern));
    };

    /*
    |--------------------------------------------------------------------------
    | Filter Menu By Permission
    |--------------------------------------------------------------------------
    */

    const filteredGroups = sidebarMenus
        .map((group) => ({
            ...group,

            items: group.items.filter((item) =>
                permissions.includes(item.permission),
            ),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* HEADER */}

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardController.index()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT */}

            <SidebarContent>
                {filteredGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isMenuActive(
                                                item.activePatterns,
                                            )}
                                        >
                                            <Link href={item.href}>
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4" />
                                                )}

                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* FOOTER */}

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
