// Manifest aset. Ubah nilai di sini untuk mengganti gambar/suara tanpa menyentuh kode.
// null = pakai art SVG bawaan (hero/item) / SFX sintetis.
export const ASSETS = {
  portrait: {
    // Tanpa parameter versi: server mengirim Cache-Control: no-store dan
    // Cloudflare BYPASS, jadi file terbaru selalu diambil. (Dulu pakai ?v=
    // karena Cloudflare meng-cache 4 jam; sudah dinetralkan no-store.)
    sylva: 'assets/portraits/sylva.webp',
    arka: 'assets/portraits/arka.webp',
    mira: 'assets/portraits/mira.webp',
    volta: 'assets/portraits/volta.webp',
  },
  icon: {
    sylva: 'assets/icons/sylva.webp',
    arka: 'assets/icons/arka.webp',
    mira: 'assets/icons/mira.webp',
    volta: 'assets/icons/volta.webp',
  },
  cutin: {
    sylva: 'assets/cutins/sylva.webp',
    arka: 'assets/cutins/arka.webp',
    mira: 'assets/cutins/mira.webp',
    volta: 'assets/cutins/volta.webp',
  },
  // Badge plakat per rarity. Dipakai rarityBadge().
  rarity: {
    R: 'assets/badges/r.webp',
    SR: 'assets/badges/sr.webp',
    SSR: 'assets/badges/ssr.webp',
  },
  // Ikon medali per elemen (kode elemen: a/w/t/g/l/d). Dipakai elementBadge().
  element: {
    a: 'assets/elements/api.webp',
    w: 'assets/elements/air.webp',
    t: 'assets/elements/petir.webp',
    g: 'assets/elements/angin.webp',
    l: 'assets/elements/cahaya.webp',
    d: 'assets/elements/gelap.webp',
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
