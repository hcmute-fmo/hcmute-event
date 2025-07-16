export interface User {
    id: string;
    full_name: string;
    email: string;
    position: string;
    avatar_image_url: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

