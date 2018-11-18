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
  Raycaster,
} from 'three';
import Camera from './camera';
import Grid from './grid';

class Scene {
  constructor({
    background = new Color(0x333333),
    mount = document.body,
  } = {}) {
    this.camera = new Camera();
    this.clock = new Clock();
    this.mount = mount;
    this.raycaster = new Raycaster();
    this.renderer = new WebGLRenderer({
      alpha: false,
      antialias: true,
    });
    this.renderer.setAnimationLoop(this.onAnimate.bind(this));
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(background);
    mount.appendChild(this.renderer.domElement);
    this.root = new Root();
    this.root.fog = new FogExp2(background, 0.06);
    this.root.add(new AmbientLight(0x454545));
    const light = new DirectionalLight(0xffffff, 0.8);
    light.position.set(1, 1, 1);
    this.root.add(light);
    const secondaryLight = new DirectionalLight(0xffffff, 0.2);
    secondaryLight.position.set(-1, -1, 1);
    this.root.add(secondaryLight);
    this.grid = new Grid({ background });
    this.root.add(this.grid);
    window.addEventListener('contextmenu', e => e.preventDefault(), false);
    window.addEventListener('resize', this.onResize.bind(this), false);
    this.onResize();
    if (!__PRODUCTION__) {
      this.stats = new Stats();
      this.stats.dom.style.position = 'absolute';
      this.stats.dom.style.left = 'auto';
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
    } = this;
    if (stats) stats.begin();
    const animation = { delta: Math.min(clock.getDelta(), 1), time: clock.oldTime / 1000 };
    if (camera.onAnimationTick) {
      camera.onAnimationTick(animation);
    }
    grid.position.set(Math.floor(camera.position.x), 0, Math.floor(camera.position.z));
    root.children.forEach((child) => {
      if (child.onAnimationTick) {
        child.onAnimationTick(animation);
      }
    });
    renderer.render(root, camera);
    if (stats) stats.end();
  }

  onResize() {
    const {
      camera,
      mount,
      renderer,
    } = this;
    const { width, height } = mount.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
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
