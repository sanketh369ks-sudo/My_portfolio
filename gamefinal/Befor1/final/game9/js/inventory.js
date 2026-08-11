/**
 * Inventory Manager
 * Tracks quick slots, ammo reserves, armor, medkits, and Gloo Walls.
 */
class InventoryManager {
    constructor(player, weaponSys) {
        this.player = player;
        this.weaponSys = weaponSys;
    }

    useMedkit() {
        this.player.useMedkit();
    }

    deployGlooWall() {
        this.player.deployGlooWall();
    }

    selectSlot(slotIndex) {
        const slots = ['ak47', 'awm', 'mp40', 'm1887', 'plasma', 'deagle', 'm60'];
        if (slots[slotIndex]) {
            this.weaponSys.switchWeapon(slots[slotIndex]);
        }
    }
}
