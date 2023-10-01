import Stat from "./Stat.js";

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
            stats: new fields.ArrayField(new fields.EmbeddedDataField(Stat))
        };
    }
}