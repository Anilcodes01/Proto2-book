import axios from "axios";
import { FetchedChapter, FetchedPart, PartData, ChapterOption, SectionData, FetchedFrontMatter, FetchedEndMatter } from "@/app/lib/types"; 

function formatApiError(error: unknown, context: string): string {
    let errorMessage = `An unexpected error occurred during ${context}.`;
    if (axios.isAxiosError(error)) {
        if (error.response) {
            errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            if (error.response.status === 409) {
                errorMessage = error.response.data?.message || `Conflict: The item might already exist.`;
            }
        } else {
            errorMessage = "Network error or server did not respond.";
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error(`Error during ${context}:`, error);
    return `${context} failed: ${errorMessage}`;
}

export const fetchBookStructure = async (bookProjectId: string): Promise<{ chapters: FetchedChapter[], parts: FetchedPart[] }> => {
    console.log(`API Service: Fetching structure for ${bookProjectId}`);
    try {
        const [chaptersResponse, partsResponse] = await Promise.all([
            axios.get<FetchedChapter[]>(`/api/get-chapter?bookProjectId=${bookProjectId}`),
            axios.get<FetchedPart[]>(`/api/get-parts?bookProjectId=${bookProjectId}`)
        ]);
        return { chapters: chaptersResponse.data, parts: partsResponse.data };
    } catch (error) {
        throw new Error(formatApiError(error, 'fetching book structure'));
    }
};

export const addChapterAPI = async (bookProjectId: string, chapterName: string): Promise<{ id: string; chapterName: string }> => {
    console.log("API Service: Attempting to add chapter:", { bookProjectId, chapterName });
    try {
        const res = await axios.post("/api/add-chapter", { bookProjectId, chapterName });
        if (res.status === 200 && res.data && res.data.id) {
            return res.data as { id: string; chapterName: string; };
        } else {
             throw new Error(`API responded OK, but chapter data or ID missing: ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `adding chapter "${chapterName}"`));
    }
};

export const addPartAPI = async (bookProjectId: string, chapterId: string, partName: string): Promise<{ id: string; partName: string }> => {
    console.log("API Service: Attempting to add part:", { bookProjectId, chapterId, partName });
     try {
        const res = await axios.post("/api/add-part", { bookProjectId, chapterId, partName });
        if (res.status === 200 && res.data && res.data.id) {
            return res.data as { id: string; partName: string; };
        } else {
             throw new Error(`API responded OK, but part data or ID missing: ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `adding part "${partName}" to chapter ID ${chapterId}`));
    }
};

export const deleteChapterAPI = async (chapterId: string): Promise<void> => {
    console.log("API Service: Attempting to delete chapter:", { chapterId });
    try {
        const res = await axios.delete('/api/delete-chapter', { data: { chapterId } });
        if (res.status !== 200) {
            throw new Error(`Server responded with status ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `deleting chapter ID ${chapterId}`));
    }
};

export const deletePartAPI = async (partId: string): Promise<void> => {
    console.log("API Service: Attempting to delete part:", { partId });
     try {
        const res = await axios.delete('/api/delete-part', { data: { partId } });
         if (res.status !== 200) {
            throw new Error(`Server responded with status ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `deleting part ID ${partId}`));
    }
};

export const fetchFrontMatterAPI = async (bookProjectId: string): Promise<FetchedFrontMatter[]> => {
    console.log(`API Service: Fetching Front Matter for ${bookProjectId}`);
    try {
        // Assuming your GET route is correct
        const response = await axios.get<FetchedFrontMatter[]>(`/api/get-frontMatter?bookProjectId=${bookProjectId}`);
        return response.data;
    } catch (error) {
        throw new Error(formatApiError(error, 'fetching front matter'));
    }
};

export const addFrontMatterAPI = async (bookProjectId: string, frontMatterName: string): Promise<{ id: string; fronteMatterName: string }> => {
    console.log("API Service: Attempting to add Front Matter:", { bookProjectId, frontMatterName });
    try {
        // Ensure the payload key matches your API route ('fronteMatterName')
        const res = await axios.post("/api/add-fronteMatter", { bookProjectId, fronteMatterName: frontMatterName });
        if (res.status === 200 && res.data && res.data.id) {
             // Adjust the return type if the API response differs
            return res.data as { id: string; fronteMatterName: string; };
        } else {
            throw new Error(`API responded OK, but Front Matter data or ID missing: ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `adding front matter "${frontMatterName}"`));
    }
};

export const deleteFrontMatterAPI = async (frontMatterId: string): Promise<void> => {
    console.log("API Service: Attempting to delete Front Matter:", { frontMatterId });
    try {
        // Assuming the API expects { frontMatterId } in the data payload for DELETE
        const res = await axios.delete('/api/delete-front-matter', { data: { frontMatterId } });
        if (res.status !== 200 && res.status !== 204) { // Allow 204 No Content
            throw new Error(`Server responded with status ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `deleting front matter ID ${frontMatterId}`));
    }
};


export const fetchEndMatterAPI = async (bookProjectId: string): Promise<FetchedEndMatter[]> => {
    try {
        console.log(`[API] Fetching End Matter for book project: ${bookProjectId}`);
        const response = await axios.get<FetchedEndMatter[]>(`/api/get-endMatter?bookProjectId=${bookProjectId}`);
        return response.data
    } catch (error: any) {
        console.error("[API] Error fetching End Matter:", error.response?.data || error.message);
        throw new Error(error.response?.data?.error || "Failed to fetch End Matter items.");
    }
};


export const deleteEndMatterAPI = async (endMatterId: string): Promise<void> => {
    console.log("API Service: Attempting to delete Front Matter:", { endMatterId });
    try {
        const res = await axios.delete('/api/delete-end-matter', { data: { endMatterId } });
        if (res.status !== 200 && res.status !== 204) { 
            throw new Error(`Server responded with status ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `deleting front matter ID ${endMatterId}`));
    }
};


export const addEndMatterAPI = async (bookProjectId: string, endMatterName: string): Promise<{ id: string; endMatterName: string }> => {
    console.log("API Service: Attempting to add Front Matter:", { bookProjectId, endMatterName });
    try {
        const res = await axios.post("/api/add-endMatter", { bookProjectId, endMatterName: endMatterName });
        if (res.status === 200 && res.data && res.data.id) {
            return res.data as { id: string; endMatterName: string; };
        } else {
            throw new Error(`API responded OK, but Front Matter data or ID missing: ${res.status}`);
        }
    } catch (error) {
        throw new Error(formatApiError(error, `adding front matter "${endMatterName}"`));
    }
};