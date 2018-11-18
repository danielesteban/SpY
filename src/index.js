import { Vector2, Vector3 } from 'three';
import Dude from '@/actors/dude';
import Scene from '@/engine/scene';

const scene = new Scene({ mount: document.body });

const dude = new Dude();
scene.camera.lookAt(0, -0.5, -1);
scene.camera.target = {
  position: dude.position,
  offset: new Vector3(0, 3, 5),
};
scene.root.add(dude);

const pointer = new Vector2();
scene.mount.addEventListener('mousedown', ({ button, clientX: x, clientY: y }) => {
  if (button !== 0) return;
  const { camera, grid, raycaster } = scene;
  const { width, height } = scene.renderer.getSize();
  pointer.x = ((x / width) * 2) - 1;
  pointer.y = 1 - ((y / height) * 2);
  raycaster.setFromCamera(pointer, camera);
  const hit = scene.raycaster.intersectObject(grid)[0];
  if (!hit) return;
  dude.walkTo(hit.point);
});
