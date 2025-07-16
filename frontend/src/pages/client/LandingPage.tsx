import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, MapPin, Star } from "lucide-react"

function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        HCMUTE EVENT
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                        Khám phá và tham gia những sự kiện thú vị tại Đại học Sư phạm Kỹ thuật TP.HCM
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                            Khám phá sự kiện
                        </Button>
                        <Button size="lg" variant="outline" className="px-8 py-3">
                            Đăng ký ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <Calendar className="w-12 h-12 mx-auto text-blue-600" />
                            <CardTitle className="text-lg">Sự kiện đa dạng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Từ hội thảo, workshop đến các hoạt động văn hóa, thể thao
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <Users className="w-12 h-12 mx-auto text-purple-600" />
                            <CardTitle className="text-lg">Cộng đồng sôi động</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Kết nối với sinh viên, giảng viên và đối tác
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <MapPin className="w-12 h-12 mx-auto text-green-600" />
                            <CardTitle className="text-lg">Địa điểm thuận tiện</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Tại trường ĐH Sư phạm Kỹ thuật TP.HCM
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <Star className="w-12 h-12 mx-auto text-yellow-600" />
                            <CardTitle className="text-lg">Trải nghiệm tuyệt vời</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Những kỷ niệm đáng nhớ và kiến thức bổ ích
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Sẵn sàng tham gia?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Không bỏ lỡ cơ hội trải nghiệm những sự kiện thú vị
                    </p>
                    <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                        Xem lịch sự kiện
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-lg font-semibold mb-2">HCMUTE EVENT</p>
                    <p className="text-gray-400">
                        © 2024 Đại học Sư phạm Kỹ thuật TP.HCM. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage