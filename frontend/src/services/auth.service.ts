import { supabase } from "@/lib/supabase";

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return data;
}

export const retrieveSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data;
}

export const logout = async () => {
    try {
        await signOut();
        return { success: true };
    } catch (error) {
        throw error;
    }
}