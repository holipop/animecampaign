import * as List from "../List.js"
import Stat from "./Stat.js";
import Section from "./Section.js";
import Details from "./Details.js";

/** 
 * Data structure for Kit Features. 
 */
export default class FeatureData extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            color: new fields.ColorField({
                required: true,
                initial: CONFIG.AC.defaultColor
            }),
            category: new fields.StringField({ initial: 'weapon' }),

            stats: new fields.ArrayField(new fields.EmbeddedDataField(Stat)),
            
            sections: new fields.ArrayField(new fields.EmbeddedDataField(Section), {
                initial: [{ visible: true, collapsed: false, richtext: null }],
            }),

            details: new fields.EmbeddedDataField(Details),

            // ! Pre-v1.0
            type: new fields.StringField(),
            customType: new fields.StringField(),
            formula: new fields.StringField(),
            usage: new fields.StringField(),
            action: new fields.StringField(),
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
                img: 'systems/animecampaign/assets/transparent.svg',
            };
            return List.get(this.stats, { tag: tracker.tag.toLowerCase() }) ?? fallback;
        })
    }

    /** Get the palette of this feature.
     * @returns {{ primary: string, secondary: string, contrast: string }}
     */
    get palette () {
        const color = this.color
        const [h, s, l] = color.hsl

        let [red, green, blue] = color.rgb
        red *= 0.2126;
        green *= 0.7152;
        blue *= 0.0722;
        const luma = (red + green + blue) / 1;
        const contrast = (luma <= .5) 
            ? CONFIG.AC.contrastColors.white
            : CONFIG.AC.contrastColors.black;

        return {
            primary: color.css,
            secondary: foundry.utils.Color.fromHSL([h, s * .66, .66]).css,
            contrast,
        }
    }
}
