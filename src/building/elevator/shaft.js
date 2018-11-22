import {
  BufferGeometry,
  DoubleSide,
  Geometry,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
} from 'three';

class Shaft extends Mesh {
  constructor({
    color,
    floors,
    scale,
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
    merged.scale(scale.x, scale.y, scale.z);
    super(
      (new BufferGeometry()).fromGeometry(merged),
      new MeshPhongMaterial({
        color,
        side: DoubleSide,
      })
    );
  }
}

export default Shaft;
