"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/user";
import { createUser, updateUser } from "@/services/user.service";
import { batchFaceDelete, batchFaceRegister, batchFaceUpdate } from "@/services/face.service";

interface UserFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "update" | "view";
    user?: User;
    onSuccess?: () => void;
}

export function UserFormModal({
    open,
    onOpenChange,
    mode,
    user,
    onSuccess,
}: UserFormModalProps) {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        position: "",
        avatar_image_url: "",
        metadata: {},
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && (mode === "update" || mode === "view")) {
            setFormData({
                full_name: user.full_name,
                email: user.email,
                position: user.position,
                avatar_image_url: user.avatar_image_url,
                metadata: user.metadata,
            });
        } else {
            setFormData({
                full_name: "",
                email: "",
                position: "",
                avatar_image_url: "",
                metadata: {},
            });
        }
    }, [user, mode, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "view") return;

        setLoading(true);
        try {
            if (mode === "create") {
                await createUser(formData);
                toast.success("Người dùng đã được tạo thành công", { position: "bottom-center" });

            } else if (mode === "update" && user) {
                await updateUser(user.id, formData);

                toast.success("Người dùng đã được cập nhật thành công", { position: "bottom-center" });
            }

            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(mode === "create" ? "Lỗi khi tạo người dùng" : "Lỗi khi cập nhật người dùng", { position: "bottom-center" });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getTitle = () => {
        switch (mode) {
            case "create":
                return "Tạo người dùng mới";
            case "update":
                return "Cập nhật người dùng";
            case "view":
                return "Chi tiết người dùng";
        }
    };

    const getDescription = () => {
        switch (mode) {
            case "create":
                return "Điền thông tin để tạo người dùng mới";
            case "update":
                return "Cập nhật thông tin người dùng";
            case "view":
                return "Xem chi tiết thông tin người dùng";
        }
    };

    const isReadOnly = mode === "view";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto max-h-screen">
                <SheetHeader className="sticky top-0 bg-background z-10 pb-4">
                    <SheetTitle>{getTitle()}</SheetTitle>
                    <SheetDescription>{getDescription()}</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className={`space-y-6 p-1 pb-24 ${isReadOnly ? 'pointer-events-none' : ''}`}>
                        {mode === "view" && user && (
                            <div className="space-y-4 mb-6">
                                {/* User Profile Card */}
                                <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-muted/50 rounded-lg">
                                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                                        <AvatarImage src={user.avatar_image_url} />
                                        <AvatarFallback className="text-lg sm:text-xl md:text-2xl font-medium">
                                            {user.full_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2 min-w-0 flex-1">
                                        <h3 className="font-semibold text-lg sm:text-xl md:text-2xl truncate">{user.full_name}</h3>
                                        <p className="text-sm sm:text-base text-muted-foreground truncate">{user.email}</p>
                                        <Badge variant="secondary" className="text-sm">{user.position}</Badge>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-6 px-1">
                            <div className="grid gap-3">
                                <Label htmlFor="full_name" className="text-sm font-medium">Họ và tên</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                                    placeholder={isReadOnly ? "Họ và tên" : "Nhập họ và tên"}
                                    required={!isReadOnly}
                                    readOnly={isReadOnly}
                                    disabled={isReadOnly}
                                    className={`px-4 py-3 ${isReadOnly ? 'bg-muted/50 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder={isReadOnly ? "Email" : "Nhập email"}
                                    required={!isReadOnly}
                                    readOnly={isReadOnly}
                                    disabled={isReadOnly}
                                    className={`px-4 py-3 ${isReadOnly ? 'bg-muted/50 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="position" className="text-sm font-medium">Chức vụ</Label>
                                <Input
                                    id="position"
                                    value={formData.position}
                                    onChange={(e) => handleInputChange("position", e.target.value)}
                                    placeholder={isReadOnly ? "Chức vụ" : "Nhập chức vụ"}
                                    required={!isReadOnly}
                                    readOnly={isReadOnly}
                                    disabled={isReadOnly}
                                    className={`px-4 py-3 ${isReadOnly ? 'bg-muted/50 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            {mode !== "view" && (
                                <div className="grid gap-3">
                                    <ImageUpload
                                        label="Avatar"
                                        value={formData.avatar_image_url}
                                        onChange={(url) => handleInputChange("avatar_image_url", url)}
                                        disabled={isReadOnly}
                                        size="md"
                                        placeholder="Kéo thả hoặc chọn file ảnh"
                                    />
                                </div>
                            )}

                            {mode === "view" && user && (
                                <div className="grid gap-3 pt-2">
                                    <Label className="text-sm font-medium">Thông tin thêm</Label>
                                    <div className="text-sm text-muted-foreground space-y-2 bg-muted/30 rounded-lg p-4">
                                        <p className="flex justify-between">
                                            <span className="font-medium">Ngày tạo:</span>
                                            <span>{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium">Cập nhật lần cuối:</span>
                                            <span>{new Date(user.updated_at).toLocaleDateString('vi-VN')}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </form>
                </div>

                <SheetFooter className="sticky bottom-0 bg-background border-t pt-4 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2"
                    >
                        {mode === "view" ? "Đóng" : "Hủy"}
                    </Button>
                    {mode !== "view" && (
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2"
                            onClick={handleSubmit}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "create" ? "Tạo mới" : "Cập nhật"}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
} 