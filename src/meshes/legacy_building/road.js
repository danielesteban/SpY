import {
  BufferGeometry,
  Geometry,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  VertexColors,
} from 'three';

class Road extends Mesh {
  constructor() {
    const geometry = new Geometry();
    const track = new PlaneGeometry(512, 4);
    track.rotateX(Math.PI * -0.5);
    track.faces.forEach((face) => {
      face.color.set(0x222233);
      face.materialIndex = 0;
    });
    const markings = new PlaneGeometry(1, 0.2);
    markings.rotateX(Math.PI * -0.5);
    markings.faces.forEach((face) => {
      face.color.set(0xBEBEBE);
      face.materialIndex = 0;
    });
    for (let x = -128; x < 128; x += 5) {
      geometry.merge(
        markings.clone().translate(x, 0.001, 0)
      );
    }
    geometry.merge(track);
    geometry.translate(0, 0, 4);
    super(
      (new BufferGeometry()).fromGeometry(geometry),
      new MeshLambertMaterial({
        vertexColors: VertexColors,
      })
    );
  }
}

export default Road;
