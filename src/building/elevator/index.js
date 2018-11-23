import {
  Object3D,
  Vector3,
} from 'three';
import Cabin from './cabin';
import Doors from './doors';
import Shaft from './shaft';

class Elevator extends Object3D {
  constructor({
    floors,
    origin,
  }) {
    super();
    this.buttons = [];
    this.floors = floors;
    this.origin = origin;
    this.animationStart = Math.random() * 512;

    this.shaft = new Shaft({
      color: Elevator.shaft,
      floors,
      scale: Elevator.scale,
    });
    this.add(this.shaft);

    this.doors = [...Array(floors)].map((v, floor) => {
      const doors = new Doors({
        color: Elevator.doors,
        onCall: () => this.onCall(floor),
        scale: Elevator.scale,
      });
      doors.position.y = floor * Elevator.scale.y;
      this.buttons.push(doors.callButton);
      this.add(doors);
      return doors;
    });

    this.cabin = new Cabin({
      color: Elevator.cabin,
      scale: Elevator.scale,
    });
    this.add(this.cabin);
    this.position.z = -1.5 * Elevator.scale.z;
  }

  onAnimationTick(animation) {
    // const { time } = animation;
    // const { animationStart, floors, cabin: { position: cabin } } = this;
    // const mid = (floors - 1) * Elevator.scale.y * 0.5;
    // cabin.y = mid + (Math.sin((animationStart + time) * 0.5) * mid);
    this.doors.forEach(door => door.onAnimationTick(animation));
  }

  onCall(floor) {
    const { doors } = this;
    // Debug: Door toggle testing
    if (doors[floor].state === Doors.states.OPEN) {
      doors[floor].close();
      return false;
    }
    doors[floor].open();
    return true;
  }
}

Elevator.scale = new Vector3(2, 3, 2);
Elevator.cabin = 0x440000;
Elevator.doors = 0x333333;
Elevator.shaft = 0x333333;

export default Elevator;
