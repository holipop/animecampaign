import AC from "../AC.js";

export default class ACActor extends Actor {

    async _onCreate(data, options, userId) {
        await this.updateResources(data);
        super._onCreate(data, options, userId);
    }

    async _onUpdate(changed, options, userId) {
        await this.updateResources(changed);
        super._onUpdate(changed, options, userId);
    }

    async updateResources({ system = {} }) {
        if (!Object.hasOwn(system, 'stats')) return;
        const { stats } = system;
        
        const filteredStats = stats.filter(stat => stat.settings.resource != 'None');
        if (filteredStats.length < 1) return;
        
        console.groupCollapsed(`%cAnime Campaign | Updating resources for ${this.name}.`, 'color: orange;');
        
        await this.system.resetResources();

        for (const stat of filteredStats) {
            await this.update({ [`system.resources.${stat.settings.resource}`]: {
                stat: stat,
                value: Number(stat.value) || 0,
                max: Number(stat.max) || 0,
            } })
            AC.log(`Assigned Stat '${stat.name}' to resource ${stat.settings.resource}.`);
        }

        console.groupEnd();
    }

}