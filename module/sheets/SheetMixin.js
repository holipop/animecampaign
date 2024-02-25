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
        }
    }
    
}