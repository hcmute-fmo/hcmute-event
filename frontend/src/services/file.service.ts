import { supabase } from "@/lib/supabase";

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResult {
    url: string;
    path: string;
    error?: string;
}

export const uploadFile = async (
    file: File,
    bucket: string = "avatars",
    folder: string = "users",
    onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Chỉ chấp nhận file hình ảnh');
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('Kích thước file không được vượt quá 5MB');
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Simulate progress for better UX
        let uploadedBytes = 0;
        const progressInterval = setInterval(() => {
            uploadedBytes += file.size * 0.1;
            if (uploadedBytes < file.size && onProgress) {
                onProgress({
                    loaded: uploadedBytes,
                    total: file.size,
                    percentage: Math.min((uploadedBytes / file.size) * 100, 90)
                });
            }
        }, 100);

        // Upload file to Supabase storage
        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        clearInterval(progressInterval);

        if (error) {
            throw error;
        }

        // Complete progress
        if (onProgress) {
            onProgress({
                loaded: file.size,
                total: file.size,
                percentage: 100
            });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            url: urlData.publicUrl,
            path: filePath
        };

    } catch (error: any) {
        return {
            url: '',
            path: '',
            error: error.message || 'Lỗi khi tải file lên'
        };
    }
};

export const deleteFile = async (
    path: string,
    bucket: string = "avatars"
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Lỗi khi xóa file'
        };
    }
};

export const getFileUrl = (
    path: string,
    bucket: string = "avatars"
): string => {
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
};

export const validateImageFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
        return 'Chỉ chấp nhận file hình ảnh';
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return 'Kích thước file không được vượt quá 5MB';
    }

    // Check file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return 'Chỉ chấp nhận file JPG, PNG hoặc WEBP';
    }

    return null;
};
