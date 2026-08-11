/**
 * Shrinking Safe Zone (Battle Royale Storm Barrier)
 * Controls translucent 3D energy wall barrier, countdown timer, zone shrinking phases, and damage outside zone.
 */
class SafeZoneManager {
    constructor(scene, worldSize) {
        this.scene = scene;
        this.worldSize = worldSize;

        this.phases = [
            { initialDelay: 35, shrinkTime: 30, targetRadius: 170, damage: 4 },
            { initialDelay: 25, shrinkTime: 25, targetRadius: 90, damage: 7 },
            { initialDelay: 20, shrinkTime: 20, targetRadius: 35, damage: 12 },
            { initialDelay: 15, shrinkTime: 15, targetRadius: 8, damage: 20 }
        ];

        this.currentPhaseIndex = 0;
        this.currentRadius = 240;
        this.startRadius = 240;
        this.targetRadius = 240;

        this.currentCenter = new THREE.Vector3(0, 0, 0);
        this.startCenter = new THREE.Vector3(0, 0, 0);
        this.targetCenter = new THREE.Vector3(0, 0, 0);

        this.state = 'WAITING'; // WAITING, SHRINKING, COMPLETED
        this.timer = this.phases[0].initialDelay;
        this.shrinkDuration = 30;
        this.lastDamageTick = 0;

        this.createZoneMesh();
    }

    createZoneMesh() {
        const geo = new THREE.CylinderGeometry(240, 240, 150, 64, 1, true);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });

        this.zoneMesh = new THREE.Mesh(geo, mat);
        this.zoneMesh.position.set(0, 75, 0);
        this.scene.add(this.zoneMesh);
    }

    update(delta, player, bots) {
        this.timer -= delta;

        if (this.state === 'WAITING' && this.timer <= 0) {
            const phase = this.phases[this.currentPhaseIndex];
            this.state = 'SHRINKING';
            this.timer = phase.shrinkTime;
            this.shrinkDuration = phase.shrinkTime;

            this.startRadius = this.currentRadius;
            this.targetRadius = phase.targetRadius;

            this.startCenter.copy(this.currentCenter);
            this.targetCenter.set(
                this.currentCenter.x + (Math.random() - 0.5) * 40,
                0,
                this.currentCenter.z + (Math.random() - 0.5) * 40
            );
        } else if (this.state === 'SHRINKING') {
            const progress = Math.min(1, Math.max(0, 1 - (this.timer / this.shrinkDuration)));

            this.currentRadius = THREE.MathUtils.lerp(this.startRadius, this.targetRadius, progress);
            this.currentCenter.lerpVectors(this.startCenter, this.targetCenter, progress);

            if (this.timer <= 0) {
                this.state = 'WAITING';
                if (this.currentPhaseIndex < this.phases.length - 1) {
                    this.currentPhaseIndex++;
                    this.timer = this.phases[this.currentPhaseIndex].initialDelay;
                } else {
                    this.state = 'COMPLETED';
                }
            }
        }

        // Update 3D Visual Mesh
        const scaleFactor = Math.max(0.01, this.currentRadius / 240);
        this.zoneMesh.scale.set(scaleFactor, 1, scaleFactor);
        this.zoneMesh.position.x = this.currentCenter.x;
        this.zoneMesh.position.z = this.currentCenter.z;

        // Pulsing animation
        const time = performance.now() * 0.003;
        this.zoneMesh.material.opacity = 0.3 + Math.sin(time) * 0.1;

        // Damage Players & Bots Outside Safe Zone
        const now = performance.now() * 0.001;
        if (now - this.lastDamageTick > 1.2) {
            this.lastDamageTick = now;
            const currentDmg = this.phases[this.currentPhaseIndex].damage;

            // Check Player
            if (player.isAlive && !this.isInsideZone(player.position)) {
                player.takeDamage(currentDmg);
                if (!player.isAlive && window.gameInstance && window.gameInstance.ui) {
                    window.gameInstance.ui.addKillFeed('Safe Zone Storm ⚡', 'Player', 'Out of Zone', false);
                }
            }

            // Check Bots
            bots.forEach(bot => {
                if (bot.isAlive && !this.isInsideZone(bot.position)) {
                    bot.takeDamage(currentDmg);
                    if (!bot.isAlive && window.gameInstance && window.gameInstance.ui) {
                        window.gameInstance.ui.addKillFeed('Safe Zone Storm ⚡', bot.name, 'Out of Zone', false);
                    }
                }
            });
        }
    }

    isInsideZone(pos) {
        const dist = new THREE.Vector2(pos.x, pos.z).distanceTo(new THREE.Vector2(this.currentCenter.x, this.currentCenter.z));
        return dist <= this.currentRadius;
    }
}
