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
        this.weaponSys.switchSlot(slotIndex);
    }
}
