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
            const color = this.object.system.color
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

        /** Handle extra operations when the tab changes
         * @param {MouseEvent|null} event
         * @param {Tabs} tabs
         * @param {String} active
         * @override
         */
        _onChangeTab (event, tabs, active) {
            this.setTabName(active)

            super._onChangeTab(event, tabs, active)
        }

        /** Set the HTML for the localized tab name.
         * @param {String} active 
         */
        setTabName (active) {
            const capitalized = active.at(0).toUpperCase() + active.slice(1)
            const name = game.i18n.localize(`AC.NAV.${capitalized}`)

            this._element.find('form [data-tab-name]').html(
                `<span class="nav__current-tab--initial">${name.at(0)}</span>${name.slice(1)}`
            )
        }

        /** Hook up event listeners between for Actors and Items.
         * @param {*} html 
         * @override
         */
        activateListeners (html) {
            super.activateListeners(html)

            this.setTabName(html.find('[data-nav] .active').data('tab'))

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