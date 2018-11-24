import {
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  Vector3,
  VertexColors,
} from 'three';

class Wall extends Mesh {
  static getGeometry({
    aoTop = true,
    aoBottom = true,
    width = 1,
    height = 1,
    material,
    orientation,
  }) {
    const wall = new PlaneGeometry(
      width,
      height,
      Math.ceil(width * Wall.scale.x),
      Math.ceil(height * (orientation === 'horizontal' ? Wall.scale.x : Wall.scale.y))
    );
    const color = new Color();
    wall.faces.forEach((face, i) => {
      if (i % 2 === 0) {
        color.setHSL(Math.random(), 0.05, 0.25 + (Math.random() * 0.125));
      }
      face.materialIndex = material;
      const vertices = [
        wall.vertices[face.a],
        wall.vertices[face.b],
        wall.vertices[face.c],
      ];
      face.vertexColors = [...Array(3)].map((v, j) => {
        const c = color.clone();
        if (
          (aoTop && Math.abs(vertices[j].y - height * 0.5) < 0.0001)
          || (aoBottom && Math.abs(vertices[j].y - height * -0.5) < 0.0001)
        ) {
          c.offsetHSL(0, 0, -0.1);
        }
        return c;
      });
    });
    if (orientation === 'horizontal') {
      wall.rotateX(Math.PI * -0.5);
    }
    return wall;
  }

  constructor({
    aoTop = false,
    aoBottom = false,
  } = {}) {
    const geometry = Wall.getGeometry({
      aoTop,
      aoBottom,
      orientation: 'vertical',
      material: 0,
    });
    geometry.translate(0, 0.5, -0.5);
    geometry.scale(Wall.scale.x, Wall.scale.y, Wall.scale.z);
    super(
      (new BufferGeometry()).fromGeometry(geometry),
      new MeshPhongMaterial({
        side: DoubleSide,
        vertexColors: VertexColors,
      })
    );
  }
}

Wall.scale = new Vector3(4, 3, 4);

export default Wall;
