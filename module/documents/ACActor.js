import AC from "../AC.js";

//  A custom document class to override certain Actor methods.
export default class ACActor extends Actor {

    _preUpdate(changed, options, user) {
        this.updateResources(changed);
        this.updateStatOnToken(changed);
        super._preUpdate(changed, options, user);
    }

    _preCreate(data, options, userId) {
        this.updateResources(data);
        super._preCreate(data, options, userId);
    }

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
    //*     (_changed: Object) : void
    updateResources(_changed) {
        const template = { system: { stats: [] } };
        const stats = filterObject(_changed, template)?.system?.stats
        if (!stats) return;

        const resourceStats = stats.filter(stat => stat.settings.resource != 'None');
        if (resourceStats.length < 1) return;

        const updatedResources = this.system.blankResources;
        for (const stat of resourceStats) {
            let resource = {
                [stat.settings.resource]: {
                    stat: stat,
                    value: Number(stat.value) || 0,
                    max: Number(stat.max) || 0,
                }
            }
            Object.assign(updatedResources, resource);
        }

        _changed.system.resources = updatedResources;
        AC.log(`Updated resources for ${this.name}.`);
    }

    updateStatOnToken(_changed) {
        if (hasProperty(_changed, 'system.stats')) return;

        const template = { system: { resources: this.blankResources } };
        const resource = filterObject(_changed, template)?.system?.resources;
        if (!resource) return;
        
        const key = Object.keys(resource)[0];
        const updatedStat = this.system.resources[key].stat;
        const stats = this.system.updateStat(updatedStat.label, resource[key], false);

        _changed.system.stats = stats;
        AC.log(`Updated stats via token for ${this.name}.`);
    }

    // !!! DEPRECEATED
    async __updateResources({ system = {} }) {
        if (!Object.hasOwn(system, 'stats')) return;
        const { stats } = system;
        
        const filteredStats = stats.filter(stat => stat.settings?.resource != 'None');
        if (filteredStats.length < 1) return;
        
        console.groupCollapsed(`%cAnime Campaign | Updating resourcies for ${this.name}.`, 'color: orange;');
        
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
    async __updateStatOnBarUpdate({ system = {} }) {
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