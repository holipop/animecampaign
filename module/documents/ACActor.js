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

    //  Updates the stats of a character whenever its Token bars are updated.
    //*     (_changed: Object) : void
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
}