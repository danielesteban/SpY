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
      tile.walkable = type !== Floor.tiles.tile;
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
    const tile = new BufferGeometry();
    tile.setIndex(new BufferAttribute(new Uint16Array(), 1));
    tile.addAttribute('position', new BufferAttribute(new Float32Array(), 3));
    tile.addAttribute('color', new BufferAttribute(new Float32Array(), 3));
    tile.addAttribute('normal', new BufferAttribute(new Float32Array(), 3));
    this.tiles = new Mesh(
      tile,
      new GridMaterial({
        vertexColors: VertexColors,
      })
    );
    this.updateTiles();
    this.add(this.tiles);
    this.isActive = false;
  }

  setTile({
    color,
    type,
    x,
    y,
  }) {
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
      color,
      type,
      x,
      y,
    });
    this.updateTiles();
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(active) {
    const { intersect, tiles } = this;
    intersect.visible = active;
    tiles.visible = !!(tiles.geometry.getAttribute('position').array.length && active);
    this._isActive = active;
  }

  updateTiles() {
    const { grid, tiles } = this;
    const indices = [];
    const vertices = [];
    const colors = [];
    const normals = [];
    const pushFace = (v, c, n) => {
      const offset = vertices.length / 3;
      vertices.push(...v);
      colors.push(...c);
      normals.push(...n);
      indices.push(
        offset, offset + 1, offset + 2,
        offset + 2, offset + 3, offset
      );
    };
    const isWall = (x, y) => {
      if (x < 0 || x > grid.width - 1 || y < 0 || y > grid.height - 1) {
        return false;
      }
      return grid.getNodeAt(x, y).type === Floor.tiles.wall;
    };
    const wallAO = (x, y, s = 0.2) => (isWall(x, y) ? s : 0);
    const pushTile = (x, y, { r, g, b }) => {
      const ao = [
        1 - Math.min(wallAO(x, y + 1) + wallAO(x - 1, y) + wallAO(x - 1, y + 1, 0.1), 0.4),
        1 - Math.min(wallAO(x, y + 1) + wallAO(x + 1, y) + wallAO(x + 1, y + 1, 0.1), 0.4),
        1 - Math.min(wallAO(x, y - 1) + wallAO(x + 1, y) + wallAO(x + 1, y - 1, 0.1), 0.4),
        1 - Math.min(wallAO(x, y - 1) + wallAO(x - 1, y) + wallAO(x - 1, y - 1, 0.1), 0.4),
      ];
      const vertices = [
        x, 0, y + 1,
        x + 1, 0, y + 1,
        x + 1, 0, y,
        x, 0, y,
      ];
      if (
        ao[0] + ao[2] < ao[1] + ao[3]
      ) {
        const lastV = vertices.splice(9, 3);
        const lastAO = ao.splice(3, 1);
        vertices.unshift(...lastV);
        ao.unshift(...lastAO);
      }
      pushFace(
        vertices,
        [
          r * ao[0], g * ao[0], b * ao[0],
          r * ao[1], g * ao[1], b * ao[1],
          r * ao[2], g * ao[2], b * ao[2],
          r * ao[3], g * ao[3], b * ao[3],
        ],
        [
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
        ]
      );
    };
    const pushWall = (x, y, { r, g, b }) => {
      const height = 3;
      if (!isWall(x, y + 1)) {
        pushFace(
          [
            x, 0, y + 1,
            x + 1, 0, y + 1,
            x + 1, height, y + 1,
            x, height, y + 1,
          ],
          [
            r * 0.8, g * 0.8, b * 0.8,
            r * 0.8, g * 0.8, b * 0.8,
            r, g, b,
            r, g, b,
          ],
          [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
          ]
        );
      }
      if (!isWall(x, y - 1)) {
        pushFace(
          [
            x + 1, 0, y,
            x, 0, y,
            x, height, y,
            x + 1, height, y,
          ],
          [
            r * 0.8, g * 0.8, b * 0.8,
            r * 0.8, g * 0.8, b * 0.8,
            r, g, b,
            r, g, b,
          ],
          [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
          ]
        );
      }
      if (!isWall(x - 1, y)) {
        pushFace(
          [
            x, 0, y,
            x, 0, y + 1,
            x, height, y + 1,
            x, height, y,
          ],
          [
            r * 0.8, g * 0.8, b * 0.8,
            r * 0.8, g * 0.8, b * 0.8,
            r, g, b,
            r, g, b,
          ],
          [
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
          ]
        );
      }
      if (!isWall(x + 1, y)) {
        pushFace(
          [
            x + 1, 0, y + 1,
            x + 1, 0, y,
            x + 1, height, y,
            x + 1, height, y + 1,
          ],
          [
            r * 0.8, g * 0.8, b * 0.8,
            r * 0.8, g * 0.8, b * 0.8,
            r, g, b,
            r, g, b,
          ],
          [
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
          ]
        );
      }
      pushFace(
        [
          x, height, y + 1,
          x + 1, height, y + 1,
          x + 1, height, y,
          x, height, y,
        ],
        [
          r, g, b,
          r, g, b,
          r, g, b,
          r, g, b,
        ],
        [
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
        ]
      );
    };
    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        const tile = grid.getNodeAt(x, y);
        if (tile.type !== Floor.tiles.air) {
          switch (tile.type) {
            case Floor.tiles.wall:
              pushWall(x, y, tile.color);
              break;
            default:
              pushTile(x, y, tile.color);
              break;
          }
        }
      }
    }
    const { geometry } = tiles;
    const index = geometry.getIndex();
    const position = geometry.getAttribute('position');
    const color = geometry.getAttribute('color');
    const normal = geometry.getAttribute('normal');
    index.setArray(new Uint16Array(indices));
    index.needsUpdate = true;
    position.setArray(new Float32Array(vertices));
    position.needsUpdate = true;
    color.setArray(new Float32Array(colors));
    color.needsUpdate = true;
    normal.setArray(new Float32Array(normals));
    normal.needsUpdate = true;
    geometry.computeBoundingSphere();
    if (this.isActive) {
      tiles.visible = true;
    }
  }
}

Floor.tiles = {
  air: 0,
  tile: 1,
  wall: 2,
};

Floor.defaultGridSize = {
  width: 48,
  height: 48,
};

export default Floor;
