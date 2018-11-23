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
  const constraintToFloor = (point) => {
    point.x = Math.min(Math.max(point.x, -9.5), 9.5);
    point.y = floor * 3;
    point.z = Math.min(Math.max(point.z, -1.5), 1.5);
    return point;
  };
  scene.onAnimationTick = () => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processInput(pointer);
    if (pointer.primaryUp) {
      const { raycaster } = pointer;
      raycaster.setFromCamera(pointer.normalized, camera);
      {
        const hit = raycaster.intersectObjects(building.buttons)[0];
        if (hit) {
          const { point, object: button } = hit;
          dude.walkTo(constraintToFloor(point.clone()), () => {
            dude.faceTo(point);
            if (button.tap()) {
              setTimeout(() => {
                setTimeout(() => (
                  dude.say([
                    'Crap!',
                    "It's Broken!",
                    'What a night...',
                  ])
                ), 500);
                const aux = camera.position.clone();
                camera.getWorldPosition(aux);
                dude.faceTo(aux);
              }, 1000);
            }
          });
          return;
        }
      }
      {
        const hit = raycaster.intersectObjects(building.floors[floor])[0];
        if (hit) {
          constraintToFloor(hit.point);
          dude.walkTo(hit.point);
        }
      }
    }
  };
};
