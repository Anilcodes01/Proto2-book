// app/lib/apiService.ts
import axios from "axios";
import { FetchedChapter, FetchedPart, PartData, ChapterOption } from "@/app/lib/types"; // Adjust path

const API_BASE = '/api'; // Or your actual base path

// --- Fetching ---
export const fetchChaptersAPI = async (bookProjectId: string): Promise<FetchedChapter[]> => {
    const response = await axios.get<FetchedChapter[]>(`${API_BASE}/get-chapter?bookProjectId=${bookProjectId}`);
    return response.data;
};

export const fetchPartsAPI = async (bookProjectId: string): Promise<FetchedPart[]> => {
    const response = await axios.get<FetchedPart[]>(`${API_BASE}/get-parts?bookProjectId=${bookProjectId}`);
    return response.data;
};

// --- Adding ---
// Assuming API returns the newly created entity with its ID
export const addChapterAPI = async (bookProjectId: string, chapterName: string): Promise<FetchedChapter> => {
    const response = await axios.post<FetchedChapter>(`${API_BASE}/add-chapter`, { bookProjectId, chapterName });
    return response.data;
};

export const addPartAPI = async (bookProjectId: string, chapterId: string, partName: string): Promise<FetchedPart> => {
    const response = await axios.post<FetchedPart>(`${API_BASE}/add-part`, { bookProjectId, chapterId, partName });
    return response.data;
};

// --- Deleting ---
export const deleteChapterAPI = async (chapterId: string): Promise<void> => {
    await axios.delete(`${API_BASE}/delete-chapter`, { data: { chapterId } });
};

export const deletePartAPI = async (partId: string): Promise<void> => {
    await axios.delete(`${API_BASE}/delete-part`, { data: { partId } });
};

// Add functions for other options if they involve API calls