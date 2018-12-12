import Building from '@/meshes/building';
import EditorUI from '@/ui/editor';
import History from '@/core/history';
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

  // History
  const history = new History();
  window.addEventListener('keydown', (e) => {
    const {
      ctrlKey,
      keyCode,
      shiftKey,
      target,
    } = e;
    if (
      !ctrlKey
      || keyCode !== 90
      || ~['INPUT', 'TEXTAREA'].indexOf(target.tagName)
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (shiftKey) history.redo();
    else history.undo();
  });

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
    if (!hit) {
      return;
    }
    hit.point.addScaledVector(hit.face.normal, -0.5);
    const { color, tile } = ui;
    const x = Math.floor(hit.point.x);
    const y = Math.floor(hit.point.z);
    if (
      pointer.primaryDown || x !== lastTile.x || y !== lastTile.y
    ) {
      lastTile.x = x;
      lastTile.y = y;
      const current = floor.grid.getNodeAt(x, y);
      const currentType = current.type;
      const currentColor = `#${current.color.getHexString()}`;
      const action = {
        undo() {
          floor.setTile({
            type: currentType,
            color: currentColor,
            x,
            y,
          });
        },
        redo() {
          floor.setTile({
            type: tile,
            color,
            x,
            y,
          });
        },
      };
      action.redo();
      history.push(action);
    }
  };
};
