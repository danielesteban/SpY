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
    this.computeHeightmap();
  }

  onAnimationTick(animation) {
    const { floors } = this;
    floors.forEach(floor => (
      floor.entities.children.forEach(actor => actor.onAnimationTick(animation))
    ));
  }

  computeHeightmap() {
    const { floors } = this;
    const heightmap = [];
    floors.forEach(({ grid: { nodes: row } }, floor) => (
      row.forEach(nodes => (
        nodes.forEach(({ x, y, type }) => {
          if (!heightmap[y]) heightmap[y] = [];
          let height;
          switch (type) {
            case Floor.tiles.tile:
              height = (floor * 3) + 0.1;
              break;
            case Floor.tiles.wall:
            case Floor.tiles.window:
              height = (floor + 1) * 3;
              break;
            default:
              height = 0;
              break;
          }
          heightmap[y][x] = Math.max(heightmap[y][x] || 0, height);
        })
      ))
    ));
    this.heightmap = heightmap;
  }

  getHeight(x, y) {
    const { heightmap } = this;
    x = Math.floor(x);
    y = Math.floor(y);
    if (
      x < 0
      || x > heightmap[0].length - 1
      || y < 0
      || y > heightmap.length - 1
    ) {
      return 0;
    }
    return heightmap[y][x];
  }

  export() {
    const { floors } = this;
    return {
      floors: floors.map(({ grid: { nodes: row } }) => (
        row.map(nodes => (
          nodes.map(({ type, color }) => [
            type & 0xFF,
            Math.floor(color.r * 0xFF) & 0xFF,
            Math.floor(color.g * 0xFF) & 0xFF,
            Math.floor(color.b * 0xFF) & 0xFF,
          ])
        ))
      )),
    };
  }

  addFloor() {
    const { floors, activeFloor } = this;
    const floor = new Floor({ number: activeFloor + 1 });
    floors.splice(activeFloor + 1, 0, floor);
    this.add(floor);
    for (let i = activeFloor + 1; i < floors.length; i += 1) {
      floors[i].setNumber(i);
    }
    this.activeFloor += 1;
  }

  removeFloor() {
    const { floors, activeFloor } = this;
    const [floor] = floors.splice(activeFloor, 1);
    this.remove(floor);
    if (!floors.length) this.addFloor();
    if (!floors[activeFloor]) {
      this.activeFloor -= 1;
    }
    for (let i = activeFloor; i < floors.length; i += 1) {
      floors[i].setNumber(i);
    }
  }
}

export default Building;
