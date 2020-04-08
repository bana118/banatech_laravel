// run with look-controls component(camera) and movement-controls component(rig)

const JOYSTICK_EPS = 0.2;

module.exports.Component = AFRAME.registerComponent("rotation-controls", {
  schema: {
    // Controller 0-3
    controller: { default: 1, oneOf: [0, 1, 2, 3] },

    // Enable/disable features
    enabled: { default: true },

    // Debugging
    debug: { default: false },

    // Rotation sensitivity
    rotationSensitivity: { default: 2.0 },
  },
  init: function () {
    const sceneEl = this.el.sceneEl;
    this.system = sceneEl.systems['tracked-controls-webxr'] || { controllers: [] };
    this._lookVector = new THREE.Vector2();
  },
  tick: function (t, dt) {
    this.updateRotation(dt);
  },

  /*******************************************************************
   * Rotation
   */

  isRotationActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    const joystick = this._lookVector;

    this.getJoystick(joystick);

    return Math.abs(joystick.x) > JOYSTICK_EPS || Math.abs(joystick.y) > JOYSTICK_EPS;
  },

  updateRotation: function (dt) {
    //console.log(dt);
    if (!this.isRotationActive()) return;
    //this.el.object3D.rotation.y += 1

    const lookVector = this._lookVector;
    this.getJoystick(lookVector);
    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;
    lookVector.multiplyScalar(this.data.rotationSensitivity * dt / 1000);
    this.el.object3D.rotation.y -= lookVector.x;
  },

  /**
   * Returns the Gamepad instance attached to the component. If connected,
   * a proxy-controls component may provide access to Gamepad input from a
   * remote device.
   *
   * @return {Gamepad}
   */
  getGamepad: function () {
    const stdGamepad = navigator.getGamepads
      && navigator.getGamepads()[this.data.controller],
      xrController = this.system.controllers[this.data.controller],
      xrGamepad = xrController && xrController.gamepad,
      proxyControls = this.el.sceneEl.components['proxy-controls'],
      proxyGamepad = proxyControls && proxyControls.isConnected()
        && proxyControls.getGamepad(this.data.controller);
    return proxyGamepad || xrGamepad || stdGamepad;
  },

  /**
   * Returns the state of the specified joystick as a THREE.Vector2.
   * @param  {Joystick} role
   * @param  {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getJoystick: function (target) {
    const gamepad = this.getGamepad();
    if (gamepad.mapping === 'xr-standard') {
      // See: https://github.com/donmccurdy/aframe-extras/issues/307
      return target.set(gamepad.axes[2], gamepad.axes[3]);
    } else {
      return target.set(gamepad.axes[0], gamepad.axes[1]);
    }
  },

  /**
   * Returns true if the gamepad is currently connected to the system.
   * @return {boolean}
   */
  isConnected: function () {
    const gamepad = this.getGamepad();
    return !!(gamepad && gamepad.connected);
  },

  /**
   * Returns a string containing some information about the controller. Result
   * may vary across browsers, for a given controller.
   * @return {string}
   */
  getID: function () {
    return this.getGamepad().id;
  }
});
