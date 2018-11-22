import { Vector3 } from 'three';
import Dude from '@/actors/dude';
import Building from '@/building';
import Marker from '@/items/marker';

export default ({ input, scene }) => {
  /* Spawn main dude */
  const dude = new Dude({
    arms: 0x222222,
    eyes: 0x990000,
    head: 0x333333,
    legs: 0x222222,
    torso: 0x990000,
  });
  dude.position.set(2, 3, 0);
  dude.destinationMarker = new Marker();
  const positionAux = new Vector3();
  let timer;
  dude.onDestinationCallback = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (dude.destination) return;
      scene.camera.getWorldPosition(positionAux);
      dude.faceTo(positionAux);
    }, 5000);
  };
  scene.root.add(dude);
  scene.root.add(dude.destinationMarker);
  scene.camera.maxHeight = 2.9;
  scene.camera.target = dude.position;

  /* Spawn test building */
  const building = new Building({
    dudes: [...Array(4)].map(() => ({
      pallete: {
        arms: 0x222222,
        eyes: 0x999999 * Math.random(),
        head: 0x999999 * Math.random(),
        legs: 0x222222,
        torso: 0x999999 * Math.random(),
      },
      position: new Vector3(
        (Math.random() * 9 - 4.5) * 2,
        Math.floor(Math.random() * 3) * 3,
        0
      ),
    })),
    elevators: [
      {
        floors: 2,
        origin: { x: -1, y: 0 },
      },
      {
        floors: 2,
        origin: { x: 1, y: 1 },
      },
    ],
    floors: [
      [...Array(5)].map(() => ({ type: 'hallway' })),
      [...Array(5)].map(() => ({ type: 'hallway' })),
      [...Array(5)].map(() => ({ type: 'hallway' })),
      [...Array(5)].map(() => ({ type: 'hallway' })),
    ],
  });
  scene.root.add(building);

  /* Animation loop */
  const floor = 1;
  scene.onAnimationTick = () => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    if (camera.processInput(pointer)) {
      dude.onDestinationCallback();
    }
    if (pointer.primaryUp) {
      const { raycaster } = pointer;
      raycaster.setFromCamera(pointer.normalized, camera);
      const hit = raycaster.intersectObjects([
        // ...building.elevators,
        ...building.floors[floor],
      ])[0];
      if (!hit) return;
      hit.point.x = Math.min(Math.max(hit.point.x, -9.5), 9.5);
      hit.point.y = hit.object.position.y;
      hit.point.z = Math.min(Math.max(hit.point.z, -1.5), 1.5);
      dude.walkTo(hit.point);
    }
  };
};
