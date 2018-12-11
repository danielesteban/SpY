import { Grid } from 'pathfinding';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  VertexColors,
  Object3D,
} from 'three';
import GridMaterial from '@/materials/grid';

class Floor extends Object3D {
  constructor(grid) {
    super();
    const { width, height } = Floor.defaultGridSize;
    this.grid = new Grid(width, height);
    this.grid.setTile = function setTile({
      color,
      type,
      x,
      y,
    }) {
      const tile = this.nodes[y][x];
      tile.color = color;
      tile.type = type;
    };
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (grid) {
          // TODO !!!
          console.error('Slow down! Grid loading is not yet implemented!!');
        } else {
          this.grid.setTile({
            x,
            y,
            type: Floor.tiles.air,
          });
        }
      }
    }
    const plane = new PlaneBufferGeometry(width, height, 2, 2);
    plane.rotateX(Math.PI * -0.5);
    plane.translate(width * 0.5, 0, height * 0.5);
    this.intersect = new Mesh(
      plane,
      new MeshBasicMaterial({
        transparent: true,
        visible: false,
      })
    );
    this.add(this.intersect);
    this.tiles = new Mesh(
      new BufferGeometry(),
      new GridMaterial({
        vertexColors: VertexColors,
      })
    );
    this.updateTiles();
    this.add(this.tiles);
    this.isActive = false;
  }

  setTile({ color, x, y }) {
    const { grid } = this;
    if (
      x < 0
      || x > grid.width - 1
      || y < 0
      || y > grid.height - 1
    ) {
      return;
    }
    color = new Color(color);
    const avg = (color.r + color.g + color.b) / 3 * 0.1;
    color.offsetHSL(
      Math.random() * (avg * 2) - avg,
      Math.random() * (avg * 2) - avg,
      Math.random() * (avg * 2) - avg
    );
    grid.setTile({
      x,
      y,
      color,
      type: Floor.tiles.floor,
    });
    this.updateTiles();
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(active) {
    const { intersect, tiles } = this;
    intersect.visible = active;
    tiles.visible = !!(tiles.geometry.getAttribute('position') && active);
    this._isActive = active;
  }

  updateTiles() {
    const { grid, tiles } = this;
    const indices = [];
    const vertices = [];
    const colors = [];
    const normals = [];
    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        const tile = grid.getNodeAt(x, y);
        if (tile.type !== Floor.tiles.air) {
          const offset = vertices.length / 3;
          vertices.push(
            x, 0, y + 1,
            x + 1, 0, y + 1,
            x + 1, 0, y,
            x, 0, y
          );
          const { r, g, b } = tile.color;
          colors.push(
            r, g, b,
            r, g, b,
            r, g, b,
            r, g, b
          );
          normals.push(
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
          );
          indices.push(
            offset, offset + 1, offset + 2,
            offset + 2, offset + 3, offset
          );
        }
      }
    }
    if (!vertices.length) return;
    const { geometry } = tiles;
    let index = geometry.getIndex();
    if (!index) {
      geometry.setIndex(new BufferAttribute(new Uint16Array(), 1));
      index = geometry.getIndex();
    }
    let position = geometry.getAttribute('position');
    if (!position) {
      geometry.addAttribute('position', new BufferAttribute(new Float32Array(), 3));
      position = geometry.getAttribute('position');
    }
    let color = geometry.getAttribute('color');
    if (!color) {
      geometry.addAttribute('color', new BufferAttribute(new Float32Array(), 3));
      color = geometry.getAttribute('color');
    }
    let normal = geometry.getAttribute('normal');
    if (!normal) {
      geometry.addAttribute('normal', new BufferAttribute(new Float32Array(), 3));
      normal = geometry.getAttribute('normal');
    }
    index.setArray(new Uint16Array(indices));
    index.needsUpdate = true;
    position.setArray(new Float32Array(vertices));
    position.needsUpdate = true;
    color.setArray(new Float32Array(colors));
    color.needsUpdate = true;
    normal.setArray(new Float32Array(normals));
    normal.needsUpdate = true;
    if (this.isActive) {
      tiles.visible = true;
    }
  }
}

Floor.tiles = {
  air: 0,
  floor: 1,
};

Floor.defaultGridSize = {
  width: 48,
  height: 48,
};

export default Floor;
