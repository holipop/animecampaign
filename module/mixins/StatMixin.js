import { Stat } from "../data-models/Stat.js";
import AC from "../AC.js";

//  A mixin containing shared methods between Character and Kit Piece schemas for Stat usage.
export const StatMixin = {

    //  Create new Stat objects inside the stats list via a list of objects defining Stats.
    //  Optionally at a desired index.
    //*     (_stat?: Object[], _index?: number) : void
    createStats(_stats = [{}], _index = null) {
        let stats = this.stats;
        let createdStats = _stats.map(obj => new Stat(obj, { parent: this }));

        if (_index == null) {
            stats = [...stats, ...createdStats];
        } else {
            stats.splice(_index, 0, ...createdStats);
        }

        this.parent.update({ 'system.stats': stats });
        AC.log(`Created stats ${createdStats.map(i => `"${i.name}"`).join(', ')} for ${this.parent.name}`)
    },

    //  Deletes existing Stat objects from the stats list given a list of Stat names.
    //*     (_stats: string[]) : void
    deleteStats(_stats) {
        let stats = this.stats;

        for (const element of _stats) {
            let targetIndex = stats.findIndex(stat => stat.label == element)

            if (targetIndex == -1) return AC.error(`"${element}" is not a stat.`);

            stats.splice(targetIndex, 1);
        }

        this.parent.update({ 'system.stats': stats });
        AC.log(`Deleted stats "${_stats.toString()}" for ${this.parent.name}`)
    },

    //  Delete a Stat object at the desired index.
    //*     (_index: number) : void
    deleteStatIndex(_index) {
        let stats = this.stats;

        stats.splice(_index, 1);

        this.parent.update({ 'system.stats': stats });
        AC.log(`Deleted stat at index ${_index} for ${this.parent.name}`);
    },

    //  Updates a Stat object's schema
    //*     (_name: string, _schema: StatSchema) : void
    updateStat(_name, _schema) {
        const stats = this.stats;
        let targetStat = stats.find(stat => stat.label == _name);
        if (targetStat == undefined) return AC.error(`"${_name}" is not a stat.`);

        targetStat = targetStat.updateSource(_schema);

        //! This is actually one of the stupidest fixes I've ever done.
        this.parent.update({ 'system.stats': [] });
        this.parent.update({ 'system.stats': stats });
        AC.log(`Updated the "${_name}" stat for ${this.parent.name}`);
    },

    //  Deletes all Stat objects within the stats list.
    //*     () : void
    clearStats() {
        this.parent.update({ 'system.stats': [] });
        AC.log(`Deleted all stats for ${this.parent.name}`);
    }
}