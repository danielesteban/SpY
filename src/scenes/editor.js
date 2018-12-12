import Building from '@/meshes/building';
import EditorUI from '@/ui/editor';
import Starfield from '@/meshes/starfield';

export default ({ input, scene }) => {
  // Scenery
  const starfield = new Starfield();
  scene.root.add(starfield);

  // Spawn building
  const building = new Building();
  scene.root.add(building);

  // Setup camera
  scene.camera.distance = 10;
  scene.camera.pitch = Math.PI * (1 / 3);
  scene.camera.tilt = Math.PI * -0.5;
  scene.camera.updateOrbit();
  const { width, height } = building.floors[building.activeFloor].grid;
  scene.camera.root.position.set(
    width * 0.5 + 0.5,
    0,
    height * 0.5 + 0.5
  );
  // scene.camera.maxHeight = 2.9;

  // UI
  const ui = new EditorUI();

  const lastTile = { x: -1, y: -1 };
  scene.onAnimationTick = ({ delta }) => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processPointer(pointer);
    camera.processKeyboard({ ...input.keyboard, delta });
    if (!pointer.primary) {
      return;
    }
    const raycaster = camera.getRaycaster(pointer.normalized);
    const floor = building.floors[building.activeFloor];
    const hit = raycaster.intersectObjects([floor.intersect, floor.tiles])[0];
    if (hit) {
      hit.point.addScaledVector(hit.face.normal, -0.5);
      const { tiles } = floor.constructor;
      const { color, tile } = ui;
      const x = Math.floor(hit.point.x);
      const y = Math.floor(hit.point.z);
      if (
        pointer.primaryDown || x !== lastTile.x || y !== lastTile.y
      ) {
        lastTile.x = x;
        lastTile.y = y;
        switch (tile) {
          case tiles.air:
          case tiles.tile:
          case tiles.wall:
            floor.setTile({
              type: tile,
              color,
              x,
              y,
            });
            break;
          default:
            break;
        }
      }
    }
  };
};
