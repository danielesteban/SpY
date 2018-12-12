import Stats from 'stats.js';
import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  FogExp2,
  InterpolateSmooth,
  QuaternionKeyframeTrack,
  Scene as Root,
  ShaderChunk,
  VectorKeyframeTrack,
  WebGLRenderer,
} from 'three';
import Camera from './camera';
import Grid from '@/meshes/grid';
import Vignette from './vignette';

class Scene {
  constructor({
    mount = document.body,
  } = {}) {
    this.camera = new Camera();
    this.clock = new Clock();
    this.mount = mount;
    this.renderer = new WebGLRenderer({
      alpha: false,
      antialias: true,
    });
    this.renderer.autoClear = false;
    this.renderer.setAnimationLoop(this.onAnimate.bind(this));
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    const sky = new Color(0x334455);
    this.renderer.setClearColor(sky);
    mount.appendChild(this.renderer.domElement);
    this.root = new Root();
    this.root.fog = new FogExp2(sky, 0.03);
    this.root.add(new AmbientLight(0x666666));
    const light = new DirectionalLight(0xffffff, 0.3);
    light.position.set(1, 0.5, 1);
    this.root.add(light);
    const secondaryLight = new DirectionalLight(0xffffff, 0.2);
    secondaryLight.position.set(-1, -0.5, 1);
    this.root.add(secondaryLight);
    this.root.add(this.camera.root);
    this.grid = new Grid({ background: new Color(0x333344) });
    this.root.add(this.grid);
    this.vignette = new Vignette();
    window.addEventListener('resize', this.onResize.bind(this), false);
    this.onResize();
    if (!__PRODUCTION__) {
      this.stats = new Stats();
      this.stats.dom.style.position = 'absolute';
      this.stats.dom.style.top = 'auto';
      this.stats.dom.style.left = 'auto';
      this.stats.dom.style.bottom = '0';
      this.stats.dom.style.right = '0';
      mount.style.position = 'relative';
      mount.appendChild(this.stats.dom);
    }
  }

  onAnimate() {
    const {
      clock,
      camera,
      grid,
      renderer,
      root,
      stats,
      vignette,
    } = this;
    if (stats) stats.begin();
    const animation = { delta: Math.min(clock.getDelta(), 1), time: clock.oldTime / 1000 };
    if (this.onAnimationTick) {
      this.onAnimationTick(animation);
    }
    root.children.forEach((child) => {
      if (child.onAnimationTick) {
        child.onAnimationTick(animation);
      }
    });
    if (camera.onAnimationTick) {
      camera.onAnimationTick(animation);
    }
    grid.position.set(camera.root.position.x, 0, camera.root.position.z);
    renderer.clear();
    renderer.render(root, camera);
    vignette.render(renderer);
    if (stats) stats.end();
  }

  onResize() {
    const {
      camera,
      mount,
      renderer,
      vignette,
    } = this;
    const { width, height } = mount.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    vignette.onResize({ width, height });
  }

  static fixThreeJSFog() {
    ShaderChunk.fog_pars_vertex = ShaderChunk.fog_pars_vertex.replace(
      'varying float fogDepth;',
      'varying vec4 fogDepth;'
    );
    ShaderChunk.fog_vertex = ShaderChunk.fog_vertex.replace(
      'fogDepth = -mvPosition.z;',
      'fogDepth = mvPosition;'
    );
    ShaderChunk.fog_pars_fragment = ShaderChunk.fog_pars_fragment.replace(
      'varying float fogDepth;',
      'varying vec4 fogDepth;'
    );
    ShaderChunk.fog_fragment = ShaderChunk.fog_fragment.replace(
      'float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );',
      [
        'float fogDist = length(fogDepth);',
        'float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDist * fogDist * LOG2 ) );',
      ].join('\n')
    ).replace(
      'float fogFactor = smoothstep( fogNear, fogFar, fogDepth );',
      'float fogFactor = smoothstep( fogNear, fogFar, length(fogDepth) );'
    );
  }
}

Scene.fixThreeJSFog();
QuaternionKeyframeTrack.DefaultInterpolation = InterpolateSmooth;
VectorKeyframeTrack.DefaultInterpolation = InterpolateSmooth;

export default Scene;
