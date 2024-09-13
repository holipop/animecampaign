import ACDialogV2 from "./ACDialogV2.js"
import StatConfigV2 from "./StatConfigV2.js"

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

        static onStatAdd (event, target) {
            const [color] = Object
                .entries(this.document.system._stats)
                .find(([_, stat]) => stat === null) // If the value is null, get the key

            new StatConfigV2({
                window: { 
                    title: game.i18n.format("AC.DIALOG.AddStat.Title", { name: this.document.name }) 
                },
                document: this.document,
                stat: {
                    color, 
                    tag: "",
                }
            }).render(true)
        }

        static onStatEdit (event, target) {
            const index = $(event.target).closest('[data-stat]').data("stat")
            const stat = this.document.system.colorStats[index];

            new StatConfigV2({ 
                window: {
                    title: game.i18n.format("AC.DIALOG.EditStat.Title", { 
                        tag: stat.tag.toUpperCase(),
                        name: this.document.name
                    })
                },
                document: this.document,
                stat,
            }).render(true)
        }

        static async onStatDelete (event, target) {
            const index = $(event.target).closest('[data-stat]').data("stat")
            const { tag, color } = this.document.system.colorStats[index]

            const confirm = await ACDialogV2.confirm({
                window: {
                    title: game.i18n.format("AC.DIALOG.DeleteColorStat.Title", { 
                        tag: tag.toUpperCase(), 
                        name: this.document.name
                    }),
                },
                content: game.i18n.format("AC.DIALOG.DeleteColorStat.Content", {
                    tag: tag.toUpperCase(), 
                    color: color.toUpperCase()
                }),
                modal: true
            });
            
            if (confirm) {
                this.document.update({ [`system._stats.${color}`]: null })
            }
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