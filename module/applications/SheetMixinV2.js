/**
 * A mixin for shared methods between Characters and Feature sheets.
 */
export default function SheetMixinV2 (Base) {

    /**
     * The common DocumentSheet class for Anime Campaign.
     */
    return class ACSheetV2 extends Base {

        /**
         * Manually invokes the color picker.
         */
        static invokeColorPicker (event, target) {
            console.log("click!")
            this.element.querySelector('[data-color-button="target"]').click()
        }

        /** The set of colors derived from this document's color.
         * @returns {*}
         */
        get palette () {
            const color = this.document.system.color
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
         * Actions performed after any render of the Application.
         * Post-render steps are not awaited by the render process.
         * @param {ApplicationRenderContext} context      Prepared context data
         * @param {RenderOptions} options                 Provided render options
         * @protected
         */
        _onRender(context, options) {

            // Apply color palette
            const coloredElements = this.element.querySelectorAll("[data-color]")
            for (const element of coloredElements) {
                const { color, colorProps } = element.dataset
                const properties = (colorProps === undefined)
                    ? `color: ${color};`
                    : colorProps.split(" ").map(p => `${p}: ${color};`).join("")
                element.style.cssText += properties
            }

            // Resizes the height of a textarea dynamically as you type more.
            const html = $(this.element)
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

        }
    }

}