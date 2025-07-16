// src/api/endpoints/faces.service.ts
import apiClient from "@/lib/client";
import type { BatchFaceDeleteRequest, BatchFaceRegisterRequest, BatchFaceUpdateRequest } from "@/types/faces.type";

export const batchFaceRegister = async (data: BatchFaceRegisterRequest) => {
    const response = await apiClient.post("/faces/batch-register", data);
    console.log("batchFaceRegister response", response);
    return response.data;

};

export const batchFaceDelete = async (data: BatchFaceDeleteRequest) => {
    const response = await apiClient.post("/faces/batch-delete", data);
    console.log("batchFaceDelete response", response);
    return response.data;
};

export const batchFaceUpdate = async (data: BatchFaceUpdateRequest) => {
    const response = await apiClient.post("/faces/batch-update", data);
    console.log("batchFaceUpdate response", response);
    return response.data;
};
