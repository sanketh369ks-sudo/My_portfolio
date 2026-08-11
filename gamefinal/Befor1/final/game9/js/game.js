/**
 * Battle Royale Main Game Engine & Loop Orchestrator
 * Integrates Three.js rendering, game states, input handlers, continuous automatic fire, win/loss rules, and restart logic.
 */
class BattleRoyaleGame {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.state = 'MENU';

        this.menuAngle = 0;
        this.isMouseDown = false;

        this.initThree();
        this.initSystems();
        this.setupEventListeners();

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-overlay');
            if (loadingScreen) loadingScreen.style.opacity = '0';
            setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
            }, 500);
        }, 800);
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
    }

    initSystems() {
        this.world = new GameWorld(this.scene);
        this.weaponSys = new WeaponSystem(this.scene, this.camera);
        this.player = new PlayerController(this.scene, this.camera, this.canvas, this.world);

        this.lootManager = new LootManager(this.scene, this.world);
        this.botManager = new BotManager(this.scene, this.world, this.weaponSys);
        this.zoneManager = new SafeZoneManager(this.scene, this.world.mapSize);

        this.ui = new UIManager();
        this.inventory = new InventoryManager(this.player, this.weaponSys);
        this.touchController = new TouchController(this.player, this.weaponSys, this.inventory);

        window.gameInstance = this;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mouse Shoot & Aim Controls
        window.addEventListener('mousedown', (e) => {
            if (this.state !== 'PLAYING' || !this.player.isAlive) return;

            if (e.button === 0) {
                this.isMouseDown = true;
                this.firePlayerWeapon();
            } else if (e.button === 2) {
                this.player.isAiming = true;
                this.ui.toggleScope(true, this.weaponSys.equippedKey);
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isMouseDown = false;
            } else if (e.button === 2) {
                this.player.isAiming = false;
                this.ui.toggleScope(false);
            }
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());

        // Keyboard Slot Switching & Reload
        window.addEventListener('keydown', (e) => {
            if (this.state !== 'PLAYING') return;

            if (e.code === 'Digit1') this.weaponSys.switchSlot(0);
            if (e.code === 'Digit2') this.weaponSys.switchSlot(1);
            if (e.code === 'KeyR') this.weaponSys.reload();
            if (e.code === 'KeyF') {
                const loot = this.lootManager.checkPlayerProximity(this.player.position);
                if (loot) {
                    this.attemptLootPickup();
                } else {
                    this.player.activateAbility();
                }
            }
            if (e.code === 'KeyG') {
                this.player.deployGlooWall();
            }
            if (e.code === 'KeyQ') {
                this.player.activateBubbleShield();
            }
            if (e.code === 'KeyH') {
                this.player.useMedkit();
            }
            if (e.code === 'KeyE' || e.code === 'KeyT' || e.code === 'KeyB') {
                const loot = (e.code === 'KeyE') ? this.lootManager.checkPlayerProximity(this.player.position) : null;
                if (loot) {
                    this.attemptLootPickup();
                } else {
                    const emoteOverlay = document.getElementById('emote-wheel-overlay');
                    const isHidden = emoteOverlay ? emoteOverlay.classList.contains('hidden') : true;
                    this.ui.toggleEmoteWheel(isHidden);
                }
            }
            if (e.code === 'Tab' || e.code === 'KeyI') {
                e.preventDefault();
                const invOverlay = document.getElementById('inventory-overlay');
                const isHidden = invOverlay.classList.contains('hidden');
                this.ui.toggleInventory(isHidden, this.player, this.weaponSys);
            }
        });

        // Menu Buttons
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startMatch();
        });
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startMatch();
        });
    }

    startMatch() {
        audioManager.unlock();
        this.state = 'PLAYING';

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('end-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');

        const playerSpawn = this.world.spawnPoints[0] || new THREE.Vector3(0, 2, 0);
        this.player.spawn(playerSpawn.x, playerSpawn.z);

        this.botManager.spawnBots(6, this.player);
        this.zoneManager = new SafeZoneManager(this.scene, this.world.mapSize);

        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 900);
        if (isTouch) {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {
                    // Orientation lock handled gracefully
                });
            }
        } else {
            try {
                if (this.canvas && this.canvas.requestPointerLock) {
                    this.canvas.requestPointerLock();
                }
            } catch (e) {
                // Mobile touch fallback
            }
        }
    }

    firePlayerWeapon() {
        if (!this.player.isAlive) return;

        const cameraDir = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDir);

        const origin = this.camera.position.clone();
        const targets = [...this.botManager.bots];

        const hits = this.weaponSys.fire(origin, cameraDir, this.player, targets, this.world.solidMeshes);
        if (hits && hits.length > 0) {
            this.ui.triggerHitMarker();
        }
    }

    attemptLootPickup() {
        const nearbyLoot = this.lootManager.checkPlayerProximity(this.player.position);
        if (nearbyLoot) {
            this.lootManager.pickupLoot(nearbyLoot, this.player, this.weaponSys);
        }
    }

    checkMatchEndCondition() {
        if (this.state !== 'PLAYING') return;

        if (!this.player.isAlive) {
            this.triggerEndGame(false);
            return;
        }

        if (this.botManager.getAliveCount() === 0) {
            this.triggerEndGame(true);
        }
    }

    triggerEndGame(isVictory) {
        this.state = isVictory ? 'VICTORY' : 'DEFEAT';
        this.isMouseDown = false;

        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        if (isVictory) audioManager.playVictory();

        const endScreen = document.getElementById('end-screen');
        const endTitle = document.getElementById('end-title');

        if (isVictory) {
            endTitle.className = 'end-title victory';
            endTitle.textContent = '#1 BOOYAH!';
        } else {
            endTitle.className = 'end-title defeat';
            endTitle.textContent = 'DEFEATED';
        }

        document.getElementById('stat-kills').textContent = this.player.kills;
        document.getElementById('stat-damage').textContent = Math.round(this.player.damageDealt);
        document.getElementById('stat-placement').textContent = isVictory ? '#1 / 7' : `#${this.botManager.getAliveCount() + 1} / 7`;

        endScreen.classList.remove('hidden');
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.state === 'MENU') {
            this.menuAngle += delta * 0.15;
            const camX = Math.sin(this.menuAngle) * 160;
            const camZ = Math.cos(this.menuAngle) * 160;
            this.camera.position.set(camX, 65, camZ);
            this.camera.lookAt(0, 10, 0);
            this.lootManager.update();
        } else if (this.state === 'PLAYING') {
            // Smooth Camera Optical FOV Zoom when Aiming Down Sights (ADS Scope)
            const targetFOV = this.player.isAiming ? (this.weaponSys.equippedKey === 'awm' ? 20 : 32) : 65;
            if (Math.abs(this.camera.fov - targetFOV) > 0.1) {
                this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.25);
                this.camera.updateProjectionMatrix();
            }

            // Periodic Air Drop Supply Crate Spawner (Every 40 seconds)
            if (typeof this.airdropTimer !== 'number') this.airdropTimer = 35;
            this.airdropTimer -= delta;
            if (this.airdropTimer <= 0) {
                this.airdropTimer = 40;
                const dropX = (Math.random() - 0.5) * 280;
                const dropZ = (Math.random() - 0.5) * 280;
                this.lootManager.spawnAirdrop(dropX, dropZ);
            }

            this.player.update(delta);
            this.weaponSys.update();
            this.botManager.update(delta, this.player, this.zoneManager);
            this.lootManager.update(this.player, this.weaponSys);
            this.zoneManager.update(delta, this.player, this.botManager.bots);

            const nearbyLoot = this.lootManager.checkPlayerProximity(this.player.position);
            this.ui.showLootPrompt(nearbyLoot ? nearbyLoot.data.name : null);

            const totalAlive = (this.player.isAlive ? 1 : 0) + this.botManager.getAliveCount();
            this.ui.updateHUD(this.player, this.weaponSys, this.zoneManager, totalAlive);

            this.checkMatchEndCondition();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js loading delay detected...');
        const checkThree = setInterval(() => {
            if (typeof THREE !== 'undefined') {
                clearInterval(checkThree);
                new BattleRoyaleGame();
            }
        }, 100);
        return;
    }
    try {
        new BattleRoyaleGame();
    } catch (err) {
        console.error('Game initialization error:', err);
    }
});
