import {
  ClampToEdgeWrapping,
  NearestFilter,
  LinearFilter,
  Sprite,
  Scene,
  OrthographicCamera,
} from 'three';
import SpriteMaterial from '@/materials/sprite';


class Vignette extends Scene {
  constructor() {
    super();
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.sprite = new SpriteMaterial({
      width: 0,
      height: 0,
    });
    this.sprite.map.wrapS = ClampToEdgeWrapping;
    this.sprite.map.wrapT = ClampToEdgeWrapping;
    this.sprite.map.magFilter = NearestFilter;
    this.sprite.map.minFilter = LinearFilter;
    this.add(new Sprite(this.sprite));
  }

  onResize({ width, height }) {
    const { sprite } = this;
    const { renderer, ctx } = sprite;
    const size = Math.max(width, height);
    renderer.width = size;
    renderer.height = size;
    const grd = ctx.createRadialGradient(
      size * 0.5, size * 0.5, size * 0.6,
      size * 0.5, size * 0.5, size
    );
    grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.fill();
    sprite.map.needsUpdate = true;
  }

  render(renderer) {
    renderer.clearDepth();
    renderer.render(this, this.camera);
  }
}

export default Vignette;
