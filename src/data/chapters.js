// Bab (chapter), misi, dan musuh.
export const CHAPTERS = [
  { name: 'Hutan Senja',    color: '#4fe08a', elements: ['w', 'a', 'g'], boss: 'Raja Slime',    bossElement: 'w' },
  { name: 'Gurun Volt',     color: '#ffd23f', elements: ['t', 'd', 'a'], boss: 'Ifrit',         bossElement: 'a' },
  { name: 'Menara Cahaya',  color: '#ffe9a3', elements: ['l', 'g', 'd'], boss: 'Naga Nocturne', bossElement: 'd' },
];

export const MOB_NAMES = {
  a: 'Wisp Api',
  w: 'Slime',
  t: 'Golem Volt',
  g: 'Sylph',
  l: 'Ksatria Cahaya',
  d: 'Imp',
};

export const STAGES_PER_CHAPTER = 10;
/** Langkah tengah bab: misi elite (1 elite + pengawal). */
export const ELITE_STEP = 5;
export const TOTAL_STAGES = CHAPTERS.length * STAGES_PER_CHAPTER;

/** Nama misi tiap bab, berurutan untuk langkah 1..(STAGES_PER_CHAPTER - 1). */
export const MISSION_NAMES = [
  [
    'Jejak di Semak',
    'Sarang Slime',
    'Kabut Senja',
    'Reruntuhan Lumut',
    'Penjaga Rimba',
    'Rawa Berbisik',
    'Kunang-Kunang Ajaib',
    'Pusat Hutan',
    'Gerbang Sarang',
  ],
  [
    'Pasir Berdengung',
    'Oase Kering',
    'Badai Debu',
    'Karavan Hilang',
    'Penjaga Oase',
    'Ngarai Petir',
    'Piramida Runtuh',
    'Sungai Lava',
    'Gerbang Kaldera',
  ],
  [
    'Tangga Bercahaya',
    'Aula Gema',
    'Cermin Retak',
    'Perpustakaan Kuno',
    'Penjaga Aula',
    'Jembatan Bintang',
    'Taman Bayangan',
    'Puncak Berawan',
    'Gerbang Malam',
  ],
];

export const chapterIndexForStage = (stage) => Math.floor((stage - 1) / STAGES_PER_CHAPTER);
export const isBossStage = (stage) => (stage - 1) % STAGES_PER_CHAPTER === STAGES_PER_CHAPTER - 1;
export const isEliteStage = (stage) => (stage - 1) % STAGES_PER_CHAPTER === ELITE_STEP - 1;
export const stageScaling = (stage) => 1 + .22 * (stage - 1);

/** Judul misi: nama bertema, prefix Elite di tengah bab, boss di akhir bab. */
export function missionTitle(stage) {
  const chapterIndex = chapterIndexForStage(stage);
  if (isBossStage(stage)) return 'Boss: ' + CHAPTERS[chapterIndex].boss;
  const name =
    MISSION_NAMES[chapterIndex]?.[(stage - 1) % STAGES_PER_CHAPTER] ??
    'Patroli ' + CHAPTERS[chapterIndex].name;
  return isEliteStage(stage) ? 'Elite: ' + name : name;
}

/** Jumlah musuh dalam satu stage. */
export function enemyCount(stage) {
  const step = (stage - 1) % STAGES_PER_CHAPTER + 1;
  const chapter = chapterIndexForStage(stage);
  if (step === STAGES_PER_CHAPTER) return 3 + chapter;
  if (step === ELITE_STEP) return 4;
  if (step <= 2) return 3;
  if (step <= 6) return 4;
  return 5;
}

/** Deskripsi ringkas musuh untuk daftar stage. */
export function enemySummary(stage) {
  if (isBossStage(stage)) return '1 boss + pengawal';
  if (isEliteStage(stage)) return '1 elite + pengawal';
  return `${enemyCount(stage)} unit`;
}
