/**
 * Official IYMPACK Teams & Chapters Data
 * Chapters: Pusat, Jakarta, Bogor, Depok, Tangerang, Bekasi, Bandung, Mengajar
 * Inisialisasi bersih (clean slate) - konten profil dan anggota dikosongkan.
 */

export const teamsData = [
  {
    id: "pusat",
    slug: "pusat",
    name: "IYMPACK Pusat",
    displayName: "IYMPACK Pusat",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "mengajar",
    nextTeam: "jakarta"
  },
  {
    id: "jakarta",
    slug: "jakarta",
    name: "IYMPACK Jakarta",
    displayName: "IYMPACK Jakarta",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "pusat",
    nextTeam: "bogor"
  },
  {
    id: "bogor",
    slug: "bogor",
    name: "IYMPACK Bogor",
    displayName: "IYMPACK Bogor",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "jakarta",
    nextTeam: "depok"
  },
  {
    id: "depok",
    slug: "depok",
    name: "IYMPACK Depok",
    displayName: "IYMPACK Depok",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "bogor",
    nextTeam: "tangerang"
  },
  {
    id: "tangerang",
    slug: "tangerang",
    name: "IYMPACK Tangerang",
    displayName: "IYMPACK Tangerang",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "depok",
    nextTeam: "bekasi"
  },
  {
    id: "bekasi",
    slug: "bekasi",
    name: "IYMPACK Bekasi",
    displayName: "IYMPACK Bekasi",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "tangerang",
    nextTeam: "bandung"
  },
  {
    id: "bandung",
    slug: "bandung",
    name: "IYMPACK Bandung",
    displayName: "IYMPACK Bandung",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "bekasi",
    nextTeam: "mengajar"
  },
  {
    id: "mengajar",
    slug: "mengajar",
    name: "IYMPACK Mengajar",
    displayName: "IYMPACK Mengajar",
    tagline: "",
    ig: "",
    igUrl: "",
    tiktok: null,
    tiktokUrl: null,
    coverImage: "",
    membersCount: 0,
    members: [],
    divisions: [],
    prevTeam: "bandung",
    nextTeam: "pusat"
  }
];

export const getTeamBySlug = (slug) => {
  if (!slug) return null;
  const clean = slug.toLowerCase().replace('iympack-', '').replace('-2', '').trim();
  return teamsData.find(t => t.slug === clean || t.id === clean || t.name.toLowerCase().includes(clean));
};
