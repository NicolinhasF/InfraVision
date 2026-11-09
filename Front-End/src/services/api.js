import axios from "axios";

// URL padrão do backend. Pode ser sobrescrita no arquivo .env do frontend.
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
