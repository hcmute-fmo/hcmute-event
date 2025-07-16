import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react"

export default function ManageUserPage() {
    // Mock data for users
    const users = [
        {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            role: "Admin",
            status: "Hoạt động",
            joinDate: "2024-01-15",
            eventsJoined: 5,
        },
        {
            id: 2,
            name: "Trần Thị B",
            email: "tranthib@example.com",
            role: "User",
            status: "Hoạt động",
            joinDate: "2024-02-20",
            eventsJoined: 3,
        },
        {
            id: 3,
            name: "Lê Văn C",
            email: "levanc@example.com",
            role: "User",
            status: "Bị khóa",
            joinDate: "2024-03-10",
            eventsJoined: 1,
        },
        {
            id: 4,
            name: "Phạm Thị D",
            email: "phamthid@example.com",
            role: "Moderator",
            status: "Hoạt động",
            joinDate: "2024-01-05",
            eventsJoined: 8,
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                    <p className="text-muted-foreground">
                        Quản lý tất cả người dùng trong hệ thống
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm người dùng mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                    <CardDescription>
                        Tổng cộng {users.length} người dùng
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium">Tên</th>
                                    <th className="text-left p-2 font-medium">Email</th>
                                    <th className="text-left p-2 font-medium">Vai trò</th>
                                    <th className="text-left p-2 font-medium">Trạng thái</th>
                                    <th className="text-left p-2 font-medium">Ngày tham gia</th>
                                    <th className="text-left p-2 font-medium">Sự kiện đã tham gia</th>
                                    <th className="text-left p-2 font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-muted/50">
                                        <td className="p-2 font-medium">{user.name}</td>
                                        <td className="p-2">{user.email}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'Moderator' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Hoạt động' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-2">{user.joinDate}</td>
                                        <td className="p-2">{user.eventsJoined}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {user.status === 'Hoạt động' ? (
                                                    <Button variant="ghost" size="sm">
                                                        <UserX className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="sm">
                                                        <UserCheck className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
