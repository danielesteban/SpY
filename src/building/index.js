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
            break;
        }
        mesh.position.set(room * 4, floor * 3, 0);
        this.add(mesh);
        for (let y = 1; y < 5; y += 1) {
          for (let x = (room * 4); x < ((room + 1) * 4); x += 1) {
            grid[y][x] = 0;
          }
        }
      });
      const walkable = new Walkable(grid);
      walkable.position.set(-2, floor * 3, -3);
      this.add(walkable);
      return walkable;
    });
  }

  onAnimationTick(animation) {
    const { elevators } = this;
    elevators.forEach(elevator => elevator.onAnimationTick(animation));
  }
}

export default Building;
