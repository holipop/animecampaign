import ACDialogV2 from "./ACDialogV2.js"

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
         * @param {PointerEvent} event
         * @param {HTMLElement} target
         */
        static onInvokeColorPicker (event, target) {
            this.element.querySelector('[data-color-button="target"]').click()
        }

        /**
         * Invokes the file picker for editing images.
         * @param {PointerEvent} event
         * @param {HTMLElement} target
         */
        static onEditImage (event, target) {
            const fp = new FilePicker({
                current: this.document.img,
                type: "image",
                callback: (src) => {
                    this.document.update({ "img": src })
                }
            })
            fp.browse()
        }

        static async onStatAdd (event, target) {
            
            const proceed = await ACDialogV2.confirm({
                window: { title: "A Modal Dialog" },
                content: "Are you sure?",
                rejectClose: false,
                modal: true,
            });
            if ( proceed ) console.log("Proceed.");
            else console.log("Do not proceed.");
              
        }

        static onStatEdit (event, target) {

        }

        static onStatDelete (event, target) {

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
            const resizeableTextAreas = this.element.querySelectorAll("textarea[data-resize]")
            for (const element of resizeableTextAreas) {
                element.style.height = 0
                element.style.height = element.scrollHeight + "px"

                element.addEventListener("input", () => {
                    // const parentDiv = html.find('[data-scrollable]')
                    // const initScrollY = parentDiv.scrollTop()

                    element.style.height = 0
                    element.style.height = element.scrollHeight + "px"

                    // parentDiv.scrollTop(initScrollY)
                })
            }

            // Submits the form whenever the enter key is pressed.
            const enterableElements = this.element.querySelectorAll("[data-enter]")
            for (const element of enterableElements) {
                element.addEventListener("keypress", event => {
                    const escape = element.dataset.enter

                    if (event.code == 'Enter') {
                        if (escape == 'shift' && event.shiftKey) return

                        event.preventDefault()
                        this.submit()
                    }
                })
            }
        }
    }

}