/**
 * Player Controller & Physics Engine
 * Handles WASD + Arrow keys movement, mouse camera orbit, ADS scope zoom, crouching, Prone ("Sleep"), Jump, Gloo Defense Wall, and fluid collision sliding.
 */
class PlayerController {
    constructor(scene, camera, domElement, world) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;
        this.world = world;

        // Player Stats
        this.maxHp = 100;
        this.hp = 100;
        this.maxArmor = 100;
        this.armor = 0;
        this.medkits = 2;
        this.glooWalls = 3;
        this.isAlive = true;
        this.kills = 0;
        this.damageDealt = 0;
        this.name = 'Player';
        this.isPlayer = true;

        // Movement Physics & Stances
        this.position = new THREE.Vector3(0, 2, 0);
        this.velocity = new THREE.Vector3();
        this.rotationY = 0;
        this.pitch = 0;

        this.speed = 14;
        this.sprintMultiplier = 1.45;
        this.crouchMultiplier = 0.55;
        this.proneMultiplier = 0.30;
        this.jumpForce = 13.5;
        this.gravity = 32;
        this.isGrounded = false;

        this.isSprinting = false;
        this.isCrouching = false;
        this.isProne = false;
        this.isAiming = false;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            crouch: false,
            prone: false
        };

        this.isLocked = false;

        // Free Fire Character Ability (Alok "Drop the Beat" Healing Aura Ring)
        this.abilityCooldown = 0;
        this.abilityActive = false;
        this.abilityTimer = 0;
        this.abilityRingMesh = null;

        // Free Fire Emotes System
        this.isEmoting = false;
        this.currentEmote = null;
        this.emoteTime = 0;
        this.emoteHologram = null;
        this.throneMesh = null;

        this.createMesh();
        this.setupCamera();
        this.setupControls();
    }

    createMesh() {
        this.meshGroup = new THREE.Group();

        // White Sci-Fi Mannequin Materials (Matching Reference Image)
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.2, metalness: 0.15 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.4, metalness: 0.7 });
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.9 });

        // 1. Mannequin Torso & White Tactical Armor Rig
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.7, 0.45), whiteMat);
        chest.position.y = 1.35;
        chest.castShadow = true;
        this.meshGroup.add(chest);

        const tacticalVest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.5), whiteMat);
        tacticalVest.position.y = 1.35;
        tacticalVest.castShadow = true;
        this.meshGroup.add(tacticalVest);

        // Black Accent Joint Belt & Harness
        const harness = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.15, 0.52), blackMat);
        harness.position.y = 1.05;
        this.meshGroup.add(harness);

        // Shoulder Armor Pads
        const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.25, 0.35), whiteMat);
        shoulderL.position.set(-0.45, 1.55, 0);
        this.meshGroup.add(shoulderL);

        const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.25, 0.35), whiteMat);
        shoulderR.position.set(0.45, 1.55, 0);
        this.meshGroup.add(shoulderR);

        // 2. White Smooth Mannequin Head & Visor
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), whiteMat);
        head.position.y = 1.95;
        head.castShadow = true;
        this.meshGroup.add(head);

        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.22), visorMat);
        visor.position.set(0, 1.98, -0.18);
        this.meshGroup.add(visor);

        const headsetLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1), blackMat);
        headsetLeft.rotateZ(Math.PI / 2);
        headsetLeft.position.set(-0.3, 1.96, 0);
        this.meshGroup.add(headsetLeft);

        const headsetRight = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1), blackMat);
        headsetRight.rotateZ(Math.PI / 2);
        headsetRight.position.set(0.3, 1.96, 0);
        this.meshGroup.add(headsetRight);

        // 3. White Jointed Legs & Black Knee Joints
        this.leftLeg = new THREE.Group();
        const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), whiteMat);
        thighL.position.y = -0.25;
        const kneeL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), blackMat);
        kneeL.position.y = -0.55;
        const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), whiteMat);
        shinL.position.y = -0.7;
        const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), blackMat);
        bootL.position.set(0, -0.95, -0.06);
        this.leftLeg.add(thighL); this.leftLeg.add(kneeL); this.leftLeg.add(shinL); this.leftLeg.add(bootL);
        this.leftLeg.position.set(-0.24, 0.9, 0);
        this.meshGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Group();
        const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), whiteMat);
        thighR.position.y = -0.25;
        const kneeR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), blackMat);
        kneeR.position.y = -0.55;
        const shinR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), whiteMat);
        shinR.position.y = -0.7;
        const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), blackMat);
        bootR.position.set(0, -0.95, -0.06);
        this.rightLeg.add(thighR); this.rightLeg.add(kneeR); this.rightLeg.add(shinR); this.rightLeg.add(bootR);
        this.rightLeg.position.set(0.24, 0.9, 0);
        this.meshGroup.add(this.rightLeg);

        // 4. White Arms & Black Elbow Joints
        this.armGroup = new THREE.Group();
        this.armGroup.position.set(0, 1.5, 0);

        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), whiteMat);
        rightArm.position.set(0.52, -0.15, -0.3);
        rightArm.rotation.x = -Math.PI / 3;
        this.armGroup.add(rightArm);

        this.weaponSocket = new THREE.Group();
        this.weaponSocket.position.set(0.55, -0.15, -0.75);
        this.armGroup.add(this.weaponSocket);

        this.meshGroup.add(this.armGroup);

        // Generous Combat Hitbox
        const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 1.2), hitboxMat);
        hitbox.position.y = 1.2;
        this.meshGroup.add(hitbox);

        this.scene.add(this.meshGroup);
        this.attachWeapon3D('ak47');
    }

    attachWeapon3D(weaponId) {
        while (this.weaponSocket.children.length > 0) {
            const child = this.weaponSocket.children[0];
            this.weaponSocket.remove(child);
        }

        const weaponGroup = new THREE.Group();

        if (weaponId === 'ak47') {
            // Iconic AK-47 Assault Rifle
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.85 });
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.7 });
            const magMat = new THREE.MeshStandardMaterial({ color: 0xd63031, metalness: 0.9 });

            const mainBody = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 1.2), bodyMat);
            const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.45), woodMat);
            handguard.position.set(0, -0.02, -0.35);

            const curvedMag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.25), magMat);
            curvedMag.position.set(0, -0.3, 0.05);
            curvedMag.rotation.x = 0.25;

            const stock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.55), woodMat);
            stock.position.set(0, -0.05, 0.55);

            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7), bodyMat);
            barrel.rotateX(Math.PI / 2);
            barrel.position.set(0, 0.05, -0.75);

            weaponGroup.add(mainBody);
            weaponGroup.add(handguard);
            weaponGroup.add(curvedMag);
            weaponGroup.add(stock);
            weaponGroup.add(barrel);
        } else if (weaponId === 'awm') {
            // Heavy Camo AWM Sniper Rifle
            const camoMat = new THREE.MeshStandardMaterial({ color: 0x3b5323, roughness: 0.6 });
            const barrelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95 });
            const scopeLensMat = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 0.9 });

            const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 1.6), camoMat);
            const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6), barrelMat);
            longBarrel.rotateX(Math.PI / 2);
            longBarrel.position.set(0, 0.04, -1.2);

            const bigScope = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6), scopeLensMat);
            bigScope.rotateX(Math.PI / 2);
            bigScope.position.set(0, 0.25, -0.2);

            const bipodLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), barrelMat);
            bipodLeft.position.set(-0.12, -0.22, -1.1);

            const bipodRight = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), barrelMat);
            bipodRight.position.set(0.12, -0.22, -1.1);

            weaponGroup.add(body);
            weaponGroup.add(longBarrel);
            weaponGroup.add(bigScope);
            weaponGroup.add(bipodLeft);
            weaponGroup.add(bipodRight);
        } else if (weaponId === 'mp40') {
            // High Speed MP40 Submachine Gun
            const smgMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, metalness: 0.9, roughness: 0.2 });
            const magMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.8 });

            const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.85), smgMat);
            const longMag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.12), magMat);
            longMag.position.set(0, -0.32, -0.1);

            const thinBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), smgMat);
            thinBarrel.rotateX(Math.PI / 2);
            thinBarrel.position.set(0, 0.02, -0.6);

            weaponGroup.add(body);
            weaponGroup.add(longMag);
            weaponGroup.add(thinBarrel);
        } else if (weaponId === 'm1887') {
            // Double Barrel M1887 Heavy Shotgun
            const metalMat = new THREE.MeshStandardMaterial({ color: 0x636e72, metalness: 0.85 });
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x6c5ce7, roughness: 0.7 });

            const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.8), metalMat);
            const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9), metalMat);
            barrel1.rotateX(Math.PI / 2);
            barrel1.position.set(-0.06, 0.06, -0.75);

            const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9), metalMat);
            barrel2.rotateX(Math.PI / 2);
            barrel2.position.set(0.06, 0.06, -0.75);

            const stock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.45), woodMat);
            stock.position.set(0, -0.05, 0.45);

            weaponGroup.add(body);
            weaponGroup.add(barrel1);
            weaponGroup.add(barrel2);
            weaponGroup.add(stock);
        } else if (weaponId === 'plasma') {
            // Futuristic Plasma Energy Rifle
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, metalness: 0.9 });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.85 });

            const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 1.1), bodyMat);
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8), glowMat);
            barrel.rotateX(Math.PI / 2);
            barrel.position.set(0, 0.05, -0.7);

            const core = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), glowMat);
            core.position.set(0, 0.1, -0.1);

            weaponGroup.add(body);
            weaponGroup.add(barrel);
            weaponGroup.add(core);
        } else if (weaponId === 'deagle') {
            // Desert Eagle Handgun
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.1 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.5), goldMat);
            const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.4), goldMat);
            barrel.position.set(0, 0.05, -0.35);

            weaponGroup.add(body);
            weaponGroup.add(barrel);
        } else if (weaponId === 'm60') {
            // Iconic M60 Heavy LMG (Matching User's Reference Image)
            const steelMat = new THREE.MeshStandardMaterial({ color: 0x636e72, metalness: 0.85, roughness: 0.25 });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, metalness: 0.9, roughness: 0.4 });
            const brassMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.95, roughness: 0.1 });
            const redMat = new THREE.MeshStandardMaterial({ color: 0xd63031, metalness: 0.6 });

            // 1. Heavy Receiver & Barrel with Heat Shield Rings
            const mainReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 1.2), steelMat);
            const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.4), steelMat);
            longBarrel.rotateX(Math.PI / 2);
            longBarrel.position.set(0, 0.04, -1.0);

            // Heat-Shield Rings on Barrel
            for (let r = 0; r < 4; r++) {
                const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12), darkMat);
                ring.rotateX(Math.PI / 2);
                ring.position.set(0, 0.04, -0.5 - (r * 0.2));
                weaponGroup.add(ring);
            }

            // Muzzle Brake & Front Sight
            const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.2), darkMat);
            muzzle.position.set(0, 0.04, -1.75);

            const sight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), darkMat);
            sight.position.set(0, 0.14, -1.65);

            // 2. Front Dual Bipod Attachment (Matching Reference Image)
            const bipodLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65), darkMat);
            bipodLeft.position.set(-0.22, -0.3, -1.3);
            bipodLeft.rotation.z = -0.35;

            const bipodRight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65), darkMat);
            bipodRight.position.set(0.22, -0.3, -1.3);
            bipodRight.rotation.z = 0.35;

            // 3. Top Carrying Handle (Matching Reference Image)
            const handleMount = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), darkMat);
            handleMount.position.set(0, 0.26, -0.35);
            handleMount.rotation.x = -0.35;

            const handleGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35), darkMat);
            handleGrip.rotateX(Math.PI / 2);
            handleGrip.position.set(0, 0.35, -0.42);

            // 4. Ammo Box & Hanging Brass Bullet Belt (Matching Reference Image)
            const ammoBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.32), darkMat);
            ammoBox.position.set(-0.25, -0.32, -0.1);

            // Curve of Brass Bullet Cartridges feeding into tray
            for (let b = 0; b < 7; b++) {
                const bullet = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.18), brassMat);
                bullet.rotateZ(Math.PI / 2);
                bullet.position.set(-0.16 + (b * 0.02), -0.05 - (b * 0.04), -0.08);
                weaponGroup.add(bullet);
            }

            // 5. Stock, Pistol Grip & Red Trigger
            const stock = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 0.6), steelMat);
            stock.position.set(0, -0.05, 0.6);

            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.22), darkMat);
            grip.position.set(0, -0.32, 0.25);
            grip.rotation.x = -0.3;

            const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.08), redMat);
            trigger.position.set(0, -0.18, 0.12);

            weaponGroup.add(mainReceiver);
            weaponGroup.add(longBarrel);
            weaponGroup.add(muzzle);
            weaponGroup.add(sight);
            weaponGroup.add(bipodLeft);
            weaponGroup.add(bipodRight);
            weaponGroup.add(handleMount);
            weaponGroup.add(handleGrip);
            weaponGroup.add(ammoBox);
            weaponGroup.add(stock);
            weaponGroup.add(grip);
            weaponGroup.add(trigger);
        }

        this.weaponSocket.add(weaponGroup);
    }

    setupCamera() {
        this.cameraOffset = new THREE.Vector3(0, 2.2, 3.8);
        this.aimCameraOffset = new THREE.Vector3(0.55, 1.85, 1.2);
    }

    setupControls() {
        document.addEventListener('click', (e) => {
            if (this.isAlive && !this.isLocked && e.target.tagName === 'CANVAS') {
                this.domElement.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = (document.pointerLockElement === this.domElement);
            const lockPrompt = document.getElementById('lock-prompt');
            if (lockPrompt) {
                if (!this.isLocked && this.isAlive && window.gameInstance && window.gameInstance.state === 'PLAYING') {
                    lockPrompt.classList.remove('hidden');
                } else {
                    lockPrompt.classList.add('hidden');
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isLocked || !this.isAlive) return;

            const sensitivity = this.isAiming ? 0.0015 : 0.0025;
            this.rotationY -= e.movementX * sensitivity;
            this.pitch -= e.movementY * sensitivity;
            this.pitch = Math.max(-0.45, Math.min(0.55, this.pitch));
        });

        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));
    }

    handleKey(e, isPressed) {
        if (!this.isAlive) return;

        const code = e.code;
        const key = e.key ? e.key.toLowerCase() : '';

        if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') this.keys.forward = isPressed;
        if (code === 'KeyS' || code === 'ArrowDown' || key === 's') this.keys.backward = isPressed;
        if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') this.keys.left = isPressed;
        if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') this.keys.right = isPressed;

        if (isPressed) {
            if (code === 'Space' || key === ' ' || key === 'space') {
                if (this.isGrounded) {
                    const terrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
                    this.position.y = terrainY + 1.5;
                    this.velocity.y = this.jumpForce;
                    this.isGrounded = false;
                    this.isCrouching = false;
                    this.isProne = false;
                }
            }
            if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.keys.sprint = true;
            if (code === 'KeyC' || key === 'c') {
                this.isCrouching = !this.isCrouching;
                this.isProne = false;
            }
            if (code === 'KeyZ' || key === 'z') {
                this.isProne = !this.isProne;
                this.isCrouching = false;
            }
            if (code === 'KeyF' || key === 'f') {
                this.activateAbility();
            }
            if (code === 'KeyG' || key === 'g') {
                this.deployGlooWall();
            }
            if (code === 'KeyH' || key === 'h') {
                this.useMedkit();
            }
        } else {
            if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.keys.sprint = false;
        }
    }

    activateAbility() {
        if (!this.isAlive || this.abilityCooldown > 0 || this.abilityActive) return;

        this.abilityActive = true;
        this.abilityTimer = 10;
        this.abilityCooldown = 30;
        audioManager.playHeal();

        // Spawn 3D Glowing Green Healing Aura Ring around Player
        if (!this.abilityRingMesh) {
            const ringGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.4, 32, 1, true);
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0x2ed573,
                emissive: 0x00ff88,
                emissiveIntensity: 0.85,
                transparent: true,
                opacity: 0.45,
                side: THREE.DoubleSide
            });
            this.abilityRingMesh = new THREE.Mesh(ringGeo, ringMat);
            this.scene.add(this.abilityRingMesh);
        }
        this.abilityRingMesh.visible = true;
    }

    deployGlooWall() {
        if (!this.isAlive || this.glooWalls <= 0) return;
        this.glooWalls--;

        audioManager.playGlooWall();

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
        const wallPos = this.position.clone().addScaledVector(forward, 2.8);
        const groundY = this.world.getTerrainHeight(wallPos.x, wallPos.z);
        wallPos.y = groundY + 1.8;

        const wallGeo = new THREE.BoxGeometry(5.2, 3.6, 0.6);
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.6,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.85
        });

        const glooMesh = new THREE.Mesh(wallGeo, wallMat);
        glooMesh.position.copy(wallPos);
        glooMesh.rotation.y = this.rotationY;
        glooMesh.castShadow = true;
        glooMesh.receiveShadow = true;

        this.scene.add(glooMesh);

        // Spawn Gloo Shockwave Ring FX
        const ringGeo = new THREE.RingGeometry(0.2, 3.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(wallPos);
        ring.position.y = groundY + 0.1;
        this.scene.add(ring);
        let ringTime = 0;
        const ringAnim = setInterval(() => {
            ringTime += 0.05;
            ring.scale.addScalar(0.2);
            ringMat.opacity = Math.max(0, 0.9 - ringTime * 2);
            if (ringTime > 0.45) {
                clearInterval(ringAnim);
                this.scene.remove(ring);
            }
        }, 30);

        this.world.solidMeshes.push(glooMesh);
        const bbox = new THREE.Box3().setFromObject(glooMesh);
        this.world.colliders.push({ box: bbox, type: 'gloowall' });

        setTimeout(() => {
            this.scene.remove(glooMesh);
            const idx1 = this.world.solidMeshes.indexOf(glooMesh);
            if (idx1 !== -1) this.world.solidMeshes.splice(idx1, 1);
            const idx2 = this.world.colliders.findIndex(c => c.box === bbox);
            if (idx2 !== -1) this.world.colliders.splice(idx2, 1);
        }, 30000);
    }

    spawn(x, z) {
        this.position.set(x, this.world.getTerrainHeight(x, z) + 1.5, z);
        this.hp = this.maxHp;
        this.armor = 50;
        this.glooWalls = 3;
        this.isAlive = true;
        this.kills = 0;
        this.damageDealt = 0;
        this.velocity.set(0, 0, 0);
        this.isCrouching = false;
        this.isProne = false;
        this.stopEmote();
    }

    takeDamage(amount, attacker) {
        if (!this.isAlive) return;
        this.stopEmote();

        let remaining = amount;
        if (this.armor > 0) {
            const absorbed = Math.min(this.armor, amount * 0.5);
            this.armor -= absorbed;
            remaining -= absorbed;
        }

        this.hp -= remaining;
        audioManager.playHurt();

        if (window.gameInstance && window.gameInstance.ui) {
            window.gameInstance.ui.triggerDamageFlash();
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            if (attacker && window.gameInstance && window.gameInstance.ui) {
                window.gameInstance.ui.addKillFeed(attacker.name || 'Bot', 'Player', 'Combat', false);
            }
        }
    }

    useMedkit() {
        if (!this.isAlive || this.medkits <= 0 || this.hp >= this.maxHp) return;
        this.medkits--;
        this.hp = Math.min(this.maxHp, this.hp + 50);
        audioManager.playHeal();

        this.spawnHealParticles();

        if (window.gameInstance && window.gameInstance.ui) {
            window.gameInstance.ui.showHealText('+50 HP HEALED');
        }
    }

    spawnHealParticles() {
        const pGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x20e2a3, emissive: 0x20e2a3, emissiveIntensity: 0.9 });
        for (let i = 0; i < 14; i++) {
            const particle = new THREE.Mesh(pGeo, pMat);
            particle.position.copy(this.position).add(new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,
                Math.random() * 2,
                (Math.random() - 0.5) * 1.5
            ));
            this.scene.add(particle);
            let age = 0;
            const anim = setInterval(() => {
                age += 0.05;
                particle.position.y += 0.08;
                particle.scale.multiplyScalar(0.92);
                if (age > 0.6) {
                    clearInterval(anim);
                    this.scene.remove(particle);
                }
            }, 30);
        }
    }

    performEmote(emoteId) {
        if (!this.isAlive) return;
        this.isEmoting = true;
        this.currentEmote = emoteId;
        this.emoteTime = 0;

        audioManager.playEmoteSound(emoteId);
        this.createEmoteHologram(emoteId);

        if (emoteId === 'throne') {
            this.createThroneMesh();
        } else if (this.throneMesh) {
            this.scene.remove(this.throneMesh);
            this.throneMesh = null;
        }

        if (window.gameInstance && window.gameInstance.ui) {
            const emoteNames = {
                booyah: '🔥 BOOYAH! DANCE',
                lol: '😂 LOL TAUNT',
                heart: '💖 LOVE HEART',
                pushup: '💪 POWER PUSH-UP',
                throne: '👑 ROYAL THRONE',
                clap: '👏 VICTORY CLAP'
            };
            window.gameInstance.ui.showEmoteBanner(emoteNames[emoteId] || 'EMOTE');
        }
    }

    stopEmote() {
        this.isEmoting = false;
        this.currentEmote = null;
        if (this.emoteHologram) {
            this.scene.remove(this.emoteHologram);
            this.emoteHologram = null;
        }
        if (this.throneMesh) {
            this.scene.remove(this.throneMesh);
            this.throneMesh = null;
        }
        if (this.armGroup) {
            this.armGroup.position.set(0, 1.5, 0);
            this.armGroup.rotation.set(0, 0, 0);
        }
        if (this.leftLeg) this.leftLeg.rotation.set(0, 0, 0);
        if (this.rightLeg) this.rightLeg.rotation.set(0, 0, 0);
    }

    createEmoteHologram(emoteId) {
        if (this.emoteHologram) {
            this.scene.remove(this.emoteHologram);
            this.emoteHologram = null;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(10, 10, 236, 108, 16);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#00f0ff';
        ctx.stroke();

        const emojis = {
            booyah: '🔥 BOOYAH!',
            lol: '😂 LOL!',
            heart: '💖 LOVE!',
            pushup: '💪 POWER!',
            throne: '👑 KING!',
            clap: '👏 BRAVO!'
        };

        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(emojis[emoteId] || '✨ EMOTE', 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        this.emoteHologram = new THREE.Sprite(spriteMat);
        this.emoteHologram.scale.set(3.2, 1.6, 1);
        this.scene.add(this.emoteHologram);
    }

    createThroneMesh() {
        if (this.throneMesh) {
            this.scene.remove(this.throneMesh);
        }
        this.throneMesh = new THREE.Group();
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2, emissive: 0xffaa00, emissiveIntensity: 0.3 });
        const redMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.5 });

        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.1), redMat);
        seat.position.y = 0.5;
        this.throneMesh.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.2), goldMat);
        back.position.set(0, 1.4, 0.45);
        this.throneMesh.add(back);

        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 4), goldMat);
        crown.position.set(0, 2.5, 0.45);
        crown.rotation.y = Math.PI / 4;
        this.throneMesh.add(crown);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.0), goldMat);
        armL.position.set(-0.6, 0.75, 0);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.0), goldMat);
        armR.position.set(0.6, 0.75, 0);
        this.throneMesh.add(armL);
        this.throneMesh.add(armR);

        const backward = new THREE.Vector3(0, 0, 0.15).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
        this.throneMesh.position.copy(this.position).add(backward);
        this.throneMesh.position.y = this.world.getTerrainHeight(this.position.x, this.position.z);
        this.throneMesh.rotation.y = this.rotationY;

        this.scene.add(this.throneMesh);
    }

    updateEmoteAnimation(delta) {
        this.emoteTime += delta;
        const time = this.emoteTime;

        if (this.emoteHologram) {
            this.emoteHologram.position.copy(this.position);
            this.emoteHologram.position.y += 2.8 + Math.sin(time * 6) * 0.15;
        }

        if (this.currentEmote === 'booyah') {
            // Hands wave in victory
            this.armGroup.rotation.x = -Math.PI / 1.2 + Math.sin(time * 8) * 0.3;
            this.leftLeg.rotation.x = Math.sin(time * 10) * 0.2;
            this.rightLeg.rotation.x = -Math.sin(time * 10) * 0.2;
        } else if (this.currentEmote === 'lol') {
            // Laughing forward-backward shake
            this.armGroup.rotation.x = -Math.PI / 3 + Math.sin(time * 12) * 0.25;
            this.meshGroup.rotation.x = Math.sin(time * 12) * 0.15;
        } else if (this.currentEmote === 'heart') {
            // Hands forming heart pose
            this.armGroup.rotation.x = -Math.PI / 2.2;
            this.armGroup.rotation.z = Math.sin(time * 4) * 0.1;
        } else if (this.currentEmote === 'pushup') {
            // Push-up on floor
            this.meshGroup.rotation.x = Math.PI / 2.2;
            this.meshGroup.position.y = this.position.y - 1.2 + Math.sin(time * 6) * 0.15;
        } else if (this.currentEmote === 'throne') {
            // Sit on throne pose
            this.leftLeg.rotation.x = Math.PI / 2.5;
            this.rightLeg.rotation.x = Math.PI / 2.5;
            this.armGroup.rotation.x = -Math.PI / 4;
            this.meshGroup.position.y = this.position.y - 0.7;
        } else if (this.currentEmote === 'clap') {
            // Rapid clapping animation
            this.armGroup.rotation.x = -Math.PI / 2 + Math.sin(time * 14) * 0.15;
        }

        if (this.emoteTime > 4.5) {
            this.stopEmote();
        }
    }

    update(delta) {
        if (!this.isAlive) return;

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

        let moveDir = new THREE.Vector3();
        if (this.keys.forward) moveDir.add(forward);
        if (this.keys.backward) moveDir.sub(forward);
        if (this.keys.right) moveDir.add(right);
        if (this.keys.left) moveDir.sub(right);

        if (moveDir.lengthSq() > 0 || this.keys.jump) {
            if (this.isEmoting) this.stopEmote();
        }

        if (this.isEmoting) {
            this.updateEmoteAnimation(delta);
        }

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
        }

        // Ability Timers & Healing Aura Tick
        if (this.abilityCooldown > 0) {
            this.abilityCooldown = Math.max(0, this.abilityCooldown - delta);
        }

        if (this.abilityActive) {
            this.abilityTimer -= delta;
            this.hp = Math.min(this.maxHp, this.hp + 5 * delta); // Heal +5 HP/sec

            if (this.abilityRingMesh) {
                const terrainY = this.world ? this.world.getTerrainHeight(this.position.x, this.position.z) : 0;
                this.abilityRingMesh.position.set(this.position.x, terrainY + 0.2, this.position.z);
                this.abilityRingMesh.material.opacity = 0.35 + Math.sin(performance.now() * 0.008) * 0.15;
            }

            if (this.abilityTimer <= 0) {
                this.abilityActive = false;
                if (this.abilityRingMesh) this.abilityRingMesh.visible = false;
            }
        }

        let currentSpeed = this.speed;
        if (this.abilityActive) {
            currentSpeed *= 1.25; // Alok +25% Speed Boost!
        }

        if (this.keys.sprint && this.keys.forward && !this.isCrouching && !this.isProne && !this.isAiming) {
            currentSpeed *= this.sprintMultiplier;
            this.isSprinting = true;
        } else {
            this.isSprinting = false;
        }

        if (this.isProne) {
            currentSpeed *= this.proneMultiplier;
        } else if (this.isCrouching) {
            currentSpeed *= this.crouchMultiplier;
        }

        this.velocity.x = moveDir.x * currentSpeed;
        this.velocity.z = moveDir.z * currentSpeed;
        this.velocity.y -= this.gravity * delta;

        let eyeOffset = 1.5;
        if (this.isProne) eyeOffset = 0.35;
        else if (this.isCrouching) eyeOffset = 0.9;

        const stepX = this.velocity.x * delta;
        const stepZ = this.velocity.z * delta;
        const stepY = this.velocity.y * delta;

        let nextX = this.position.x + stepX;
        let nextZ = this.position.z + stepZ;
        let nextY = this.position.y + stepY;

        const playerRadius = 0.45;
        const feetY = nextY - eyeOffset;
        const headY = feetY + 2.0;

        // X-axis collision slide test
        if (this.world && this.world.colliders) {
            for (let col of this.world.colliders) {
                if (feetY < col.box.max.y && headY > col.box.min.y) {
                    const minX = col.box.min.x - playerRadius;
                    const maxX = col.box.max.x + playerRadius;
                    const minZ = col.box.min.z - playerRadius;
                    const maxZ = col.box.max.z + playerRadius;

                    if (nextX >= minX && nextX <= maxX && this.position.z >= minZ && this.position.z <= maxZ) {
                        nextX = this.position.x;
                        break;
                    }
                }
            }
        }

        // Z-axis collision slide test
        if (this.world && this.world.colliders) {
            for (let col of this.world.colliders) {
                if (feetY < col.box.max.y && headY > col.box.min.y) {
                    const minX = col.box.min.x - playerRadius;
                    const maxX = col.box.max.x + playerRadius;
                    const minZ = col.box.min.z - playerRadius;
                    const maxZ = col.box.max.z + playerRadius;

                    if (nextX >= minX && nextX <= maxX && nextZ >= minZ && nextZ <= maxZ) {
                        nextZ = this.position.z;
                        break;
                    }
                }
            }
        }

        const groundHeight = this.world ? this.world.getTerrainHeight(nextX, nextZ) : 0;
        const groundY = groundHeight + eyeOffset;

        if (nextY <= groundY) {
            nextY = groundY;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        this.position.set(nextX, nextY, nextZ);

        this.meshGroup.position.copy(this.position);
        this.meshGroup.position.y -= eyeOffset;
        this.meshGroup.rotation.y = this.rotationY;

        if (this.isProne) {
            this.meshGroup.rotation.x = Math.PI / 2.2;
            this.armGroup.rotation.x = 0;
        } else {
            this.meshGroup.rotation.x = 0;
            this.armGroup.rotation.x = this.pitch;
        }

        if (moveDir.lengthSq() > 0 && this.isGrounded && !this.isProne) {
            const time = performance.now() * 0.012;
            this.leftLeg.rotation.x = Math.sin(time * (this.isSprinting ? 1.5 : 1.0)) * 0.6;
            this.rightLeg.rotation.x = -Math.sin(time * (this.isSprinting ? 1.5 : 1.0)) * 0.6;
        } else {
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
        }

        const baseCamHeight = this.isProne ? 0.8 : (this.isCrouching ? 1.4 : 2.2);
        const camOffset = this.isAiming ? this.aimCameraOffset : new THREE.Vector3(0, baseCamHeight, 3.8);
        const rotatedOffset = camOffset.clone()
            .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

        const camTargetPos = this.position.clone().add(rotatedOffset);
        this.camera.position.lerp(camTargetPos, 0.3);
        
        const lookAtPoint = this.position.clone().add(
            new THREE.Vector3(0, 0, -10)
                .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch)
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY)
        );
        this.camera.lookAt(lookAtPoint);
    }
}
