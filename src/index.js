import { Vector3 } from 'three';
import Dude from '@/actors/dude';
import Input from '@/engine/input';
import Scene from '@/engine/scene';

const input = new Input({ mount: document.body });
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
        point.x += (Math.random() * 2) - 1;
        point.z += (Math.random() * 2) - 1;
        dude.actions.walk.timeScale = 0.8 + Math.random() * 0.4;
      }
      dude.walkTo(point);
    });
  },
};

scene.camera.target = pack.dudes[0].position;

scene.onAnimationTick = () => {
  const { camera, grid } = scene;
  const pointer = input.getPointerFrame();
  if (pointer.primaryUp) {
    const { raycaster } = pointer;
    raycaster.setFromCamera(pointer.normalized, camera);
    const hit = raycaster.intersectObject(grid)[0];
    if (!hit) return;
    pack.walkTo(hit.point);
  }
  if (pointer.secondary) {
    const { movement } = pointer;
    const sensitivity = 0.003;
    camera.tilt -= movement.x * sensitivity;
    camera.pitch += movement.y * sensitivity;
    camera.pitch = Math.min(Math.max(camera.pitch, Math.PI * -0.5), Math.PI * 0.5);
    camera.updateOrbit();
  }
  if (pointer.wheel) {
    const sensitivity = 0.006;
    camera.distance = Math.min(Math.max(camera.distance + (pointer.wheel * sensitivity), 1), 16);
    camera.updateOrbit();
  }
};

// Stayin' alive demo hack
// let z = 0;
// setInterval(() => {
//   z += 8;
//   pack.walkTo(new Vector3(z * 0.5, 0, z));
// }, 3000);
// scene.camera.speed = 1.5;
