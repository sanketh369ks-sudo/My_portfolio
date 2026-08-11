/**
 * Autonomous AI Bots Manager (Battle Royale Competitors)
 * Tactical FSM AI: Patrols island, loots crates, maintains tactical standoff distance (15-25m), strafes during gunfights, and retreats if rushed.
 */
class BotManager {
    constructor(scene, world, weaponSys) {
        this.scene = scene;
        this.world = world;
        this.weaponSys = weaponSys;
        this.bots = [];

        this.botNames = [
            'CyberBot_Alpha', 'Viper_X', 'Shadow_Hunter', 'Apex_Predator', 'Phantom_Zero',
            'Neon_Stalker', 'Ghost_Rider', 'Titan_Mech', 'Blaze_Runner'
        ];
    }

    spawnBots(count, player) {
        this.clearBots();
        const spawnIndices = [...Array(this.world.spawnPoints.length).keys()].sort(() => Math.random() - 0.5);

        for (let i = 0; i < count; i++) {
            const spawnPos = this.world.spawnPoints[spawnIndices[i % spawnIndices.length]] || new THREE.Vector3(50, 2, 50);
            const botName = this.botNames[i % this.botNames.length];
            const bot = new AIBot(this.scene, this.world, this.weaponSys, spawnPos, botName);
            this.bots.push(bot);
        }
    }

    clearBots() {
        this.bots.forEach(b => b.destroy());
        this.bots = [];
    }

    update(delta, player, zone) {
        const aliveTargets = [player, ...this.bots].filter(t => t.isAlive);

        this.bots.forEach(bot => {
            if (bot.isAlive) {
                bot.update(delta, aliveTargets, zone, player);
            }
        });
    }

    getAliveCount() {
        return this.bots.filter(b => b.isAlive).length;
    }
}

class AIBot {
    constructor(scene, world, weaponSys, spawnPos, name) {
        this.scene = scene;
        this.world = world;
        this.weaponSys = weaponSys;
        this.name = name;
        this.isBot = true;

        this.maxHp = 100;
        this.hp = 100;
        this.armor = 25;
        this.isAlive = true;

        this.position = spawnPos.clone();
        this.velocity = new THREE.Vector3();
        this.speed = 4.8;
        this.rotationY = Math.random() * Math.PI * 2;

        this.target = null;
        this.lastFireTime = 0;
        this.fireInterval = 0.85 + Math.random() * 0.5;
        this.patrolTarget = this.getRandomPatrolPoint();

        // Tactical Strafe Timer & Direction
        this.strafeDir = Math.random() > 0.5 ? 1 : -1;
        this.lastStrafeChange = 0;

        this.createMesh();
    }

