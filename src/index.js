import Input from '@/engine/input';
import Scene from '@/engine/scene';
import * as Scenes from '@/scenes';

const mount = document.getElementById('mount');
const input = new Input({ mount });
const scene = new Scene({ mount });

input.touches.once('start', () => {
  document.getElementById('credits').style.display = 'none';
});

let route = window.location.hash.split('/').slice(1)[0];
if (!Scenes[route]) {
  window.location.hash = '/debug';
  route = 'debug';
}
Scenes[route]({ input, scene });
