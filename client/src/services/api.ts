import axios from 'redaxios'

const api = axios.create({
    baseURL: 'http://localhost:3333',
    withCredentials: true // automatically sends cookies - needed for authentication
});

export default api;