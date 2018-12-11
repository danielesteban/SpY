import {
  BufferGeometry,
  Color,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  VertexColors,
} from 'three';

class Building extends Mesh {
  constructor() {
    const floor = new PlaneGeometry(
      16,
      8,
      16,
      8
    );
    const color = new Color();
    floor.faces.forEach((face, i) => {
      if (i % 2 === 0) {
        color.setHSL(Math.random(), 0.05, 0.25 + (Math.random() * 0.125));
      }
      face.materialIndex = 0;
      face.vertexColors = [...Array(3)].map(() => color);
    });
    floor.rotateX(Math.PI * -0.5);
    super(
      (new BufferGeometry()).fromGeometry(floor),
      new MeshPhongMaterial({
        vertexColors: VertexColors,
      })
    );
  }
}

export default Building;
