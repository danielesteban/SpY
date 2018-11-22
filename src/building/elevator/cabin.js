import {
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  VertexColors,
} from 'three';

class Cabin extends Mesh {
  constructor({
    color,
    scale,
  }) {
    const geometry = new BoxGeometry(
      0.9985, 0.9985, 0.9985,
      scale.x, scale.y, scale.z
    );
    const aux = new Color();
    geometry.faces.forEach((face, i) => {
      if (i % 2 === 0) {
        aux.setHSL(Math.random(), 0.05, 0.25 + (Math.random() * 0.125));
      }
      face.color.copy(aux);
    });
    geometry.translate(0, 0.5, 0);
    for (let i = 0; i < 12; i += 1) {
      geometry.faces.splice(40, 1);
    }
    geometry.scale(scale.x, scale.y, scale.z);
    super(
      (new BufferGeometry()).fromGeometry(geometry),
      new MeshPhongMaterial({
        color,
        side: DoubleSide,
        vertexColors: VertexColors,
      })
    );
  }
}

export default Cabin;
