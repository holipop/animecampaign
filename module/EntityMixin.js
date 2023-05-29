import { Stat } from "./ACStat.js";

//
//  A mixin containing shared methods between Character and Kit Piece schema.
//
export const ACEntityMixin = {

    testThis() {
        console.log(this);
    },

    //  Create new Stat objects inside the stats list.
    //      _stats  (Stat[])     : An array of objects, each parameters for constructing a Stat.
    createStats(_stats = [{}], _index = null) {
        let stats = this.stats;
        let createdStats = _stats.map(obj => new Stat(obj, { parent: this }));

        if (_index == null) {
            stats = [...stats, ...createdStats];
        } else {
            stats.splice(_index, 0, ...createdStats);
        }

        this.parent.update({ 'system.stats': stats });
        return console.log(`Created stats ${createdStats.map(i => `"${i.name}"`).join(', ')} for ${this.parent.name}`)
    },

    //  Deletes existing Stat objects from the stats list.
    //      _stats  (string[])  : An array of strings, each the names of Stats.
    deleteStats(_stats) {
        let stats = this.stats;

        for (const element of _stats) {
            let targetIndex = stats.findIndex(stat => stat.label == element)

            if (targetIndex == -1) return console.error(`"${element}" is not a stat.`);

            stats.splice(targetIndex, 1);
        }

        this.parent.update({ 'system.stats': stats });
        return console.log(`Deleted stats "${_stats.toString()}" for ${this.parent.name}`)
    },

    deleteStatIndex(_index) {
        let stats = this.stats;

        stats.splice(_index, 1);

        this.parent.update({ 'system.stats': stats });
        return console.log(`Deleted stat at index ${_index} for ${this.parent.name}`)
    },

    updateStat(_name, _schema) {
        const stats = this.stats;
        let targetStat = stats.find(stat => stat.label == _name);

        if (targetStat == undefined) return console.error(`"${_name}" is not a stat.`);

        Object.assign(targetStat, _schema);

        this.parent.update({ 'system.stats': [...stats] });
        return console.log(`Updated the "${_name}" stat for ${this.parent.name}`);
    },

    clearStats() {
        this.parent.update({ 'system.stats': [] });
        return console.log(`Deleted all stats for ${this.parent.name}`)
    },

    // !!!
    // !!! EVERYTHING ELSE BELOW HERE IS DEPRECIATED.
    // !!! 
    //  Creates a stat within an entity's 'system.stats' object.
    //      _key    (string)    : The name of the stat
    //      _value  (?any)      : The value assigned
    __createStat(_key, _value = "") {
        const stats = Object.keys(this.parent.system.stats);
        if (stats.includes(_key)) {
            ui.notifications.error(`Anime Campaign | ${this.parent.name} already has a "${_key}" stat.`);
            return;
        }

        ui.notifications.info(`Anime Campaign | Created the "${_key}" stat on ${this.parent.name}.`);
        this.parent.update({ [`system.stats.${_key}`]: _value });
    },

    //  Deletes a stat within an entity's 'system.stats' object.
    //      _key    (string)    : The name of the stat
    __deleteStat(_key) {
        const stats = Object.keys(this.parent.system.stats);
        if (!stats.includes(_key)) {
            ui.notifications.error(`Anime Campaign | ${this.parent.name} doesn't have a "${_key}" stat.`);
            return;
        }

        ui.notifications.info(`Anime Campaign | Deleted the "${_key}" stat on ${this.parent.name}.`);
        this.parent.update({ [`system.stats.-=${_key}`]: null })
    },

    //  Deletes all stats within an entity's 'system.stats' object.
    //  !!! If done on a Character, their Character Sheet cannot be opened due to it attempting to fetch default stats.
    //  !!! Be sure to re-add them via the 'addDefaultStats()' method.
    __deleteAllStats() {
        const stats = Object.keys(this.parent.system.stats);

        if (stats.length == 0) {
            ui.notifications.error(`Anime Campaign | ${this.parent.name} doesn't have any stats.`);
            return;
        }

        ui.notifications.info(`Anime Campaign | Deleted all stats on ${this.parent.name}.`);
        stats.forEach(element => this.parent.update({ [`system.stats.-=${element}`]: null }));
    }
}