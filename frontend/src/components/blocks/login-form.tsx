import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "@/services/auth.service"
import { useAuthStore } from "@/stores/auth.store"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { user, setUser } = useAuthStore()
    useEffect(() => {
        if (user) {
            navigate("/quan-ly")
        }
    }, [user])
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { user } = await signIn(email, password)

            if (user) {
                setUser(user)
                toast("Đăng nhập thành công!", {
                    description: "Chào mừng bạn quay trở lại hệ thống",
                })
                navigate("/quan-ly")
            }
        } catch (error: any) {
            console.error("Login error:", error)

            // Handle specific error cases
            if (error.message?.includes("Invalid login credentials")) {
                toast("Đăng nhập thất bại", {
                    description: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
                })
            } else if (error.message?.includes("Email not confirmed")) {
                toast("Email chưa được xác nhận", {
                    description: "Vui lòng kiểm tra email và xác nhận tài khoản trước khi đăng nhập.",
                })
            } else {
                toast("Lỗi hệ thống", {
                    description: "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.",
                    action: {
                        label: "Thử lại",
                        onClick: () => console.log("Retry login"),
                    },
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-bold text-2xl">Đăng nhập vào tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="********"
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
