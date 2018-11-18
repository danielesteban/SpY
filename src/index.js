import { Vector2, Vector3 } from 'three';
import Dude from '@/actors/dude';
import Scene from '@/engine/scene';

const scene = new Scene({ mount: document.body });

const pack = {
  dudes: [...Array(7)].map((v, i) => {
    const dude = new Dude({
      arms: 0x222222,
      eyes: i === 0 ? 0x990000 : (0x999999 * Math.random()),
      head: i === 0 ? 0x333333 : (0x999999 * Math.random()),
      legs: 0x222222,
      torso: i === 0 ? 0x990000 : (0x999999 * Math.random()),
    });
    dude.position.set(Math.floor((i + 1) / 2) * ((i + 1) % 2 === 0 ? 1 : -1), 0, 0);
    scene.root.add(dude);
    return dude;
  }),
  walkTo(point) {
    const { x: mainDudeX, z: mainDudeZ } = point;
    this.dudes.forEach((dude, i) => {
      point.x = mainDudeX + Math.floor((i + 1) / 2) * ((i + 1) % 2 === 0 ? 1 : -1);
      point.z = mainDudeZ + Math.floor((i + 1) / 2) * -1;
      if (i > 0) {
        dude.actions.walk.timeScale = 0.75 + Math.random() * 0.4;
      }
      dude.walkTo(point);
    });
  },
};

scene.camera.lookAt(0, -0.5, -1);
scene.camera.target = {
  position: pack.dudes[0].position,
  offset: new Vector3(0, 2, 4),
};

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
  pack.walkTo(hit.point);
});

let z = 0;
setInterval(() => {
  z += 8;
  pack.walkTo(new Vector3(0, 0, z));
}, 3000);
scene.camera.speed = 2;
scene.camera.position.copy(scene.camera.target.offset);
