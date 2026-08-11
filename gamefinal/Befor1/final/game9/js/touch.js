/**
 * Mobile Touch Controls & Virtual Joystick Handler
 * Multi-touch virtual joystick & action buttons for touchscreen play (Shoot, Aim, Jump, Crouch, Prone, Gloo Wall, Reload, Switch).
 */
class TouchController {
    constructor(player, weaponSys, inventory) {
        this.player = player;
        this.weaponSys = weaponSys;
        this.inventory = inventory;

        this.joystickContainer = document.getElementById('joystick-container');
        this.joystickKnob = document.getElementById('joystick-knob');

        this.isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        this.activeTouchId = null;
        this.cameraTouchId = null;
        this.lastCameraPos = { x: 0, y: 0 };

        this.joystickCenter = { x: 0, y: 0 };
        this.maxRadius = 45;

        if (this.isTouchDevice) {
            document.body.classList.add('is-touch');
            const touchControls = document.getElementById('touch-controls');
            if (touchControls) touchControls.style.display = 'block';
        }

        if (this.joystickContainer) {
            this.setupJoystick();
            this.setupCameraTouchLook();
            this.setupActionButtons();
        }
    }

    setupJoystick() {
        const container = this.joystickContainer;

        const handleStart = (clientX, clientY, id) => {
            if (this.activeTouchId !== null) return;
            this.activeTouchId = id;

            const rect = container.getBoundingClientRect();
            this.joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.updateKnobPosition(clientX, clientY);
        };

        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            handleStart(touch.clientX, touch.clientY, touch.identifier);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.activeTouchId === null) return;
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.activeTouchId) {
                    this.updateKnobPosition(touch.clientX, touch.clientY);
                    break;
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (this.activeTouchId === null) return;
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.activeTouchId) {
                    this.resetJoystick();
                    break;
                }
            }
        });
    }

    setupCameraTouchLook() {
        window.addEventListener('touchstart', (e) => {
            for (let touch of e.changedTouches) {
                if (touch.clientX > window.innerWidth * 0.35 && this.cameraTouchId === null) {
                    const target = touch.target;
                    if (target.classList.contains('touch-btn') || target.closest('#joystick-container')) {
                        continue;
                    }
                    this.cameraTouchId = touch.identifier;
                    this.lastCameraPos = { x: touch.clientX, y: touch.clientY };
                }
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.cameraTouchId === null) return;
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.cameraTouchId) {
                    const dx = touch.clientX - this.lastCameraPos.x;
                    const dy = touch.clientY - this.lastCameraPos.y;
                    this.lastCameraPos = { x: touch.clientX, y: touch.clientY };

                    const sensitivity = this.player.isAiming ? 0.003 : 0.005;
                    this.player.rotationY -= dx * sensitivity;
                    this.player.pitch -= dy * sensitivity;
                    this.player.pitch = Math.max(-0.45, Math.min(0.55, this.player.pitch));
                    break;
                }
            }
        });

        window.addEventListener('touchend', (e) => {
            if (this.cameraTouchId === null) return;
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.cameraTouchId) {
                    this.cameraTouchId = null;
                    break;
                }
            }
        });
    }

    updateKnobPosition(clientX, clientY) {
        let dx = clientX - this.joystickCenter.x;
        let dy = clientY - this.joystickCenter.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.maxRadius) {
            dx = (dx / dist) * this.maxRadius;
            dy = (dy / dist) * this.maxRadius;
        }

        this.joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        const normX = dx / this.maxRadius;
        const normY = dy / this.maxRadius;

        this.player.keys.forward = (normY < -0.3);
        this.player.keys.backward = (normY > 0.3);
        this.player.keys.left = (normX < -0.3);
        this.player.keys.right = (normX > 0.3);
    }

    resetJoystick() {
        this.activeTouchId = null;
        this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        this.player.keys.forward = false;
        this.player.keys.backward = false;
        this.player.keys.left = false;
        this.player.keys.right = false;
    }

    setupActionButtons() {
        const bindBtn = (id, onDown, onUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            const triggerDown = (e) => {
                if (e && e.cancelable) e.preventDefault();
                btn.classList.add('pressed');
                if (onDown) onDown();
            };

            const triggerUp = (e) => {
                if (e && e.cancelable) e.preventDefault();
                btn.classList.remove('pressed');
                if (onUp) onUp();
            };

            btn.addEventListener('touchstart', triggerDown, { passive: false });
            btn.addEventListener('touchend', triggerUp, { passive: false });

            btn.addEventListener('mousedown', (e) => triggerDown(e));
            btn.addEventListener('mouseup', (e) => triggerUp(e));
        };

        // Fire Button
        bindBtn('touch-btn-fire', () => {
            if (window.gameInstance) {
                window.gameInstance.firePlayerWeapon();
            }
        });

        // Character Skill Ability Button
        bindBtn('touch-btn-ability', () => {
            this.player.activateAbility();
        });

        // Aim Scope Button
        bindBtn('touch-btn-aim', () => {
            this.player.isAiming = !this.player.isAiming;
            if (window.gameInstance && window.gameInstance.ui) {
                window.gameInstance.ui.toggleScope(this.player.isAiming, this.weaponSys.equippedKey);
            }
        });

        // Jump Button
        bindBtn('touch-btn-jump', () => {
            if (this.player.isGrounded) {
                const terrainY = this.player.world ? this.player.world.getTerrainHeight(this.player.position.x, this.player.position.z) : 0;
                this.player.position.y = terrainY + 1.5;
                this.player.velocity.y = this.player.jumpForce;
                this.player.isGrounded = false;
                this.player.isCrouching = false;
                this.player.isProne = false;
            }
        });

        // Crouch Button
        bindBtn('touch-btn-crouch', () => {
            this.player.isCrouching = !this.player.isCrouching;
            this.player.isProne = false;
        });

        // Prone / "Sleep" Button
        bindBtn('touch-btn-prone', () => {
            this.player.isProne = !this.player.isProne;
            this.player.isCrouching = false;
        });

        // Gloo Wall Defense Button
        bindBtn('touch-btn-gloo', () => {
            this.player.deployGlooWall();
        });

        // Medkit Healing Button
        bindBtn('touch-btn-medkit', () => {
            this.player.useMedkit();
        });

        // Emote Wheel Button
        bindBtn('touch-btn-emote', () => {
            if (window.gameInstance && window.gameInstance.ui) {
                const emoteOverlay = document.getElementById('emote-wheel-overlay');
                const isHidden = emoteOverlay ? emoteOverlay.classList.contains('hidden') : true;
                window.gameInstance.ui.toggleEmoteWheel(isHidden);
            }
        });

        // Reload Button
        bindBtn('touch-btn-reload', () => {
            this.weaponSys.reload();
        });

        // Switch Weapon Button (Toggles between Slot 1 and Slot 2)
        bindBtn('touch-btn-switch', () => {
            const nextSlot = (this.weaponSys.activeSlot === 0) ? 1 : 0;
            this.weaponSys.switchSlot(nextSlot);
        });
    }
}
