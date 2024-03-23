import * as Utils from "../Utils.js"

/** 
 * Data structure for categories.
 */
export default class Category extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            name: new fields.StringField(),
            color: new fields.StringField(),
            collapsed: new fields.BooleanField({ initial: true }),

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
     * @returns {*}
     */
    get palette () {
        const primary = this.color ?? this.parent.color
        const [h, s, l] = Utils.hexToHSL(primary)

        const constrast = (Utils.contrastHexLuma(primary) == "white")
            ? CONFIG.AC.contrastColors.white
            : CONFIG.AC.contrastColors.black

        return {
            primary,
            secondary: Utils.HSLToHex(h, s * .66, 66),
            constrast
        }
    }

    /** Get the HTML for this category's header.
     * @returns {String}
     */
    get nameHTML () {
        return `<span class="category__name--initial">${this.name.at(0)}</span>${this.name.slice(1)}`
    }
}
