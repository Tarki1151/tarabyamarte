import React, { useState, useEffect } from 'react';
import { getPrograms } from '../services/api'; // API fonksiyonu

function ProgramsListPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await getPrograms();
        setPrograms(response.data.results || response.data); // DRF pagination varsa .results kullanılır
      } catch (err) {
        setError('Programlar yüklenirken bir hata oluştu.');
        console.error("Program fetch error:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []); // Boş dependency array, sadece component mount olduğunda çalışır

  if (loading) return <div className="p-4">Programlar Yükleniyor...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Spor Programları</h1>
      {programs.length === 0 ? (
        <p>Aktif spor programı bulunamadı.</p>
      ) : (
        <ul className="space-y-3">
          {programs.map((program) => (
            <li key={program.id} className="p-4 bg-white rounded shadow">
              <h2 className="text-xl font-semibold">{program.name}</h2>
              {program.description && <p className="text-gray-600 mt-1">{program.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProgramsListPage;