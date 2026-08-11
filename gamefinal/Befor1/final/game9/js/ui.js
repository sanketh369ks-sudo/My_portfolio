/**
 * User Interface & Minimap Rendering Engine
 * Updates HUD vitals, ammo, scope overlay, real-time killfeed, damage flashes, hit markers, and 2D canvas minimap.
 */
class UIManager {
    constructor() {
        this.gunfireBlips = [];
        this.cacheDOMElements();
        this.setupMinimapCanvas();
    }

    cacheDOMElements() {
        this.hpBar = document.getElementById('hp-bar');
        this.hpVal = document.getElementById('hp-val');
        this.armorBar = document.getElementById('armor-bar');
        this.armorVal = document.getElementById('armor-val');
        this.medkitCount = document.getElementById('medkit-count');
        this.glooCount = document.getElementById('gloo-count');
        
        this.weaponName = document.getElementById('weapon-name');
        this.ammoCount = document.getElementById('ammo-count');
        this.ammoReserve = document.getElementById('ammo-reserve');

        this.zoneTimer = document.getElementById('zone-timer');
        this.aliveCount = document.getElementById('alive-count');
        this.killCount = document.getElementById('kill-count');

        this.lootPrompt = document.getElementById('loot-prompt');
        this.lootText = document.getElementById('loot-text');

        this.scopeOverlay = document.getElementById('scope-overlay');
        this.hitMarker = document.getElementById('hit-marker');
        this.damageFlash = document.getElementById('damage-flash');
        this.zoneWarning = document.getElementById('zone-warning');

        this.killFeedContainer = document.getElementById('kill-feed');
        this.minimapCanvas = document.getElementById('minimap');
    }

    setupMinimapCanvas() {
        if (this.minimapCanvas) {
            this.minimapCtx = this.minimapCanvas.getContext('2d');
            this.minimapCanvas.width = 150;
            this.minimapCanvas.height = 150;
        }
    }

    updateHUD(player, weaponSys, zone, aliveCountTotal) {
        if (!player) return;

        // Vitals
        const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
        const armorPercent = Math.max(0, (player.armor / player.maxArmor) * 100);
        
        this.hpBar.style.width = `${hpPercent}%`;
        this.hpVal.textContent = Math.ceil(player.hp);

        this.armorBar.style.width = `${armorPercent}%`;
        this.armorVal.textContent = Math.ceil(player.armor);

        if (this.medkitCount) this.medkitCount.textContent = `x${player.medkits}`;
        if (this.glooCount) this.glooCount.textContent = `x${player.glooWalls}`;

        // Skill Cooldown Badge
        const skillCd = document.getElementById('skill-cd');
        if (skillCd) {
            if (player.abilityActive) {
                skillCd.textContent = `ACTIVE (${Math.ceil(player.abilityTimer)}s)`;
                skillCd.style.color = '#2ed573';
            } else if (player.abilityCooldown > 0) {
                skillCd.textContent = `${Math.ceil(player.abilityCooldown)}s`;
                skillCd.style.color = '#ffaa00';
            } else {
                skillCd.textContent = 'READY';
                skillCd.style.color = '#20e2a3';
            }
        }

        // Active Weapon & Ammo
        const w = weaponSys.currentWeapon;
        this.weaponName.textContent = w.name;
        this.ammoCount.textContent = weaponSys.isReloading ? 'RELOADING...' : w.currentAmmo;
        this.ammoReserve.textContent = (w.reserveAmmo === Infinity || w.reserveAmmo > 999) ? '/ ∞' : `/ ${w.reserveAmmo}`;

        // Render 2 Carried Weapon Slots on HUD
        const slotsContainer = document.querySelector('.weapon-slots');
        if (slotsContainer && weaponSys.carriedWeapons) {
            slotsContainer.innerHTML = '';
            weaponSys.carriedWeapons.forEach((gunKey, idx) => {
                const gunDef = weaponSys.weapons[gunKey];
                if (!gunDef) return;
                const isEquipped = (weaponSys.equippedKey === gunKey);
                const slotEl = document.createElement('div');
                slotEl.className = `weapon-slot ${isEquipped ? 'active' : ''}`;
                slotEl.style.width = 'auto';
                slotEl.style.padding = '0 12px';
                slotEl.style.minWidth = '75px';
                slotEl.innerHTML = `<span style="color:#ffaa00; font-weight:900; margin-right:4px;">${idx + 1}.</span> ${gunDef.name}`;
                slotEl.onclick = () => {
                    weaponSys.switchSlot(idx);
                };
                slotsContainer.appendChild(slotEl);
            });
        }

        // Top Status Bar
        const mins = Math.floor(Math.max(0, zone.timer) / 60);
        const secs = Math.floor(Math.max(0, zone.timer) % 60);
        this.zoneTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        this.aliveCount.textContent = aliveCountTotal;
        this.killCount.textContent = player.kills;

        // Out of Zone Warning
        if (player.isAlive && !zone.isInsideZone(player.position)) {
            this.zoneWarning.classList.remove('hidden');
        } else {
            this.zoneWarning.classList.add('hidden');
        }

        // Render Canvas Minimap
        this.renderMinimap(player, zone);
    }

