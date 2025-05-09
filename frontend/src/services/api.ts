import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API functions
export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);

    // Set content type to multipart/form-data
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    try {
        const response = await api.post('/upload/file', formData, config);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const uploadText = async (text: string) => {
    try {
        const response = await api.post('/upload/text', { text });
        return response.data;
    } catch (error) {
        console.error('Error uploading text:', error);
        throw error;
    }
};

export default api;