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

        constructor (options = {}) {
            super(options)
            this.#dragDrop = this.#createDragDropHandlers()
        }

        /** @type {DragDrop[]} */
        #dragDrop

        /**
         * Returns an array of DragDrop instances
         * @type {DragDrop[]}
         */
        get dragDrop() {
            return this.#dragDrop;
        }

        /** Create drag-and-drop workflow handlers for this Application
         * @returns {DragDrop[]}     An array of DragDrop handlers
         * @private
         */
        #createDragDropHandlers () {
            return this.options.dragDrop.map((d) => {
                d.permissions = {
                    dragstart: this._canDragStart.bind(this),
                    drop: this._canDragDrop.bind(this),
                }
                d.callbacks = {
                    dragstart: this._onDragStart.bind(this),
                    dragover: this._onDragOver.bind(this),
                    drop: this._onDrop.bind(this),
                }
                return new DragDrop(d)
            });
        }

        /** Manually invokes the color picker. */
        static onInvokeColorPicker () {
            this.element.querySelector('.JS-InvokeColorPicker').click()
        }

        /** Invokes the file picker for editing images. */
        static onEditImage () {
            const fp = new FilePicker({
                current: this.document.img,
                type: "image",
                callback: (src) => {
                    this.document.update({ "img": src })
                }
            })
            fp.browse()
        }

        /** Invokes the Stat configuration window for creating a stat. */
        static onStatAdd () {
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

        /** Invokes the Stat configuration window for editing the targetted stat. 
         * @param {PointerEvent} event
         * @param {HTMLElement} target
         */
        static onStatEdit (event, target) {
            const index = target.closest('.JS-Stat').dataset.stat
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

        /** Deletes the targetted stat.
         * @param {PointerEvent} event
         * @param {HTMLElement} target
         */
        static async onStatDelete (event, target) {            
            const index = target.closest('.JS-Stat').dataset.stat
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

        /** Define whether a user is able to begin a dragstart workflow for a given drag selector
         * @param {string} selector       The candidate HTML selector for dragging
         * @returns {boolean}             Can the current user drag this selector?
         * @protected
         */
        _canDragStart (selector) {
            return this.isEditable;
        }

        /** Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
         * @param {string} selector       The candidate HTML selector for the drop target
         * @returns {boolean}             Can the current user drop on this selector?
         * @protected
         */
        _canDragDrop (selector) {
            return this.isEditable;
        }

        /** Callback actions which occur at the beginning of a drag start workflow.
         * @param {DragEvent} event
         * @protected
         */
        _onDragStart (event) { }

        /** Callback actions which occur when a dragged element is over a drop target.
         * @param {DragEvent} event
         * @protected
         */
        _onDragOver (event) { }

        /** Callback actions which occur when a dragged element is dropped on a target.
         * @param {DragEvent} event
         * @protected
         */
        _onDrop (event) { }

        /**
         * Actions performed after any render of the Application.
         * Post-render steps are not awaited by the render process.
         * @param {ApplicationRenderContext} context      Prepared context data
         * @param {RenderOptions} options                 Provided render options
         * @protected
         */
        _onRender (context, options) {

            // bind DragDrop events
            this.#dragDrop.forEach(d => d.bind(this.element))

            // Apply color palette
            const coloredElements = this.element.querySelectorAll(".JS-Color")
            for (const element of coloredElements) {
                const { color, properties } = element.dataset
                const css = (properties)
                    ? properties.split(" ").map(p => `${p}: ${color};`).join("")
                    : `color: ${color};`
                element.style.cssText += css
            }

            // Resizes the height of a textarea dynamically as you type more.
            const resizeableTextAreas = this.element.querySelectorAll("textarea.JS-ResizeTextArea")
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

            // Resizes the width of an input as you type more.
            /** @type {HTMLElement[]} */
            const resizeableInputs = this.element.querySelectorAll("input.JS-ResizeInput")
            for (const element of resizeableInputs) {
                element.style.width = 0
                element.style.width = element.scrollWidth + "px"

                element.addEventListener("input", () => {
                    element.style.width = 0
                    element.style.width = element.scrollWidth + "px"
                })
            }

            // Submits the form whenever the enter key is pressed.
            const enterableElements = this.element.querySelectorAll(".JS-Enter")
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

            // Apply the sizes of stats.
            const statElements = this.element.querySelectorAll("[data-stat]")
            for (const element of statElements) {
                const index = element.dataset.stat
                const stat = this.document.system.colorStats[index]

                if (stat.size == "big") {
                    element.classList.add("stat-card--big")
                }
            }

        }
    }

}