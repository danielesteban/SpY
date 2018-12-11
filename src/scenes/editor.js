import Building from '@/meshes/building';
import Starfield from '@/meshes/starfield';

export default ({ input, scene }) => {
  // Scenery
  const starfield = new Starfield();
  scene.root.add(starfield);

  // Spawn building
  const building = new Building();
  scene.root.add(building);

  // Setup camera
  scene.camera.distance = 8;
  scene.camera.pitch = Math.PI * 0.2;
  scene.camera.tilt = Math.PI * -0.5;
  scene.camera.updateOrbit();
  const { width, height } = building.floors[building.activeFloor].grid;
  scene.camera.root.position.set(
    width * 0.5 + 0.5,
    0,
    height * 0.5 + 0.5
  );
  // scene.camera.maxHeight = 2.9;

  const lastTile = { x: -1, y: -1 };
  scene.onAnimationTick = ({ delta }) => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processPointer(pointer);
    camera.processKeyboard({ ...input.keyboard, delta });
    const raycaster = camera.getRaycaster(pointer.normalized);
    const floor = building.floors[building.activeFloor];
    const hit = raycaster.intersectObject(floor.intersect)[0];
    if (hit) {
      const x = Math.floor(hit.point.x);
      const y = Math.floor(hit.point.z);
      if (pointer.primary && (x !== lastTile.x || y !== lastTile.y)) {
        lastTile.x = x;
        lastTile.y = y;
        floor.setTile({ color: 0xFFFFFF, x, y });
      }
    }
  };
};
