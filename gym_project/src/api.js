import axios from 'axios';

// Backend API'mizin temel URL'si (Render'daki adresiniz veya lokal adres)
// const API_BASE_URL = 'https://sizin-render-uygulamaniz.onrender.com/api';
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Lokal geliştirme için

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek interceptor'ı: Her isteğe otomatik olarak Authorization başlığını ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Token'ı localStorage'dan al
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Örnek API çağrı fonksiyonları
export const loginUser = (credentials) => {
  // NOT: DRF'in /api-token-auth/ endpoint'i doğrudan axios ile çağrılabilir
  // veya ayrı bir login endpoint'i oluşturulabilir.
  // Bu örnek, DRF'in varsayılanını kullanır.
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
    // appointmentData = { program: programId, appointment_datetime: 'YYYY-MM-DDTHH:mm:ssZ' }
    return apiClient.post('/appointments/', appointmentData);
};

// Diğer API çağrıları buraya eklenebilir...

export default apiClient;
