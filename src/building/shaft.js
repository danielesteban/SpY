import {
  BufferGeometry,
  DoubleSide,
  Geometry,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  Vector3,
} from 'three';
import Doors from './doors';

class Shaft extends Mesh {
  constructor({
    elevator,
  }) {
    const { floors, origin } = elevator;
    const merged = new Geometry();
    for (let i = 0; i <= floors; i += 1) {
      if (i === 0 || i === floors) {
        const floor = new PlaneGeometry(1, 1);
        floor.rotateX(Math.PI * -0.5);
        floor.translate(0, i, 0);
        merged.merge(floor);
        if (i === floors) break;
      }
      const back = new PlaneGeometry(1, 1);
      back.translate(0, i + 0.5, -0.5);
      merged.merge(back);
      const side = new PlaneGeometry(1, 1);
      side.rotateY(Math.PI * -0.5);
      side.translate(-0.5, i + 0.5, 0);
      merged.merge(side);
      side.translate(1, 0, 0);
      merged.merge(side);
    }
    merged.scale(Shaft.scale.x, Shaft.scale.y, Shaft.scale.z);
    super(
      (new BufferGeometry()).fromGeometry(merged),
      new MeshPhongMaterial({
        color: Shaft.color,
        side: DoubleSide,
      })
    );
    this.doors = [...Array(floors)].map((v, floor) => {
      const doors = new Doors({ floor });
      this.add(doors);
      return doors;
    });
    this.position.x = origin.x * 4;
    this.position.y = origin.y * 3;
    this.position.z = -1.5 * Shaft.scale.z;
    this.add(elevator);
  }
}

Shaft.color = 0x333333;
Shaft.scale = new Vector3(2, 3, 2);

export default Shaft;
