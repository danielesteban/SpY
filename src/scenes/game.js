import Dude from '@/actors/dude';
import ThiccBoi from '@/actors/thiccboi';
import Building from '@/meshes/building';
import ElevatorUI from '@/ui/elevator';
import Marker from '@/meshes/marker';
import Rain from '@/meshes/rain';
import Starfield from '@/meshes/starfield';

export default ({ input, scene }) => {
  // Scenery
  const rain = new Rain();
  scene.root.add(rain);
  const starfield = new Starfield();
  scene.root.add(starfield);

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
        floors: 4,
        origin: { x: 2, y: 0 },
      },
      {
        floors: 4,
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
  rain.position.x = building.heightmap[0].length * 0.5;
  rain.setHeightTest(building.getHeight.bind(building));

  // Spawn some dudes
  const actors = [Dude, ThiccBoi, ThiccBoi];
  const dudes = [...Array(building.floors.length * actors.length)].map(() => {
    const Actor = actors[Math.floor(Math.random() * actors.length)];
    const dude = new Actor({
      arms: 0x222222,
      eyes: 0x999999 * Math.random(),
      hat: Math.random() > 0.5 ? (0x999999 * Math.random()) : false,
      head: 0x999999 * Math.random(),
      legs: 0x222222,
      torso: 0x999999 * Math.random(),
    });
    const floor = Math.floor(Math.random() * building.floors.length);
    const { walkable: { grid } } = building.floors[floor];
    let spawn;
    do {
      spawn = {
        x: Math.floor(Math.random() * grid.width),
        z: Math.floor(Math.random() * (grid.height - 1)),
      };
    } while (!grid.isWalkableAt(spawn.x, spawn.z));
    building.addActor({
      floor,
      actor: dude,
      position: spawn,
    });
    dude.position.y += 0.001;
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
        const from = player.position.clone();
        const to = dude.position.clone();
        to.z += 1;
        const path = walkable.getPath(from, to);
        if (path.length > 1) {
          walkable.grid.setWalkableAt(from.x, from.z, true);
          player.walk(path.slice(1), () => {
            walkable.grid.setWalkableAt(to.x, to.z, false);
            onDestination();
          });
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
                    elevator.removePassenger(player);
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
          const from = player.position.clone();
          const to = point.clone();
          const path = walkable.getPath(from, to);
          if (path.length) {
            walkable.grid.setWalkableAt(from.x, from.z, true);
            if (path.length > 1) {
              player.walk(path.slice(1), onDestination);
            } else {
              onDestination();
            }
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
        const from = player.position.clone();
        const to = point.clone();
        const path = walkable.getPath(from, to);
        if (path.length > 1) {
          walkable.grid.setWalkableAt(from.x, from.z, true);
          player.walk(path.slice(1), () => {
            walkable.grid.setWalkableAt(to.x, to.z, false);
            onDestination();
          });
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
        const from = player.position.clone();
        const to = hit.point.clone();
        const path = walkable.getPath(from, to);
        if (path.length > 1) {
          walkable.grid.setWalkableAt(from.x, from.z, true);
          player.walk(path.slice(1), () => {
            walkable.grid.setWalkableAt(to.x, to.z, false);
          });
        }
      }
    }
  };
};
