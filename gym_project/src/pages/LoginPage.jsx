/* src/pages/LoginPage.jsx */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation eklendi
import { loginUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // useAuth hook'unu import et

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Kullanıcının nereden geldiğini almak için
  const auth = useAuth();

  // Login sonrası yönlendirilecek hedef yolu belirle (eğer state'de varsa)
  const from = location.state?.from?.pathname || "/dashboard"; // Varsayılan hedef: dashboard

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ username, password });
      if (response.data.token) {
        // Context üzerinden login işlemini yap (token kaydı ve kullanıcı bilgisi alma)
        await auth.login(response.data.token);
        // Başarılı girişte hedeflenen sayfaya veya dashboard'a yönlendir
        navigate(from, { replace: true });
      } else {
        // Bu durum genellikle API hatası olarak yakalanır ama ekstra kontrol
        setError('Giriş başarısız. Token alınamadı.');
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError('Giriş başarısız. Kullanıcı adı veya şifre hatalı.');
      // auth.logout(); // Context içinde hata durumunda temizlik yapılabilir
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
         <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
