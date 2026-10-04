/**
 * IYMPACK CMS — Page Sections Service
 *
 * Manages section-level content across website pages (Home, About, Volunteer, Legal).
 * Provides default fallbacks, localStorage persistence, and update handlers.
 */

import { LS_KEYS } from '../lib/db.constants.js';
import { getObject, setObject } from '../lib/storage.js';

export const DEFAULT_PAGE_SECTIONS = {
  home: {
    hero: {
      headline: 'IYMPACK',
      subheadline: 'Mari bertumbuh bersama, membangun aksi sosial yang berdampak, dan membuka kesempatan pendidikan yang lebih luas bagi anak-anak Indonesia.',
      buttonText: 'Ikut Kegiatan',
      buttonUrl: '/event',
      bannerUrl: '/hero-hands.webp',
    },
    stats: {
      title: 'Tentang Kami',
      desc: 'IYMPACK (Indonesia Yuwana Muda Peduli Aksi Cinta Kasih) adalah gerakan pemuda sukarela yang berfokus pada pemerataan pendidikan, aksi sosial kemanusiaan, dan pemberdayaan anak-anak bangsa di berbagai pelosok Indonesia. Bergerak secara nyata ke lapangan, kami mendampingi generasi penerus, menyalurkan sarana literasi, dan membuka kesempatan belajar yang lebih luas demi mewujudkan masa depan anak-anak Indonesia yang lebih cerah dan berdaya.',
      stat1Value: '100+',
      stat1Label: 'Relawan Terlibat',
      stat2Value: '8',
      stat2Label: 'Cabang Kota & Divisi',
      stat3Value: '1.000+',
      stat3Label: 'Penerima Manfaat',
    },
    pillars: {
      title: 'Langkah Nyata Bersama Kami',
      subtitle: 'Tiga pilar utama keterlibatan untuk menciptakan gelombang kebaikan yang lebih luas',
      items: [
        {
          id: 'volunteer',
          title: 'Jadi Volunteer',
          desc: 'Siap bertumbuh sekaligus memberikan dampak positif? Yuk, pelajari berbagai program kami dan wujudkan aksi sosial pertamamu bersama IYMPACK!',
          actionLabel: 'Ikut event',
          actionUrl: '/event',
          image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop',
        },
        {
          id: 'community',
          title: 'Kolaborasi Komunitas',
          desc: 'Satu komunitas, ribuan kebaikan! Ingin tebar manfaat bersama? Yuk, jalin kolaborasi dan wujudkan dampak yang luar biasa. Daftarkan di sini!',
          actionLabel: 'Ajukan kolaborasi',
          actionUrl: '/kontak',
          image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop',
        },
        {
          id: 'partner',
          title: 'Kemitraan & Sponsor',
          desc: 'Jadikan perusahaan Anda bagian dari perubahan positif! Mari berkolaborasi memperluas dampak sosial dan dukung gerakan keberlanjutan lewat inovasi program kami.',
          actionLabel: 'Hubungi kami',
          actionUrl: '/kontak',
          image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000&auto=format&fit=crop',
        },
      ],
    },
    eventsHeader: {
      title: 'Agenda Kegiatan Mendatang',
      subtitle: 'Temukan aksi sosial dan program terdekat yang sesuai dengan panggilan hatimu.',
    },
    galleryHeader: {
      title: 'Dokumentasi Aksi Lapangan',
      subtitle: 'Momen nyata kebersamaan relawan di berbagai pelosok negeri',
    },
    testimonialsHeader: {
      title: 'Suara dari Lapangan',
      subtitle: 'Pengalaman nyata mereka yang telah merasakan hangatnya bertumbuh dan berbagi bersama kami',
    },
    articlesHeader: {
      title: 'Kabar & Cerita Aksi',
      subtitle: 'Ikuti liputan kegiatan, edukasi sosial, dan catatan perjalanan dari berbagai cabang',
    },
    cta: {
      title: 'Siap Mengambil Bagian dalam Perubahan?',
      subtitle: 'Bergabunglah bersama ratusan pemuda lainnya untuk mewujudkan aksi nyata dan membuka pintu kebaikan yang lebih luas.',
      buttonText: 'Gabung Jadi Relawan',
      buttonUrl: '/event',
    },
  },
  about: {
    banner: {
      tag: 'Tentang Kami',
      title: 'Tentang Kami',
      desc: 'Mengenal profil, sejarah, visi, dan misi Yayasan Indonesia Yuwana Muda Peduli Aksi Cinta Kasih.',
      imageUrl: '/hero-hands.webp',
    },
    story: {
      aboutTitle: 'Tentang Yayasan IYMPACK',
      aboutText: 'Yayasan IYMPACK (Indonesia Yuwana Muda Peduli Aksi Cinta Kasih) merupakan organisasi kepemudaan dan yayasan sosial yang diinisiasi oleh Melisania Suardi dan resmi berdiri pada 4 November 2024. Kami hadir sebagai wadah bagi generasi muda untuk menciptakan dampak positif melalui aksi sosial dan kemanusiaan.',
      historyTitle: 'Sejarah Berdirinya',
      historyText: 'Lahirnya IYMPACK berawal dari pengalaman pribadi sang pendiri ketika berada di titik terpuruk dan merasa kehilangan arah. Masa-masa sulit tersebut justru menumbuhkan tekad yang kuat untuk menciptakan sebuah komunitas bermakna. IYMPACK dibangun tidak hanya untuk membantu masyarakat luas, tetapi juga sebagai ruang aman untuk saling bertumbuh, menguatkan, dan memulihkan diri bagi mereka yang pernah mengalami hal serupa.',
      focusTitle: 'Fokus dan Kegiatan',
      focusText: 'Berlandaskan kepedulian dan semangat untuk bangkit bersama, IYMPACK aktif menjalankan berbagai program di bidang sosial, edukasi, kemanusiaan, dan pengabdian masyarakat. Organisasi ini percaya bahwa menolong sesama adalah jalan untuk menghadirkan harapan baru, membangun rasa syukur, dan menghidupkan kembali semangat bagi masyarakat maupun para relawan itu sendiri.',
      valuesTitle: 'Nilai dan Harapan',
      valuesText: 'Kami percaya bahwa menolong orang lain adalah cara terbaik untuk menemukan kembali harapan dan rasa syukur, baik bagi penerima manfaat maupun bagi relawan. Dengan menjunjung tinggi nilai gotong royong, solidaritas, dan aksi nyata, IYMPACK berupaya menciptakan ruang positif bagi generasi muda untuk terus berkarya, peduli, dan membawa perubahan nyata bagi Indonesia.',
    },
    visionMission: {
      visionTitle: 'Visi',
      visionText: 'Menjadi wadah kepemudaan yang aktif, inklusif, dan berkelanjutan dalam mendorong aksi sosial, pendidikan, dan kemanusiaan untuk menciptakan masyarakat Indonesia yang berdaya, berkarakter, dan berkeadilan.',
      missionTitle: 'Misi',
      missions: [
        'Membangun jejaring generasi muda yang berintegritas, berempati, dan memiliki jiwa kepemimpinan sosial.',
        'Menginisiasi program-program berdampak di bidang pendidikan, pengabdian masyarakat, dan bantuan sosial bagi komunitas rentan.',
        'Menyediakan ruang aman untuk bertumbuh, berbagi pengalaman, dan saling menguatkan bagi seluruh relawan serta penerima manfaat.',
        'Menjalin kolaborasi strategis dengan berbagai pihak guna memperluas jangkauan dan keberlanjutan aksi kemanusiaan di Indonesia.',
      ],
    },
  },
  volunteer: {
    banner: {
      tag: 'Pemberdayaan Pemuda',
      title: 'Portal Relawan IYMPACK',
      desc: 'Jadilah bagian dari jejaring pemuda Indonesia yang mendedikasikan energi positif dan kepedulian untuk sesama.',
      imageUrl: '/hero-hands.webp',
    },
    divisionsHeader: {
      subtitle: 'Bidang Kontribusi',
      title: 'Pilih Peran Sesuai Minat & Keahlian Anda',
    },
    divisions: [
      {
        id: 'pengajaran',
        title: 'Divisi Pengajaran & Edukasi',
        desc: 'Merancang kurikulum interaktif, modul sains kreatif, dan mengajar langsung anak-anak di pelosok negeri.',
      },
      {
        id: 'media',
        title: 'Divisi Media & Dokumentasi',
        desc: 'Mengabadikan momen aksi kebaikan, memproduksi konten visual kreatif, dan mengelola media publikasi.',
      },
      {
        id: 'logistik',
        title: 'Divisi Logistik & Lapangan',
        desc: 'Mengkoordinasikan kebutuhan operasional, distribusi paket bantuan/buku, serta manajemen posko kegiatan sosial.',
      },
      {
        id: 'kemitraan',
        title: 'Divisi Kemitraan & Hubungan Masyarakat',
        desc: 'Membangun sinergi dengan berbagai komunitas pemuda, sponsor, media partner, dan institusi pemerintahan.',
      },
    ],
  },
  legal: {
    termsIntro: 'Selamat datang di IYMPACK. Syarat dan Ketentuan ini mengatur penggunaan platform web, pendaftaran kegiatan, dan partisipasi Anda dalam program relawan kami.',
    termsEffectiveDate: '1 Januari 2026',
    privacyIntro: 'Yayasan IYMPACK menghormati dan melindungi privasi data pribadi Anda saat menggunakan platform kami, mendaftar kegiatan, atau berkontribusi sebagai relawan.',
    privacyEffectiveDate: '1 Januari 2026',
  },
};

