//import * as Utils from "../Utils.js";
//import * as List from "../List.js";

/**
 * A mixin for shared methods between Characters and Feature sheets.
 */
export default function SheetMixin (Base) {

    /**
     * The common DocumentSheet class for Anime Campaign.
     */
    return class ACSheet extends Base {

        /** Hook up event listeners between for Actors and Items.
         * @param {*} html 
         * @override
         */
        activateListeners (html) {
            super.activateListeners(html)

            // Set the color of elements with [data-color].
            html.find('[data-color]').each(this.setColor.bind(this))
        }

        /**
         * @param {Number} index 
         * @param {Element} element 
         */
        setColor (index, element) {
            const properties = {
                "color": $(element).data("color")
            }
            $(element).css(properties)
            //console.log($(element).data("color"))
        }
    }
    
}