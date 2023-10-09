import Stat from "./Stat.js";
import * as AC from "../AC.js"

// Data structure for Kit Features.
export default class FeatureData extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            color: new fields.StringField({
                required: true,
                initial: CONFIG.animecampaign.defaultColor
            }),
            category: new fields.StringField({ initial: 'weapon' }),
            stats: new fields.ArrayField(new fields.EmbeddedDataField(Stat)),
        };
    }

    get trackedStats () {
        if (!this.parent.isOwned) return null;
        const categories = this.parent.parent.system.categories;
        const trackers = AC.getObjectEntry(categories, {name: this.category}).trackers;

        const trackedStats = trackers.map(tracker => {
            const stat = AC.getObjectEntry(this.stats, { tag: tracker.tag });
            const obj = {};

            if (stat === undefined) return {
                value: '',
                img: 'icons/svg/circle.svg',
            };

            obj.tag = stat.tag;
            obj.img = stat.img;

            if (stat.view == 'value') obj.value = stat.value;
            else if (stat.view == 'label') obj.value = stat.label;
            else if (stat.view == 'resource') {
                obj.value = AC.clampedPercent(stat.value / stat.max);
            }

            if (!obj.value) obj.value = " ";

            return obj;
        })

        return trackedStats;
    }
}
