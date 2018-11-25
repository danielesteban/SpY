import {
  ShaderLib,
  ShaderMaterial,
  UniformsUtils,
} from 'three';

class GridMaterial extends ShaderMaterial {
  constructor({
    color = 0xFFFFFF,
    size = 1,
    subdivisions = 10,
    ...rest
  } = {}) {
    const vertexShader = ShaderLib.lambert.vertexShader.replace(
      '#include <clipping_planes_pars_vertex>',
      [
        '#include <clipping_planes_pars_vertex>',
        'varying vec3 vPosition;',
      ].join('\n')
    ).replace(
      '#include <fog_vertex>',
      [
        '#include <fog_vertex>',
        'vPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;',
      ].join('\n')
    );
    const primaryGrid = 1 / size;
    const secondaryGrid = primaryGrid * subdivisions;
    const fragmentShader = ShaderLib.lambert.fragmentShader.replace(
      '#include <clipping_planes_pars_fragment>',
      [
        '#include <clipping_planes_pars_fragment>',
        'varying vec3 vPosition;',
        'float getGrid(float scale) {',
        ' vec2 coord = vPosition.xz * scale;',
        ' vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);',
        ' return 1.0 - min(min(grid.x, grid.y), 1.0);',
        '}',
      ].join('\n')
    ).replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      [
        `float primaryGrid = getGrid(${primaryGrid}${primaryGrid % 1 === 0 ? '.0' : ''});`,
        `float secondaryGrid = getGrid(${secondaryGrid}${secondaryGrid % 1 === 0 ? '.0' : ''});`,
        'vec3 grid = mix(mix(diffuse, diffuse * 0.95, secondaryGrid), diffuse * 1.15, primaryGrid);',
        'vec4 diffuseColor = vec4(grid, opacity);',
      ].join('\n')
    );
    super({
      name: `grid-material-${size}-${subdivisions}`,
      uniforms: UniformsUtils.clone(ShaderLib.lambert.uniforms),
      fragmentShader,
      vertexShader,
      extensions: { derivatives: true },
      fog: true,
      lights: true,
      ...rest,
    });
    this.color = this.uniforms.diffuse.value;
    this.color.set(color);
  }
}

export default GridMaterial;
