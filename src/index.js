import Input from '@/engine/input';
import Scene from '@/engine/scene';
import * as Scenes from '@/scenes';

const mount = document.getElementById('mount');
const input = new Input({ mount });
const scene = new Scene({ mount });

let route = window.location.hash.split('/').slice(1)[0];
if (!Scenes[route]) {
  window.location.hash = '/game';
  route = 'game';
}
window.addEventListener('hashchange', () => window.location.reload(), false);

function onLoad() {
  document.body.className = 'loaded';
  Scenes[route]({ input, scene });
  input.touches.once('end', () => {
    document.getElementById('splash').style.display = 'none';
    input.isEnabled = true;
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
