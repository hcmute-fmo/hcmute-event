"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    Upload,
    X,
    Image as ImageIcon,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile, validateImageFile, type UploadProgress } from "@/services/file.service";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
}

export function ImageUpload({
    value = "",
    onChange,
    label = "Avatar",
    placeholder = "Kéo thả hoặc chọn file ảnh",
    className,
    disabled = false,
    size = "md"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string>(value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: "h-16 w-16",
        md: "h-20 w-20",
        lg: "h-24 w-24"
    };

    const handleFileUpload = async (file: File) => {
        const validationError = validateImageFile(file);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setUploading(true);
        setProgress({ loaded: 0, total: file.size, percentage: 0 });

        try {
            // Create preview
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);

            const result = await uploadFile(
                file,
                "avatars",
                "users",
                (progressData) => {
                    setProgress(progressData);
                }
            );

            if (result.error) {
                toast.error(result.error);
                setPreview(value); // Revert to original
            } else {
                onChange(result.url);
                setPreview(result.url);
                toast.success("Tải ảnh lên thành công");
            }
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi tải ảnh lên");
            setPreview(value); // Revert to original
        } finally {
            setUploading(false);
            setProgress(null);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
        }
    }, [disabled]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const files = e.target.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
        }
    };

    const handleClick = () => {
        if (disabled || uploading) return;
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        if (disabled || uploading) return;
        onChange("");
        setPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleManualUrl = (url: string) => {
        onChange(url);
        setPreview(url);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <Label className="text-sm font-medium">{label}</Label>

            {/* Upload Area */}
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                    "hover:bg-muted/50 cursor-pointer",
                    dragActive && "border-primary bg-primary/5",
                    disabled && "opacity-50 cursor-not-allowed",
                    uploading && "pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled || uploading}
                />

                <div className="flex flex-col items-center gap-4">
                    {/* Preview or Upload Icon */}
                    {preview ? (
                        <div className="relative">
                            <Avatar className={cn(sizeClasses[size])}>
                                <AvatarImage src={preview} />
                                <AvatarFallback>
                                    <ImageIcon className="h-6 w-6" />
                                </AvatarFallback>
                            </Avatar>
                            {!uploading && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {uploading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                    )}

                    {/* Upload Status */}
                    {uploading && progress ? (
                        <div className="w-full space-y-2">
                            <Progress value={progress.percentage} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">
                                Đang tải lên... {Math.round(progress.percentage)}%
                            </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                {placeholder}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG hoặc WEBP (tối đa 5MB)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual URL Input - Hidden in disabled mode */}
            {!disabled && (
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                        Hoặc nhập URL ảnh trực tiếp
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://example.com/image.jpg"
                            value={value}
                            onChange={(e) => handleManualUrl(e.target.value)}
                            disabled={disabled || uploading}
                            className="flex-1"
                        />
                        {value && !uploading && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemove}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Status Messages */}
            {uploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải lên...
                </div>
            )}
        </div>
    );
} 