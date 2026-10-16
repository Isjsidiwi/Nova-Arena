// Manifest aset. Ubah nilai di sini untuk mengganti gambar/suara tanpa menyentuh kode.
// null = pakai art SVG bawaan (hero/item) / SFX sintetis.
export const ASSETS = {
  portrait: {
    // ?v= wajib dinaikkan setiap file diganti: Cloudflare + browser meng-cache
    // aset statis sampai 4 jam, query versi membuat URL dianggap aset baru.
    sylva: 'assets/portraits/sylva.webp?v=2',
    arka: 'assets/portraits/arka.webp?v=1',
    mira: 'assets/portraits/mira.webp?v=1',
  },
  icon: {
    sylva: 'assets/icons/sylva.webp?v=3',
    arka: 'assets/icons/arka.webp?v=1',
    mira: 'assets/icons/mira.webp?v=1',
  },
  cutin: {
    sylva: 'assets/cutins/sylva.webp?v=3',
    arka: 'assets/cutins/arka.webp?v=1',
    mira: 'assets/cutins/mira.webp?v=1',
  },
  // Badge plakat per rarity. Dipakai rarityBadge().
  rarity: {
    R: 'assets/badges/r.webp?v=1',
    SR: 'assets/badges/sr.webp?v=1',
    SSR: 'assets/badges/ssr.webp?v=1',
  },
  // Ikon medali per elemen (kode elemen: a/w/t/g/l/d). Dipakai elementBadge().
  element: {
    a: 'assets/elements/api.webp?v=1',
    w: 'assets/elements/air.webp?v=1',
    t: 'assets/elements/petir.webp?v=1',
    g: 'assets/elements/angin.webp?v=1',
    l: 'assets/elements/cahaya.webp?v=1',
    d: 'assets/elements/gelap.webp?v=1',
  },
  bg: {
    home: null,
    battle: null,
  },
  sfx: {
    tap: null,
    hit: null,
    ult: null,
    pull: null,
    win: null,
    lose: null,
  },
  bgm: null,
};
