import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true, // Allows you to send and receive cookies
});

// There is no need to add the interceptor if you are not dealing with tokens in the header.
// If you need to remove the Authorization header
api.interceptors.request.use((config) => {
    // Remove the Authorization header if present
    if (config.headers['Authorization']) {
        delete config.headers['Authorization'];
    }
    return config;
});

export default api;