    createMesh() {
        this.meshGroup = new THREE.Group();

        // Sci-Fi Enemy Guard Skins (Red Enemy Guards & Green Guards matching reference image)
        const skins = [
            { main: 0xff1e43, accent: 0x900c3f, visor: 0xff0033 }, // Crimson Red Enemy Guard
            { main: 0xd63031, accent: 0x2d3436, visor: 0xff4757 }, // Dark Red Enemy Operator
            { main: 0x2ed573, accent: 0x10ac84, visor: 0x00ff88 }, // Vibrant Green Guard
            { main: 0xee5253, accent: 0x1e272e, visor: 0xff0033 }  // Glossy Red Guard
        ];
        const selectedSkin = skins[Math.floor(Math.random() * skins.length)];

        const bodyMat = new THREE.MeshStandardMaterial({ color: selectedSkin.main, roughness: 0.25, metalness: 0.3 });
        const accentMat = new THREE.MeshStandardMaterial({ color: selectedSkin.accent, roughness: 0.4, metalness: 0.7 });
        const visorMat = new THREE.MeshStandardMaterial({ color: selectedSkin.visor, emissive: selectedSkin.visor, emissiveIntensity: 0.95 });
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });

        // 1. Enemy Guard Torso & Chest Armor
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.7, 0.45), bodyMat);
        chest.position.y = 1.35;
        chest.castShadow = true;
        this.meshGroup.add(chest);

        const tacticalVest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.5), bodyMat);
        tacticalVest.position.y = 1.35;
        tacticalVest.castShadow = true;
        this.meshGroup.add(tacticalVest);

        const harness = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.15, 0.52), accentMat);
        harness.position.y = 1.05;
        this.meshGroup.add(harness);

        // 2. Enemy Guard Head & Glowing Visor
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 18), bodyMat);
        head.position.y = 1.95;
        head.castShadow = true;
        this.meshGroup.add(head);

        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.22), visorMat);
        visor.position.set(0, 1.98, -0.18);
        this.meshGroup.add(visor);

        // 3. Enemy Jointed Legs
        this.leftLeg = new THREE.Group();
        const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), bodyMat);
        thighL.position.y = -0.25;
        const kneeL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), accentMat);
        kneeL.position.y = -0.55;
        const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), bodyMat);
        shinL.position.y = -0.7;
        const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), accentMat);
        bootL.position.set(0, -0.95, -0.06);
        this.leftLeg.add(thighL); this.leftLeg.add(kneeL); this.leftLeg.add(shinL); this.leftLeg.add(bootL);
        this.leftLeg.position.set(-0.24, 0.9, 0);
        this.meshGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Group();
        const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), bodyMat);
        thighR.position.y = -0.25;
        const kneeR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), accentMat);
        kneeR.position.y = -0.55;
        const shinR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.5, 0.26), bodyMat);
        shinR.position.y = -0.7;
        const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), accentMat);
        bootR.position.set(0, -0.95, -0.06);
        this.rightLeg.add(thighR); this.rightLeg.add(kneeR); this.rightLeg.add(shinR); this.rightLeg.add(bootR);
        this.rightLeg.position.set(0.24, 0.9, 0);
        this.meshGroup.add(this.rightLeg);

        // 4. Enemy Arm & Weapon Model
        const armGroup = new THREE.Group();
        armGroup.position.set(0, 1.5, 0);

        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), bodyMat);
        rightArm.position.set(0.52, -0.15, -0.3);
        rightArm.rotation.x = -Math.PI / 3;
        armGroup.add(rightArm);

        const gunGroup = new THREE.Group();
        gunGroup.position.set(0.55, -0.15, -0.75);

        const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 1.1), gunMat);
        const barrelMat = new THREE.MeshStandardMaterial({ color: selectedSkin.visor, emissive: selectedSkin.visor, emissiveIntensity: 0.85 });
        const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8), barrelMat);
        gunBarrel.rotateX(Math.PI / 2);
        gunBarrel.position.set(0, 0.05, -0.7);

        gunGroup.add(gunBody);
        gunGroup.add(gunBarrel);
        armGroup.add(gunGroup);

        this.meshGroup.add(armGroup);

        // Generous Invisible Combat Hitbox
        const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 1.2), hitboxMat);
        hitbox.position.y = 1.2;
        this.meshGroup.add(hitbox);

        this.meshGroup.position.copy(this.position);
        this.scene.add(this.meshGroup);
    }

    getRandomPatrolPoint() {
        return new THREE.Vector3(
            (Math.random() - 0.5) * 320,
            0,
            (Math.random() - 0.5) * 320
        );
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

        if (attacker) {
            this.target = attacker; // Lock target on attacker
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            this.scene.remove(this.meshGroup);

            if (attacker && attacker.isPlayer) {
                attacker.kills++;
            }
        }
    }

    update(delta, targets, zone, player) {
        if (!this.isAlive) return;

        const now = performance.now() * 0.001;

        // Zone Safety Logic: If outside zone, run to zone center!
        const distToZoneCenter = new THREE.Vector2(this.position.x, this.position.z)
            .distanceTo(new THREE.Vector2(zone.currentCenter.x, zone.currentCenter.z));

        let moveVector = new THREE.Vector3();

        if (distToZoneCenter > zone.currentRadius - 10) {
            // Run toward safe zone center
            const zoneCenter = new THREE.Vector3(zone.currentCenter.x, 0, zone.currentCenter.z);
            moveVector = zoneCenter.sub(this.position).normalize();
        } else {
            // Find nearby targets (player or other bots) within 55m
            let closestDist = 55;
            this.target = null;

            for (let t of targets) {
                if (t === this || !t.isAlive) continue;
                const d = this.position.distanceTo(t.position);
                if (d < closestDist) {
                    closestDist = d;
                    this.target = t;
                }
            }

            if (this.target && this.target.isAlive) {
                const targetDist = this.position.distanceTo(this.target.position);
                const toTarget = this.target.position.clone().sub(this.position);
                toTarget.y = 0;
                toTarget.normalize();

                // Smoothly face the target
                const targetAngle = Math.atan2(toTarget.x, toTarget.z);
                let diff = targetAngle - this.rotationY;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.rotationY += diff * Math.min(1, delta * 5.0);

                // Change strafe direction every 2.4 seconds
                if (now - this.lastStrafeChange > 2.4) {
                    this.lastStrafeChange = now;
                    this.strafeDir = Math.random() > 0.5 ? 1 : -1;
                }

                const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

                if (targetDist > 22) {
                    // Approach target
                    moveVector.copy(toTarget);
                } else if (targetDist < 8) {
                    // Retreat backward slowly to maintain gunfight distance
                    moveVector.copy(toTarget.clone().negate().multiplyScalar(0.6));
                } else {
                    // Tactical Standoff (8m - 22m): Strafe left or right smoothly!
                    moveVector.copy(rightVec.multiplyScalar(this.strafeDir * 0.6));
                }
            } else {
                // Patrol mode
                if (this.position.distanceTo(this.patrolTarget) < 5) {
                    this.patrolTarget = this.getRandomPatrolPoint();
                }
                const toPatrol = this.patrolTarget.clone().sub(this.position);
                toPatrol.y = 0;
                if (toPatrol.lengthSq() > 0.1) {
                    moveVector.copy(toPatrol.normalize());
                    const patrolAngle = Math.atan2(moveVector.x, moveVector.z);
                    let pDiff = patrolAngle - this.rotationY;
                    while (pDiff < -Math.PI) pDiff += Math.PI * 2;
                    while (pDiff > Math.PI) pDiff -= Math.PI * 2;
                    this.rotationY += pDiff * Math.min(1, delta * 4.0);
                }
            }
        }

        // Apply movement physics with obstacle sliding
        if (moveVector.lengthSq() > 0.01) {
            moveVector.normalize();
            const stepX = moveVector.x * this.speed * delta;
            const stepZ = moveVector.z * this.speed * delta;

            let nextX = this.position.x + stepX;
            let nextZ = this.position.z + stepZ;
            let nextY = this.world.getTerrainHeight(nextX, nextZ) + 1.5;

            const botRadius = 0.45;
            const feetY = nextY - 1.5;
            const headY = feetY + 2.0;

            if (this.world && this.world.colliders) {
                for (let col of this.world.colliders) {
                    if (feetY < col.box.max.y && headY > col.box.min.y) {
                        const minX = col.box.min.x - botRadius; const maxX = col.box.max.x + botRadius;
                        const minZ = col.box.min.z - botRadius; const maxZ = col.box.max.z + botRadius;

                        if (nextX >= minX && nextX <= maxX && this.position.z >= minZ && this.position.z <= maxZ) {
                            nextX = this.position.x;
                            break;
                        }
                    }
                }

                for (let col of this.world.colliders) {
                    if (feetY < col.box.max.y && headY > col.box.min.y) {
                        const minX = col.box.min.x - botRadius; const maxX = col.box.max.x + botRadius;
                        const minZ = col.box.min.z - botRadius; const maxZ = col.box.max.z + botRadius;

                        if (nextX >= minX && nextX <= maxX && nextZ >= minZ && nextZ <= maxZ) {
                            nextZ = this.position.z;
                            break;
                        }
                    }
                }
            }

            this.position.set(nextX, nextY, nextZ);

            // Realistic Human Leg Swing Animation
            const time = performance.now() * 0.012;
            if (this.leftLeg) this.leftLeg.rotation.x = Math.sin(time) * 0.65;
            if (this.rightLeg) this.rightLeg.rotation.x = -Math.sin(time) * 0.65;
        } else {
            if (this.leftLeg) this.leftLeg.rotation.x = 0;
            if (this.rightLeg) this.rightLeg.rotation.x = 0;
        }

        // Sync Mesh
        this.meshGroup.position.copy(this.position);
        this.meshGroup.position.y -= 1.5;
        this.meshGroup.rotation.y = this.rotationY;

        // Attack Logic
        if (this.target && this.target.isAlive) {
            const dist = this.position.distanceTo(this.target.position);
            if (dist < 50) {
                if (now - this.lastFireTime > this.fireInterval) {
                    this.lastFireTime = now;

                    const fireDir = this.target.position.clone().sub(this.position).normalize();
                    fireDir.x += (Math.random() - 0.5) * 0.06;
                    fireDir.y += (Math.random() - 0.5) * 0.06;
                    fireDir.z += (Math.random() - 0.5) * 0.06;

                    const origin = this.position.clone().add(new THREE.Vector3(0, 1.2, 0));
                    this.weaponSys.fire(origin, fireDir, this, targets, this.world.solidMeshes);
                }
            }
        }
    }

    destroy() {
        this.isAlive = false;
        this.scene.remove(this.meshGroup);
    }
}