    showLootPrompt(lootName) {
        if (lootName) {
            this.lootPrompt.classList.remove('hidden');
            this.lootText.textContent = `Pick Up ${lootName}`;
        } else {
            this.lootPrompt.classList.add('hidden');
        }
    }

    toggleScope(show, weaponKey = 'ak47') {
        if (show) {
            this.scopeOverlay.classList.remove('hidden');
            const rangeFinder = document.getElementById('scope-range-finder');
            if (rangeFinder) {
                if (weaponKey === 'awm') rangeFinder.textContent = '8x OPTICAL SNIPER SCOPE | AWM';
                else if (weaponKey === 'ak47') rangeFinder.textContent = '4x MIL-DOT TACTICAL SCOPE | AK-47';
                else if (weaponKey === 'mp40') rangeFinder.textContent = '2x RED DOT SIGHT | MP40';
                else rangeFinder.textContent = 'TACTICAL OPTICAL SCOPE';
            }
        } else {
            this.scopeOverlay.classList.add('hidden');
        }
    }

    triggerHitMarker(isHeadshot = false) {
        this.hitMarker.classList.add('active');
        setTimeout(() => this.hitMarker.classList.remove('active'), 120);
    }

    triggerHeadshotBanner() {
        const banner = document.getElementById('headshot-banner');
        if (banner) {
            banner.classList.add('active');
            setTimeout(() => banner.classList.remove('active'), 1000);
        }
    }

    triggerKillStreak(count) {
        const banner = document.getElementById('streak-banner');
        if (!banner) return;

        let text = 'DOUBLE KILL!';
        if (count === 3) text = 'TRIPLE KILL!';
        else if (count === 4) text = 'QUAD KILL!';
        else if (count >= 5) text = '🔥 BOOYAH MASTER!';

        banner.textContent = text;
        banner.classList.add('active');
        setTimeout(() => banner.classList.remove('active'), 1400);
    }

