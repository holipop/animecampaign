import * as Utils from "../Utils.js"
import Details from "./Details.js";

/** 
 * Data structure for categories.
 */
export default class Category extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            name: new fields.StringField(),
            color: new fields.ColorField(),
            collapsed: new fields.BooleanField({ initial: true }),

            details: new fields.EmbeddedDataField(Details),

            trackers: new fields.ArrayField(new fields.SchemaField({
                tag: new fields.StringField(),
                img: new fields.FilePathField({
                    categories: ['IMAGE'],
                    initial: 'icons/svg/circle.svg'
                })
            }))
        };
    }

    /** Get the palette of this category.
     * @returns {{ primary: string, secondary: string, contrast: string }}
     */
    get palette () {
        const color = this.color ?? this.parent.color
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

    /** Get the HTML for this category's header.
     * @returns {String}
     */
    get nameHTML () {
        return `<span class="category__name--initial">${this.name.at(0)}</span>${this.name.slice(1)}`
    }

    /** Get the list of features under this category.
     * @returns {ACItem[]}
     */
    get features () {
        // parent.parent is ACActor
        return this.parent.parent.items.filter(item => item.system.category === this.name)
    }
}
