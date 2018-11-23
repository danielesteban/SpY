import {
  CanvasTexture,
  SpriteMaterial as ThreeSprite,
} from 'three';

class SpriteMaterial extends ThreeSprite {
  constructor({ width, height, ...rest }) {
    const renderer = document.createElement('canvas');
    renderer.width = width;
    renderer.height = height;
    const texture = new CanvasTexture(renderer);
    super({
      map: texture,
      ...rest,
    });
    this.renderer = renderer;
    this.ctx = renderer.getContext('2d');
  }
}

export default SpriteMaterial;
