import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient, { getCurrentUser } from '../services/api'; // apiClient ve getCurrentUser import edildi

// Context'i oluştur
const AuthContext = createContext(null);

// Provider bileşeni
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Kullanıcı bilgilerini de tutalım
  const [loading, setLoading] = useState(true); // Başlangıçta durumu kontrol ederken yükleniyor

  // Uygulama yüklendiğinde token ve kullanıcı bilgisini kontrol et
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Token varsa, kullanıcı bilgilerini API'den almayı dene
          // Axios interceptor token'ı otomatik ekleyecektir
          const response = await getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token geçersizse veya API hatası olursa token'ı temizle
          console.error("Auth check failed:", error);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false); // Kontrol bitti, yükleniyor durumu false yap
    };
    checkAuthStatus();
  }, []);

  // Login fonksiyonu
  const login = async (token) => {
    localStorage.setItem('authToken', token);
    // Token'ı aldıktan sonra kullanıcı bilgilerini çek ve state'i güncelle
    try {
        const response = await getCurrentUser(); // apiClient otomatik token kullanacak
        setUser(response.data);
        setIsAuthenticated(true);
    } catch(error) {
        console.error("Failed to fetch user after login:", error);
        // Hata durumunda belki token'ı tekrar silmek gerekebilir
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
    }
  };

  // Logout fonksiyonu
  const logout = () => {
    localStorage.removeItem('authToken');
    // İsteğe bağlı: localStorage'dan kullanıcı bilgisini de sil
    // localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    // Yönlendirme burada değil, çağıran bileşende (Layout) yapılacak
  };

  // Yükleniyor durumu bitene kadar children'ı render etme (isteğe bağlı)
   if (loading) {
     return <div>Uygulama Yükleniyor...</div>; // Veya bir spinner göster
   }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
