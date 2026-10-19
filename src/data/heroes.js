// Data 18 hero. weapon = tipe senjata bawaan (dipakai logika kecocokan item). k = urutan index (dipakai varian art prosedural k%3).
// skill/ult type: s=1 musuh, a=semua musuh, h=pulih, b=buff ATK tim.
export const HEROES = [
  { id: 'raka',   k: 0,  name: 'Raka',   title: 'Kaisar Inferno',  element: 'a', rarity: 'SSR', role: 'Penyerang', weapon: 'pedang', color: '#ff7a2f', skill: { name: 'Tebasan Blaze',      mult: 2.2, type: 's' }, ult: { name: 'Inferno Cataclysm',   mult: 4.5, type: 's' } },
  { id: 'naya',   k: 1,  name: 'Naya',   title: 'Putri Samudra',   element: 'w', rarity: 'SSR', role: 'Penyembuh', weapon: 'tongkat', color: '#3fa9ff', skill: { name: 'Arus Penyembuh',     mult: 1.8, type: 'h' }, ult: { name: 'Samudra Kehidupan',   mult: 3,   type: 'h' } },
  { id: 'volta',  k: 2,  name: 'Volta',  title: 'Titan Petir',     element: 't', rarity: 'SSR', role: 'Tank', weapon: 'tombak',      color: '#ffe14f', skill: { name: 'Tombak Volt',        mult: 2,   type: 's' }, ult: { name: 'Penghakiman Volt',    mult: 2.6, type: 'a' } },
  { id: 'aella',  k: 3,  name: 'Aella',  title: 'Ratu Tornado',    element: 'g', rarity: 'SSR', role: 'Penyerang', weapon: 'panah', color: '#4fe08a', skill: { name: 'Panah Pusaran',      mult: 1.6, type: 'a' }, ult: { name: 'Topan Nirwana',       mult: 2.6, type: 'a' } },
  { id: 'lumia',  k: 4,  name: 'Lumia',  title: 'Cahaya Fajar',    element: 'l', rarity: 'SSR', role: 'Pendukung', weapon: 'tongkat', color: '#fff3b3', skill: { name: 'Berkat Fajar',       mult: 0,   type: 'b' }, ult: { name: 'Aurora Genesis',      mult: 0,   type: 'b' } },
  { id: 'umbra',  k: 5,  name: 'Umbra',  title: 'Bayangan Abadi',  element: 'd', rarity: 'SSR', role: 'Penyerang', weapon: 'belati', color: '#7a5fd0', skill: { name: 'Tikaman Kelam',      mult: 2.4, type: 's' }, ult: { name: 'Malam Tanpa Akhir',   mult: 4.5, type: 's' } },
  { id: 'bara',   k: 6,  name: 'Bara',   title: 'Perisai Magma',   element: 'a', rarity: 'SR',  role: 'Tank', weapon: 'kapak',      color: '#c23a1a', skill: { name: 'Dinding Magma',      mult: 1.5, type: 's' }, ult: { name: 'Erupsi Pelindung',    mult: 2.2, type: 'a' } },
  { id: 'tirta',  k: 7,  name: 'Tirta',  title: 'Pedang Ombak',    element: 'w', rarity: 'SR',  role: 'Penyerang', weapon: 'pedang', color: '#1a6fb3', skill: { name: 'Tebasan Ombak',      mult: 2.1, type: 's' }, ult: { name: 'Tsunami Blade',       mult: 4.2, type: 's' } },
  { id: 'sylva',  k: 8,  name: 'Sylva',  title: 'Penjaga Badai',   element: 'g', rarity: 'SR',  role: 'Penyerang', weapon: 'panah', color: '#2fae62', skill: { name: 'Panah Tornado',      mult: 1.5, type: 'a' }, ult: { name: 'Hujan Badai',        mult: 2.4, type: 'a' } },
  { id: 'saka',   k: 9,  name: 'Saka',   title: 'Volt Penyembuh',  element: 't', rarity: 'SR',  role: 'Penyembuh', weapon: 'tongkat', color: '#fff06b', skill: { name: 'Sengatan Pulih',     mult: 1.6, type: 'h' }, ult: { name: 'Arus Volt Suci',      mult: 2.6, type: 'h' } },
  { id: 'kirana', k: 10, name: 'Kirana', title: 'Kesatria Fajar',  element: 'l', rarity: 'SR',  role: 'Tank', weapon: 'pedang',      color: '#ffe9a3', skill: { name: 'Tebasan Suci',       mult: 1.8, type: 's' }, ult: { name: 'Perisai Fajar',       mult: 2.2, type: 'a' } },
  { id: 'senja',  k: 11, name: 'Senja',  title: 'Orkestra Kelam',  element: 'd', rarity: 'SR',  role: 'Pendukung', weapon: 'tongkat', color: '#5a3f9c', skill: { name: 'Not Kelam',          mult: 1.8, type: 's' }, ult: { name: 'Requiem Kegelapan',   mult: 1.8, type: 'a' } },
  { id: 'arka',   k: 12, name: 'Arka',   title: 'Pedang Api',      element: 'a', rarity: 'R',   role: 'Penyerang', weapon: 'pedang', color: '#8a2a1a', skill: { name: 'Bara Tebasan',       mult: 1.8, type: 's' }, ult: { name: 'Bara Terakhir',       mult: 3.8, type: 's' } },
  { id: 'mira',   k: 13, name: 'Mira',   title: 'Tetes Embun',     element: 'w', rarity: 'R',   role: 'Penyembuh', weapon: 'tongkat', color: '#1a4a8a', skill: { name: 'Embun Segar',        mult: 1.4, type: 'h' }, ult: { name: 'Embun Pagi',          mult: 2.4, type: 'h' } },
  { id: 'petra',  k: 14, name: 'Petra',  title: 'Tombak Karang',   element: 't', rarity: 'R',   role: 'Tank', weapon: 'tombak',      color: '#8a7a3a', skill: { name: 'Tusukan Karang',     mult: 1.5, type: 's' }, ult: { name: 'Benteng Karang',      mult: 2,   type: 'a' } },
  { id: 'sena',   k: 15, name: 'Sena',   title: 'Panah Angin',     element: 'g', rarity: 'R',   role: 'Penyerang', weapon: 'panah', color: '#1c6b3d', skill: { name: 'Panah Sepoi',        mult: 1.7, type: 's' }, ult: { name: 'Seribu Panah',        mult: 2.2, type: 'a' } },
  { id: 'citra',  k: 16, name: 'Citra',  title: 'Belati Cahaya',   element: 'l', rarity: 'R',   role: 'Pendukung', weapon: 'belati', color: '#d8c26b', skill: { name: 'Sorak Cahaya',       mult: 0,   type: 'b' }, ult: { name: 'Himne Cahaya',        mult: 0,   type: 'b' } },
  { id: 'raga',   k: 17, name: 'Raga',   title: 'Bayangan Liar',   element: 'd', rarity: 'R',   role: 'Penyerang', weapon: 'kapak', color: '#2a2a3d', skill: { name: 'Tebasan Liar',       mult: 1.9, type: 's' }, ult: { name: 'Amuk Bayangan',       mult: 4,   type: 's' } },
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export function heroesByRarity(rarity) {
  return HEROES.filter((h) => h.rarity === rarity);
}

/** Deskripsi teks skill/ult sesuai tipe. */
export function describeAction(type, mult, isUlt) {
  if (type === 's') return `Serang 1 musuh ${mult}× ATK.`;
  if (type === 'a') return `Serang semua musuh ${mult}× ATK.`;
  if (type === 'h') return isUlt ? `Pulihkan semua sekutu ${mult}× ATK.` : `Pulihkan sekutu dengan HP terendah ${mult}× ATK.`;
  return `ATK seluruh tim +30% selama ${isUlt ? 3 : 2} giliran.`;
}
