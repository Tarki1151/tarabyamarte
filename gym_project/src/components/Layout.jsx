/* src/components/Layout.jsx */
import React from 'react';
import { Link, Outlet, useNavigate, NavLink } from 'react-router-dom'; // NavLink eklendi
import { useAuth } from '../contexts/AuthContext'; // useAuth import et

function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Context'ten user ve logout fonksiyonunu al

    const handleLogout = () => {
        logout(); // Context üzerinden logout yap
        navigate('/login'); // Login sayfasına yönlendir (sayfa yenilemeye gerek yok)
    };

    // Aktif link stili için Tailwind class'ları
    const activeClassName = "bg-gray-900 text-white";
    const inactiveClassName = "text-gray-300 hover:bg-gray-700 hover:text-white";

    // NavLink için stil fonksiyonu
    const getNavLinkClass = ({ isActive }) =>
        `block py-2 px-4 rounded ${isActive ? activeClassName : inactiveClassName}`;


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Kenar Çubuğu (Sidebar) */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0"> {/* flex-shrink-0 eklendi */}
        <div className="p-4 text-2xl font-bold border-b border-gray-700 text-center">Gym Yönetim</div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto"> {/* space-y azaltıldı, overflow eklendi */}
          <NavLink to="/dashboard" className={getNavLinkClass}>Gösterge Paneli</NavLink>
          <NavLink to="/programs" className={getNavLinkClass}>Programlar</NavLink>

          {/* Sadece üyeler için görünen linkler */}
          {user?.role === 'member' && (
            <>
              <NavLink to="/my-memberships" className={getNavLinkClass}>Üyeliklerim</NavLink>
              <NavLink to="/my-appointments" className={getNavLinkClass}>Randevularım</NavLink>
              <NavLink to="/book-appointment" className={getNavLinkClass}>Yeni Randevu</NavLink>
            </>
          )}

           {/* Sadece adminler için görünen linkler */}
           {user?.role === 'admin' && (
            <>
              {/* Gelecekte eklenecek admin linkleri */}
              {/* <NavLink to="/admin/users" className={getNavLinkClass}>Kullanıcı Yönetimi</NavLink> */}
              {/* <NavLink to="/admin/plans" className={getNavLinkClass}>Plan Yönetimi</NavLink> */}
              {/* <NavLink to="/admin/settings" className={getNavLinkClass}>Ayarlar</NavLink> */}
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700 mt-auto"> {/* mt-auto eklendi */}
            {/* Kullanıcı adını göster (varsa) */}
            {user && <p className="text-sm mb-2 text-center text-gray-400">Giriş: {user.username} ({user.role})</p>}
            <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
                Çıkış Yap
            </button>
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Üst Bar (Header - isteğe bağlı, eklenebilir) */}
        {/* <header className="bg-white shadow p-4">...</header> */}

        {/* Sayfa İçeriği (Outlet ile App.jsx'teki iç route'lar buraya gelir) */}
        {/* p-4 yerine daha fazla padding ve scroll eklendi */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
