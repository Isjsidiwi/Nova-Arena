// Manifest aset. Ubah nilai di sini untuk mengganti gambar/suara tanpa menyentuh kode.
// null = pakai art SVG bawaan (hero/item) / SFX sintetis.
export const ASSETS = {
  portrait: {
    // ?v= wajib dinaikkan setiap file diganti: Cloudflare + browser meng-cache
    // aset statis sampai 4 jam, query versi membuat URL dianggap aset baru.
    sylva: 'assets/portraits/sylva.webp?v=2',
  },
  icon: {
    sylva: 'assets/icons/sylva.webp?v=3',
  },
  cutin: {
    sylva: 'assets/cutins/sylva.webp?v=3',
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
