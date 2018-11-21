import Input from '@/engine/input';
import Scene from '@/engine/scene';
import * as Scenes from '@/scenes';

const mount = document.getElementById('mount');
const input = new Input({ mount });
const scene = new Scene({ mount });

input.touches.once('end', () => {
  document.getElementById('splash').style.display = 'none';
  input.isEnabled = true;
});

let route = window.location.hash.split('/').slice(1)[0];
if (!Scenes[route]) {
  window.location.hash = '/game';
  route = 'game';
}
Scenes[route]({ input, scene });
