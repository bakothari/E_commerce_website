import axios from "axios";

const api = axios.create({
    baseURL: "https://e-commerce-website-1-7fz6.onrender.com"
});

export default api;