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
    camera.processInput(pointer);
    if (pointer.primaryUp) {
      const { raycaster } = pointer;
      raycaster.setFromCamera(pointer.normalized, camera);
      const hit = raycaster.intersectObject(grid)[0];
      if (!hit) return;
      dude.walkTo(hit.point);
    }
  };
};
