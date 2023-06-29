import AC from "../AC.js";

//  A custom document class to override certain Actor methods.
export default class ACActor extends Actor {

    /* async _onCreate(data, options, userId) {
        await this.updateResources(data);
        super._onCreate(data, options, userId);
    } */

    /* async _onUpdate(changed, options, userId) {
        await this.updateResources(changed);
        await this.updateStatOnBarUpdate(changed);
        super._onUpdate(changed, options, userId);
    } */

    //  Updates the resources of a character whenever owned Stat objects change.
    //*     (changed: { system?: Object }) : void
    async updateResources({ system = {} }) {
        if (!Object.hasOwn(system, 'stats')) return;
        const { stats } = system;
        
        const filteredStats = stats.filter(stat => stat.settings?.resource != 'None');
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

    //  Updates the matching Stat object whenever the actor's token bar value changes.
    //*     (changed: { system?: Object }) : void
    async updateStatOnBarUpdate({ system = {} }) {
        const { resources = {} } = system;
        const key = Object.keys(resources)[0]
        const template =  {
            [key]: { value: resources[key]?.value }
        }
        if (!objectsEqual(resources, template)) return;

        const stat = this.system.resources[key].stat;

        this.system.updateStat(stat.label, resources[key]);
    }
}