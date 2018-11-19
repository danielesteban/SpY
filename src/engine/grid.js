import {
  Color,
  Mesh,
  PlaneBufferGeometry,
} from 'three';
import GridMaterial from '@/materials/grid';

class Grid extends Mesh {
  constructor({
    background = new Color(0xFFFFFF),
    size = 1,
    subdivisions = 10,
  } = {}) {
    const geometry = new PlaneBufferGeometry(2048, 2048, 2, 2);
    geometry.translate(0, 0, -0.01);
    geometry.rotateX(Math.PI * -0.5);
    super(
      geometry,
      new GridMaterial({
        size,
        subdivisions,
      })
    );
    this.material.color.set(background);
  }
}

export default Grid;
