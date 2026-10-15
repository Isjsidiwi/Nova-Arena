import './styles/index.css';
import { registerScreen, initNav, go } from './ui/router.js';
import { initParticles } from './ui/particles.js';
import { initHomeScreen, renderHomeScreen } from './ui/screens/home.js';
import { initHeroScreen, renderHeroScreen } from './ui/screens/heroes.js';
import { initGachaScreen, renderGachaScreen } from './ui/screens/gacha.js';
import { initStageScreen, renderStageScreen } from './ui/screens/stages.js';

initParticles();
initNav();

initHomeScreen();
initHeroScreen();
initGachaScreen();
initStageScreen();

registerScreen('home', { render: renderHomeScreen });
registerScreen('hero', { render: renderHeroScreen });
registerScreen('gacha', { render: renderGachaScreen });
registerScreen('stage', { render: renderStageScreen });

go('home');
