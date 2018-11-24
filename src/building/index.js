import { Object3D } from 'three';
import Elevator from './elevator';
import Hallway from './hallway';
import Walkable from '@/engine/walkable';

class Building extends Object3D {
  constructor({
    elevators,
    floors,
  }) {
    super();
    this.buttons = [];
    this.elevators = elevators.map(({
      floors,
      origin,
    }) => {
      const elevator = new Elevator({ floors, origin });
      elevator.position.x = origin.x * 4;
      elevator.position.y = origin.y * 3;
      this.buttons = [
        ...this.buttons,
        ...elevator.buttons,
      ];
      this.add(elevator);
      return elevator;
    });
    const width = floors.reduce((width, layout) => Math.max(width, layout.split('').length * 4), 0);
    this.heightmap = [...Array(6)].map(() => [...Array(width)].map(() => (0)));
    this.floors = floors.map((layout, floor) => {
      const rooms = layout.split('');
      const grid = [...Array(5)].map(() => [...Array(rooms.length * 4)].map(() => (1)));
      rooms.forEach((type, room) => {
        let isEdge = false;
        if (room === 0) isEdge = 'left';
        else if (room === rooms.length - 1) isEdge = 'right';
        const hasElevator = (
          this.elevators.findIndex(({
            floors,
            origin,
          }) => (
            origin.x === room
            && origin.y <= floor
            && origin.y + floors > floor
          ))
        ) !== -1;
        let mesh;
        switch (type) {
          default:
            mesh = new Hallway({
              hasElevator,
              isEdge,
              isLobby: floor === 0,
            });
            for (let x = 0; x < 4; x += 1) {
              for (let z = 0; z < 6; z += 1) {
                if (z > 1) {
                  this.heightmap[z][(room * 4) + x] = floor * 3;
                } else if (hasElevator && x > 1 && x < 4) {
                  this.heightmap[z][(room * 4) + x] = (floor + 1) * 3;
                }
              }
              for (let y = 1; y < 5; y += 1) {
                grid[y][(room * 4) + x] = 0;
              }
            }
            break;
        }
        mesh.position.set(room * 4, floor * 3, 0);
        this.add(mesh);
      });
      const walkable = new Walkable(grid);
      walkable.position.set(-2, floor * 3, -3);
      this.add(walkable);
      return walkable;
    });
  }

  getHeight(x, z) {
    const { heightmap } = this;
    x = Math.floor(x + 2);
    z = Math.floor(z + 4);
    if (
      x < 0
      || x > heightmap[0].length - 1
      || z < 0
      || z > heightmap.length - 1
    ) {
      return 0;
    }
    return heightmap[z][x];
  }

  onAnimationTick(animation) {
    const { elevators } = this;
    elevators.forEach(elevator => elevator.onAnimationTick(animation));
  }
}

export default Building;
