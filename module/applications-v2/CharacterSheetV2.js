import SheetMixinV2 from "./SheetMixinV2.js"

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets

/**
 * @typedef ApplicationTab
 * @property {string} id         The ID of the tab. Unique per group.
 * @property {string} group      The group this tab belongs to.
 * @property {string} icon       An icon to prepend to the tab
 * @property {string} label      Display text, will be run through `game.i18n.localize`
 * @property {boolean} active    If this is the active tab, set with `this.tabGroups[group] === id`
 * @property {string} css        "active" or "" based on the above boolean
 */

/**
 * The application for Characters.
 */
export default class CharacterSheetV2 extends HandlebarsApplicationMixin(SheetMixinV2(ActorSheetV2)) {

    /** The default configuration options which are assigned to every instance of this Application class. */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "actor", "sheet"],
        position: {
            width: 650,
            height: 550,
        },
        window: {
            resizable: true,
        },
        actions: {
            onInvokeColorPicker: super.onInvokeColorPicker,
            onEditImage: super.onEditImage,
            onStatAdd: super.onStatAdd,
            onStatEdit: super.onStatEdit,
            onStatDelete: super.onStatDelete,
        },
        form: {
            submitOnChange: true,
        },
        dragDrop: [{ dragSelector: '.JS-Drag', dropSelector: '.JS-Drop' }],
    }

    /** The Handlebars templates for this application. These are rendered in order. */
    static PARTS = {
        template: {
            template: "systems/animecampaign/templates/character-v2/template.hbs",
            scrollable: [".Scrollable"]
        },
    }

    /** The title of this application's window.
     * @returns {String}
     */
    get title () {
        return `${this.document.name}`
    }

    /** @override */
    tabGroups = {
        character: "kit"
    }

    /** Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event
     * @protected
     * @override
     */
    _onDragStart (event) {
        const dataset = event.target.dataset
        const type = dataset.drag
        const data = { type, index: null, object: null }

        switch (type) {
            case 'stat':
                const index = Number(dataset.stat)
                data.index = index
                data.object = this.document.system.colorStats[index]
                break

            // case 'feature': break
            // case 'category': break
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(data))
    }

    /** Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event
     * @protected
     * @override
     */
    _onDrop (event) {
        const data = TextEditor.getDragEventData(event)
        
        switch (data.type) {
            case 'stat':
                this.onDropStat(event, data)
                break

            /* case 'feature': 
                this.onDropFeature(event, data)
                break
            case 'category': 
                this.onDropCategory(event, data)
                break */
        }
    }

    /** Handles the drop event for stats, setting their 'sort' key.
     * @param {Event} event 
     * @param {*} data 
     */
    onDropStat (event, data) {
        const stats = this.document.system.colorStats
        if (stats.length === 1) return  // can't sort single entry

        const target = $(event.target).closest('[data-drag="stat"]')
        if (target.length === 0) return  // no target found
        if (target.data('stat') === data.index) return  // don't sort on self 

        const sort = SortingHelpers.performIntegerSort(data.object, {
            target: stats[target.data('stat')],
            siblings: stats.toSpliced(data.index, 1)
        })
        const updates = sort.map(({ target, update }) => [target.color, update])

        this.document.update({ 'system._stats': Object.fromEntries(updates) })
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {RenderOptions} options                 Provided render options
     * @protected
     * @override
     */
    _onRender(context, options) {
        super._onRender(context, options)

        // Set the initial tab. Foundry code is so damn ugly.
        const tabs = this.getTabs();
        const tab = tabs[this.tabGroups.character]
        this.element.querySelector(".JS-TabName").textContent = game.i18n.localize(tab.label)
        this.element.querySelector(`.tab[data-tab="${tab.id}"]`).classList.add("active")

        // Make the little stamina bar change amount :3
        let staminaRatio = this.document.system.staminaRatio
        if (staminaRatio >= 1) {
            staminaRatio = 1
        } else if (staminaRatio <= 0) {
            staminaRatio = 0
        }
        staminaRatio *= 100
        //!!! this.element.querySelector('[data-stam-bar]').style.height = `${staminaRatio}%`

        // Disable the Add Stat button when the stats list is full.
        if (this.document.system.colorStats.length >= 8) {
            this.element.querySelector(`.JS-DisableStatAdd`).setAttribute("disabled", "disabled")
        }
    }

    /**
     * Returns a record of navigation tabs.
     * @returns {Record<string, ApplicationTab>}
     */
    getTabs() {
        const tabs = {
            kit:        { id: "kit", group: "character", icon: "check", label: "AC.NAV.Kit" },
            biography:  { id: "biography", group: "character", icon: "person", label: "AC.NAV.Biography" }
        }
        for (const tab of Object.values(tabs)) {
            tab.active = this.tabGroups[tab.group] === tab.id
            tab.css = tab.active ? "active" : ""
        }
        return tabs
    }

    /** 
     * This is really the only place changing the tab name can be done.
     * @override 
     */
    changeTab (tab, group, options) {
        const tabs = this.getTabs();
        const label = tabs[tab].label

        this.element.querySelector(".JS-TabName").textContent = game.i18n.localize(label)

        super.changeTab(tab, group, options)
    }

    /** The context passed to each Handlebars template.
     * @returns {*}
     */
    async _prepareContext () {
        
        return {
            ...super._prepareContext(),
            config: CONFIG.AC,
            document: this.document,
            system: this.document.system,
            palette: this.palette,
            tabs: this.getTabs(),
            stats: this.document.system.colorStats,
            categories: this.document.system.categories

            /* svg: {
                bg: this.svgBackground,
                text: this.svgText,
            }, */
        }
    }

    /**
     * Submit a document update based on the processed form data.
     * @param {SubmitEvent} event                   The originating form submission event
     * @param {HTMLFormElement} form                The form element that was submitted
     * @param {object} submitData                   Processed and validated form data to be used for a document update
     * @returns {Promise<void>}
     * @protected
     * @override
     */
    async _processSubmitData(event, form, submitData) {
        const updates = submitData

        console.log(updates)

        // intercept stat handling
        if ("stats" in updates.system) {
            const statData = Object
                .entries(updates.system.stats)
                .map(([index, statChanges]) => {
                    const stat = this.document.system.colorStats[index]
                    return [stat.color, { ...stat, ...statChanges }]
                })

            updates.system.stats = null // v1.0 bandaid
            updates.system._stats = Object.fromEntries(statData)
        }

        super._processSubmitData(event, form, updates)
    }

}