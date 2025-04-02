/* src/pages/MemberAppointmentsPage.jsx */
import React, { useState, useEffect } from 'react';
import { getMyAppointments } from '../services/api'; // API fonksiyonunu import et
import { useAuth } from '../contexts/AuthContext'; // Kullanıcı kontrolü için (opsiyonel)
import { Link } from 'react-router-dom'; // Yeni randevu linki için

function MemberAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Kullanıcı rolünü kontrol etmek için

  useEffect(() => {
    if (user?.role === 'member') {
      const fetchAppointments = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await getMyAppointments();
          // API cevabının yapısına göre veriyi al (DRF pagination varsa .results)
          // Modelde varsayılan sıralama en yeniden en eskiye doğruydu, bu genellikle iyidir.
          setAppointments(response.data.results || response.data);
        } catch (err) {
          console.error("Appointment fetch error:", err.response || err);
          setError('Randevu bilgileri yüklenirken bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      };

      fetchAppointments();
    } else {
      setLoading(false);
      setAppointments([]);
    }
  }, [user]); // user değiştiğinde tekrar kontrol et

  // Tarih ve saat formatlama fonksiyonu
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Yükleniyor durumu
  if (loading) {
    return <div className="p-6 text-center">Randevular yükleniyor...</div>;
  }

  // Hata durumu
  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Randevularım</h1>
        <Link
            to="/book-appointment"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
            Yeni Randevu Al
        </Link>
      </div>


      {appointments.length === 0 ? (
        <p className="text-gray-600">Görüntülenecek bir randevunuz bulunmuyor.</p>
      ) : (
        <div className="bg-white rounded shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {/* Randevuları listele */}
            {appointments.map((appointment) => {
              const isPast = new Date(appointment.appointment_datetime) < new Date(); // Randevu geçmişte mi?
              return (
                <li key={appointment.id} className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center ${isPast ? 'bg-gray-50 opacity-75' : ''}`}>
                  <div className="mb-2 md:mb-0">
                    <p className="text-lg font-semibold text-gray-800">{appointment.program_name}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(appointment.appointment_datetime)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                     {isPast && ( // Sadece geçmiş randevular için katılım durumunu göster
                       <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${appointment.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {appointment.attended ? 'Katıldı' : 'Katılmadı'}
                       </span>
                     )}
                     {!isPast && ( // Gelecek randevular için farklı bir etiket
                        <span className="font-medium px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            Yaklaşan
                        </span>
                     )}
                     {/* İptal etme veya düzenleme butonu eklenebilir (API desteği gerektirir) */}
                     {/* {!isPast && <button className="text-xs text-red-500 hover:underline">İptal Et</button>} */}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MemberAppointmentsPage;
