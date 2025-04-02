/* src/pages/DashboardPage.jsx */
import React, { useState, useEffect } from 'react'; // useState ve useEffect eklendi
import { useAuth } from '../contexts/AuthContext';
// API fonksiyonlarını import et
import { getMyMemberships, getMyAppointments } from '../services/api';
import { Link } from 'react-router-dom'; // Link eklemek için

function DashboardPage() {
   const { user } = useAuth(); // Auth context'inden kullanıcı bilgisini al (loading ve isAuthenticated'a gerek yok, PrivateRoute hallediyor)

   // Üye özel verileri için state'ler
   const [activeMembership, setActiveMembership] = useState(null);
   const [upcomingAppointments, setUpcomingAppointments] = useState([]);
   const [dataLoading, setDataLoading] = useState(false); // Bu sayfaya özel veri yükleme durumu
   const [dataError, setDataError] = useState(''); // Bu sayfaya özel veri yükleme hatası

   // Kullanıcı bilgisi yüklendiğinde ve kullanıcı bir üye ise ilgili verileri çek
   useEffect(() => {
    // Sadece rol 'member' ise ve user bilgisi mevcutsa veri çek
    if (user?.role === 'member') {
      const fetchMemberData = async () => {
        setDataLoading(true);
        setDataError('');
        try {
          // Eş zamanlı olarak üyelikleri ve randevuları çek
          const [membershipsResponse, appointmentsResponse] = await Promise.all([
            getMyMemberships(),
            getMyAppointments()
          ]);

          // Aktif üyeliği bul (varsa)
          const memberships = membershipsResponse.data.results || membershipsResponse.data;
          const active = memberships.find(m => m.is_active && !m.is_expired);
          setActiveMembership(active || null); // Bulunamazsa null yap

          // Yaklaşan randevuları filtrele (şimdiki zamandan sonraki)
          const appointments = appointmentsResponse.data.results || appointmentsResponse.data;
          const upcoming = appointments
            .filter(a => new Date(a.appointment_datetime) > new Date())
            .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime)); // Yakın tarihe göre sırala
          setUpcomingAppointments(upcoming);

        } catch (err) {
          console.error("Dashboard data fetch error:", err.response || err);
          setDataError('Kontrol paneli verileri yüklenirken bir hata oluştu.');
        } finally {
          setDataLoading(false);
        }
      };
      fetchMemberData();
    }
    // user değiştiğinde veya component ilk yüklendiğinde çalışır
   }, [user]); // useEffect'in user değiştiğinde tekrar çalışmasını sağla

  // Kullanıcı bilgisi henüz yüklenmediyse (AuthContext'ten dolayı pek olası değil ama kontrol)
  if (!user) {
    return <div className="p-4">Kullanıcı bilgisi bekleniyor...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Hoş Geldiniz, {user.first_name || user.username}!</h1>
      <p className="mb-6">Bu sizin kontrol paneliniz.</p>

      {/* ------ Admin Paneli Özeti ------ */}
      {user.role === 'admin' && (
          <div className="p-4 bg-green-100 border border-green-300 rounded shadow-sm">
            <p className="text-green-800 font-semibold">Admin yetkilerine sahipsiniz.</p>
            <p className="text-sm text-green-700 mt-2">Kullanıcıları, programları ve üyelik planlarını yönetebilirsiniz.</p>
            {/* Admin'e özel hızlı linkler veya istatistikler eklenebilir */}
            {/* Örn: Yeni üye sayısı, aktif üyelik sayısı vb. */}
          </div>
       )}

       {/* ------ Eğitmen Paneli Özeti ------ */}
       {user.role === 'trainer' && (
           <div className="p-4 bg-purple-100 border border-purple-300 rounded shadow-sm">
             <p className="text-purple-800 font-semibold">Eğitmen olarak giriş yaptınız.</p>
             <p className="text-sm text-purple-700 mt-2">Size atanmış dersleri ve katılımcıları görüntüleyebilirsiniz.</p>
             {/* Eğitmene özel bilgiler eklenebilir */}
           </div>
       )}

      {/* ------ Üye Paneli Özeti ------ */}
      {user.role === 'member' && (
           <div className="p-4 bg-blue-100 border border-blue-300 rounded shadow-sm">
             <p className="text-blue-800 font-semibold">Üye olarak giriş yaptınız.</p>

             {dataLoading && <p className="mt-4 text-blue-600">Üyelik ve randevu bilgileriniz yükleniyor...</p>}
             {dataError && <p className="mt-4 text-red-600">{dataError}</p>}

             {!dataLoading && !dataError && (
               <div className="mt-4 space-y-4">
                 {/* Aktif Üyelik Bilgisi */}
                 <div>
                   <h2 className="text-lg font-semibold text-blue-900 mb-2">Aktif Üyelik</h2>
                   {activeMembership ? (
                     <div className="p-3 bg-white rounded border border-blue-200">
                       <p><strong>Plan:</strong> {activeMembership.plan.name}</p>
                       {activeMembership.plan.plan_type === 'days' ? (
                         <p><strong>Kalan Gün:</strong> {activeMembership.remaining_days} (Bitiş: {new Date(activeMembership.end_date).toLocaleDateString('tr-TR')})</p>
                       ) : (
                         <p><strong>Kalan Ders Hakkı:</strong> {activeMembership.remaining_sessions}</p>
                       )}
                       <Link to="/my-memberships" className="text-sm text-blue-600 hover:underline mt-1 inline-block">Tüm Üyelikleri Gör</Link>
                     </div>
                   ) : (
                     <p className="text-sm text-gray-600">Aktif bir üyeliğiniz bulunmamaktadır.</p>
                   )}
                 </div>

                 {/* Yaklaşan Randevular */}
                 <div>
                   <h2 className="text-lg font-semibold text-blue-900 mb-2">Yaklaşan Randevular</h2>
                   {upcomingAppointments.length > 0 ? (
                     <ul className="space-y-2">
                       {upcomingAppointments.slice(0, 3).map(app => ( // İlk 3 randevuyu gösterelim
                         <li key={app.id} className="p-3 bg-white rounded border border-blue-200 text-sm">
                           <strong>{app.program_name}</strong> - {new Date(app.appointment_datetime).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                         </li>
                       ))}
                       {upcomingAppointments.length > 3 && (
                           <li>
                               <Link to="/my-appointments" className="text-sm text-blue-600 hover:underline mt-1 inline-block">... ve {upcomingAppointments.length - 3} tane daha. Tümünü Gör</Link>
                           </li>
                       )}
                        <li>
                            <Link to="/book-appointment" className="text-sm text-green-600 hover:underline mt-2 inline-block font-semibold">Yeni Randevu Al</Link>
                        </li>
                     </ul>
                   ) : (
                     <>
                        <p className="text-sm text-gray-600">Yaklaşan bir randevunuz bulunmamaktadır.</p>
                        <Link to="/book-appointment" className="text-sm text-green-600 hover:underline mt-2 inline-block font-semibold">Yeni Randevu Al</Link>
                     </>
                   )}
                 </div>
               </div>
             )}
           </div>
       )}
    </div>
  );
}

export default DashboardPage;
