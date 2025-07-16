import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Eye } from "lucide-react"

export default function ManageEventPage() {
    // Mock data for events
    const events = [
        {
            id: 1,
            title: "Hội thảo Công nghệ 2024",
            date: "2024-12-15",
            time: "09:00",
            location: "Hội trường A",
            status: "Đang diễn ra",
            participants: 150,
        },
        {
            id: 2,
            title: "Workshop React Development",
            date: "2024-12-20",
            time: "14:00",
            location: "Phòng Lab 101",
            status: "Sắp diễn ra",
            participants: 30,
        },
        {
            id: 3,
            title: "Seminar AI & Machine Learning",
            date: "2024-12-25",
            time: "10:00",
            location: "Hội trường B",
            status: "Đã kết thúc",
            participants: 200,
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
                    <p className="text-muted-foreground">
                        Quản lý tất cả các sự kiện trong hệ thống
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sự kiện mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách sự kiện</CardTitle>
                    <CardDescription>
                        Tổng cộng {events.length} sự kiện
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium">Tên sự kiện</th>
                                    <th className="text-left p-2 font-medium">Ngày</th>
                                    <th className="text-left p-2 font-medium">Giờ</th>
                                    <th className="text-left p-2 font-medium">Địa điểm</th>
                                    <th className="text-left p-2 font-medium">Trạng thái</th>
                                    <th className="text-left p-2 font-medium">Số người tham gia</th>
                                    <th className="text-left p-2 font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-b hover:bg-muted/50">
                                        <td className="p-2 font-medium">{event.title}</td>
                                        <td className="p-2">{event.date}</td>
                                        <td className="p-2">{event.time}</td>
                                        <td className="p-2">{event.location}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${event.status === 'Đang diễn ra' ? 'bg-green-100 text-green-800' :
                                                    event.status === 'Sắp diễn ra' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="p-2">{event.participants}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
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
