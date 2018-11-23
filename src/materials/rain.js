import {
  ShaderLib,
  ShaderMaterial,
  UniformsUtils,
} from 'three';

class RainMaterial extends ShaderMaterial {
  constructor({
    color = 0xFFFFFF,
    ...rest
  } = {}) {
    const vertexShader = ShaderLib.basic.vertexShader.replace(
      '#include <clipping_planes_pars_vertex>',
      [
        '#include <clipping_planes_pars_vertex>',
        'attribute vec3 offset;',
      ].join('\n')
    ).replace(
      '#include <begin_vertex>',
      [
        'vec3 transformed = vec3(position + offset);',
      ].join('\n')
    );
    super({
      name: 'rain-material',
      uniforms: UniformsUtils.clone(ShaderLib.basic.uniforms),
      fragmentShader: ShaderLib.basic.fragmentShader,
      vertexShader,
      fog: true,
      ...rest,
    });
    this.color = this.uniforms.diffuse.value;
    this.color.set(color);
  }
}

export default RainMaterial;
