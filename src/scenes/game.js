import Dude from '@/actors/dude';
import Building from '@/building';
import Marker from '@/items/marker';

export default ({ input, scene }) => {
  /* Spawn player */
  const player = new Dude({
    arms: 0x222222,
    eyes: 0x990000,
    head: 0x333333,
    legs: 0x222222,
    torso: 0x990000,
  });
  player.position.set(6, 3, 0);
  player.destinationMarker = new Marker();
  scene.root.add(player);
  scene.root.add(player.destinationMarker);
  scene.camera.maxHeight = 2.9;
  scene.camera.target = player.position;

  /* Spawn test building */
  const building = new Building({
    elevators: [
      {
        floors: 2,
        origin: { x: 1, y: 0 },
      },
      {
        floors: 3,
        origin: { x: 4, y: 1 },
      },
    ],
    floors: [
      '  ...',
      ' .._..',
      ' .._..',
      '......',
      '......',
    ].reverse(),
  });
  scene.root.add(building);
  scene.rain.position.x = building.heightmap[0].length * 0.5;
  scene.rain.setHeightTest(building.getHeight.bind(building));

  /* Spawn some dudes */
  const dudes = [...Array(4)].map(() => {
    const dude = new Dude({
      arms: 0x222222,
      eyes: 0x999999 * Math.random(),
      hat: Math.random() > 0.5 ? (0x999999 * Math.random()) : false,
      head: 0x999999 * Math.random(),
      legs: 0x222222,
      torso: 0x999999 * Math.random(),
    });
    const floor = Math.floor(Math.random() * 2);
    const { grid } = building.floors[floor];
    let spawn;
    do {
      spawn = {
        x: Math.floor(Math.random() * grid.width),
        z: Math.floor(Math.random() * grid.height - 1),
      };
    } while (!grid.isWalkableAt(spawn.x, spawn.z));
    building.addToFloorGrid({
      floor,
      mesh: dude,
      ...spawn,
    });
    return dude.collisionMesh;
  });

  /* Animation loop */
  const floor = 1;
  scene.onAnimationTick = () => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processInput(pointer);
    if (pointer.primaryUp) {
      const { raycaster } = pointer;
      raycaster.setFromCamera(pointer.normalized, camera);
      const walkable = building.floors[floor];
      {
        const hit = raycaster.intersectObjects(dudes)[0];
        if (hit) {
          const { object: { parent: dude } } = hit;
          const lines = [
            'Fuck You',
            'Go away',
            'Leave me alone',
          ];
          const onDestination = () => {
            player.faceTo(dude.position);
            setTimeout(() => (
              dude.say([lines[Math.floor(Math.random() * lines.length)]])
            ), 1000);
          };
          const path = walkable.getPath(player.position.clone(), dude.position.clone());
          if (path.length > 1) {
            player.walk(path.slice(1), onDestination);
          } else if (path.length) {
            onDestination();
          }
          return;
        }
      }
      {
        const hit = raycaster.intersectObjects(walkable.buttons)[0];
        if (hit) {
          const { point, object: button } = hit;
          const onDestination = () => {
            player.faceTo(point);
            button.tap();
          };
          const path = walkable.getPath(player.position.clone(), point.clone());
          if (path.length > 1) {
            player.walk(path.slice(1), onDestination);
          } else if (path.length) {
            onDestination();
          }
          return;
        }
      }
      {
        const hit = raycaster.intersectObject(walkable)[0];
        if (hit) {
          const path = walkable.getPath(player.position.clone(), hit.point);
          if (path.length > 1) {
            player.walk(path.slice(1));
          }
        }
      }
    }
  };
};
