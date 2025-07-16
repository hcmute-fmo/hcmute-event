export interface Event {
    id: number;
    slug: string;
    title: string;
    description?: string;
    banner_image_url?: string;
    from_date: Date;
    to_date: Date;
    is_public: boolean;
    user_ids?: string[]; // Array of UUIDs for users associated with the event
    created_at: Date;
    updated_at?: Date;
    images: EventImage[];
    documents: EventDocument[];
}

export interface EventImage {
    id: number;
    event_id: number;
    raw_image_url: string;
    processed_image_url?: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at?: Date;
}

export interface EventDocument {
    id: number;
    event_id: number;
    title: string;
    description?: string;
    document_url: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at?: Date;
}
