import {
  Object3D,
} from 'three';
import Floor from './floor';

class Building extends Object3D {
  constructor(meta = {}) {
    super();
    this.floors = meta.floors ? (
      meta.floors.map(grid => new Floor(grid))
    ) : [new Floor()];
    this.floors.forEach(floor => this.add(floor));
    this.activeFloor = 0;
  }

  get activeFloor() {
    return this._activeFloor;
  }

  set activeFloor(floor) {
    const { floors } = this;
    if (this._activeFloor !== undefined) {
      floors[this._activeFloor].isActive = false;
    }
    floors[floor].isActive = true;
    this._activeFloor = floor;
  }
}

export default Building;