/**
 * Deep merge utility to safely fill missing keys with defaults
 */
function deepMerge(target, source) {
  if (!source) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }
  return output;
}

/**
 * Get all page sections merged with defaults
 * @returns {Object}
 */
export function getPageSections() {
  const stored = getObject(LS_KEYS.PAGE_SECTIONS);
  if (!stored) {
    return DEFAULT_PAGE_SECTIONS;
  }
  const merged = deepMerge(DEFAULT_PAGE_SECTIONS, stored);
  if (merged?.home?.cta?.buttonUrl === '/relawan') {
    merged.home.cta.buttonUrl = '/event';
  }
  return merged;
}

/**
 * Update a specific section on a specific page
 * @param {string} pageKey - 'home' | 'about' | 'volunteer' | 'legal'
 * @param {string} sectionKey - Section identifier inside that page
 * @param {Object} data - Section payload
 * @returns {Object}
 */
export function updatePageSection(pageKey, sectionKey, data) {
  const current = getPageSections();
  const pageData = current[pageKey] || {};
  const updatedPage = {
    ...pageData,
    [sectionKey]: data,
  };
  const updatedAll = {
    ...current,
    [pageKey]: updatedPage,
  };
  setObject(LS_KEYS.PAGE_SECTIONS, updatedAll);
  return updatedAll;
}

