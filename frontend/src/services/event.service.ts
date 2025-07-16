import { supabase } from "@/lib/supabase";
import type { TableFilters } from "@/types/table";
import type { Event } from "@/types/event";

export const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'images' | 'documents'>): Promise<Event> => {
    const { data, error } = await supabase
        .from("events")
        .insert([eventData])
        .select(`
            *,
            images:event_images(*),
            documents:event_documents(*)
        `)
        .single();

    if (error) throw error;
    return data;
};

export const getEvents = async (
    filters: TableFilters
): Promise<any> => {
    let query = supabase
        .from("events")
        .select(`
            *,
            images:event_images(*),
            documents:event_documents(*)
        `, { count: "exact" });

    if (filters.search && filters.searchColumn) {
        query = query.like(filters.searchColumn, `%${filters.search}%`);
    }

    if (filters.columnFilters) {
        Object.entries(filters.columnFilters).forEach(
            ([key, value]) => value && (query = query.eq(key, value))
        );
    }

    if ((filters as any).filters) {
        Object.entries((filters as any).filters).forEach(
            ([k, v]) => v && (query = query.eq(k, v))
        );
    }

    if ((filters as any).sortColumn) {
        query = query.order((filters as any).sortColumn, {
            ascending: (filters as any).sortDirection === "asc",
        });
    } else {
        query = query.order("created_at", { ascending: false });
    }

    const page = (filters as any).page || 1;
    const limit = (filters as any).limit || 10;
    query = query.range(
        (page - 1) * limit,
        page * limit - 1
    );

    const { data, error, count } = await query;
    console.log(JSON.stringify({ data, error, count }, null, 2));

    if (error) throw error;

    return {
        items: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
    };
};

export const getEventById = async (id: number): Promise<Event> => {
    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            images:event_images(*),
            documents:event_documents(*)
        `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

export const getEventBySlug = async (slug: string): Promise<Event> => {
    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            images:event_images(*),
            documents:event_documents(*)
        `)
        .eq("slug", slug)
        .single();

    if (error) throw error;
    return data;
};

export const updateEvent = async (id: number, eventData: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at' | 'images' | 'documents'>>): Promise<Event> => {
    const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", id)
        .select(`
            *,
            images:event_images(*),
            documents:event_documents(*)
        `)
        .single();

    if (error) throw error;
    return data;
};

export const deleteEvent = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

    if (error) throw error;
};

export const deleteEvents = async (ids: number[]): Promise<void> => {
    const { error } = await supabase
        .from("events")
        .delete()
        .in("id", ids);

    if (error) throw error;
};

// Event Images CRUD operations
export const addEventImage = async (imageData: { event_id: number; raw_image_url: string; processed_image_url?: string; metadata?: Record<string, any> }) => {
    const { data, error } = await supabase
        .from("event_images")
        .insert([imageData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateEventImage = async (id: number, imageData: { processed_image_url?: string; metadata?: Record<string, any> }) => {
    const { data, error } = await supabase
        .from("event_images")
        .update(imageData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteEventImage = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from("event_images")
        .delete()
        .eq("id", id);

    if (error) throw error;
};

// Event Documents CRUD operations
export const addEventDocument = async (documentData: { event_id: number; title: string; description?: string; document_url: string; metadata?: Record<string, any> }) => {
    const { data, error } = await supabase
        .from("event_documents")
        .insert([documentData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateEventDocument = async (id: number, documentData: { title?: string; description?: string; document_url?: string; metadata?: Record<string, any> }) => {
    const { data, error } = await supabase
        .from("event_documents")
        .update(documentData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteEventDocument = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from("event_documents")
        .delete()
        .eq("id", id);

    if (error) throw error;
};
