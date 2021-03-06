import {
  BufferGeometry,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from 'three';

import { AStarFinder, Grid } from 'pathfinding';

class Walkable extends Mesh {
  constructor(grid) {
    const geometry = new Geometry();
    const floor = new PlaneGeometry(1024, 1024, 2, 2);
    floor.rotateX(Math.PI * -0.5);
    floor.translate(0, 0, 512);
    const intersect = new PlaneGeometry(1024, 1024, 2, 2);
    intersect.translate(0, 512, 0);
    geometry.merge(floor);
    geometry.merge(intersect);
    super(
      (new BufferGeometry()).fromGeometry(geometry),
      new MeshBasicMaterial({
        transparent: true,
        visible: false,
      })
    );
    this.finder = new AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true,
    });
    this.grid = new Grid(grid);
  }

  getPath(from, to) {
    const { grid, finder } = this;
    from = this.worldToGrid(from);
    to = this.worldToGrid(to);
    return finder.findPath(from.x, from.z, to.x, to.z, grid.clone()).map(([x, z]) => (
      this.localToWorld(new Vector3(x + 0.5, 0, z + 0.5))
    ));
  }

  worldToGrid(point) {
    const { grid, position } = this;
    point.y = position.y;
    this.worldToLocal(point);
    point.x = Math.floor(Math.min(Math.max(point.x, 0), grid.width - 1));
    point.z = Math.floor(Math.min(Math.max(point.z, 0), grid.height - 1));
    return point;
  }
}

export default Walkable;
