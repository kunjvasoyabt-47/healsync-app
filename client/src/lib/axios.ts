import axios from 'axios';

const api = axios.create({
    // Replace with your actual Render URL
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // Required to send HttpOnly cookies
});

export default api;