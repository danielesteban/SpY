import {
  BufferGeometry,
  Color,
  DoubleSide,
  Geometry,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  Vector3,
  VertexColors,
} from 'three';
import GridMaterial from '@/materials/grid';

class Hallway extends Mesh {
  static generateWall({
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
      Math.ceil(width * Hallway.scale.x),
      Math.ceil(height * (orientation === 'horizontal' ? Hallway.scale.x : Hallway.scale.y))
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
    hasElevator = false,
    isEdge = false,
    isLobby = false,
  } = {}) {
    const merged = new Geometry();
    const floor = Hallway.generateWall({
      aoBottom: !isLobby,
      material: 0,
      orientation: 'horizontal',
    });
    merged.merge(floor);
    if (hasElevator) {
      const wall = Hallway.generateWall({
        width: 0.25,
        material: 1,
      });
      wall.translate(-0.375, 0.5, -0.5);
      merged.merge(wall);
      wall.translate(0.75, 0, 0);
      merged.merge(wall);
    } else {
      const wall = Hallway.generateWall({
        material: 1,
      });
      wall.translate(0, 0.5, -0.5);
      merged.merge(wall);
    }
    if (!isLobby) {
      const wall = Hallway.generateWall({
        aoTop: false,
        height: 1 / 3,
        material: 1,
      });
      wall.rotateY(Math.PI);
      wall.translate(0, 1 / 3 / 2, 0.5);
      merged.merge(wall);
      if (isEdge) {
        const wall = Hallway.generateWall({
          aoTop: false,
          height: 1 / 3,
          material: 1,
        });
        wall.rotateY(Math.PI * 0.5 * (isEdge === 'left' ? 1 : -1));
        wall.translate(isEdge === 'left' ? -0.5 : 0.5, 1 / 3 / 2, 0);
        merged.merge(wall);
      }
    }
    super(
      (new BufferGeometry()).fromGeometry(merged),
      [
        new GridMaterial({
          side: DoubleSide,
          vertexColors: VertexColors,
        }),
        new MeshPhongMaterial({
          side: DoubleSide,
          vertexColors: VertexColors,
        }),
      ]
    );
    this.scale.copy(Hallway.scale);
  }
}

Hallway.scale = new Vector3(4, 3, 4);

export default Hallway;
