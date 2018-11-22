import { Object3D } from 'three';
import Dude from '@/actors/dude';
import Elevator from './elevator';
import Hallway from './hallway';

class Building extends Object3D {
  constructor({
    dudes,
    elevators,
    floors,
  }) {
    super();
    this.buttons = [];
    this.dudes = dudes.map(({
      pallete,
      position,
    }) => {
      const mesh = new Dude(pallete);
      mesh.position.copy(position);
      this.add(mesh);
      return mesh;
    });
    this.elevators = elevators.map(({
      floors,
      origin,
    }) => {
      const elevator = new Elevator({ floors, origin });
      this.buttons = [
        ...this.buttons,
        ...elevator.buttons,
      ];
      this.add(elevator);
      return elevator;
    });
    this.floors = floors.map((rooms, floor) => rooms.map(({ type }, room) => {
      let isEdge = false;
      if (room === 0) isEdge = 'left';
      else if (room === rooms.length - 1) isEdge = 'right';
      const hasElevator = (
        this.elevators.findIndex(({
          floors,
          origin,
        }) => (
          origin.x === room - Math.floor(rooms.length / 2)
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
      mesh.position.set(room * 4 - (Math.floor(rooms.length / 2) * 4), floor * 3, 0);
      this.add(mesh);
      return mesh;
    }));
  }

  onAnimationTick(animation) {
    const { dudes, elevators } = this;
    dudes.forEach(dude => dude.onAnimationTick(animation));
    elevators.forEach(elevator => elevator.onAnimationTick(animation));
  }
}

export default Building;