/**
 * Update all sections of a single page
 * @param {string} pageKey
 * @param {Object} pageData
 * @returns {Object}
 */
export function updatePage(pageKey, pageData) {
  const current = getPageSections();
  const updatedAll = {
    ...current,
    [pageKey]: {
      ...current[pageKey],
      ...pageData,
    },
  };
  setObject(LS_KEYS.PAGE_SECTIONS, updatedAll);
  return updatedAll;
}

/**
 * Reset a single section to default
 * @param {string} pageKey
 * @param {string} sectionKey
 * @returns {Object}
 */
export function resetSection(pageKey, sectionKey) {
  const defaultVal = DEFAULT_PAGE_SECTIONS[pageKey]?.[sectionKey];
  if (defaultVal !== undefined) {
    return updatePageSection(pageKey, sectionKey, defaultVal);
  }
  return getPageSections();
}

/**
 * Reset entire page or all page sections to default
 * @param {string|null} pageKey - optional pageKey, or resets everything
 * @returns {Object}
 */
export function resetPageSections(pageKey = null) {
  if (pageKey && DEFAULT_PAGE_SECTIONS[pageKey]) {
    return updatePage(pageKey, DEFAULT_PAGE_SECTIONS[pageKey]);
  }
  setObject(LS_KEYS.PAGE_SECTIONS, DEFAULT_PAGE_SECTIONS);
  return DEFAULT_PAGE_SECTIONS;
}
