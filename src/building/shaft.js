import {
  BufferGeometry,
  DoubleSide,
  Geometry,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  Vector3,
} from 'three';

class Shaft extends Mesh {
  constructor({
    floors,
    origin,
  }) {
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
    merged.translate(0, 0, -1.5);
    super(
      (new BufferGeometry()).fromGeometry(merged),
      new MeshPhongMaterial({
        color: Shaft.color,
        side: DoubleSide,
      })
    );
    this.position.x = origin.x * 4;
    this.position.y = origin.y * 3;
    this.scale.copy(Shaft.scale);
  }
}

Shaft.color = 0x333333;
Shaft.scale = new Vector3(2, 3, 2);

export default Shaft;
