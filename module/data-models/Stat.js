/** 
 * Data structure for stats.
 */ 
export default class Stat extends foundry.abstract.DataModel {

    /** @override */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            tag: new fields.StringField(),
            color: new fields.StringField(),
            view: new fields.StringField({ initial: 'value' }),

            value: new fields.NumberField(),
            max: new fields.NumberField(),
            label: new fields.StringField(),

            sort: new fields.NumberField({ initial: 0 }),
        }
    }

    /**
     * Gets the path of the corresponding color stat image.
     * If this stat belongs to a feature, an empty string.
     * @returns {string}
     */
    get img () {
        return (this.color) ? `systems/animecampaign/assets/${this.color}.png` : ""
    }
}
