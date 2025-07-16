import { Home, Users, CalendarDays, LogOut } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuthStore } from "@/stores/auth.store"
import { logout } from "@/services/auth.service"
import { toast } from "sonner"

// Menu items for the admin dashboard
const items = [
    {
        title: "Dashboard",
        url: "/quan-ly",
        icon: Home,
    },
    {
        title: "Quản lý sự kiện",
        url: "/quan-ly/su-kien",
        icon: CalendarDays,
    },
    {
        title: "Quản lý người dùng",
        url: "/quan-ly/nguoi-dung",
        icon: Users,
    },
]

export function AppSidebar() {
    const location = useLocation()
    const { setUser } = useAuthStore()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await logout()
            setUser(null)
            toast.success("Đăng xuất thành công")
            // Redirect to login page
            window.location.href = "/dang-nhap"
        } catch (error) {
            console.error("Logout error:", error)
            toast.error("Có lỗi xảy ra khi đăng xuất")
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Quản lý hệ thống</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = location.pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <SidebarMenuButton disabled={isLoggingOut}>
                                    <LogOut />
                                    <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                                </SidebarMenuButton>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}