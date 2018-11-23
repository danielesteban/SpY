import {
  Sprite,
} from 'three';
import SpriteMaterial from '@/materials/sprite';

class Bubble extends Sprite {
  constructor() {
    super(new SpriteMaterial({
      width: 512,
      height: 64,
    }));
    this.scale.set(2, 0.25, 1);
    this.visible = false;
  }

  display(lines, delay = 1500) {
    const { renderer, ctx } = this.material;
    const { width, height } = renderer;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.font = "24px 'Print Char 21',monospace";
    ctx.fillText(lines.shift(), width * 0.5, height * 0.5);
    this.material.map.needsUpdate = true;
    this.visible = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (lines.length) {
        this.display(lines, delay);
        return;
      }
      this.visible = false;
    }, delay);
  }
}

export default Bubble;
