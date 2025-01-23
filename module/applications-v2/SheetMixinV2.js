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



        // ---- Drag & Drop ----

        /** @type {DragDrop[]} */
        #dragDrop

        /**
         * Returns an array of DragDrop instances
         * @type {DragDrop[]}
         */
        get dragDrop() {
            return this.#dragDrop;
        }

        /** 
         * Create drag-and-drop workflow handlers for this Application
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

        /** 
         * Define whether a user is able to begin a dragstart workflow for a given drag selector
         * @param {string} selector       The candidate HTML selector for dragging
         * @returns {boolean}             Can the current user drag this selector?
         * @protected
         */
        _canDragStart (selector) {
            return this.isEditable;
        }

        /** 
         * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
         * @param {string} selector       The candidate HTML selector for the drop target
         * @returns {boolean}             Can the current user drop on this selector?
         * @protected
         */
        _canDragDrop (selector) {
            return this.isEditable;
        }

        /** 
         * Callback actions which occur at the beginning of a drag start workflow.
         * @param {DragEvent} event
         * @protected
         */
        _onDragStart (event) { }

        /** 
         * Callback actions which occur when a dragged element is over a drop target.
         * @param {DragEvent} event
         * @protected
         */
        _onDragOver (event) { }

        /** 
         * Callback actions which occur when a dragged element is dropped on a target.
         * @param {DragEvent} event
         * @protected
         */
        _onDrop (event) { }



        // ---- Context ----

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

            // Disable inputs if not an owner
            /** @type {NodeListOf<Element>} */
            const ownerInputs = this.element.querySelectorAll(".JS-OwnerInput")
            ownerInputs.forEach(element => {
                if (this.document.permission < 3) {
                    element.setAttribute("disabled", "true")
                }
            })

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

        }



        // ---- Actions ----

        /** 
         * Manually invokes the color picker. 
         * @this {ACSheetV2}
         */
        static onInvokeColorPicker () {
            this.element.querySelector('.JS-InvokeColorPicker').click()
        }

        /** 
         * Invokes the file picker for editing images. 
         * @this {ACSheetV2}
         */
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
    }

}