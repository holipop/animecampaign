import * as List from "../List.js"
import Stat from "./Stat.js";
import Section from "./Section.js";

/** 
 * Data structure for Kit Features. 
 */
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
                initial: [{ visible: true }],
            }),

            details: new fields.SchemaField({
                editor: new fields.StringField({ initial: 'markdown' }),
                formula: new fields.StringField({ initial: '1d20' }),
                action: new fields.StringField({ initial: 'Main' }),
                usage: new fields.SchemaField({
                    multiple: new fields.NumberField({ initial: 1 }),
                    timeframe: new fields.StringField({ initial: 'Round' })
                }),
            })
        };
    }

    /** If this Feature is owned, returns the stats that are being tracked in its category.
     * @returns {Object[]}
     */
    get trackedStats () {
        if (!this.parent.isOwned) return null;
        const categories = this.parent.parent.system.categories;
        const trackers = List.get(categories, { name: this.category }).trackers;

        return trackers.map(tracker => {
            const fallback = {
                view: 'value',
                value: '',
                img: 'icons/svg/circle.svg',
            };
            return List.get(this.stats, { tag: tracker.tag }) ?? fallback;
        })
    }
}
