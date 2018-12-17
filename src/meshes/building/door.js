import {
  BoxBufferGeometry,
  Mesh,
} from 'three';
import GridMaterial from '@/materials/grid';

class Door extends Mesh {
  constructor({
    color,
  }) {
    const geometry = new BoxBufferGeometry(1, 1.9, 0.2);
    geometry.translate(0, 0.95, 0);
    super(
      geometry,
      new GridMaterial({
        color,
      })
    );
    this.geometries = {
      xAxis: geometry,
      yAxis: geometry.clone(),
    };
    this.geometries.yAxis.rotateY(Math.PI * 0.5);
    this.timeOffset = Math.random() * 100;
  }

  onAnimationTick({ time }) {
    const { position, timeOffset } = this;
    const scale = 1 - Math.max(Math.sin(time * 2 + timeOffset), 0);
    this.scale.set(1, scale, 1);
    position.y = (1 - scale) * 1.9;
  }

  get yAxis() {
    return this._yAxis || false;
  }

  set yAxis(value) {
    const current = this.yAxis;
    this._yAxis = value;
    if (current !== value) {
      this.geometry = this.geometries[value ? 'yAxis' : 'xAxis'];
    }
  }
}

export default Door;
