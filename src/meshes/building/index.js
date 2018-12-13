import {
  Object3D,
} from 'three';
import Floor from './floor';

class Building extends Object3D {
  constructor(meta = {}) {
    super();
    this.floors = meta.floors ? (
      meta.floors.map((grid, number) => new Floor({ grid, number }))
    ) : [new Floor()];
    this.floors.forEach(floor => this.add(floor));
    this.activeFloor = 0;
  }

  addFloor() {
    const { floors, activeFloor } = this;
    const floor = new Floor({ number: activeFloor + 1 });
    floors.splice(activeFloor + 1, 0, floor);
    this.add(floor);
  }

  removeFloor() {
    const { floors, activeFloor } = this;
    const [floor] = floors.splice(activeFloor, 1);
    this.remove(floor);
    if (!floors.length) this.addFloor();
    if (!floors[activeFloor]) {
      this._activeFloor = this._activeFloor - 1;
    }
    floors[this._activeFloor].setNumber(this._activeFloor);
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
