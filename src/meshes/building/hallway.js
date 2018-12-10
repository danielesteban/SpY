import {
  BufferGeometry,
  DoubleSide,
  Geometry,
  Mesh,
  MeshPhongMaterial,
  VertexColors,
} from 'three';
import GridMaterial from '@/materials/grid';
import Wall from './wall';

class Hallway extends Mesh {
  constructor({
    hasCeiling,
    hasElevator,
    isEdge,
    isLobby,
  }) {
    const merged = new Geometry();
    const floor = Wall.getGeometry({
      aoBottom: !isLobby,
      material: 0,
      orientation: 'horizontal',
    });
    merged.merge(floor);
    if (hasElevator) {
      const wall = Wall.getGeometry({
        aoTop: hasCeiling,
        width: 0.25,
        material: 1,
      });
      wall.translate(-0.375, 0.5, -0.5);
      merged.merge(wall);
      wall.translate(0.75, 0, 0);
      merged.merge(wall);
    } else {
      const wall = Wall.getGeometry({
        aoTop: hasCeiling,
        material: 1,
      });
      wall.translate(0, 0.5, -0.5);
      merged.merge(wall);
    }
    if (!isLobby) {
      const wall = Wall.getGeometry({
        aoTop: false,
        height: 1 / 3,
        material: 1,
      });
      wall.rotateY(Math.PI);
      wall.translate(0, 1 / 3 / 2, 0.5);
      merged.merge(wall);
      if (isEdge) {
        const wall = Wall.getGeometry({
          aoTop: false,
          height: 1 / 3,
          material: 1,
        });
        wall.rotateY(Math.PI * 0.5 * (isEdge === 'left' ? 1 : -1));
        wall.translate(isEdge === 'left' ? -0.5 : 0.5, 1 / 3 / 2, 0);
        merged.merge(wall);
      }
    }
    merged.scale(Wall.scale.x, Wall.scale.y, Wall.scale.z);
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
  }
}

export default Hallway;
