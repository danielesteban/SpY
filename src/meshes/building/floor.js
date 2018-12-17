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
import Dude from '@/actors/dude';
import ThiccBoi from '@/actors/thiccboi';
import GridMaterial from '@/materials/grid';
import Door from './door';

const Actors = [Dude, ThiccBoi];

class Floor extends Object3D {
  constructor({ grid, number } = { number: 0 }) {
    super();
    this.setNumber(number);
    this.entities = new Object3D();
    this.entities.position.set(0, 0.1, 0);
    this.add(this.entities);
    const { width, height } = Floor.defaultGridSize;
    this.grid = new Grid(width, height);
    this.grid.setTile = ({
      color,
      type,
      x,
      y,
    }) => {
      const { entities, grid } = this;
      const tile = grid.nodes[y][x];
      if (~[tile.type, type].indexOf(Floor.tiles.actor)) {
        const already = entities.children.findIndex(({ spawn }) => (
          x === spawn.x && y === spawn.y
        ));
        if (~already) {
          entities.remove(entities.children[already]);
        }
      }
      tile.color = color;
      tile.type = type;
      tile.walkable = type !== Floor.tiles.tile;
      switch (type) {
        case Floor.tiles.actor: {
          const Actor = Actors[Math.floor(Math.random() * Actors.length)];
          const actor = new Actor({
            arms: 0x222222,
            eyes: 0x999999 * Math.random(),
            hat: Math.random() > 0.5 ? (0x999999 * Math.random()) : false,
            head: 0x999999 * Math.random(),
            legs: 0x222222,
            torso: 0x999999 * Math.random(),
          });
          actor.spawn = { x, y };
          actor.position.set(x + 0.5, 0, y + 0.5);
          entities.add(actor);
          break;
        }
        case Floor.tiles.door: {
          let { r, g, b } = color;
          const avg = (r + g + b) / 3;
          r += avg * 0.3;
          g += avg * 0.3;
          b += avg * 0.3;
          const door = new Door({
            color: (new Color())
              .setRGB(r, g, b),
          });
          door.spawn = { x, y };
          door.position.set(x + 0.5, 0, y + 0.5);
          entities.add(door);
          break;
        }
        default:
          break;
      }
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
    const intersect = new Mesh(
      plane,
      new MeshBasicMaterial({
        side: DoubleSide,
        transparent: true,
        visible: false,
      })
    );
    this.add(intersect);
    this.intersect = [intersect];
    const material = new GridMaterial({
      vertexColors: VertexColors,
    });
    this.chunks = [...Array(Math.ceil(this.grid.height / Floor.chunkSize.height))].map(() => (
      [...Array(Math.ceil(this.grid.width / Floor.chunkSize.width))].map(() => {
        const geometry = new BufferGeometry();
        geometry.setIndex(new BufferAttribute(new Uint16Array(), 1));
        geometry.addAttribute('position', new BufferAttribute(new Float32Array(), 3));
        geometry.addAttribute('color', new BufferAttribute(new Float32Array(), 3));
        geometry.addAttribute('normal', new BufferAttribute(new Float32Array(), 3));
        const chunk = new Mesh(
          geometry,
          material
        );
        chunk.visible = false;
        this.add(chunk);
        this.intersect.push(chunk);
        return chunk;
      })
    ));
    for (let y = 0; y < this.chunks.length; y += 1) {
      for (let x = 0; x < this.chunks[0].length; x += 1) {
        this.updateChunk(x, y);
      }
    }
  }

  setNumber(number) {
    this.number = number;
    this.position.set(0, Floor.height * number, 0);
  }

  setTile({
    color,
    type,
    x,
    y,
  }) {
    const { chunks, grid } = this;
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
    const chunk = {
      x: Math.floor(x / Floor.chunkSize.width),
      y: Math.floor(y / Floor.chunkSize.height),
    };
    for (
      let cy = Math.max(chunk.y - 1, 0);
      cy <= Math.min(y + 1, chunks.length - 1);
      cy += 1
    ) {
      for (
        let cx = Math.max(chunk.x - 1, 0);
        cx <= Math.min(x + 1, chunks[0].length - 1);
        cx += 1
      ) {
        this.updateChunk(cx, cy);
      }
    }
  }

  testTile(x, y, types) {
    const { grid } = this;
    if (x < 0 || x > grid.width - 1 || y < 0 || y > grid.height - 1) {
      return false;
    }
    return types.indexOf(grid.getNodeAt(x, y).type) !== -1;
  }

  updateChunk(cx, cy) {
    const {
      chunks,
      entities,
      grid,
      number,
    } = this;
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
    const pushBox = (x, y, width, length, height, { r, g, b }, testNeighbor, topAO, z = 0) => {
      const o = {
        x: x + 0.5,
        y: y + 0.5,
      };
      const hw = width * 0.5;
      const hl = length * 0.5;
      const bottomAO = 0.8 + (0.2 * z / Floor.height);
      if (!testNeighbor(x, y + 1)) {
        pushFace(
          [
            o.x - hw, z, o.y + hl,
            o.x + hw, z, o.y + hl,
            o.x + hw, z + height, o.y + hl,
            o.x - hw, z + height, o.y + hl,
          ],
          [
            r * bottomAO, g * bottomAO, b * bottomAO,
            r * bottomAO, g * bottomAO, b * bottomAO,
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
            o.x + hw, z, o.y - hl,
            o.x - hw, z, o.y - hl,
            o.x - hw, z + height, o.y - hl,
            o.x + hw, z + height, o.y - hl,
          ],
          [
            r * bottomAO, g * bottomAO, b * bottomAO,
            r * bottomAO, g * bottomAO, b * bottomAO,
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
            o.x - hw, z, o.y - hl,
            o.x - hw, z, o.y + hl,
            o.x - hw, z + height, o.y + hl,
            o.x - hw, z + height, o.y - hl,
          ],
          [
            r * bottomAO, g * bottomAO, b * bottomAO,
            r * bottomAO, g * bottomAO, b * bottomAO,
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
            o.x + hw, z, o.y + hl,
            o.x + hw, z, o.y - hl,
            o.x + hw, z + height, o.y - hl,
            o.x + hw, z + height, o.y + hl,
          ],
          [
            r * bottomAO, g * bottomAO, b * bottomAO,
            r * bottomAO, g * bottomAO, b * bottomAO,
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
            o.x - hw, z + 0.001, o.y - hl,
            o.x + hw, z + 0.001, o.y - hl,
            o.x + hw, z + 0.001, o.y + hl,
            o.x - hw, z + 0.001, o.y + hl,
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
          o.x - hw, z + height, o.y + hl,
          o.x + hw, z + height, o.y + hl,
          o.x + hw, z + height, o.y - hl,
          o.x - hw, z + height, o.y - hl,
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
    const testTileNeighbor = (x, y) => this.testTile(
      x,
      y,
      [Floor.tiles.door, Floor.tiles.tile, Floor.tiles.wall, Floor.tiles.window]
    );
    const testWallNeighbor = (x, y) => this.testTile(x, y, [Floor.tiles.wall]);
    const testWindowNeighbor = (x, y) => this.testTile(x, y, [
      Floor.tiles.wall,
      Floor.tiles.window,
    ]);
    const tileAO = (x, y, s = 0.2) => (
      this.testTile(x, y, [Floor.tiles.wall, Floor.tiles.window]) ? s : 0
    );
    const windowAO = (x, y, s = 0.2) => (
      this.testTile(x, y, [Floor.tiles.wall]) ? s : 0
    );
    const pushTile = (x, y, color) => (
      pushBox(x, y, 1, 1, 0.1, color, testTileNeighbor, [
        1 - Math.min(tileAO(x, y + 1) + tileAO(x - 1, y) + tileAO(x - 1, y + 1, 0.1), 0.4),
        1 - Math.min(tileAO(x, y + 1) + tileAO(x + 1, y) + tileAO(x + 1, y + 1, 0.1), 0.4),
        1 - Math.min(tileAO(x, y - 1) + tileAO(x + 1, y) + tileAO(x + 1, y - 1, 0.1), 0.4),
        1 - Math.min(tileAO(x, y - 1) + tileAO(x - 1, y) + tileAO(x - 1, y - 1, 0.1), 0.4),
      ])
    );
    const pushDoorway = (x, y, color) => {
      pushTile(x, y, color);
      pushBox(
        x,
        y,
        1,
        1,
        Floor.height * (1 / 3),
        color,
        testWindowNeighbor,
        [1, 1, 1, 1],
        Floor.height * (1 / 3) * 2
      );
      entities.children[entities.children.findIndex(({ spawn }) => (
        x === spawn.x && y === spawn.y
      ))].yAxis = (
        this.testTile(x, y + 1, [Floor.tiles.wall, Floor.tiles.door])
        && this.testTile(x, y - 1, [Floor.tiles.wall, Floor.tiles.door])
      );
    };
    const pushWall = (x, y, color) => (
      pushBox(x, y, 1, 1, Floor.height, color, testWallNeighbor, [1, 1, 1, 1])
    );
    const pushWindow = (x, y, color) => {
      pushBox(x, y, 1, 1, Floor.height * (1 / 3), color, testWindowNeighbor, [
        1 - Math.min(windowAO(x, y + 1) + windowAO(x - 1, y) + windowAO(x - 1, y + 1, 0.1), 0.4),
        1 - Math.min(windowAO(x, y + 1) + windowAO(x + 1, y) + windowAO(x + 1, y + 1, 0.1), 0.4),
        1 - Math.min(windowAO(x, y - 1) + windowAO(x + 1, y) + windowAO(x + 1, y - 1, 0.1), 0.4),
        1 - Math.min(windowAO(x, y - 1) + windowAO(x - 1, y) + windowAO(x - 1, y - 1, 0.1), 0.4),
      ]);
      pushBox(
        x,
        y,
        1,
        1,
        Floor.height * (1 / 3),
        color,
        testWindowNeighbor,
        [1, 1, 1, 1],
        Floor.height * (1 / 3) * 2
      );
    };
    for (
      let y = cy * Floor.chunkSize.height;
      y < Math.min((cy + 1) * Floor.chunkSize.height, grid.height);
      y += 1
    ) {
      for (
        let x = cx * Floor.chunkSize.width;
        x < Math.min((cx + 1) * Floor.chunkSize.width, grid.width);
        x += 1
      ) {
        const tile = grid.getNodeAt(x, y);
        switch (tile.type) {
          case Floor.tiles.air:
            break;
          case Floor.tiles.door:
            pushDoorway(x, y, tile.color);
            break;
          case Floor.tiles.wall:
            pushWall(x, y, tile.color);
            break;
          case Floor.tiles.window:
            pushWindow(x, y, tile.color);
            break;
          case Floor.tiles.dude:
          default:
            pushTile(x, y, tile.color);
            break;
        }
      }
    }
    const mesh = chunks[cy][cx];
    const { geometry } = mesh;
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
    mesh.visible = !!position.count;
  }
}

Floor.height = 3;

Floor.tiles = {
  air: 0,
  tile: 1,
  wall: 2,
  window: 3,
  door: 4,
  actor: 5,
};

Floor.defaultGridSize = {
  width: 48,
  height: 48,
};

Floor.chunkSize = {
  width: 16,
  height: 16,
};

export default Floor;
