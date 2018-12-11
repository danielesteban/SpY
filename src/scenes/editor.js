export default ({ input, scene }) => {
  scene.camera.maxHeight = 2.9;
  scene.onAnimationTick = ({ delta }) => {
    const { camera } = scene;
    const pointer = input.getPointerFrame();
    camera.processPointer(pointer);
    camera.processKeyboard({ ...input.keyboard, delta });
  };
};
