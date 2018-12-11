import Building from '@/meshes/building';
import Marker from '@/meshes/marker';
import Starfield from '@/meshes/starfield';

export default ({ input, scene }) => {
  // Scenery
  const starfield = new Starfield();
  scene.root.add(starfield);

  // Setup camera
  scene.camera.distance = 10;
  scene.camera.pitch = Math.PI * 0.2;
  scene.camera.updateOrbit();
  // scene.camera.maxHeight = 2.9;

  // Spawn building
  const building = new Building();
  scene.root.add(building);

  // Spawn marker
  const marker = new Marker();
  scene.root.add(marker);

  scene.onAnimationTick = ({ delta }) => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processPointer(pointer);
    camera.processKeyboard({ ...input.keyboard, delta });
    const raycaster = camera.getRaycaster(pointer.normalized);
    const hit = raycaster.intersectObject(scene.grid)[0];
    marker.visible = !!hit;
    if (hit) {
      marker.position.set(
        Math.floor(hit.point.x) + 0.5,
        0,
        Math.floor(hit.point.z) + 0.5
      );
    }
  };
};
