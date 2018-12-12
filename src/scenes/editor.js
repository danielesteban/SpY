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

  // UI
  const ui = new EditorUI();
  ui.onToolChange = (tool) => { input.keyboard.tool = tool; };

  const lastTile = { x: -1, y: -1, tool: -1 };
  scene.onAnimationTick = ({ delta }) => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processPointer(pointer);
    camera.processKeyboard({ ...input.keyboard, delta });
    if (ui.tool !== input.keyboard.tool) {
      ui.setTool(input.keyboard.tool);
    }
    if (!pointer.primary) {
      return;
    }
    const raycaster = camera.getRaycaster(pointer.normalized);
    const floor = building.floors[building.activeFloor];
    const hit = raycaster.intersectObjects([floor.intersect, floor.tiles])[0];
    if (hit) {
      const { tiles } = floor.constructor;
      const { tool } = input.keyboard;
      hit.point.addScaledVector(
        hit.face.normal,
        ~[tiles.air, tiles.tile].indexOf(tool) ? -0.5 : 0.5
      );
      const x = Math.floor(hit.point.x);
      const y = Math.floor(hit.point.z);
      const tile = floor.grid.getNodeAt(x, y);
      if (
        pointer.primaryDown
        || (
          ~[tiles.air, tiles.tile].indexOf(tool)
          && ~[tiles.air, tiles.tile].indexOf(tile.type)
          && (x !== lastTile.x || y !== lastTile.y)
        )
      ) {
        lastTile.x = x;
        lastTile.y = y;
        lastTile.tool = tool;
        switch (tool) {
          case tiles.air:
          case tiles.tile:
          case tiles.wall:
            floor.setTile({
              type: tool,
              color: ui.color.value,
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
