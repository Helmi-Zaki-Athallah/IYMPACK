/**
 * IYMPACK — Modals Component (Minimalist Dark Forest Green Edition)
 */

import React, { useState } from 'react';
import { useModal } from '../hooks/useModal.js';
import { Link } from 'react-router-dom';

export function Modals() {
  const {
    donationModal, closeDonation,
    volunteerModal, closeVolunteer,
    eventModal, closeEvent,
    searchModal, closeSearch,
    toast, showToast
  } = useModal();

  // Donation State
  const [presetAmount, setPresetAmount] = useState(100000);
  const [customAmount, setCustomAmount] = useState('100.000');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');

  const presets = [25000, 50000, 100000, 250000, 500000, 1000000];

  const handlePresetSelect = (val) => {
    setPresetAmount(val);
    setCustomAmount(new Intl.NumberFormat('id-ID').format(val));
  };

  const handleCustomChange = (e) => {
    setPresetAmount(null);
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(raw ? new Intl.NumberFormat('id-ID').format(raw) : '');
  };

  const handleDonationSubmit = (e) => {
    e.preventDefault();
    closeDonation();
    showToast(`Terima kasih, ${donorName || 'Sahabat Kebaikan'}! Donasi sebesar Rp ${customAmount} untuk ${donationModal.programName} berhasil disimulasikan.`);
    setDonorName('');
    setDonorEmail('');
  };

  // Volunteer State
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volDivision, setVolDivision] = useState('pengajaran');
  const [volMotivation, setVolMotivation] = useState('');

  const handleVolunteerSubmit = (e) => {
    e.preventDefault();
    closeVolunteer();
    showToast(`Selamat bergabung, ${volName}! Tim IYMPACK akan menghubungi nomor ${volPhone} via WhatsApp.`);
    setVolName('');
    setVolEmail('');
    setVolPhone('');
    setVolMotivation('');
  };

  // Event RSVP State
  const [eventName, setEventName] = useState('');
  const [eventEmail, setEventEmail] = useState('');
  const [eventPhone, setEventPhone] = useState('');
  const [eventInst, setEventInst] = useState('');

  const handleEventSubmit = (e) => {
    e.preventDefault();
    closeEvent();
    showToast(`Pendaftaran berhasil! E-ticket untuk ${eventModal.eventTitle} telah dikirimkan.`);
    setEventName('');
    setEventEmail('');
    setEventPhone('');
    setEventInst('');
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const searchableItems = [
    { title: 'Beasiswa Pendidikan Cendekia Muda', type: 'Program', link: '/event' },
    { title: 'Nutrisi Sehat & Pangan Bergizi Anak Bangsa', type: 'Program', link: '/event' },
    { title: 'Pemberdayaan Skill & Komunitas Pemuda', type: 'Program', link: '/event' },
    { title: 'IYMPACK Mengajar ke Pelosok Negeri', type: 'Program', link: '/event' },
    { title: 'Aksi Bersih Pantai & Restorasi Mangrove', type: 'Program', link: '/event' },
    { title: 'Youth Leadership & Social Impact Summit 2026', type: 'Kegiatan', link: '/event' },
    { title: 'IYMPACK Mengajar Batch 5', type: 'Kegiatan', link: '/event' },
    { title: 'Membangun Karakter Generasi Muda melalui Pengabdian', type: 'Artikel', link: '/artikel' },
    { title: 'Visi & Misi Komunitas IYMPACK', type: 'Tentang', link: '/tentang-kami' },
    { title: 'Pendaftaran Relawan Batch 2026', type: 'Relawan', link: '/relawan' }
  ];

  const filteredSearch = searchQuery.trim()
    ? searchableItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#252f27] text-[#faeed4] px-5 py-3 rounded-xl shadow-2xl border border-white/20 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast.message}
        </div>
      )}

      {/* 1. DONATION MODAL */}
      {donationModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#252f27] text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl border border-white/15">
            <button
              onClick={closeDonation}
              className="absolute top-5 right-5 text-sm font-semibold text-stone-400 hover:text-white cursor-pointer"
            >
              [ Tutup ]
            </button>

            <div className="mb-6 space-y-1">
              <p className="text-xs uppercase tracking-wider text-[#819b8e] font-bold">Penyaluran Donasi</p>
              <h3 className="text-2xl font-bold text-white font-heading">Formulir Donasi Online</h3>
              <p className="text-xs text-stone-300">{donationModal.programName}</p>
            </div>

            <form onSubmit={handleDonationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">Pilih Nominal</label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetSelect(amt)}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        presetAmount === amt
                          ? 'border-[#faeed4] bg-[#faeed4] text-[#252f27]'
                          : 'border-white/10 bg-[#1c241e]/50 text-stone-300 hover:border-white/30'
                      }`}
                    >
                      Rp {new Intl.NumberFormat('id-ID').format(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nominal Donasi (Rp)</label>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomChange}
                  required
                  placeholder="Contoh: 100.000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-sm placeholder:text-stone-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Nama Lengkap / Anonim</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    placeholder="Nama Anda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Email / WhatsApp</label>
                  <input
                    type="text"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    required
                    placeholder="Untuk tanda terima"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {['qris', 'va', 'ewallet'].map((methodKey) => (
                    <div
                      key={methodKey}
                      onClick={() => setPaymentMethod(methodKey)}
                      className={`p-3 rounded-xl border cursor-pointer font-semibold transition-all ${
                        paymentMethod === methodKey
                          ? 'border-[#faeed4] bg-[#faeed4] text-[#252f27]'
                          : 'border-white/10 bg-[#1c241e]/50 text-stone-300 hover:border-white/30'
                      }`}
                    >
                      {methodKey === 'qris' ? 'QRIS Instan' : methodKey === 'va' ? 'Transfer Bank' : 'E-Wallet'}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] font-semibold text-xs transition-colors cursor-pointer mt-2 shadow-lg"
              >
                Konfirmasi Donasi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. VOLUNTEER MODAL */}
      {volunteerModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#252f27] text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl border border-white/15">
            <button
              onClick={closeVolunteer}
              className="absolute top-5 right-5 text-sm font-semibold text-stone-400 hover:text-white cursor-pointer"
            >
              [ Tutup ]
            </button>

            <div className="mb-6 space-y-1">
              <p className="text-xs uppercase tracking-wider text-[#819b8e] font-semibold">Komunitas Relawan</p>
              <h3 className="text-2xl font-bold text-white font-heading">Bergabung Jadi Relawan</h3>
              <p className="text-xs text-stone-300">Mulai perjalanan kontribusi sosial Anda bersama IYMPACK.</p>
            </div>

            <form onSubmit={handleVolunteerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  placeholder="Nama sesuai identitas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={volEmail}
                    onChange={(e) => setVolEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Minat Divisi</label>
                <select
                  value={volDivision}
                  onChange={(e) => setVolDivision(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-stone-200 focus:outline-none focus:border-[#819b8e] text-xs"
                >
                  <option value="pengajaran">Divisi Pengajaran & Edukasi</option>
                  <option value="media">Divisi Media & Dokumentasi</option>
                  <option value="logistik">Divisi Logistik & Aksi Lapangan</option>
                  <option value="kemitraan">Divisi Kemitraan & Kerjasama</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Motivasi</label>
                <textarea
                  rows={3}
                  value={volMotivation}
                  onChange={(e) => setVolMotivation(e.target.value)}
                  placeholder="Ceritakan mengapa Anda tertarik..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs resize-none placeholder:text-stone-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] font-semibold text-xs transition-colors cursor-pointer shadow-lg"
              >
                Kirim Pendaftaran Relawan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. EVENT RSVP MODAL */}
      {eventModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#252f27] text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl border border-white/15">
            <button
              onClick={closeEvent}
              className="absolute top-5 right-5 text-sm font-semibold text-stone-400 hover:text-white cursor-pointer"
            >
              [ Tutup ]
            </button>

            <div className="mb-6 space-y-1">
              <p className="text-xs uppercase tracking-wider text-[#819b8e] font-semibold">Konfirmasi Kehadiran</p>
              <h3 className="text-2xl font-bold text-white font-heading">Daftar Kegiatan</h3>
              <p className="text-xs text-stone-300">{eventModal.eventTitle}</p>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={eventEmail}
                    onChange={(e) => setEventEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={eventPhone}
                    onChange={(e) => setEventPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Instansi / Kampus</label>
                <input
                  type="text"
                  value={eventInst}
                  onChange={(e) => setEventInst(e.target.value)}
                  placeholder="Contoh: Universitas Indonesia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1c241e] text-white focus:outline-none focus:border-[#819b8e] text-xs placeholder:text-stone-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#faeed4] hover:bg-white text-[#252f27] font-semibold text-xs transition-colors cursor-pointer shadow-lg"
              >
                Konfirmasi Pendaftaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. SEARCH MODAL */}
      {searchModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 pt-20">
          <div className="bg-[#252f27] text-stone-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-white/15 animate-in fade-in duration-150">
            <button
              onClick={closeSearch}
              className="absolute top-5 right-5 text-sm font-semibold text-stone-400 hover:text-white cursor-pointer"
            >
              [ Tutup ]
            </button>

            <p className="text-xs uppercase tracking-wider text-[#819b8e] font-semibold mb-3">Pencarian Cepat</p>

            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik topik, kegiatan, atau artikel..."
              className="w-full px-4 py-3 text-sm border-b-2 border-[#faeed4] bg-transparent text-white focus:outline-none mb-4 placeholder:text-stone-500"
            />

            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredSearch.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.link}
                  onClick={closeSearch}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c241e] text-xs transition-colors"
                >
                  <span className="font-semibold text-stone-200">{item.title}</span>
                  <span className="text-[#819b8e]">{item.type}</span>
                </Link>
              ))}

              {searchQuery.trim() && filteredSearch.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-6">
                  Tidak ada hasil untuk "{searchQuery}".
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
