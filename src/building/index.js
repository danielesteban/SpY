import { Object3D } from 'three';
import Elevator from './elevator';
import Hallway from './hallway';
import Road from './road';
import Wall from './wall';
import Walkable from '@/engine/walkable';
import AI from './ai';

class Building extends Object3D {
  constructor({
    elevators,
    floors,
  }) {
    super();
    this.ai = new AI(this);
    this.elevators = elevators.map(({
      floors,
      origin,
    }) => {
      const elevator = new Elevator({ floors, origin });
      elevator.position.x = origin.x * 4;
      elevator.position.y = origin.y * 3;
      this.add(elevator);
      return elevator;
    });
    const width = floors.reduce((width, layout) => Math.max(width, layout.split('').length * 4), 0);
    this.heightmap = [...Array(6)].map(() => [...Array(width)].map(() => (0)));
    this.floors = floors.map((layout, floor) => {
      const buttons = [];
      const elevators = [];
      const meshes = [];
      const rooms = layout.split('');
      const grid = [...Array(4)].map(() => [...Array(rooms.length * 4)].map(() => (1)));
      rooms.forEach((type, room) => {
        let mesh;
        switch (type) {
          case ' ':
            return;
          case '_':
            mesh = new Wall();
            break;
          case '.':
          default: {
            let isEdge = false;
            if (room === 0 || ~[' ', '_'].indexOf(rooms[room - 1])) isEdge = 'left';
            else if (room === rooms.length - 1 || ~[' ', '_'].indexOf(rooms[room + 1])) isEdge = 'right';
            const hasCeiling = floor < floors.length - 1 && [' ', '_'].indexOf(floors[floor + 1].split('')[room]) === -1;
            const elevatorIndex = (
              this.elevators.findIndex(({
                floors,
                origin,
              }) => (
                origin.x === room
                && origin.y <= floor
                && origin.y + floors > floor
              ))
            );
            const hasElevator = ~elevatorIndex;
            if (hasElevator) {
              const elevator = this.elevators[elevatorIndex];
              const doors = elevator.doors[floor - elevator.origin.y];
              buttons.push(doors.callButton);
              elevators.push(doors.collisionMesh);
              meshes.push(doors.collisionMesh);
            }
            mesh = new Hallway({
              hasCeiling,
              hasElevator,
              isEdge,
              isLobby: floor === 0,
            });
            for (let x = 0; x < 4; x += 1) {
              for (let z = 0; z < 6; z += 1) {
                if (z > 1) {
                  this.heightmap[z][(room * 4) + x] = floor * 3;
                } else if (hasElevator && x > 0 && x < 3) {
                  this.heightmap[z][(room * 4) + x] = (floor + 1) * 3;
                }
              }
              for (let y = 0; y < 4; y += 1) {
                grid[y][(room * 4) + x] = 0;
              }
            }
            break;
          }
        }
        mesh.position.set(room * 4, floor * 3, 0);
        this.add(mesh);
        meshes.push(mesh);
      });
      const walkable = new Walkable(grid);
      walkable.position.set(-2, floor * 3, -2);
      this.add(walkable);
      return {
        buttons,
        elevators,
        meshes,
        walkable,
      };
    });
    this.road = new Road();
    this.add(this.road);
  }

  addActor({
    actor,
    floor,
    position,
  }) {
    this.addToGrid({ floor, mesh: actor, position });
    this.ai.addActor({ actor, floor, position });
  }

  addToGrid({
    floor,
    mesh,
    position,
  }) {
    const { floors: { [floor]: { walkable } } } = this;
    walkable.grid.setWalkableAt(position.x, position.z, false);
    mesh.position.set(position.x + 0.5, 0, position.z + 0.5).add(walkable.position);
    this.add(mesh);
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
    const { ai, children } = this;
    ai.onAnimationTick(animation);
    children.forEach((child) => {
      if (child.onAnimationTick) {
        child.onAnimationTick(animation);
      }
    });
  }
}

export default Building;
