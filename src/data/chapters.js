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

export const STAGES_PER_CHAPTER = 5;
export const TOTAL_STAGES = CHAPTERS.length * STAGES_PER_CHAPTER;

export const chapterIndexForStage = (stage) => Math.floor((stage - 1) / STAGES_PER_CHAPTER);
export const isBossStage = (stage) => (stage - 1) % STAGES_PER_CHAPTER === STAGES_PER_CHAPTER - 1;
export const stageScaling = (stage) => 1 + .22 * (stage - 1);

/** Jumlah musuh dalam satu stage. */
export function enemyCount(stage) {
  const step = (stage - 1) % STAGES_PER_CHAPTER + 1;
  const chapter = Math.floor((stage - 1) / STAGES_PER_CHAPTER);
  if (step === STAGES_PER_CHAPTER) return 3 + chapter;
  if (step <= 2) return 3;
  if (step <= 4) return 4;
  return 5;
}

/** Deskripsi ringkas musuh untuk daftar stage. */
export function enemySummary(stage) {
  const step = (stage - 1) % STAGES_PER_CHAPTER + 1;
  return isBossStage(stage) ? '1 boss + pengawal' : `${enemyCount(stage)} unit`;
}
