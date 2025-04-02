/* src/pages/MemberMembershipsPage.jsx */
import React, { useState, useEffect } from 'react';
import { getMyMemberships } from '../services/api'; // API fonksiyonunu import et
import { useAuth } from '../contexts/AuthContext'; // Kullanıcı bilgisine erişim için (opsiyonel)

function MemberMembershipsPage() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Mevcut kullanıcıyı al (opsiyonel, sadece rol kontrolü vb. için)

  useEffect(() => {
    // Sadece üye rolündeki kullanıcılar için veri çekelim
    if (user?.role === 'member') {
      const fetchMemberships = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await getMyMemberships();
          // API cevabının yapısına göre veriyi al (DRF pagination varsa .results)
          setMemberships(response.data.results || response.data);
        } catch (err) {
          console.error("Membership fetch error:", err.response || err);
          setError('Üyelik bilgileri yüklenirken bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      };

      fetchMemberships();
    } else {
      // Eğer kullanıcı üye değilse veya giriş yapmamışsa (PrivateRoute zaten engeller ama ekstra kontrol)
      setLoading(false);
      // İsteğe bağlı olarak bir hata mesajı veya yönlendirme yapılabilir
      // setError('Bu sayfayı görüntüleme yetkiniz yok.');
      setMemberships([]); // Boş liste göster
    }
  }, [user]); // user değiştiğinde tekrar kontrol et

  // Tarih formatlama fonksiyonu
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Yükleniyor durumu
  if (loading) {
    return <div className="p-6 text-center">Üyelikler yükleniyor...</div>;
  }

  // Hata durumu
  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Üyeliklerim</h1>

      {memberships.length === 0 ? (
        <p className="text-gray-600">Görüntülenecek bir üyeliğiniz bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {/* Üyelikleri listele */}
          {memberships.map((membership) => (
            <div key={membership.id} className={`p-4 rounded shadow-md border-l-4 ${membership.is_active && !membership.is_expired ? 'border-green-500 bg-white' : 'border-gray-400 bg-gray-50 opacity-80'}`}>
              <h2 className="text-xl font-semibold mb-2">{membership.plan.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p><strong>Plan Tipi:</strong> {membership.plan.plan_type_display}</p>
                <p><strong>Başlangıç Tarihi:</strong> {formatDate(membership.start_date)}</p>

                {/* Gün bazlı ise bitiş ve kalan gün */}
                {membership.plan.plan_type === 'days' && (
                  <>
                    <p><strong>Bitiş Tarihi:</strong> {formatDate(membership.end_date)}</p>
                    <p><strong>Kalan Gün:</strong> {membership.remaining_days >= 0 ? membership.remaining_days : 0}</p>
                  </>
                )}

                {/* Seans bazlı ise kalan seans */}
                {membership.plan.plan_type === 'sessions' && (
                  <p><strong>Kalan Ders Hakkı:</strong> {membership.remaining_sessions ?? '-'}</p>
                )}

                <p><strong>Durum:</strong>
                  <span className={`ml-2 font-medium px-2 py-0.5 rounded-full text-xs ${membership.is_active && !membership.is_expired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {membership.is_active && !membership.is_expired ? 'Aktif' : 'Pasif/Süresi Doldu'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MemberMembershipsPage;
