export default ({ input, scene }) => {
  scene.camera.distance = 6;
  scene.camera.pitch = Math.PI * 0.125;
  scene.camera.updateOrbit();

  scene.onAnimationTick = () => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processInput(pointer);
  };
};
