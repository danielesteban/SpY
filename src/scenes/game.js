import { Vector3 } from 'three';
import Dude from '@/actors/dude';
import Hallway from '@/rooms/hallway';
import Shaft from '@/rooms/shaft';
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
  dude.onDestinationCallback = () => {
    scene.camera.getWorldPosition(positionAux);
    dude.faceTo(positionAux);
  };
  scene.root.add(dude);
  scene.root.add(dude.destinationMarker);
  scene.camera.target = dude.position;

  /* Spawn test building */
  const building = {
    dudes: [...Array(4)].map(() => {
      const dude = new Dude({
        arms: 0x222222,
        eyes: 0x999999 * Math.random(),
        head: 0x999999 * Math.random(),
        legs: 0x222222,
        torso: 0x999999 * Math.random(),
      });
      dude.position.set(
        Math.random() * 19 - 9.5,
        Math.floor(Math.random() * 3) * 3,
        0
      );
      return dude;
    }),
    elevators: [],
    floors: [
      [...Array(5)].map((v, i) => {
        const hallway = new Hallway({
          hasElevator: i === 1,
          // eslint-disable-next-line no-nested-ternary
          isEdge: i === 0 ? 'left' : (i === 4 ? 'right' : false),
        });
        hallway.position.set(i * 4 - (2 * 4), 0, 0);
        return hallway;
      }),
      [...Array(5)].map((v, i) => {
        const hallway = new Hallway({
          hasElevator: i === 1 || i === 3,
          // eslint-disable-next-line no-nested-ternary
          isEdge: i === 0 ? 'left' : (i === 4 ? 'right' : false),
        });
        hallway.position.set(i * 4 - (2 * 4), 3, 0);
        return hallway;
      }),
      [...Array(5)].map((v, i) => {
        const hallway = new Hallway({
          hasElevator: i === 3,
          // eslint-disable-next-line no-nested-ternary
          isEdge: i === 0 ? 'left' : (i === 4 ? 'right' : false),
        });
        hallway.position.set(i * 4 - (2 * 4), 6, 0);
        return hallway;
      }),
      [...Array(5)].map((v, i) => {
        const hallway = new Hallway({
          // eslint-disable-next-line no-nested-ternary
          isEdge: i === 0 ? 'left' : (i === 4 ? 'right' : false),
        });
        hallway.position.set(i * 4 - (2 * 4), 9, 0);
        return hallway;
      }),
    ],
    shafts: [
      {
        floors: 2,
        origin: { x: -1, y: 0 },
      },
      {
        floors: 2,
        origin: { x: 1, y: 1 },
      },
    ].map((meta => new Shaft(meta))),
  };

  [
    ...building.dudes,
    ...building.elevators,
    ...building.floors.reduce((floors, floor) => [...floors, ...floor], []),
    ...building.shafts,
  ].forEach(mesh => scene.root.add(mesh));

  /* Animation loop */
  const floor = 1;
  scene.onAnimationTick = () => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    if (camera.processInput(pointer) && !dude.destination) {
      scene.camera.getWorldPosition(positionAux);
      dude.faceTo(positionAux);
    }
    if (pointer.primaryUp) {
      const { raycaster } = pointer;
      raycaster.setFromCamera(pointer.normalized, camera);
      const hit = raycaster.intersectObjects([
        ...building.elevators,
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
