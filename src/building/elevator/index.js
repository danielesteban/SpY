import {
  Math as ThreeMath,
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
      this.add(doors);
      return doors;
    });

    this.cabin = new Cabin({
      color: Elevator.cabin,
      scale: Elevator.scale,
    });
    this.add(this.cabin);
    this.position.z = -1.5 * Elevator.scale.z;
    this.floor = 0;
  }

  onAnimationTick(animation) {
    const { cabin, doors, route } = this;
    if (route) {
      route.step += animation.delta * 0.75;
      if (route.step >= 1) {
        route.step = 1;
        doors[route.to].open();
        this.floor = route.to;
        delete this.route;
      }
      const step = ThreeMath.smoothstep(route.step, 0, 1) * route.travel;
      cabin.position.y = (route.from + step) * Elevator.scale.y;
    }
    doors.forEach(door => door.onAnimationTick(animation));
  }

  onCall(floor) {
    const { route, doors } = this;
    if (route) return;
    if (floor === this.floor) {
      doors[floor].toggle();
      return;
    }
    doors[this.floor].close();
    this.route = {
      from: this.floor,
      to: floor,
      travel: floor - this.floor,
      step: 0,
    };
  }
}

Elevator.scale = new Vector3(2, 3, 2);
Elevator.cabin = 0x440000;
Elevator.doors = 0x333333;
Elevator.shaft = 0x333333;

export default Elevator;
