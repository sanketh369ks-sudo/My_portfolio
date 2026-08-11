/**
 * Weapons & Ballistics Raycasting System
 * Defines AK-47, AWM Sniper, MP40 SMG, M1887 Shotgun, Plasma Rifle, and Desert Eagle sidearm.
 */
class WeaponSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();

        this.weapons = {
            ak47: {
                id: 'ak47',
                name: 'AK-47 Rifle',
                type: 'AR',
                damage: 38,
                fireRate: 0.11,
                magSize: 30,
                currentAmmo: 30,
                reserveAmmo: 120,
                reloadTime: 2.0,
                spread: 0.022,
                range: 350,
                color: 0xffaa00
            },
            awm: {
                id: 'awm',
                name: 'AWM Sniper',
                type: 'SR',
                damage: 120,
                fireRate: 1.25,
                magSize: 5,
                currentAmmo: 5,
                reserveAmmo: 20,
                reloadTime: 3.0,
                spread: 0.001,
                range: 600,
                color: 0xff0055
            },
            mp40: {
                id: 'mp40',
                name: 'MP40 SMG',
                type: 'SMG',
                damage: 22,
                fireRate: 0.07,
                magSize: 35,
                currentAmmo: 35,
                reserveAmmo: 140,
                reloadTime: 1.6,
                spread: 0.035,
                range: 200,
                color: 0x00f0ff
            },
            m1887: {
                id: 'm1887',
                name: 'M1887 Shotgun',
                type: 'SG',
                damage: 26,
                pellets: 10,
                fireRate: 0.65,
                magSize: 2,
                currentAmmo: 2,
                reserveAmmo: 24,
                reloadTime: 1.9,
                spread: 0.085,
                range: 75,
                color: 0xff5500
            },
            plasma: {
                id: 'plasma',
                name: 'Plasma Rifle',
                type: 'AR',
                damage: 32,
                fireRate: 0.12,
                magSize: 30,
                currentAmmo: 30,
                reserveAmmo: 120,
                reloadTime: 1.8,
                spread: 0.015,
                range: 350,
                color: 0x00ffff
            },
            deagle: {
                id: 'deagle',
                name: 'Desert Eagle',
                type: 'HG',
                damage: 48,
                fireRate: 0.25,
                magSize: 7,
                currentAmmo: 7,
                reserveAmmo: 35,
                reloadTime: 1.4,
                spread: 0.012,
                range: 250,
                color: 0xffd700
            }
        };

        this.equippedKey = 'ak47';
        this.isReloading = false;
        this.lastFireTime = 0;

        this.tracers = [];
        this.sparks = [];
        this.flashes = [];
    }

    get currentWeapon() {
        return this.weapons[this.equippedKey];
    }

    switchWeapon(key) {
        if (this.weapons[key] && !this.isReloading) {
            this.equippedKey = key;
            audioManager.playReload();
            if (window.gameInstance && window.gameInstance.player) {
                window.gameInstance.player.attachWeapon3D(key);
            }
        }
    }

    reload() {
        const w = this.currentWeapon;
        if (this.isReloading || w.currentAmmo >= w.magSize || w.reserveAmmo <= 0) return;

        this.isReloading = true;
        audioManager.playReload();

        setTimeout(() => {
            const needed = w.magSize - w.currentAmmo;
            const reloaded = Math.min(needed, w.reserveAmmo);
            w.currentAmmo += reloaded;
            w.reserveAmmo -= reloaded;
            this.isReloading = false;
        }, w.reloadTime * 1000);
    }

    fire(originPos, direction, shooter, targets, solidMeshes = []) {
        const now = performance.now() * 0.001;
        const w = this.currentWeapon;

        if (this.isReloading || now - this.lastFireTime < w.fireRate) return null;

        if (w.currentAmmo <= 0) {
            this.reload();
            return null;
        }

        w.currentAmmo--;
        this.lastFireTime = now;

        // Play Gunshot SFX
        if (w.id === 'ak47' || w.id === 'deagle') audioManager.playPlasmaShot();
        else if (w.id === 'm1887') audioManager.playShotgunShot();
        else if (w.id === 'awm') audioManager.playSniperShot();
        else audioManager.playPlasmaShot();

        this.createMuzzleFlash(shooter.position.clone().add(new THREE.Vector3(0, 1.2, 0)), w.color);

        const hits = [];
        const pelletCount = w.pellets || 1;

        const targetMeshMap = new Map();
        const targetMeshes = [];

        targets.forEach(t => {
            if (t && t !== shooter && t.isAlive) {
                const group = t.meshGroup || t.mesh;
                if (group) {
                    targetMeshes.push(group);
                    targetMeshMap.set(group.id, t);
                    group.traverse(child => {
                        if (child.isMesh) targetMeshMap.set(child.id, t);
                    });
                }
            }
        });

        const obstacleMeshes = solidMeshes.filter(m => m !== window.gameInstance?.world?.terrainMesh);

        const shooterMeshIds = new Set();
        if (shooter.meshGroup) {
            shooterMeshIds.add(shooter.meshGroup.id);
            shooter.meshGroup.traverse(child => shooterMeshIds.add(child.id));
        }

        const tracerStart = shooter.position.clone().add(new THREE.Vector3(0, 1.2, 0));

        for (let p = 0; p < pelletCount; p++) {
            let currentSpread = w.spread;
            if (shooter.isAiming) {
                currentSpread *= 0.25; // 75% accuracy precision bonus when scoped!
            }

            const spreadVec = new THREE.Vector3(
                (Math.random() - 0.5) * currentSpread,
                (Math.random() - 0.5) * currentSpread,
                (Math.random() - 0.5) * currentSpread
            );
            const fireDir = direction.clone().add(spreadVec).normalize();

            this.raycaster.set(originPos, fireDir);
            this.raycaster.far = w.range;

            const enemyIntersects = this.raycaster.intersectObjects(targetMeshes, true);
            let closestEnemyHit = null;

            for (let hit of enemyIntersects) {
                if (shooterMeshIds.has(hit.object.id)) continue;
                const targetObj = targetMeshMap.get(hit.object.id);
                if (targetObj && targetObj !== shooter && targetObj.isAlive) {
                    closestEnemyHit = { hit: hit, target: targetObj };
                    break;
                }
            }

            const obstacleIntersects = this.raycaster.intersectObjects(obstacleMeshes, true);
            let closestWallHit = null;

            for (let hit of obstacleIntersects) {
                if (shooterMeshIds.has(hit.object.id)) continue;
                closestWallHit = hit;
                break;
            }

            let tracerEndPos = originPos.clone().addScaledVector(fireDir, w.range);

            if (closestEnemyHit && (!closestWallHit || closestEnemyHit.hit.distance < closestWallHit.distance)) {
                const hitTarget = closestEnemyHit.target;
                tracerEndPos = closestEnemyHit.hit.point;

                // Headshot height check (impact Y relative to target root ground level)
                const relativeHitY = closestEnemyHit.hit.point.y - (hitTarget.position.y - 1.5);
                const isHeadshot = (relativeHitY >= 1.65);
                const finalDamage = isHeadshot ? Math.round(w.damage * 2.5) : w.damage;

                hitTarget.takeDamage(finalDamage, shooter);
                hits.push(hitTarget);

                if (shooter.isPlayer) {
                    audioManager.playHitMarker();
                    shooter.damageDealt += finalDamage;

                    if (window.gameInstance && window.gameInstance.ui) {
                        window.gameInstance.ui.triggerHitMarker(isHeadshot);
                        if (isHeadshot) {
                            window.gameInstance.ui.triggerHeadshotBanner();
                        }
                    }
                }

                if (!hitTarget.isAlive && window.gameInstance && window.gameInstance.ui) {
                    const killMethod = isHeadshot ? `${w.name} (🎯 HEADSHOT)` : w.name;
                    window.gameInstance.ui.addKillFeed(
                        shooter.isPlayer ? 'Player' : shooter.name,
                        hitTarget.isPlayer ? 'Player' : hitTarget.name,
                        killMethod,
                        shooter.isPlayer
                    );
                }
            } else if (closestWallHit) {
                tracerEndPos = closestWallHit.point;
                this.createSpark(closestWallHit.point);
            }

            this.createTracer(tracerStart, tracerEndPos, w.color);
        }

        return hits;
    }

    createTracer(start, end, colorHex) {
        const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
        const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });
        const line = new THREE.Line(geo, mat);

        this.scene.add(line);
        this.tracers.push({ mesh: line, createdAt: performance.now() });
    }

    createMuzzleFlash(pos, colorHex) {
        const light = new THREE.PointLight(colorHex, 3, 10);
        light.position.copy(pos);
        this.scene.add(light);
        this.flashes.push({ light: light, createdAt: performance.now() });
    }

    createSpark(pos) {
        const pGeo = new THREE.SphereGeometry(0.15, 6, 6);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 1 });
        const spark = new THREE.Mesh(pGeo, pMat);
        spark.position.copy(pos);

        this.scene.add(spark);
        this.sparks.push({ mesh: spark, createdAt: performance.now() });
    }

    update() {
        const now = performance.now();

        for (let i = this.tracers.length - 1; i >= 0; i--) {
            if (now - this.tracers[i].createdAt > 70) {
                this.scene.remove(this.tracers[i].mesh);
                this.tracers.splice(i, 1);
            }
        }

        for (let i = this.sparks.length - 1; i >= 0; i--) {
            if (now - this.sparks[i].createdAt > 100) {
                this.scene.remove(this.sparks[i].mesh);
                this.sparks.splice(i, 1);
            }
        }

        for (let i = this.flashes.length - 1; i >= 0; i--) {
            if (now - this.flashes[i].createdAt > 50) {
                this.scene.remove(this.flashes[i].light);
                this.flashes.splice(i, 1);
            }
        }
    }
}
