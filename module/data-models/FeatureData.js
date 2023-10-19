import Stat from "./Stat.js";
import Section from "./Section.js";
import * as Obj from "../Obj.js"

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
            
            sections: new fields.ArrayField(new fields.EmbeddedDataField(Section), {
                initial: [{}],
            }),

            details: new fields.SchemaField({
                editor: new fields.StringField({ initial: 'markdown' }),
                action: new fields.StringField(),
                formula: new fields.StringField(),
            })
        };
    }

    /** If this Feature is owned, returns the stats that are being tracked in its category.
     * @returns {Object[]}
     */
    get trackedStats () {
        if (!this.parent.isOwned) return null;
        const categories = this.parent.parent.system.categories;
        const trackers = Obj.getEntry(categories, {name: this.category}).trackers;

        const trackedStats = trackers.map(tracker => {
            const fallback = {
                view: 'value',
                value: '',
                img: 'icons/svg/circle.svg',
            };
            return Obj.getEntry(this.stats, { tag: tracker.tag }) ?? fallback;
        })

        return trackedStats;
    }
}
