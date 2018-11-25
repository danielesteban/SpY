import Dude from '@/actors/dude';
import Building from '@/building';
import ElevatorUI from '@/ui/elevator';
import Marker from '@/items/marker';

export default ({ input, scene }) => {
  // Spawn player
  const player = new Dude({
    arms: 0x222222,
    eyes: 0x990000,
    head: 0x333333,
    legs: 0x222222,
    torso: 0x990000,
  });
  player.position.set(6, 0, 0);
  player.destinationMarker = new Marker();
  scene.root.add(player);
  scene.root.add(player.destinationMarker);
  scene.camera.target = player.position;

  // Spawn test building
  const building = new Building({
    elevators: [
      {
        floors: 2,
        origin: { x: 2, y: 0 },
      },
      {
        floors: 3,
        origin: { x: 4, y: 1 },
      },
    ],
    floors: [
      '  ...',
      ' .._..',
      '..._..',
      '......',
      ' ....',
    ].reverse(),
  });
  scene.root.add(building);
  scene.camera.maxHeight = 2.9;
  scene.camera.testMeshes = building.floors.reduce((floors, { meshes }) => ([
    ...floors,
    ...meshes,
  ]), []);
  scene.rain.position.x = building.heightmap[0].length * 0.5;
  scene.rain.setHeightTest(building.getHeight.bind(building));

  // Spawn some dudes
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
    const { walkable: { grid } } = building.floors[floor];
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
    dude.collisionMesh.floor = floor;
    return dude.collisionMesh;
  }).reduce((floors, dude) => {
    if (!floors[dude.floor]) {
      floors[dude.floor] = [];
    }
    floors[dude.floor].push(dude);
    return floors;
  }, {});

  const elevatorUI = new ElevatorUI();

  // Animation loop
  let floor = 0;
  scene.onAnimationTick = () => {
    const { camera } = scene;
    const { buttons, elevators, walkable } = building.floors[floor];
    const pointer = input.getPointerFrame();
    camera.processInput(pointer);
    if (!pointer.primaryUp) {
      return;
    }
    const raycaster = camera.getRaycaster(pointer.normalized);
    {
      // Dudes interaction
      const hit = raycaster.intersectObjects(dudes[floor] || [])[0];
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
          ), 500);
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
      // Elevators interaction
      const hit = raycaster.intersectObjects(elevators)[0];
      if (hit) {
        const { point, object: { elevator } } = hit;
        const elevatorFloor = floor - elevator.origin.y;
        if (
          elevator.floor === elevatorFloor
          && elevator.doors[elevatorFloor].state === 0
        ) {
          const onDestination = () => {
            input.isEnabled = false;
            const cabin = elevator.cabin.position
              .clone()
              .add(elevator.position);
            player.walk([cabin], () => {
              elevator.doors[elevatorFloor].close();
              elevatorUI.show(elevator, {
                onFloor(target) {
                  elevator.addPassenger(player);
                  elevator.onCall(target, () => {
                    cabin
                      .copy(elevator.cabin.position)
                      .add(elevator.position);
                    cabin.z += 1;
                    player.walk([cabin], () => {
                      floor = elevator.origin.y + target;
                      input.isEnabled = true;
                    });
                  });
                },
                onExit() {
                  elevator.doors[elevatorFloor].open();
                  cabin.z += 1;
                  player.walk([cabin], () => {
                    input.isEnabled = true;
                  });
                },
              });
            });
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
    }
    {
      // Button tapping
      const hit = raycaster.intersectObjects(buttons)[0];
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
      // Walk
      const hit = raycaster.intersectObject(walkable)[0];
      if (hit) {
        const path = walkable.getPath(player.position.clone(), hit.point);
        if (path.length > 1) {
          player.walk(path.slice(1));
        }
      }
    }
  };
};
