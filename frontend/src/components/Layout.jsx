import React from 'react';
import { Link, Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const activeClassName = "bg-gray-900 text-white";
    const inactiveClassName = "text-gray-300 hover:bg-gray-700 hover:text-white";
    const getNavLinkClass = ({ isActive }) =>
        `block py-2 px-4 rounded ${isActive ? activeClassName : inactiveClassName}`;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="p-4 text-2xl font-bold border-b border-gray-700 text-center">Gym Yönetim</div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" className={getNavLinkClass}>Gösterge Paneli</NavLink>
          <NavLink to="/programs" className={getNavLinkClass}>Programlar</NavLink>

          {user?.role === 'member' && (
            <>
              <NavLink to="/my-memberships" className={getNavLinkClass}>Üyeliklerim</NavLink>
              <NavLink to="/my-appointments" className={getNavLinkClass}>Randevularım</NavLink>
              <NavLink to="/book-appointment" className={getNavLinkClass}>Yeni Randevu</NavLink>
            </>
          )}

           {user?.role === 'admin' && (
            <>
              {/* <NavLink to="/admin/users" className={getNavLinkClass}>Kullanıcı Yönetimi</NavLink> */}
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700 mt-auto">
            {user && <p className="text-sm mb-2 text-center text-gray-400">Giriş: {user.username} ({user.role})</p>}
            <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
                Çıkış Yap
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;