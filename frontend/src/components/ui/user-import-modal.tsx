import { useState, useRef } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, FileSpreadsheet, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { readAndMapExcel, createUserColumnExcelMapper } from "@/services/load.service";
import { convertRawUrlToImageUrl } from "@/services/file.service";
import { createUser } from "@/services/user.service";
import type { User } from "@/types/user";

interface ImportResult {
    total: number;
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
}

interface UserImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface ImportUserData {
    full_name: string;
    email: string;
    position: string;
    avatar_image_raw_url: string;
}

export function UserImportModal({ open, onOpenChange, onSuccess }: UserImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [currentStep, setCurrentStep] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
                toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)", { position: "bottom-center" });
                return;
            }
            setFile(selectedFile);
            setImportResult(null);
        }
    };

    const downloadTemplate = () => {
        // Create template data
        const templateData = [
            {
                "Họ và tên": "Nguyễn Văn A",
                "Email": "nguyenvana@example.com",
                "Chức vụ": "Nhân viên",
                "Link ảnh": "https://drive.google.com/file/d/1234567890/view?usp=sharing"
            },
            {
                "Họ và tên": "Trần Thị B",
                "Email": "tranthib@example.com",
                "Chức vụ": "Quản lý",
                "Link ảnh": "https://drive.google.com/file/d/0987654321/view?usp=sharing"
            }
        ];

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách người dùng");

        // Set column widths
        ws['!cols'] = [
            { width: 20 }, // Họ và tên
            { width: 30 }, // Email
            { width: 15 }, // Chức vụ
            { width: 50 }  // Link ảnh
        ];

        // Download file
        XLSX.writeFile(wb, "mau_danh_sach_nguoi_dung.xlsx");
        toast.success("Đã tải xuống file mẫu thành công", { position: "bottom-center" });
    };

    const processImport = async () => {
        if (!file) {
            toast.error("Vui lòng chọn file để import", { position: "bottom-center" });
            return;
        }

        setImporting(true);
        setProgress(0);
        setImportResult(null);

        try {
            // Step 1: Read Excel file
            setCurrentStep("Đang đọc file Excel...");
            setProgress(10);

            const rawData = await readAndMapExcel<ImportUserData>(file, createUserColumnExcelMapper as Record<string, keyof ImportUserData>);

            if (!rawData || rawData.length === 0) {
                throw new Error("File Excel trống hoặc không có dữ liệu hợp lệ");
            }

            setProgress(20);

            // Step 2: Process avatar URLs and create users
            setCurrentStep("Đang xử lý dữ liệu người dùng...");

            const results: ImportResult = {
                total: rawData.length,
                success: 0,
                failed: 0,
                errors: []
            };

            for (let i = 0; i < rawData.length; i++) {
                const userData = rawData[i];
                const rowNumber = i + 2; // Excel row number (starting from row 2, after header)

                try {
                    setCurrentStep(`Đang xử lý người dùng ${i + 1}/${rawData.length}: ${userData.full_name}`);
                    setProgress(20 + (i / rawData.length) * 70);

                    // Validate required fields
                    if (!userData.full_name || !userData.email) {
                        throw new Error("Thiếu thông tin bắt buộc (Họ và tên, Email)");
                    }
                    // Process avatar URL if provided
                    let avatar_image_url = "";
                    if (userData.avatar_image_raw_url && userData.avatar_image_raw_url.trim()) {
                        try {
                            setCurrentStep(`Đang xử lý ảnh đại diện cho ${userData.full_name}...`);
                            const imageUrlResponse = await convertRawUrlToImageUrl(userData.avatar_image_raw_url.trim());
                            avatar_image_url = imageUrlResponse.public_url || "";
                        } catch (imageError) {
                            console.warn(`Failed to process avatar for ${userData.full_name}:`, imageError);
                            // Continue without avatar instead of failing the entire import
                        }
                    }
                    // Prepare user data for creation
                    const userToCreate: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
                        full_name: userData.full_name.trim(),
                        email: userData.email.trim().toLowerCase(),
                        position: userData.position?.trim() || "",
                        avatar_image_url: avatar_image_url,
                        metadata: {}
                    };

                    // Create user
                    await createUser(userToCreate);
                    results.success++;

                } catch (error: any) {
                    results.failed++;
                    results.errors.push({
                        row: rowNumber,
                        error: error.message || "Lỗi không xác định",
                        data: userData
                    });
                }
            }

            setProgress(100);
            setCurrentStep("Hoàn thành!");
            setImportResult(results);

            // Show summary toast
            if (results.success > 0) {
                toast.success(`Import thành công ${results.success}/${results.total} người dùng`, { position: "bottom-center" });
            }

            if (results.failed > 0) {
                toast.warning(`${results.failed} người dùng import thất bại`, { position: "bottom-center" });
            }

            // Call success callback to refresh the user list
            if (onSuccess && results.success > 0) {
                onSuccess();
            }

        } catch (error: any) {
            toast.error(`Lỗi khi import: ${error.message}`, { position: "bottom-center" });
            setImportResult({
                total: 0,
                success: 0,
                failed: 0,
                errors: [{ row: 0, error: error.message, data: {} }]
            });
        } finally {
            setImporting(false);
            setCurrentStep("");
        }
    };

    const resetModal = () => {
        setFile(null);
        setImporting(false);
        setProgress(0);
        setImportResult(null);
        setCurrentStep("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!importing) {
            if (!newOpen) {
                resetModal();
            }
            onOpenChange(newOpen);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import người dùng từ Excel
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Tải lên file Excel để thêm nhiều người dùng cùng lúc vào hệ thống
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-6">
                    {/* Template Download Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">File mẫu</CardTitle>
                            <CardDescription>
                                Tải xuống file Excel mẫu để chuẩn bị dữ liệu import
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                onClick={downloadTemplate}
                                className="w-full sm:w-auto"
                                disabled={importing}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Tải xuống file mẫu
                            </Button>
                            <div className="mt-3 text-sm text-muted-foreground">
                                <p className="font-medium mb-2">Cấu trúc file Excel:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Họ và tên:</strong> Tên đầy đủ của người dùng (bắt buộc)</li>
                                    <li><strong>Email:</strong> Địa chỉ email duy nhất (bắt buộc)</li>
                                    <li><strong>Chức vụ:</strong> Vị trí công việc (tùy chọn)</li>
                                    <li><strong>Link ảnh:</strong> Link Google Drive hoặc URL ảnh đại diện (tùy chọn)</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Chọn file Excel</CardTitle>
                            <CardDescription>
                                Chọn file Excel (.xlsx hoặc .xls) chứa danh sách người dùng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="excel-file">File Excel</Label>
                                    <Input
                                        id="excel-file"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        disabled={importing}
                                        ref={fileInputRef}
                                        className="mt-1"
                                    />
                                </div>

                                {file && (
                                    <div className="flex items-center gap-2 p-3 border rounded-md bg-blue-50 border-blue-200">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm text-blue-700">
                                            Đã chọn file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                )}

                                <Button
                                    onClick={processImport}
                                    disabled={!file || importing}
                                    className="w-full"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {importing ? "Đang import..." : "Bắt đầu import"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress Section */}
                    {importing && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Tiến trình import</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Progress value={progress} className="w-full" />
                                    <p className="text-sm text-muted-foreground">{currentStep}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Results Section */}
                    {importResult && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Kết quả import</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                                            <div className="text-sm text-muted-foreground">Tổng số</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                                            <div className="text-sm text-muted-foreground">Thành công</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                                            <div className="text-sm text-muted-foreground">Thất bại</div>
                                        </div>
                                    </div>

                                    {importResult.errors.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-destructive">Chi tiết lỗi:</h4>
                                            <div className="max-h-40 overflow-y-auto space-y-2">
                                                {importResult.errors.map((error, index) => (
                                                    <div key={index} className="flex items-start gap-2 p-3 border rounded-md bg-red-50 border-red-200">
                                                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-red-700">
                                                            <strong>Dòng {error.row}:</strong> {error.error}
                                                            {error.data.full_name && (
                                                                <span> - {error.data.full_name}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={resetModal}
                                            className="flex-1"
                                        >
                                            Import file khác
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenChange(false)}
                                            className="flex-1"
                                        >
                                            Hoàn thành
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
} 