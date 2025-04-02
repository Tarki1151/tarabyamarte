import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrograms, createAppointment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function BookAppointmentPage() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const response = await getPrograms();
        setPrograms(response.data.results || response.data);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
        setError('Spor programları yüklenirken bir hata oluştu.');
      } finally {
        setLoadingPrograms(false);
      }
    };
    if (user?.role === 'member') {
        fetchPrograms();
    } else {
        setLoadingPrograms(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    if (!selectedProgram || !appointmentDateTime) {
      setError('Lütfen bir program ve tarih/saat seçin.');
      setSubmitting(false);
      return;
    }

    const appointmentData = {
      program: parseInt(selectedProgram, 10),
      appointment_datetime: new Date(appointmentDateTime).toISOString(),
    };

    try {
      await createAppointment(appointmentData);
      setSuccessMessage('Randevunuz başarıyla oluşturuldu!');
      setSelectedProgram('');
      setAppointmentDateTime('');
      // setTimeout(() => navigate('/my-appointments'), 2000);
    } catch (err) {
      console.error("Failed to create appointment:", err.response?.data || err);
      if (err.response?.data) {
          let errors = Object.entries(err.response.data).map(([key, value]) => {
              let message = Array.isArray(value) ? value[0] : value;
              if (key === 'appointment_datetime') key = 'Randevu Zamanı';
              if (key === 'program') key = 'Program';
              if (key === 'non_field_errors') return `${message}`;
              return `${key}: ${message}`;
          }).join(' ');
          setError(`Randevu oluşturulamadı: ${errors}`);
      } else {
          setError('Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDateTime = () => {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localNow = new Date(now.getTime() - (offset*60*1000));
      return localNow.toISOString().slice(0, 16);
  }

  if (loadingPrograms) {
    return <div className="p-6 text-center">Programlar yükleniyor...</div>;
  }

  if (user?.role !== 'member') {
      return <div className="p-6 text-red-500">Bu sayfayı görüntüleme yetkiniz yok.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Yeni Randevu Al</h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded shadow-md">
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="program" className="block text-gray-700 text-sm font-bold mb-2">
            Spor Programı Seçin:
          </label>
          <select
            id="program"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline appearance-none"
            required
            disabled={submitting}
          >
            <option value="" disabled>-- Bir Program Seçin --</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="appointmentDateTime" className="block text-gray-700 text-sm font-bold mb-2">
            Randevu Tarihi ve Saati:
          </label>
          <input
            type="datetime-local"
            id="appointmentDateTime"
            value={appointmentDateTime}
            onChange={(e) => setAppointmentDateTime(e.target.value)}
            min={getMinDateTime()}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={submitting}
          />
           <p className="text-xs text-gray-500 mt-1">Lütfen ileri bir tarih ve saat seçiniz.</p>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={submitting || !selectedProgram || !appointmentDateTime}
          >
            {submitting ? 'Randevu Oluşturuluyor...' : 'Randevu Al'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookAppointmentPage;