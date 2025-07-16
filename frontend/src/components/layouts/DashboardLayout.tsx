import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../blocks/app-sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1">
                <div className="p-4">
                    <SidebarTrigger />
                </div>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    )
}