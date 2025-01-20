import Details from "./Details.js";
import ACItem from "../documents/ACItem.js";

/** 
 * Data structure for categories.
 */
export default class Category extends foundry.abstract.DataModel {

    /** @override */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            name: new fields.StringField(),
            color: new fields.ColorField(),
            collapsed: new fields.BooleanField({ initial: false }),

            snap: new fields.BooleanField({ initial: true }),

            details: new fields.EmbeddedDataField(Details),

            trackers: new fields.ArrayField(new fields.SchemaField({
                display: new fields.StringField(),
                tag: new fields.StringField(),
                
                img: new fields.FilePathField({ // !! deprecated
                    categories: ['IMAGE'],
                    initial: 'icons/svg/circle.svg'
                })
            }))
        };
    }

    /** 
     * Get the palette of this category.
     * @returns {Palette}
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

        const css = (luma <= .5) ? "White" : "Black";

        return {
            primary: color.css,
            secondary: foundry.utils.Color.fromHSL([h, s * .66, .66]).css,
            contrast,
            css,
        }
    }

    /**
     * Get the CSS class for if this Category is collapsed.
     * @returns {string}
     */
    get collapsedCSS () {
        const sheet = this.parent.parent.sheet
        return (sheet.collapsedCategories.has(this.name)) ? "Category--Collapsed" : ""
    }

    /** 
     * Get the list of features under this category.
     * @returns {ACItem[]}
     */
    get features () {
        return this.parent.parent.items
            .filter(item => item.system.category === this.name)
            .sort((a, b) => a.sort - b.sort)
    }

    /** 
     * Get the HTML for this category's header.
     * @returns {String}
     * @deprecated
     */
    get nameHTML () {
        return `<span class="category__name--initial">${this.name.at(0)}</span>${this.name.slice(1)}`
    }
}
