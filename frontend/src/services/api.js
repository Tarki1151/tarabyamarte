import axios from 'axios';

// Lokal backend adresiniz
const API_BASE_URL = 'http://127.0.0.1:8000/api';
// Render'a deploy edince burayı değiştirin veya çevre değişkeni kullanın
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Token geçersiz veya süresi dolmuş, logout yapılıyor.');
      localStorage.removeItem('authToken');
      // window.location.href = '/login'; // Sayfa yenilemesi yapar
    }
    return Promise.reject(error);
  }
);

export const loginUser = (credentials) => {
  return axios.post(`${API_BASE_URL}/api-token-auth/`, credentials);
};

export const getCurrentUser = () => {
  return apiClient.get('/users/me/');
};

export const getPrograms = () => {
  return apiClient.get('/programs/');
};

export const getPlans = () => {
  return apiClient.get('/plans/');
};

export const getMyMemberships = () => {
    return apiClient.get('/memberships/');
};

export const getMyAppointments = () => {
    return apiClient.get('/appointments/');
};

export const createAppointment = (appointmentData) => {
    return apiClient.post('/appointments/', appointmentData);
};

export default apiClient;