import Category from "../data-models/Category.js"
import ACActor from "../documents/ACActor.js"

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 * The configuration window for Categories.
 */
export default class CategoryConfigV2 extends HandlebarsApplicationMixin(ApplicationV2) {

    /** The default configuration options which are assigned to every instance of this Application class. */
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
        form: {
            handler: CategoryConfigV2.onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    }

    /** The Handlebars templates for this application. These are rendered in order. */
    static PARTS = {
        hbs: { template: "systems/animecampaign/templates/dialog/category-config.hbs" }
    }

    /**
     * @returns {Category}
     */
    get category () { 
        return this.options.category
    }

    /**
     * @returns {ACActor}
     */
    get document () {
        return this.options.document
    }

    /** Is this configuring a new category?
     * @returns {Boolean}
     */
    get isNew () {
        return !("name" in this.category)
    }

    /**
     * @returns {Color}
     */
    get displayColor () {
        return this.category.color ?? this.document.system.color
    }

    /** @override */
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
            stats: { id: "stats", group: "category", icon: "stat_0", label: "AC.CategoryConfig.Stats" },
            details: { id: "details", group: "category", icon: "stat_0", label: "AC.CategoryConfig.Details" },
        }
        
        for (const tab of Object.values(tabs)) {
            tab.active = this.tabGroups[tab.group] === tab.id
            tab.css = tab.active ? "active" : ""
        }
        return tabs
    }

    async _prepareContext () {
        return {
            app: this,
            config: CONFIG.AC,
            category: this.category,
            document: this.document,

            isNew: this.isNew,
            displayColor: this.displayColor,
        }
    }

    _onRender(context, options) {
        const picker = this.element.querySelector(".JS-ColorInput")
        const text = this.element.querySelector(".JS-ColorText")
        
        picker.addEventListener("change", () => {
            text.value = picker.value
        })
    }

    /** Update the stats list for the Stat's document. 
     * @param {SubmitEvent} event 
     * @param {HTMLFormElement} form 
     * @param {*} data 
     * @this {CategoryConfigV2}
     */
    static onSubmit (event, form, formData) {
        const data = formData.object
        const categories = this.document.system.categories

        data.name ||= "new category"
        data.name = data.name.toLowerCase()

        const nameTaken = categories
            .filter(c => c.name !== this.category.name)
            .find(c => c.name == data.name)
        if (nameTaken) {
            throw game.i18n.format("AC.CategoryConfig.CategoryNameTaken", { name: data.name.toUpperCase() })
        }

        if (this.isNew) {
            categories.push(data)
        } else {
            if (data.name !== this.category.name) {
                const updates = this.category.features.map(item => { 
                    return { _id: item._id, 'system.category': data.name }
                })
                this.document.updateEmbeddedDocuments("Item", updates)
            }

            const index = categories.findIndex(c => c.name == this.category.name)
            categories[index] = data
        }

        this.document.update({ 'system.categories': categories })
    }

}