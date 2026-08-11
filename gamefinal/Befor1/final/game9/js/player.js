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
        this.createMesh();
        this.setupCamera();
        this.setupControls();
    }

    createMesh() {
        this.meshGroup = new THREE.Group();

        // High-Detail Realistic Human Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.7 });
        const jacketMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5 });
        const vestMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.3, metalness: 0.6 });
        const camoMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.6 });
        const bootMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.7 });
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0x576574, roughness: 0.3, metalness: 0.5 });

        // 1. Human Torso, Tactical Armor Rig & Shoulder Pads
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.7, 0.45), jacketMat);
        chest.position.y = 1.35;
        chest.castShadow = true;
        this.meshGroup.add(chest);

        const tacticalVest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.5), vestMat);
        tacticalVest.position.y = 1.35;
        tacticalVest.castShadow = true;
        this.meshGroup.add(tacticalVest);

        // Shoulder Armor Pads
        const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.25, 0.35), vestMat);
        shoulderL.position.set(-0.45, 1.55, 0);
        this.meshGroup.add(shoulderL);

        const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.25, 0.35), vestMat);
        shoulderR.position.set(0.45, 1.55, 0);
        this.meshGroup.add(shoulderR);

        // Tactical Ammo Pouches & Comms Radio
        const pouch1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.15), vestMat);
        pouch1.position.set(-0.2, 1.25, -0.28);
        this.meshGroup.add(pouch1);

        const pouch2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.15), vestMat);
        pouch2.position.set(0.2, 1.25, -0.28);
        this.meshGroup.add(pouch2);

        const radio = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), vestMat);
        radio.position.set(0.32, 1.45, 0.22);
        this.meshGroup.add(radio);

        // 2. Human Head, Nose, Ears, Visor & Earcomm Headset
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
        head.position.y = 1.95;
        head.castShadow = true;
        this.meshGroup.add(head);

        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.1), skinMat);
        nose.position.set(0, 1.92, -0.28);
        this.meshGroup.add(nose);

        const earL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.08), skinMat);
        earL.position.set(-0.28, 1.95, -0.04);
        this.meshGroup.add(earL);

        const earR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.08), skinMat);
        earR.position.set(0.28, 1.95, -0.04);
        this.meshGroup.add(earR);

        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.22), visorMat);
        visor.position.set(0, 1.98, -0.18);
        this.meshGroup.add(visor);

        const headsetLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1), vestMat);
        headsetLeft.rotateZ(Math.PI / 2);
        headsetLeft.position.set(-0.3, 1.96, 0);
        this.meshGroup.add(headsetLeft);

        const headsetRight = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1), vestMat);
        headsetRight.rotateZ(Math.PI / 2);
        headsetRight.position.set(0.3, 1.96, 0);
        this.meshGroup.add(headsetRight);

        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), helmetMat);
        helmet.position.y = 2.0;
        helmet.castShadow = true;
        this.meshGroup.add(helmet);

        // 3. Human Jointed Legs & Combat Boots
        this.leftLeg = new THREE.Group();
        const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), camoMat);
        thighL.position.y = -0.25;
        const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), camoMat);
        shinL.position.y = -0.7;
        const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), bootMat);
        bootL.position.set(0, -0.95, -0.06);
        this.leftLeg.add(thighL); this.leftLeg.add(shinL); this.leftLeg.add(bootL);
        this.leftLeg.position.set(-0.24, 0.9, 0);
        this.meshGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Group();
        const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), camoMat);
        thighR.position.y = -0.25;
        const shinR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), camoMat);
        shinR.position.y = -0.7;
        const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), bootMat);
        bootR.position.set(0, -0.95, -0.06);
        this.rightLeg.add(thighR); this.rightLeg.add(shinR); this.rightLeg.add(bootR);
        this.rightLeg.position.set(0.24, 0.9, 0);
        this.meshGroup.add(this.rightLeg);

        // 4. Human Arms & Gloved Hand Weapon Socket
        this.armGroup = new THREE.Group();
        this.armGroup.position.set(0, 1.5, 0);

        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), skinMat);
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
            if (code === 'Space') {
                if (this.isGrounded) {
                    this.velocity.y = this.jumpForce;
                    this.isGrounded = false;
                    this.isCrouching = false;
                    this.isProne = false;
                }
            }
            if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = true;
            if (code === 'KeyC') {
                this.isCrouching = !this.isCrouching;
                this.isProne = false;
            }
            if (code === 'KeyZ') {
                this.isProne = !this.isProne;
                this.isCrouching = false;
            }
            if (code === 'KeyG') {
                this.deployGlooWall();
            }
            if (code === 'KeyH') {
                this.useMedkit();
            }
        } else {
            if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = false;
        }
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
            emissiveIntensity: 0.5,
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
    }

    takeDamage(amount, attacker) {
        if (!this.isAlive) return;

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

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
        }

        let currentSpeed = this.speed;
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

        const stepX = this.velocity.x * delta;
        const stepZ = this.velocity.z * delta;

        let nextX = this.position.x + stepX;
        let nextZ = this.position.z + stepZ;
        let nextY = this.position.y + this.velocity.y * delta;

        const playerRadius = 0.5;

        for (let col of this.world.colliders) {
            const minX = col.box.min.x - playerRadius;
            const maxX = col.box.max.x + playerRadius;
            const minZ = col.box.min.z - playerRadius;
            const maxZ = col.box.max.z + playerRadius;

            if (nextX >= minX && nextX <= maxX && this.position.z >= minZ && this.position.z <= maxZ) {
                nextX = this.position.x;
                break;
            }
        }

        for (let col of this.world.colliders) {
            const minX = col.box.min.x - playerRadius;
            const maxX = col.box.max.x + playerRadius;
            const minZ = col.box.min.z - playerRadius;
            const maxZ = col.box.max.z + playerRadius;

            if (nextX >= minX && nextX <= maxX && nextZ >= minZ && nextZ <= maxZ) {
                nextZ = this.position.z;
                break;
            }
        }

        let eyeOffset = 1.5;
        if (this.isProne) eyeOffset = 0.35;
        else if (this.isCrouching) eyeOffset = 0.9;

        const groundY = this.world.getTerrainHeight(nextX, nextZ) + eyeOffset;
        if (nextY <= groundY) {
            nextY = groundY;
            this.velocity.y = 0;
            this.isGrounded = true;
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
