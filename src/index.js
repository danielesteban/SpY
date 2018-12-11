import Input from '@/core/input';
import Music from '@/core/music';
import Scene from '@/core/scene';
import * as Scenes from '@/scenes';

const mount = document.getElementById('mount');
const splash = document.getElementById('splash');
const input = new Input({ mount });
const music = new Music({ toggle: document.getElementById('sound') });
const scene = new Scene({ mount });

let route = window.location.hash.split('/').slice(1)[0];
if (!Scenes[route]) {
  window.location.hash = '/game';
  route = 'game';
}
setImmediate(() => window.addEventListener('hashchange', () => window.location.reload(), false));

function onLoad() {
  document.body.className = 'loaded';
  Scenes[route]({ input, scene });
  input.touches.once('end', () => {
    splash.style.display = 'none';
    input.isEnabled = true;
    music.play();
  });
}

function waitForFonts(fonts) {
  let loaded = 0;
  fonts.forEach(({ font, test }) => {
    const fontTester = document.createElement('div');
    fontTester.innerText = test;
    fontTester.style.position = 'absolute';
    fontTester.style.fontFamily = 'sans-serif';
    fontTester.style.top = '-999999px';
    document.body.appendChild(fontTester);
    const { width: initialWidth } = fontTester.getBoundingClientRect();
    fontTester.style.fontFamily = font;
    const check = () => {
      const { width } = fontTester.getBoundingClientRect();
      if (width > initialWidth) {
        document.body.removeChild(fontTester);
        loaded += 1;
        if (loaded === fonts.length) {
          onLoad();
        }
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
}

waitForFonts([
  { font: "'Print Char 21'", test: 'QW@HhsXJ' },
]);

if (window.process && window.process.type) {
  // We're running inside electron.
  // Allow the user to exit with the ESC key.
  window.addEventListener('keydown', ({ keyCode, repeat }) => {
    if (keyCode === 27 && !repeat) {
      if (splash.style.display !== 'none') {
        window.close();
      } else {
        splash.style.display = '';
        input.isEnabled = false;
        input.touches.once('end', () => {
          splash.style.display = 'none';
          input.isEnabled = true;
        });
      }
    }
  }, false);
}
