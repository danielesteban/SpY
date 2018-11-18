import Dude from '@/actors/dude';
import Marker from '@/items/marker';

export default ({ input, scene }) => {
  const dude = new Dude({
    arms: 0x222222,
    eyes: 0x990000,
    head: 0x333333,
    legs: 0x222222,
    torso: 0x990000,
  });
  dude.destinationMarker = new Marker();
  scene.root.add(dude);
  scene.root.add(dude.destinationMarker);
  scene.camera.target = dude.position;

  scene.onAnimationTick = () => {
    const { camera, grid } = scene;
    const pointer = input.getPointerFrame();
    if (pointer.primaryUp) {
      const { raycaster } = pointer;
      raycaster.setFromCamera(pointer.normalized, camera);
      const hit = raycaster.intersectObject(grid)[0];
      if (!hit) return;
      dude.walkTo(hit.point);
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
