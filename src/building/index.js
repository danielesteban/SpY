import { Object3D } from 'three';
import Dude from '@/actors/dude';
import Hallway from './hallway';
import Shaft from './shaft';

class Building extends Object3D {
  constructor({
    dudes,
    elevators,
    floors,
  }) {
    super();
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
      const shaft = new Shaft({ floors, origin });
      this.add(shaft);
      return {
        floors,
        origin,
        shaft,
      };
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
          });
          break;
      }
      mesh.position.set(room * 4 - (Math.floor(rooms.length / 2) * 4), floor * 3, 0);
      this.add(mesh);
      return mesh;
    }));
  }

  onAnimationTick(animation) {
    const { dudes } = this;
    dudes.forEach(dude => dude.onAnimationTick(animation));
  }
}

export default Building;
