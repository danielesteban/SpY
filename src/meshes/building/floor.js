import { Grid } from 'pathfinding';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  VertexColors,
  Object3D,
} from 'three';
import GridMaterial from '@/materials/grid';

class Floor extends Object3D {
  constructor({ grid, number } = { number: 0 }) {
    super();
    this.setNumber(number);
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
          const [type, r, g, b] = grid[y][x];
          this.grid.setTile({
            x,
            y,
            type,
            color: (new Color())
              .setRGB(r / 0xFF, g / 0xFF, b / 0xFF),
          });
        } else {
          this.grid.setTile({
            x,
            y,
            type: Floor.tiles.air,
            color: new Color(0),
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
        side: DoubleSide,
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
    color = new Color(color || 0);
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
    tiles.visible = !!tiles.geometry.getAttribute('position').array.length;
    this._isActive = active;
  }

  setNumber(number) {
    this.number = number;
    this.position.set(0, Floor.height * number, 0);
  }

  updateTiles() {
    const { grid, number, tiles } = this;
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
    const pushBox = (x, y, { r, g, b }, height, testNeighbor, topAO, z = 0) => {
      if (!testNeighbor(x, y + 1)) {
        pushFace(
          [
            x, z, y + 1,
            x + 1, z, y + 1,
            x + 1, z + height, y + 1,
            x, z + height, y + 1,
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
      if (!testNeighbor(x, y - 1)) {
        pushFace(
          [
            x + 1, z, y,
            x, z, y,
            x, z + height, y,
            x + 1, z + height, y,
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
      if (!testNeighbor(x - 1, y)) {
        pushFace(
          [
            x, z, y,
            x, z, y + 1,
            x, z + height, y + 1,
            x, z + height, y,
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
      if (!testNeighbor(x + 1, y)) {
        pushFace(
          [
            x + 1, z, y + 1,
            x + 1, z, y,
            x + 1, z + height, y,
            x + 1, z + height, y + 1,
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
      if (number > 0 || z !== 0) {
        pushFace(
          [
            x, z + 0.001, y,
            x + 1, z + 0.001, y,
            x + 1, z + 0.001, y + 1,
            x, z + 0.001, y + 1,
          ],
          [
            r * 0.6, g * 0.6, b * 0.6,
            r * 0.6, g * 0.6, b * 0.6,
            r * 0.6, g * 0.6, b * 0.6,
            r * 0.6, g * 0.6, b * 0.6,
          ],
          [
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
          ]
        );
      }
      pushFace(
        [
          x, z + height, y + 1,
          x + 1, z + height, y + 1,
          x + 1, z + height, y,
          x, z + height, y,
        ],
        [
          r * topAO[0], g * topAO[0], b * topAO[0],
          r * topAO[1], g * topAO[1], b * topAO[1],
          r * topAO[2], g * topAO[2], b * topAO[2],
          r * topAO[3], g * topAO[3], b * topAO[3],
        ],
        [
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
        ]
      );
    };
    const testType = (x, y, types) => {
      if (x < 0 || x > grid.width - 1 || y < 0 || y > grid.height - 1) {
        return false;
      }
      return types.indexOf(grid.getNodeAt(x, y).type) !== -1;
    };
    const testTileNeighbor = (x, y) => testType(
      x,
      y,
      [Floor.tiles.tile, Floor.tiles.wall, Floor.tiles.window]
    );
    const testWallNeighbor = (x, y) => testType(x, y, [Floor.tiles.wall]);
    const testWindowNeighbor = (x, y) => testType(x, y, [Floor.tiles.wall, Floor.tiles.window]);
    const tileAO = (x, y, s = 0.2) => (
      testType(x, y, [Floor.tiles.wall, Floor.tiles.window]) ? s : 0
    );
    const windowAO = (x, y, s = 0.2) => (
      testType(x, y, [Floor.tiles.wall]) ? s : 0
    );
    const pushTile = (x, y, color) => (
      pushBox(x, y, color, 0.1, testTileNeighbor, [
        1 - Math.min(tileAO(x, y + 1) + tileAO(x - 1, y) + tileAO(x - 1, y + 1, 0.1), 0.4),
        1 - Math.min(tileAO(x, y + 1) + tileAO(x + 1, y) + tileAO(x + 1, y + 1, 0.1), 0.4),
        1 - Math.min(tileAO(x, y - 1) + tileAO(x + 1, y) + tileAO(x + 1, y - 1, 0.1), 0.4),
        1 - Math.min(tileAO(x, y - 1) + tileAO(x - 1, y) + tileAO(x - 1, y - 1, 0.1), 0.4),
      ])
    );
    const pushWall = (x, y, color) => (
      pushBox(x, y, color, Floor.height, testWallNeighbor, [1, 1, 1, 1])
    );
    const pushWindow = (x, y, color) => {
      pushBox(x, y, color, Floor.height * (1 / 3), testWindowNeighbor, [
        1 - Math.min(windowAO(x, y + 1) + windowAO(x - 1, y) + windowAO(x - 1, y + 1, 0.1), 0.4),
        1 - Math.min(windowAO(x, y + 1) + windowAO(x + 1, y) + windowAO(x + 1, y + 1, 0.1), 0.4),
        1 - Math.min(windowAO(x, y - 1) + windowAO(x + 1, y) + windowAO(x + 1, y - 1, 0.1), 0.4),
        1 - Math.min(windowAO(x, y - 1) + windowAO(x - 1, y) + windowAO(x - 1, y - 1, 0.1), 0.4),
      ]);
      pushBox(
        x,
        y,
        color,
        Floor.height * (1 / 3),
        testWindowNeighbor,
        [1, 1, 1, 1],
        Floor.height * (1 / 3) * 2
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
            case Floor.tiles.window:
              pushWindow(x, y, tile.color);
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
    tiles.visible = true;
  }
}

Floor.height = 3;

Floor.tiles = {
  air: 0,
  tile: 1,
  wall: 2,
  window: 3,
};

Floor.defaultGridSize = {
  width: 48,
  height: 48,
};

export default Floor;
