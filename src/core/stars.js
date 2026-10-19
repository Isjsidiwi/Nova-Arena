// Sistem bintang hero — MANUAL (keputusan user 17 Okt):
// duplikat dari gacha TIDAK langsung menaikkan bintang; duplikat masuk
// SALDO (field dp pada hero dimiliki) dan pemain sendiri yang menekan
// tombol NAIK BINTANG di sheet hero untuk membelanjakannya.
//
// Hero dimiliki tersimpan { id, lv, st, dp }: st = bintang saat ini (1-6),
// dp = saldo duplikat yang belum dibelanjakan.
//
// Biaya naik bintang menganut total (n-1)^2 duplikat untuk mencapai
// bintang n (contoh user: bintang 2 total 1, bintang 3 total 4), sehingga
// biaya per langkahnya: 1, 3, 5, 7, 9.
// Setiap bintang di atas 1 memberi +10% semua statistik dasar.
export const MAX_STAR = 6;
export const STAR_STAT_BONUS = .1;

// Biaya duplikat untuk naik KE bintang pada index ini (dari bintang sebelumnya).
export const STAR_COSTS = [0, 0, 1, 3, 5, 7, 9]; // index = bintang tujuan
// Total duplikat yang sudah terbakar untuk mencapai bintang pada index ini.
export const STAR_TOTALS = [0, 0, 1, 4, 9, 16, 25];

export const starsOf = (owned) => (owned ? owned.st || 1 : 1);
export const dupesOf = (owned) => (owned ? owned.dp || 0 : 0);

/** Biaya naik bintang berikutnya (null bila sudah maksimum). */
export function nextStarCost(owned) {
  const stars = starsOf(owned);
  return stars >= MAX_STAR ? null : STAR_COSTS[stars + 1];
}

/** Info progres untuk UI. */
export function starProgress(owned) {
  const stars = starsOf(owned);
  const dupes = dupesOf(owned);
  const cost = nextStarCost(owned);
  return {
    stars,
    dupes,
    maxed: stars >= MAX_STAR,
    nextCost: cost,
    canUpgrade: cost != null && dupes >= cost,
  };
}

/** Simpan satu duplikat ke saldo hero. Mengembalikan saldo terbaru. */
export function bankDuplicate(owned) {
  owned.dp = dupesOf(owned) + 1;
  return owned.dp;
}

/**
 * Naikkan bintang secara manual dengan saldo duplikat.
 * Mengembalikan { ok, reason?, cost?, stars? }.
 */
export function tryStarUp(owned) {
  if (!owned) return { ok: false, reason: 'missing' };
  const cost = nextStarCost(owned);
  if (cost == null) return { ok: false, reason: 'max' };
  if (dupesOf(owned) < cost) return { ok: false, reason: 'dupes', cost };
  owned.dp -= cost;
  owned.st = starsOf(owned) + 1;
  return { ok: true, cost, stars: owned.st };
}

/** Pengali statistik dari bintang: bintang 1 = x1, bintang 6 = x1.5. */
export const starStatFactor = (stars) => 1 + STAR_STAT_BONUS * (Math.max(1, stars) - 1);
