/**
 * World & 3D Environment Manager (Three.js)
 * Builds realistic battle royale island terrain, enterable houses with open doorways/windows, layered pine & oak trees, roads, water, and physics colliders.
 */
class GameWorld {
    constructor(scene) {
        this.scene = scene;
        this.mapSize = 500; // 500x500 meter island
        this.colliders = []; // Bounding boxes for player & bot collision
        this.solidMeshes = []; // 3D Meshes for weapon raycast occlusion
        this.interactiveObjects = [];
        this.spawnPoints = [];

        this.initEnvironment();
        this.createTerrain();
        this.createWater();
        this.createRoads();
        this.createBuildings();
        this.createCoverAndObstacles();
        this.createVegetation();
        this.generateSpawnPoints();
    }

    initEnvironment() {
        // Optimized Lighting for 60 FPS
        const ambientLight = new THREE.AmbientLight(0xddeeff, 0.85);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xfffaed, 1.1);
        sunLight.position.set(120, 200, 80);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 10;
        sunLight.shadow.camera.far = 450;
        const d = 180;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.001;
        this.scene.add(sunLight);

        // Sky & Atmosphere Fog
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0012);
    }

    createTerrain() {
        const terrainGeo = new THREE.PlaneGeometry(this.mapSize, this.mapSize, 64, 64);
        terrainGeo.rotateX(-Math.PI / 2);

        const pos = terrainGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const distFromCenter = Math.sqrt(x * x + z * z);
            
            let y = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 4;
            y += Math.sin(x * 0.05) * 2;
            
            if (distFromCenter > (this.mapSize / 2) - 40) {
                const dropoff = (distFromCenter - ((this.mapSize / 2) - 40)) / 40;
                y -= dropoff * dropoff * 20;
            }
            pos.setY(i, Math.max(-5, y));
        }
        terrainGeo.computeVertexNormals();

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#3a7d44';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 20000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#2f6637' : '#479453';
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }
        const grassTexture = new THREE.CanvasTexture(canvas);
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(40, 40);

        const terrainMat = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.1
        });

        this.terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
        this.terrainMesh.receiveShadow = true;
        this.scene.add(this.terrainMesh);
        this.solidMeshes.push(this.terrainMesh);
    }

    createWater() {
        const waterGeo = new THREE.PlaneGeometry(1200, 1200);
        waterGeo.rotateX(-Math.PI / 2);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x1d70b8,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.85
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = -2;
        this.scene.add(water);
    }

    createRoads() {
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.9 });

        const road1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 400), roadMat);
        road1.rotateX(-Math.PI / 2);
        road1.position.y = 0.1;
        road1.receiveShadow = true;
        this.scene.add(road1);

        const road2 = new THREE.Mesh(new THREE.PlaneGeometry(400, 16), roadMat);
        road2.rotateX(-Math.PI / 2);
        road2.position.y = 0.1;
        road2.receiveShadow = true;
        this.scene.add(road2);
    }

    createBuildings() {
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xdfd8c8, roughness: 0.6 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xa04000, roughness: 0.5 });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x5a544b, roughness: 0.7 });
        const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });

        const buildingLocs = [
            { x: -60, z: -60, w: 18, h: 8, d: 22 },
            { x: 70, z: -50, w: 22, h: 10, d: 20 },
            { x: -80, z: 70, w: 20, h: 8, d: 18 },
            { x: 60, z: 80, w: 24, h: 12, d: 24 },
            { x: 0, z: -120, w: 26, h: 10, d: 22 },
            { x: -120, z: 0, w: 20, h: 8, d: 20 },
            { x: 120, z: 20, w: 22, h: 10, d: 18 }
        ];

        buildingLocs.forEach(loc => {
            const group = new THREE.Group();
            const groundY = this.getTerrainHeight(loc.x, loc.z);
            group.position.set(loc.x, groundY, loc.z);

            // Floor inside
            const floor = new THREE.Mesh(new THREE.BoxGeometry(loc.w, 0.4, loc.d), floorMat);
            floor.position.y = 0.2;
            group.add(floor);

            const t = 0.8; // Wall thickness
            const doorW = 4.2; // 4.2m open doorway width

            // 1. South Wall with Open Doorway Entrance (Enterable!)
            const leftWallW = (loc.w - doorW) / 2;
            const wallSouthL = new THREE.Mesh(new THREE.BoxGeometry(leftWallW, loc.h, t), wallMat);
            wallSouthL.position.set(-loc.w / 2 + leftWallW / 2, loc.h / 2, loc.d / 2);
            wallSouthL.castShadow = true; wallSouthL.receiveShadow = true;
            group.add(wallSouthL);
            this.solidMeshes.push(wallSouthL);
            this.colliders.push({ box: new THREE.Box3().setFromObject(wallSouthL), type: 'wall' });

            const wallSouthR = new THREE.Mesh(new THREE.BoxGeometry(leftWallW, loc.h, t), wallMat);
            wallSouthR.position.set(loc.w / 2 - leftWallW / 2, loc.h / 2, loc.d / 2);
            wallSouthR.castShadow = true; wallSouthR.receiveShadow = true;
            group.add(wallSouthR);
            this.solidMeshes.push(wallSouthR);
            this.colliders.push({ box: new THREE.Box3().setFromObject(wallSouthR), type: 'wall' });

            // Door Frame Header
            const doorHeader = new THREE.Mesh(new THREE.BoxGeometry(doorW, loc.h - 4.5, t), doorFrameMat);
            doorHeader.position.set(0, loc.h - (loc.h - 4.5) / 2, loc.d / 2);
            group.add(doorHeader);

            // 2. North Back Wall
            const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(loc.w, loc.h, t), wallMat);
            wallNorth.position.set(0, loc.h / 2, -loc.d / 2);
            wallNorth.castShadow = true; wallNorth.receiveShadow = true;
            group.add(wallNorth);
            this.solidMeshes.push(wallNorth);
            this.colliders.push({ box: new THREE.Box3().setFromObject(wallNorth), type: 'wall' });

            // 3. East Side Wall
            const wallEast = new THREE.Mesh(new THREE.BoxGeometry(t, loc.h, loc.d), wallMat);
            wallEast.position.set(loc.w / 2, loc.h / 2, 0);
            wallEast.castShadow = true; wallEast.receiveShadow = true;
            group.add(wallEast);
            this.solidMeshes.push(wallEast);
            this.colliders.push({ box: new THREE.Box3().setFromObject(wallEast), type: 'wall' });

            // 4. West Side Wall
            const wallWest = new THREE.Mesh(new THREE.BoxGeometry(t, loc.h, loc.d), wallMat);
            wallWest.position.set(-loc.w / 2, loc.h / 2, 0);
            wallWest.castShadow = true; wallWest.receiveShadow = true;
            group.add(wallWest);
            this.solidMeshes.push(wallWest);
            this.colliders.push({ box: new THREE.Box3().setFromObject(wallWest), type: 'wall' });

            // 5. Terracotta Overhanging Roof
            const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(loc.w + 1.6, 0.8, loc.d + 1.6), roofMat);
            roofMesh.position.y = loc.h + 0.4;
            roofMesh.castShadow = true;
            group.add(roofMesh);
            this.solidMeshes.push(roofMesh);

            this.scene.add(group);
        });
    }

    createCoverAndObstacles() {
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x3e5062, roughness: 0.4, metalness: 0.6 });
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e7681, roughness: 0.9 });

        // Supply Crates & Covers
        for (let i = 0; i < 28; i++) {
            const angle = (i / 28) * Math.PI * 2;
            const radius = 30 + Math.random() * 150;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const groundY = this.getTerrainHeight(x, z);

            const w = 3 + Math.random() * 2;
            const h = 3 + Math.random() * 2;
            const d = 3 + Math.random() * 4;

            const crate = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), crateMat);
            crate.position.set(x, groundY + h / 2, z);
            crate.rotation.y = Math.random() * Math.PI;
            crate.castShadow = true; crate.receiveShadow = true;
            this.scene.add(crate);
            this.solidMeshes.push(crate);

            const bbox = new THREE.Box3().setFromObject(crate);
            this.colliders.push({ box: bbox, type: 'crate' });
        }

        // Boulders & Rocks
        for (let i = 0; i < 35; i++) {
            const x = (Math.random() - 0.5) * 360;
            const z = (Math.random() - 0.5) * 360;
            if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;

            const groundY = this.getTerrainHeight(x, z);
            const scale = 2 + Math.random() * 3;
            const rockGeo = new THREE.DodecahedronGeometry(scale, 1);
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, groundY + scale * 0.5, z);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true; rock.receiveShadow = true;
            this.scene.add(rock);
            this.solidMeshes.push(rock);

            const bbox = new THREE.Box3().setFromObject(rock);
            this.colliders.push({ box: bbox, type: 'rock' });
        }
    }

    createVegetation() {
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e19, roughness: 0.9 });
        const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x1b4d2e, roughness: 0.6 });
        const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x2d7a46, roughness: 0.5 });
        const leafMat3 = new THREE.MeshStandardMaterial({ color: 0x419b5c, roughness: 0.5 });

        // Scatter 70 Realistic Layered Trees
        for (let i = 0; i < 70; i++) {
            const x = (Math.random() - 0.5) * 410;
            const z = (Math.random() - 0.5) * 410;
            if (Math.abs(x) < 18 || Math.abs(z) < 18) continue;

            const groundY = this.getTerrainHeight(x, z);
            const treeGroup = new THREE.Group();
            treeGroup.position.set(x, groundY, z);

            // Natural Bark Trunk
            const trunkHeight = 7 + Math.random() * 3;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, trunkHeight, 10), trunkMat);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            this.solidMeshes.push(trunk);

            // 3-Tier Layered Foliage Canopy
            const tier1 = new THREE.Mesh(new THREE.ConeGeometry(5.5, 6, 8), leafMat1);
            tier1.position.y = trunkHeight + 1.5;
            tier1.castShadow = true;
            treeGroup.add(tier1);

            const tier2 = new THREE.Mesh(new THREE.ConeGeometry(4.2, 5, 8), leafMat2);
            tier2.position.y = trunkHeight + 4.0;
            tier2.castShadow = true;
            treeGroup.add(tier2);

            const tier3 = new THREE.Mesh(new THREE.ConeGeometry(2.8, 4, 8), leafMat3);
            tier3.position.y = trunkHeight + 6.2;
            tier3.castShadow = true;
            treeGroup.add(tier3);

            this.scene.add(treeGroup);

            const trunkBox = new THREE.Box3().setFromObject(trunk);
            this.colliders.push({ box: trunkBox, type: 'tree' });
        }
    }

    generateSpawnPoints() {
        const radii = [60, 100, 140];
        for (let r of radii) {
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + (r * 0.1);
                const x = Math.cos(angle) * r;
                const z = Math.sin(angle) * r;
                const y = this.getTerrainHeight(x, z) + 1.5;
                this.spawnPoints.push(new THREE.Vector3(x, y, z));
            }
        }
    }

    getTerrainHeight(x, z) {
        let y = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 4 + Math.sin(x * 0.05) * 2;
        return Math.max(0, y);
    }
}