    showDamageNumber(worldPos, damage, isHeadshot, camera) {
        const container = document.getElementById('damage-numbers-container');
        if (!container || !camera) return;

        const vec = worldPos.clone();
        vec.project(camera);

        if (vec.z > 1) return; // Behind camera

        const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vec.y * 0.5) + 0.5) * window.innerHeight;

        const num = document.createElement('div');
        num.className = `damage-number ${isHeadshot ? 'headshot' : ''}`;
        num.textContent = isHeadshot ? `🎯 ${damage}` : damage;
        num.style.left = `${x}px`;
        num.style.top = `${y}px`;

        container.appendChild(num);

        requestAnimationFrame(() => {
            num.style.transform = `translate(-50%, -100px) scale(${isHeadshot ? 1.3 : 1.1})`;
            num.style.opacity = '0';
        });

        setTimeout(() => {
            if (num.parentNode) num.parentNode.removeChild(num);
        }, 600);
    }

    triggerDamageFlash() {
        this.damageFlash.classList.add('active');
        setTimeout(() => this.damageFlash.classList.remove('active'), 200);
    }

    addKillFeed(killerName, victimName, weaponName, isPlayerKill = false) {
        const item = document.createElement('div');
        item.className = `kill-feed-item ${isPlayerKill ? 'player-kill' : ''}`;
        item.textContent = `${killerName} 🔫 [${weaponName}] ${victimName}`;

        this.killFeedContainer.appendChild(item);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (item.parentNode) item.parentNode.removeChild(item);
        }, 4000);
    }

    addGunfireBlip(x, z) {
        this.gunfireBlips.push({ x: x, z: z, createdAt: performance.now() });
    }

    renderMinimap(player, zone) {
        if (!this.minimapCtx) return;

        const ctx = this.minimapCtx;
        const width = 150;
        const height = 150;
        const scale = 0.35;

        // Clear canvas
        ctx.fillStyle = '#1b2735';
        ctx.fillRect(0, 0, width, height);

        // Center canvas on player position
        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Draw Terrain boundary circle
        ctx.beginPath();
        ctx.arc(0, 0, 240 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#2f6637';
        ctx.fill();

        // Draw Safe Zone Circle on Minimap
        const zoneX = (zone.currentCenter.x - player.position.x) * scale;
        const zoneZ = (zone.currentCenter.z - player.position.z) * scale;
        const zoneR = zone.currentRadius * scale;

        ctx.beginPath();
        ctx.arc(zoneX, zoneZ, zoneR, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Enemy Gunfire Danger Red Dots on Minimap (Free Fire Radar)
        const now = performance.now();
        for (let i = this.gunfireBlips.length - 1; i >= 0; i--) {
            const blip = this.gunfireBlips[i];
            const age = (now - blip.createdAt) * 0.001;

            if (age > 1.8) {
                this.gunfireBlips.splice(i, 1);
                continue;
            }

            const bx = (blip.x - player.position.x) * scale;
            const bz = (blip.z - player.position.z) * scale;
            const alpha = 1.0 - (age / 1.8);

            ctx.beginPath();
            ctx.arc(bx, bz, 4 + Math.sin(age * 12) * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 45, 85, ${alpha})`;
            ctx.fill();
        }

        // Draw Player Marker (Green arrow pointing facing direction)
        ctx.save();
        ctx.rotate(-player.rotationY);
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(5, 5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fillStyle = '#20e2a3';
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    toggleInventory(show, player, weaponSys) {
        const invOverlay = document.getElementById('inventory-overlay');
        if (!invOverlay) return;

        if (show) {
            this.populateInventoryModal(player, weaponSys);
            invOverlay.classList.remove('hidden');
            if (document.pointerLockElement) document.exitPointerLock();
        } else {
            invOverlay.classList.add('hidden');
            if (window.gameInstance && window.gameInstance.player && window.gameInstance.player.isAlive && !window.gameInstance.touchController.isTouchDevice) {
                document.getElementById('webgl-canvas').requestPointerLock();
            }
        }
    }

    populateInventoryModal(player, weaponSys) {
        const grid = document.getElementById('inv-weapons-grid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.keys(weaponSys.weapons).forEach(key => {
            const w = weaponSys.weapons[key];
            const isEquipped = (weaponSys.equippedKey === key);

            const card = document.createElement('div');
            card.className = `inv-weapon-card ${isEquipped ? 'active' : ''}`;
            card.innerHTML = `
                <div class="inv-weapon-name">${w.name} ${isEquipped ? 'EQUIPPED' : ''}</div>
                <div class="inv-weapon-ammo">Damage: ${w.damage} | Mag: ${w.magSize} | Reserve: ${w.reserveAmmo}</div>
            `;
            card.onclick = () => {
                weaponSys.switchWeapon(key);
                this.toggleInventory(false);
            };
            grid.appendChild(card);
        });

        const hpVal = document.getElementById('inv-hp-val');
        if (hpVal) hpVal.textContent = Math.ceil(player.hp);
        const medkitVal = document.getElementById('inv-medkit-val');
        if (medkitVal) medkitVal.textContent = player.medkits;
        const glooVal = document.getElementById('inv-gloo-val');
        if (glooVal) glooVal.textContent = player.glooWalls;
    }

    toggleEmoteWheel(show) {
        const emoteOverlay = document.getElementById('emote-wheel-overlay');
        if (!emoteOverlay) return;

        if (show) {
            emoteOverlay.classList.remove('hidden');
            if (document.pointerLockElement) document.exitPointerLock();
        } else {
            emoteOverlay.classList.add('hidden');
            if (window.gameInstance && window.gameInstance.player && window.gameInstance.player.isAlive && !window.gameInstance.touchController.isTouchDevice) {
                document.getElementById('webgl-canvas').requestPointerLock();
            }
        }
    }

    showEmoteBanner(text) {
        let banner = document.getElementById('emote-banner-pop');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'emote-banner-pop';
            banner.className = 'emote-banner-pop';
            document.getElementById('hud').appendChild(banner);
        }
        banner.textContent = text;
        banner.classList.add('show');
        setTimeout(() => {
            banner.classList.remove('show');
        }, 3000);
    }

    showHealText(text) {
        const container = document.getElementById('hud');
        if (!container) return;
        const textEl = document.createElement('div');
        textEl.className = 'heal-floating-text';
        textEl.textContent = text;
        container.appendChild(textEl);
        setTimeout(() => {
            if (textEl.parentNode) textEl.parentNode.removeChild(textEl);
        }, 1500);
    }
}
