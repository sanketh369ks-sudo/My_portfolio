
class LootManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.lootItems = [];
        this.airdrops = [];

        this.spawnInitialLoot();
    }

    spawnInitialLoot() {
        const weaponTypes = [
            { id: 'ak47', name: 'AK-47 Rifle', category: 'weapon', color: 0xffaa00, count: 1 },
            { id: 'awm', name: 'AWM Sniper', category: 'weapon', color: 0xff0055, count: 1 },
            { id: 'mp40', name: 'MP40 SMG', category: 'weapon', color: 0x00f0ff, count: 1 },
            { id: 'm1887', name: 'M1887 Shotgun', category: 'weapon', color: 0xff5500, count: 1 },
            { id: 'plasma', name: 'Plasma Rifle', category: 'weapon', color: 0x00ffff, count: 1 },
            { id: 'deagle', name: 'Desert Eagle', category: 'weapon', color: 0xffd700, count: 1 },
            { id: 'm60', name: 'M60 Heavy LMG', category: 'weapon', color: 0xffaa00, count: 1 }
        ];

        const supplyTypes = [
            { id: 'ammo_ak47', name: '7.62mm Ammo (+60)', category: 'ammo', weaponId: 'ak47', amount: 60, color: 0xffaa00 },
            { id: 'ammo_awm', name: 'Sniper Rounds (+10)', category: 'ammo', weaponId: 'awm', amount: 10, color: 0xff0055 },
            { id: 'ammo_mp40', name: 'SMG Ammo (+70)', category: 'ammo', weaponId: 'mp40', amount: 70, color: 0x00f0ff },
            { id: 'armor', name: 'Body Armor (+50)', category: 'armor', amount: 50, color: 0x1e90ff },
            { id: 'medkit', name: 'Medkit (+1)', category: 'medkit', amount: 1, color: 0x20e2a3 },
            { id: 'gloo', name: 'Gloo Wall Shield (+2)', category: 'gloo', amount: 2, color: 0x00f0ff }
        ];

        // 1. ALL 6 WEAPONS & GLOO WALLS RESTING ON THE GROUND RIGHT AT PLAYER SPAWN!
        const playerSpawn = this.world.spawnPoints[0] || new THREE.Vector3(0, 2, 0);

        weaponTypes.forEach((w, idx) => {
            const angle = (idx / weaponTypes.length) * Math.PI * 2;
            const x = playerSpawn.x + Math.cos(angle) * 4.5;
            const z = playerSpawn.z + Math.sin(angle) * 4.5;
            const y = this.world.getTerrainHeight(x, z);
            this.createLootItem(x, y, z, w);
        });

        // 4 Starter Medkits & Gloo Walls on ground at spawn
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + 0.5;
            const x = playerSpawn.x + Math.cos(angle) * 6.5;
            const z = playerSpawn.z + Math.sin(angle) * 6.5;
            const y = this.world.getTerrainHeight(x, z);
            this.createLootItem(x, y, z, { id: 'gloo', name: 'Gloo Wall Shield (+2)', category: 'gloo', amount: 2, color: 0x00f0ff });
            this.createLootItem(x + 1, y, z + 1, { id: 'medkit', name: 'Medkit (+1)', category: 'medkit', amount: 1, color: 0x20e2a3 });
        }

        // 2. FLOOR LOOT ON ROOM FLOORS INSIDE REAL HOUSES
        const houseLocations = [
            { x: -60, z: -60 }, { x: 70, z: -50 }, { x: -80, z: 70 },
            { x: 60, z: 80 }, { x: 0, z: -120 }, { x: -120, z: 0 }, { x: 120, z: 20 }
        ];

        houseLocations.forEach(h => {
            const wItem = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
            const sItem = supplyTypes[Math.floor(Math.random() * supplyTypes.length)];
            const groundY = this.world.getTerrainHeight(h.x, h.z);

            this.createLootItem(h.x - 2, groundY, h.z, wItem);
            this.createLootItem(h.x + 2, groundY, h.z, sItem);
            this.createLootItem(h.x, groundY, h.z + 2, { id: 'gloo', name: 'Gloo Wall Shield (+2)', category: 'gloo', amount: 2, color: 0x00f0ff });
            this.createLootItem(h.x - 1, groundY, h.z - 2, { id: 'medkit', name: 'Medkit (+1)', category: 'medkit', amount: 1, color: 0x20e2a3 });
        });

        // 3. SCATTER REMAINING GROUND LOOT ACROSS THE ISLAND
        for (let i = 0; i < 30; i++) {
            const template = [...weaponTypes, ...supplyTypes][Math.floor(Math.random() * (weaponTypes.length + supplyTypes.length))];
            const x = (Math.random() - 0.5) * 360;
            const z = (Math.random() - 0.5) * 360;
            const y = this.world.getTerrainHeight(x, z);
            this.createLootItem(x, y, z, template);
        }

        // Spawn Initial Air Drop!
        this.spawnAirdrop(20, -20);
    }

    createLootItem(x, y, z, itemData) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        if (itemData.category === 'weapon') {
            // Actual 3D Gun Model lying flat on ground!
            const gunMesh = this.buildGroundWeaponMesh(itemData.id);
            gunMesh.position.y = 0.2;
            group.add(gunMesh);
        } else if (itemData.category === 'medkit') {
            // 3D White Medical Box with Green Cross (+)
            const medMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
            const crossMat = new THREE.MeshStandardMaterial({ color: 0x20e2a3, emissive: 0x20e2a3, emissiveIntensity: 0.6 });

            const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.5), medMat);
            box.position.y = 0.18;
            box.castShadow = true;

            const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.52), crossMat);
            crossH.position.y = 0.18;

            const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.52), crossMat);
            crossV.position.y = 0.18;

            group.add(box); group.add(crossH); group.add(crossV);
        } else if (itemData.category === 'gloo') {
            // 3D Cyan Ice/Energy Capsule Shield Module
            const glooMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.7, roughness: 0.2 });
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.75, 12), glooMat);
            cap.rotateZ(Math.PI / 2);
            cap.position.y = 0.22;
            cap.castShadow = true;
            group.add(cap);
        } else if (itemData.category === 'ammo') {
            // 3D Brass Ammo Pack
            const ammoMat = new THREE.MeshStandardMaterial({ color: itemData.color, metalness: 0.8, roughness: 0.3 });
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.38), ammoMat);
            box.position.y = 0.16;
            box.castShadow = true;
            group.add(box);
        } else {
            // 3D Armor Vest
            const armorMat = new THREE.MeshStandardMaterial({ color: 0x1e90ff, metalness: 0.7 });
            const vest = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.35), armorMat);
            vest.position.y = 0.22;
            vest.castShadow = true;
            group.add(vest);
        }

        // Soft ground glowing emissive aura (High Performance - No PointLight overload)
        this.scene.add(group);

        this.lootItems.push({
            group: group,
            data: itemData,
            position: new THREE.Vector3(x, y, z),
            isPickedUp: false
        });
    }

    buildGroundWeaponMesh(weaponId) {
        const weaponGroup = new THREE.Group();

        if (weaponId === 'ak47') {
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.85 });
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.7 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 1.1), bodyMat);
            const stock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.25, 0.5), woodMat);
            stock.position.set(0, -0.04, 0.5);
            weaponGroup.add(body); weaponGroup.add(stock);
        } else if (weaponId === 'awm') {
            const camoMat = new THREE.MeshStandardMaterial({ color: 0x3b5323, roughness: 0.6 });
            const barrelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 1.4), camoMat);
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4), barrelMat);
            barrel.rotateX(Math.PI / 2); barrel.position.set(0, 0.04, -1.0);
            weaponGroup.add(body); weaponGroup.add(barrel);
        } else if (weaponId === 'm60') {
            const steelMat = new THREE.MeshStandardMaterial({ color: 0x636e72, metalness: 0.85 });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, metalness: 0.9 });
            const brassMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.95 });

            const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 1.2), steelMat);
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3), steelMat);
            barrel.rotateX(Math.PI / 2); barrel.position.set(0, 0.04, -0.9);

            const bipodL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55), darkMat);
            bipodL.position.set(-0.18, -0.25, -1.1); bipodL.rotation.z = -0.3;

            const bipodR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55), darkMat);
            bipodR.position.set(0.18, -0.25, -1.1); bipodR.rotation.z = 0.3;

            const ammoBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.25, 0.28), darkMat);
            ammoBox.position.set(-0.2, -0.25, -0.1);

            weaponGroup.add(body); weaponGroup.add(barrel); weaponGroup.add(bipodL); weaponGroup.add(bipodR); weaponGroup.add(ammoBox);
        } else {
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, metalness: 0.9 });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.9), bodyMat);
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7), glowMat);
            barrel.rotateX(Math.PI / 2); barrel.position.set(0, 0.04, -0.6);
            weaponGroup.add(body); weaponGroup.add(barrel);
        }

        weaponGroup.rotation.y = Math.random() * Math.PI * 2;
        return weaponGroup;
    }

    spawnAirdrop(targetX, targetZ) {
        const groundY = this.world.getTerrainHeight(targetX, targetZ) + 1.2;
        const dropGroup = new THREE.Group();
        dropGroup.position.set(targetX, 70, targetZ);

        const crateMat = new THREE.MeshStandardMaterial({ color: 0xd63031, metalness: 0.9, roughness: 0.2 });
        const goldBandMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95 });
        const crate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), crateMat);
        crate.castShadow = true;
        dropGroup.add(crate);

        const band = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 2.3), goldBandMat);
        dropGroup.add(band);

        const chuteMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, side: THREE.DoubleSide });
        const chute = new THREE.Mesh(new THREE.ConeGeometry(5.5, 3.5, 12, 1, true), chuteMat);
        chute.position.y = 6.5;
        dropGroup.add(chute);

        const smokeLight = new THREE.PointLight(0xff0055, 4, 25);
        smokeLight.position.set(0, 1.5, 0);
        dropGroup.add(smokeLight);

        this.scene.add(dropGroup);

        this.airdrops.push({
            group: dropGroup,
            targetY: groundY,
            currentY: 70,
            isLanded: false,
            light: smokeLight,
            contents: { id: 'awm', name: 'AWM Sniper', category: 'weapon', color: 0xff0055 }
        });

        if (window.gameInstance && window.gameInstance.ui) {
            window.gameInstance.ui.addKillFeed('SYSTEM', 'ISLAND', '✈️ AIRDROP INBOUND!', true);
        }
    }

    checkPlayerProximity(playerPos) {
        for (let loot of this.lootItems) {
            if (loot.isPickedUp) continue;
            const dist = loot.position.distanceTo(playerPos);
            if (dist < 3.2) {
                return loot;
            }
        }
        return null;
    }

    pickupLoot(loot, player, weaponSys) {
        if (!loot || loot.isPickedUp) return;
        loot.isPickedUp = true;
        this.scene.remove(loot.group);

        audioManager.playPickup();

        const data = loot.data;
        if (data.category === 'weapon') {
            const newGunId = data.id;
            const droppedGunId = weaponSys.equipOrSwapWeapon(newGunId);

            if (droppedGunId && weaponSys.weapons[droppedGunId]) {
                const oldDef = weaponSys.weapons[droppedGunId];
                const pos = player.position.clone();
                const groundY = this.world.getTerrainHeight(pos.x, pos.z);

                this.createLootItem(pos.x + (Math.random() - 0.5) * 1.5, groundY, pos.z + (Math.random() - 0.5) * 1.5, {
                    id: droppedGunId,
                    name: oldDef.name,
                    category: 'weapon',
                    color: oldDef.color,
                    count: 1
                });

                if (window.gameInstance && window.gameInstance.ui) {
                    window.gameInstance.ui.showHealText(`SWAPPED FOR ${weaponSys.weapons[newGunId].name}`);
                }
            } else {
                if (window.gameInstance && window.gameInstance.ui) {
                    window.gameInstance.ui.showHealText(`EQUIPPED ${data.name}`);
                }
            }
        } else if (data.category === 'ammo') {
            weaponSys.makeAmmoUnlimited();
            if (window.gameInstance && window.gameInstance.ui) {
                window.gameInstance.ui.showHealText('⚡ UNLIMITED BULLETS!');
            }
        } else if (data.category === 'armor') {
            player.armor = Math.min(player.maxArmor, player.armor + data.amount);
        } else if (data.category === 'medkit') {
            player.medkits += data.amount;
        } else if (data.category === 'gloo') {
            player.glooWalls += data.amount;
        }
    }

    update(player, weaponSys) {
        const time = performance.now() * 0.003;

        // Automatic Auto-Pickup for bullets/ammo, medkits, armor, gloo walls, and guns when carrying < 2 guns
        if (player && player.isAlive && weaponSys) {
            for (let i = 0; i < this.lootItems.length; i++) {
                const loot = this.lootItems[i];
                if (loot.isPickedUp) continue;
                const dist = loot.group.position.distanceTo(player.position);
                if (dist < 3.2) {
                    const category = loot.data.category;
                    if (category === 'ammo' || category === 'medkit' || category === 'armor' || category === 'gloo') {
                        this.pickupLoot(loot, player, weaponSys);
                    } else if (category === 'weapon' && weaponSys.carriedWeapons.length < 2) {
                        this.pickupLoot(loot, player, weaponSys);
                    }
                }
            }
        }

        // Slow subtle rotation for ground loot items
        this.lootItems.forEach(loot => {
            if (!loot.isPickedUp) {
                loot.group.rotation.y += 0.015;
            }
        });

        // Descending Air Drops animation
        this.airdrops.forEach(drop => {
            if (!drop.isLanded) {
                drop.currentY -= 0.15;
                if (drop.currentY <= drop.targetY) {
                    drop.currentY = drop.targetY;
                    drop.isLanded = true;
                    this.createLootItem(drop.group.position.x, drop.targetY, drop.group.position.z, drop.contents);
                    this.createLootItem(drop.group.position.x + 1.5, drop.targetY, drop.group.position.z, { id: 'gloo', name: 'Gloo Wall Shield (+4)', category: 'gloo', amount: 4, color: 0x00f0ff });
                }
                drop.group.position.y = drop.currentY;
            } else {
                drop.light.intensity = 2 + Math.sin(time * 5) * 1.5;
            }
        });
    }
}
