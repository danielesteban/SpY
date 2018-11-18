import Dude from '@/actors/dude';
import Marker from '@/items/marker';

export default ({ input, scene }) => {
  const pack = {
    dudes: [...Array(13)].map((v, i) => {
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

  const [mainDude] = pack.dudes;
  mainDude.destinationMarker = new Marker();
  scene.root.add(mainDude.destinationMarker);
  scene.camera.target = mainDude.position;

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
      camera.pitch = Math.min(Math.max(camera.pitch, 0), Math.PI * 0.5);
      camera.updateOrbit();
    }
    if (pointer.wheel) {
      const sensitivity = 0.006;
      camera.distance = Math.min(Math.max(camera.distance + (pointer.wheel * sensitivity), 1), 16);
      camera.updateOrbit();
    }
  };
};
