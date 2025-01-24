import Stat from "./Stat.js";
import Section from "./Section.js";
import Details from "./Details.js";

/** 
 * Data structure for Kit Features. 
 */
export default class FeatureData extends foundry.abstract.DataModel {

    /** @override */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            color: new fields.ColorField({
                required: true,
                initial: CONFIG.AC.defaultColor
            }),
            category: new fields.StringField(),
            stats: new fields.ArrayField(new fields.EmbeddedDataField(Stat)),
            description: new fields.HTMLField(),
            details: new fields.EmbeddedDataField(Details),

            // ! Pre-v2.0
            sections: new fields.ArrayField(new fields.EmbeddedDataField(Section), {
                initial: [{ visible: true, collapsed: false, richtext: null }],
            }),
        };
    }

    /** 
     * If this Feature is owned, returns the stats that are being tracked in its category.
     * @returns {StatTracker[]}
     */
    get trackedStats () {
        if (!this.parent.isOwned) return []

        const category = this.parent.parent.system.categories.find(c => c.name === this.category)
        if (!category) return []
        
        return category.trackers.map(t => this.stats.find(s => s.tag === t.tag) ?? {})
    }

    /** 
     * Get the palette of this feature.
     * @returns {Palette}
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

    /**
     * Get the CSS class for if this Feature is uncollapsed.
     * @returns {"FeatureEntry--Uncollapsed" | ""}
     */
    get uncollapsedCSS () {
        if (!this.parent.isOwned) return ""
        const sheet = this.parent.parent.sheet
        return (sheet.uncollapsedFeatures.has(this.parent._id)) ? "FeatureEntry--Uncollapsed" : ""
    }

}
