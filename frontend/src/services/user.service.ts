import { supabase } from "@/lib/supabase";
import type { TableFilters } from "@/types/table";
import type { User } from "@/types/user";

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getUsers = async (
    filters: TableFilters
): Promise<any> => {
    let query = supabase.from("users").select("*", { count: "exact" });

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

export const getUserById = async (id: string): Promise<User> => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> => {
    const { data, error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteUser = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

    if (error) throw error;
};

export const deleteUsers = async (ids: string[]): Promise<void> => {
    const { error } = await supabase
        .from("users")
        .delete()
        .in("id", ids);

    if (error) throw error;
};
