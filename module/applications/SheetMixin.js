import * as Utils from "../Utils.js";
//import * as List from "../List.js";

/**
 * A mixin for shared methods between Characters and Feature sheets.
 */
export default function SheetMixin (Base) {

    /**
     * The common DocumentSheet class for Anime Campaign.
     */
    return class ACSheet extends Base {

        /** The set of colors derived from this document's color.
         * @returns {*}
         */
        get palette () {
            const primary = this.object.system.color
            const [h, s, l] = Utils.hexToHSL(primary)

            const contrast = (Utils.contrastHexLuma(primary) == "white")
                ? CONFIG.AC.contrastColors.white
                : CONFIG.AC.contrastColors.black

            return { 
                primary, 
                secondary: Utils.HSLToHex(h, s * .66, 66),
                contrast,
            }
        }

        /** Hook up event listeners between for Actors and Items.
         * @param {*} html 
         * @override
         */
        activateListeners (html) {
            super.activateListeners(html)

            // Set the color of elements with [data-color].
            html.find('[data-color]').each((_, element) => {
                // colorProps is the list of properties to optionally use in-place of just "color".
                const { color, colorProps } = $(element).data()
                const properties = (colorProps === undefined)
                    ? { color }
                    : Object.fromEntries(colorProps.split(" ").map(p => [p, color]))

                $(element).css(properties)
            })

            // Resizes the height of a textarea dynamically as you type more.
            html.find('textarea[data-resize]')
                .each(function () {
                    this.setAttribute("style", `height:0px;`) // ! don't know why, it only works with this + overriding min-height in css.
                    this.setAttribute("style", `height:${this.scrollHeight}px;`)
                })
                .on("input", function () {
                    const parentDiv = html.find('[data-scrollable]')
                    const initScrollY = parentDiv.scrollTop()

                    this.style.height = 0
                    this.style.height = this.scrollHeight + "px"

                    parentDiv.scrollTop(initScrollY)
                })

            // Submits the form whenever the enter key is pressed.
            html.find('[data-enter]').each((_, element) => {
                $(element).on('keypress', event => {
                    const escape = $(element).data('enter')

                    if (event.code == 'Enter') {
                        if (escape == 'shift' && event.shiftKey) return

                        event.preventDefault()
                        this.submit()
                    }
                })
            })

            // Manually invoke the color picker.
            html.find('[data-color-button="sender"]').on('click', () => {
                html.find('[data-color-button="target"]').click()
            })
        }

    }
    
}