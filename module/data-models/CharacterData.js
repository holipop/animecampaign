import Stat from "./Stat.js";
import Category from "./Category.js";

/** 
 * Data structure for characters. 
 */
export default class CharacterData extends foundry.abstract.DataModel {

    /** @override */
    static defineSchema () {
        const fields = foundry.data.fields;

        const colorStats = {};
        for (const element of CONFIG.AC.colorKeys) {
            colorStats[element] = new fields.EmbeddedDataField(Stat, {
                initial: null,
                nullable: true
            })
        }

        return {
            stamina: new fields.EmbeddedDataField(Stat),
            proficiency: new fields.EmbeddedDataField(Stat),
            movement: new fields.EmbeddedDataField(Stat),

            _stats: new fields.SchemaField(colorStats), // remove underscores post v1.0

            categories: new fields.ArrayField(new fields.EmbeddedDataField(Category)),

            biography: new fields.SchemaField({
                editor: new fields.StringField({ initial: 'markdown' }),
                plaintext: new fields.StringField(),
                richtext: new fields.HTMLField(),
            }),

            class: new fields.StringField(),
            word: new fields.StringField(),
            type: new fields.StringField(),
            color: new fields.ColorField({
                required: true,
                initial: CONFIG.AC.defaultColor
            }),

            // ! Pre-v1.0
            description: new fields.HTMLField(),
            stats: new fields.ArrayField(new fields.ObjectField()),
        }
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
     * Returns the class level as a roman numeral.
     * @returns {string} 
     */
    get classLevel () {
        const prof = this.proficiency.value

        if (prof >= 100) return "III"
        else if (prof >= 60) return "II"
        else if (prof >= 0) return "I"
        return ""
    }

    /** 
     * Returns stamina represented as a ratio.
     * @returns {number} 
     */
    get staminaRatio () {
        return this.stamina.value / this.stamina.max
    }

    /** 
     * The list of color stats without null colors, sorted.
     * @returns {Stat[]}
     */
    get colorStats () {
        return Object
            .values(this._stats)
            .filter(stat => stat !== null)
            .sort((a, b) => a.sort - b.sort)
    }
}
