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

        this.joystickCenter = { x: 0, y: 0 };
        this.maxRadius = 45;

        if (this.joystickContainer) {
            this.setupJoystick();
            this.setupActionButtons();
        }
    }

    setupJoystick() {
        const container = this.joystickContainer;

        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.activeTouchId !== null) return;

            const touch = e.changedTouches[0];
            this.activeTouchId = touch.identifier;

            const rect = container.getBoundingClientRect();
            this.joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };

            this.updateKnobPosition(touch.clientX, touch.clientY);
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

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('pressed');
                if (onDown) onDown();
            }, { passive: false });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
                if (onUp) onUp();
            }, { passive: false });
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

        // Reload Button
        bindBtn('touch-btn-reload', () => {
            this.weaponSys.reload();
        });

        // Switch Weapon Button
        bindBtn('touch-btn-switch', () => {
            const keys = ['ak47', 'awm', 'mp40', 'm1887', 'plasma', 'deagle', 'm60'];
            const idx = keys.indexOf(this.weaponSys.equippedKey);
            const nextKey = keys[(idx + 1) % keys.length];
            this.weaponSys.switchWeapon(nextKey);
        });
    }
}
