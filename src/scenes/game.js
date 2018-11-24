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
  dude.position.set(6, 3, 0);
  dude.destinationMarker = new Marker();
  scene.root.add(dude);
  scene.root.add(dude.destinationMarker);
  scene.camera.maxHeight = 2.9;
  scene.camera.target = dude.position;

  /* Spawn test building */
  const building = new Building({
    elevators: [
      {
        floors: 2,
        origin: { x: 1, y: 0 },
      },
      {
        floors: 2,
        origin: { x: 4, y: 1 },
      },
    ],
    floors: [
      '.....',
      '.....',
      '.....',
      '.....',
    ],
  });
  scene.root.add(building);

  /* Animation loop */
  const floor = 1;
  // const constraintToFloor = (point) => {
  //   point.x = Math.min(Math.max(point.x, -1.5), 17.5);
  //   point.y = floor * 3;
  //   point.z = Math.min(Math.max(point.z, -1.5), 1.5);
  //   return point;
  // };
  scene.onAnimationTick = () => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processInput(pointer);
    if (pointer.primaryUp) {
      const { raycaster } = pointer;
      raycaster.setFromCamera(pointer.normalized, camera);
      const walkable = building.floors[floor];
      {
        const hit = raycaster.intersectObjects(building.buttons)[0];
        if (hit) {
          const { point, object: button } = hit;
          const path = walkable.getPath(dude.position.clone(), point);
          if (path.length) {
            dude.walkTo(path, () => {
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
          }
          return;
        }
      }
      {
        const hit = raycaster.intersectObject(walkable)[0];
        if (hit) {
          const path = walkable.getPath(dude.position.clone(), hit.point);
          if (path.length) {
            dude.walkTo(path);
          }
        }
      }
    }
  };
};
