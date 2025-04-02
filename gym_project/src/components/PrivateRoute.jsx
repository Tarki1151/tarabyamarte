/* src/components/PrivateRoute.jsx */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // useAuth import et

// Bu bileşen, kullanıcının giriş yapıp yapmadığını kontrol eder.
// Giriş yapmamışsa login sayfasına yönlendirir.
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth(); // Context'ten auth durumunu ve yükleniyor bilgisini al
  const location = useLocation(); // Kullanıcının gitmeye çalıştığı orijinal konumu al

  // Eğer context hala başlangıç kontrolünü yapıyorsa (yükleniyorsa)
  if (loading) {
    // Yükleme göstergesi (daha iyi bir UI elemanı kullanılabilir)
    return <div className="flex justify-center items-center min-h-screen">Oturum durumu kontrol ediliyor...</div>;
  }

  // Eğer yüklenme bitti ve kullanıcı giriş yapmamışsa
  if (!isAuthenticated) {
    // Login sayfasına yönlendir. 'state' ile kullanıcının
    // ursprünglich gitmek istediği yolu iletiyoruz ki, login sonrası oraya dönebilsin.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kullanıcı giriş yapmış, istenen alt bileşeni (children) göster
  return children;
}

export default PrivateRoute;
