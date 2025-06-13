import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers:{
        "Authorization":`B`
    }
});

// Attach token dynamically before each request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // ✅ Correctly setting token
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
