import pako from 'pako';
import ab2str from 'arraybuffer-to-string';
import str2ab from 'string-to-arraybuffer';
import Building from '@/meshes/building';
import EditorUI from '@/ui/editor';
import History from '@/core/history';
import Rain from '@/meshes/rain';
import Starfield from '@/meshes/starfield';

export default ({ input, scene }) => {
  // Scenery
  const rain = new Rain();
  scene.root.add(rain);
  const starfield = new Starfield();
  scene.root.add(starfield);

  // Spawn building
  const stored = localStorage.getItem('SpY::EditorTestLevel');
  const building = new Building(
    stored ? JSON.parse(ab2str(pako.inflate(new Uint8Array(str2ab(stored))))) : {}
  );
  scene.root.add(building);
  rain.position.x = building.heightmap[0].length * 0.5;
  rain.position.z = building.heightmap.length * 0.5;
  rain.setHeightTest(building.getHeight.bind(building));

  // Setup camera
  scene.camera.distance = 10;
  scene.camera.minHeight = 0.2;
  scene.camera.updateOrbit();
  const { width, height } = building.floors[building.activeFloor].grid;
  scene.camera.root.position.set(
    width * 0.5 + 0.5,
    0,
    height * 0.5 + 0.5
  );
  scene.camera.maxDistance = 32;

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

  // UI
  const ui = new EditorUI({
    floorCount: building.floors.length,
    onAddFloor() {
      building.addFloor();
      ui.setFloorCount(building.floors.length);
      ui.setFloor(building.activeFloor);
    },
    onRemoveFloor() {
      // eslint-disable-next-line no-alert
      if (!window.confirm('Remove the current floor?')) {
        return;
      }
      building.removeFloor();
      ui.setFloorCount(building.floors.length);
      ui.setFloor(building.activeFloor);
      history.empty();
    },
    onSave() {
      const meta = building.export();
      const encoded = ab2str(pako.deflate(new Uint8Array(str2ab(JSON.stringify(meta)))), 'base64');
      localStorage.setItem('SpY::EditorTestLevel', encoded);
      ui.setModified(false);
    },
    onImport() {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = () => {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem('SpY::EditorTestLevel', ab2str(reader.result, 'base64'));
          window.location.reload();
        };
        reader.readAsArrayBuffer(input.files[0]);
      };
      input.click();
    },
    onExport() {
      const meta = building.export();
      const blob = new Blob([
        pako.deflate(new Uint8Array(str2ab(JSON.stringify(meta)))),
      ]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SpYEditorLevel.bin';
      a.click();
      setImmediate(() => URL.revokeObjectURL(url));
    },
    onSetFloor(floor) {
      building.activeFloor = floor;
      const { height } = building.floors[building.activeFloor].constructor;
      scene.camera.root.position.y = height * floor;
    },
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
    const hit = raycaster.intersectObjects(floor.intersect)[0];
    if (!hit) {
      return;
    }
    hit.point.addScaledVector(hit.face.normal, -0.5);
    const { color, tool: { tool, modifier } } = ui;
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
      switch (tool) {
        case 'paint': {
          const action = {
            undo() {
              floor.setTile({
                type: currentType,
                color: currentColor,
                x,
                y,
              });
              building.computeHeightmap();
              ui.setModified(true);
            },
            redo() {
              floor.setTile({
                type: modifier,
                color,
                x,
                y,
              });
              building.computeHeightmap();
              ui.setModified(true);
            },
          };
          action.redo();
          history.push(action);
          break;
        }
        case 'pick':
          ui.setColor(currentColor);
          ui.setTool('paint', modifier);
          break;
        default:
          break;
      }
    }
  };
};
