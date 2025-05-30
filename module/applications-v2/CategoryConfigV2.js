import Category from "../data-models/Category.js"
import ACActor from "../documents/ACActor.js"

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 * The configuration window for Categories.
 */
export default class CategoryConfigV2 extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor (options = {}) {
        super(options)
        this.#dragDrop = this.#createDragDropHandlers()
    }

    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "dialog", "config"],
        tag: "form",
        position: {
            width: 400,
            height: "auto",
        },
        window: {
            minimizable: false,
        },
        actions: {
            onStatAdd: CategoryConfigV2.onStatAdd,
            onStatDelete: CategoryConfigV2.onStatDelete,
        },
        form: {
            handler: CategoryConfigV2.onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        },
        dragDrop: [{ dragSelector: '.JS-Drag', dropSelector: '.JS-Drop' }],
    }

    /** @inheritdoc */
    static PARTS = {
        hbs: { template: "systems/animecampaign/templates/dialog/category-config.hbs" }
    }

    /**
     * The Category being edited.
     * @returns {Category}
     */
    get category () { 
        return this.options.category
    }

    /**
     * The Character this Category belongs to.
     * @returns {ACActor}
     */
    get document () {
        return this.options.document
    }

    /** 
     * Is this configuring a new category?
     * @returns {Boolean}
     */
    get isNew () {
        return this.category.name === ""
    }

    /**
     * Gets the color of this Category if it is set, otherwise returns the color of the Character.
     * @returns {Color}
     */
    get displayColor () {
        return this.category.color ?? this.document.system.color
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
        return true;
    }

    /** 
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop (selector) {
        return true;
    }

    /** 
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event
     * @protected
     */
    _onDragStart (event) {
        const index = Number(event.target.dataset.stat)
        const stats = this.getLocalStats()

        const data = { 
            index: index,
            object: stats[index]
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(data))
    }

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
    _onDrop (event) {
        const data = TextEditor.getDragEventData(event)
        const trackers = this.getLocalStats()
        if (trackers.length === 1) return  // can't sort single entry

        const target = event.target.closest('.JS-CategoryStat')
        if (target.length === 0) return  // no target found
        if (target.dataset.stat === data.index) return  // don't sort on self 

        trackers.splice(data.index, 1)
        trackers.splice(target.dataset.stat, 0, data.object)

        this.category.updateSource({ trackers })
        this.render(true)

        event.stopPropagation()
    }



    // ---- Context ----

    /** @inheritdoc */
    tabGroups = {
        category: "basic"
    }

    /**
     * Returns a record of navigation tabs.
     * @returns {Record<string, ApplicationTab>}
     */
    getTabs() {
        const tabs = {
            basic: { id: "basic", group: "category", icon: "deployed_code", label: "AC.CategoryConfig.Basic" },
            stats: { id: "stats", group: "category", icon: "equalizer", label: "AC.CategoryConfig.Stats" },
            details: { id: "details", group: "category", icon: "info", label: "AC.CategoryConfig.Details" },
        }
        
        for (const tab of Object.values(tabs)) {
            tab.active = this.tabGroups[tab.group] === tab.id
            tab.css = tab.active ? "active" : ""
        }
        return tabs
    }

    /** @inheritdoc */
    async _prepareContext (options) {
        return {
            app: this,
            config: CONFIG.AC,
            category: this.category,
            document: this.document,
            isNew: this.isNew,
            displayColor: this.displayColor,
            tabs: this.getTabs(),
        }
    }

    /** @inheritdoc */
    _onRender(context, options) {
        super._onRender(context, options)

        // bind DragDrop events
        this.#dragDrop.forEach(d => d.bind(this.element))

        // Link color picker values
        const picker = this.element.querySelector(".JS-ColorInput")
        const text = this.element.querySelector(".JS-ColorText")
        picker.addEventListener("change", () => {
            text.value = picker.value
        })

        // Disable the Add Stat button when the stats list is full.
        if (this.category.trackers.length >= 4) {
            this.element.querySelector(`.JS-DisableStatAdd`).setAttribute("disabled", "disabled")
        }
    }



    // ---- Actions ----

    /**
     * Gets the local stats data directly from the form. 
     * This ensures changes persist prior to rerendering.
     * @returns {{ tag: string, display: "value"|"resource"|"label" }[]}
     */
    getLocalStats () {
        const data = {}
        const inputs = this.element.querySelectorAll(".JS-StatInput")
        let trackers = []
        if (inputs.length > 0) {
            inputs.forEach(el => {
                data[el.getAttribute("name")] = el.value
            })
            trackers = Object.values(foundry.utils.expandObject(data).trackers)
        }
        return trackers
    }

    /**
     * Locally appends the Stats list with a new Stat.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CategoryConfigV2}
     */
    static onStatAdd (event, target) {
        let trackers = this.getLocalStats()

        trackers.push({
            tag: "new stat",
            display: "value"
        })

        this.category.updateSource({ trackers })
        this.render(true)
    }

    /**
     * Locally removes a Stat from the stats list.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CategoryConfigV2}
     */
    static onStatDelete (event, target) {
        let trackers = this.getLocalStats()
        const index = target.closest(".JS-CategoryStat").dataset.stat

        trackers.splice(index, 1)
        
        this.category.updateSource({ trackers })
        this.render(true)
    }

    /** 
     * Form submission handler.
     * @param {SubmitEvent} event 
     * @param {HTMLFormElement} form 
     * @param {*} data 
     * @this {CategoryConfigV2}
     */
    static onSubmit (event, form, formData) {
        const data = formData.object
        const categories = [...this.document.system.categories]

        data.name ||= "new category"
        data.name = data.name.toLowerCase()

        // forces Foundry to update even when it *thinks* there's no changes.
        data.snap = !this.category.snap
        
        const { trackers } = foundry.utils.expandObject(data)
        if (trackers) {
            const trackersArr = Object.values(trackers)

            const uniqueTags = new Set(trackersArr.map(t => t.tag.toLowerCase()))

            if (uniqueTags.has("")) {
                throw game.i18n.format("AC.CategoryConfig.StatTagEmpty")
            }

            if (uniqueTags.size !== trackersArr.length) {
                throw game.i18n.format("AC.CategoryConfig.StatTagTaken")
            }
    
            trackersArr.forEach((t, i) => {
                data[`trackers.${i}.tag`] = t.tag.toLowerCase()
            })
        }

        const nameTaken = categories
            .filter(c => c.name !== this.category.name)
            .find(c => c.name == data.name)
        if (nameTaken) {
            throw game.i18n.format("AC.CategoryConfig.CategoryNameTaken", { name: data.name.toUpperCase() })
        }

        const updates = { "system.categories": categories }

        if (this.isNew) {
            categories.push(data)
        } else {
            // if name was changed, change the category of all of its features
            if (data.name !== this.category.name) {
                const updatedItems = this.category.features.map(item => { 
                    return { _id: item._id, 'system.category': data.name }
                })
                updates.items = updatedItems
            }

            const index = categories.findIndex(c => c.name == this.category.name)
            categories[index] = data
        }

        this.document.update(updates)
    }

}