import SheetMixinV2 from "./SheetMixinV2.js"
import ACDialogV2 from "./ACDialogV2.js"
import StatConfigV2 from "./StatConfigV2.js"
import CategoryConfigV2 from "./CategoryConfigV2.js"
import ACItem from "../documents/ACItem.js"

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets

/**
 * The application for Characters.
 */
export default class CharacterSheetV2 extends HandlebarsApplicationMixin(SheetMixinV2(ActorSheetV2)) {

    /** @override */
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
            onStatAdd: CharacterSheetV2.onStatAdd,
            onStatEdit: CharacterSheetV2.onStatEdit,
            onStatDelete: CharacterSheetV2.onStatDelete,
            onCategoryCollapse: CharacterSheetV2.onCategoryCollapse,
            onCategoryEdit: CharacterSheetV2.onCategoryEdit,
            onCategoryFlood: CharacterSheetV2.onCategoryFlood,
            onCategoryDelete: CharacterSheetV2.onCategoryDelete,
            onCategoryCreate: CharacterSheetV2.onCategoryCreate,
            onFeatureAdd: CharacterSheetV2.onFeatureAdd,
            onFeatureCollapse: CharacterSheetV2.onFeatureCollapse,
            onFeatureEdit: CharacterSheetV2.onFeatureEdit,
            onFeatureDelete: CharacterSheetV2.onFeatureDelete,
        },
        form: {
            submitOnChange: true,
        },
        dragDrop: [{ dragSelector: '.JS-Drag', dropSelector: '.JS-Drop' }],
    }

    /** @override */
    static PARTS = {
        template: {
            template: "systems/animecampaign/templates/character-v2/template.hbs",
            scrollable: [".Scrollable"]
        },
    }

    /** 
     * The title of this application's window.
     * @returns {String}
     */
    get title () {
        return `${this.document.name}`
    }



    // ---- Drag & Drop ----

    /** 
     * Callback actions which occur at the beginning of a drag start workflow.
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
                const element = event.target.closest(".JS-Stat")
                data.index = Number(element.dataset.stat)
                data.object = this.document.system.colorStats[data.index]
                break

            // case 'feature': break
            // case 'category': break
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(data))
    }

    /** 
     * Callback actions which occur when a dragged element is dropped on a target.
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

    /** 
     * Handles the drop event for stats, setting their 'sort' key.
     * @param {Event} event 
     * @param {*} data 
     */
    onDropStat (event, data) {
        const stats = this.document.system.colorStats
        if (stats.length === 1) return  // can't sort single entry

        const target = $(event.target).closest('.JS-Stat')
        if (target.length === 0) return  // no target found
        if (target.data('stat') === data.index) return  // don't sort on self 

        const sort = SortingHelpers.performIntegerSort(data.object, {
            target: stats[target.data('stat')],
            siblings: stats.toSpliced(data.index, 1)
        })
        const updates = sort.map(({ target, update }) => [target.color, update])

        this.document.update({ 'system._stats': Object.fromEntries(updates) })
    }



    // ---- Context ----

    /** @override */
    tabGroups = {
        character: "kit"
    }

    /**
     * Returns a record of navigation tabs.
     * @returns {Record<string, ApplicationTab>}
     */
    getTabs () {
        const tabs = {
            kit:        { id: "kit", group: "character", icon: "stat_0", label: "AC.CharacterSheet.Kit" },
            biography:  { id: "biography", group: "character", icon: "person", label: "AC.CharacterSheet.Biography" }
        }
        
        for (const tab of Object.values(tabs)) {
            tab.active = this.tabGroups[tab.group] === tab.id
            tab.css = tab.active ? "active" : ""
        }
        return tabs
    }

    /**
     * Gets the Features that don't belong to a Category. These used to be hidden.
     * @returns {ACItem[]}
     */
    getUncategorizedFeatures () {
        const categoryNames = this.document.system.categories.map(c => c.name)
        return this.document.items.filter(item => {
            return !categoryNames.includes(item.system.category)
        })
    }

    /** @override */
    async _prepareContext () {
        return {
            ...super._prepareContext(),
            config: CONFIG.AC,
            document: this.document,
            system: this.document.system,
            palette: this.document.system.palette,
            tabs: this.getTabs(),
            stats: this.document.system.colorStats,
            categories: this.document.system.categories,
            uncategorizedFeatures: this.getUncategorizedFeatures()
        }
    }

    /** @override */
    _onRender (context, options) {
        super._onRender(context, options)

        // Disable the Add Stat button when the stats list is full.
        if (this.document.system.colorStats.length >= 8) {
            this.element.querySelector(`.JS-DisableStatAdd`).setAttribute("disabled", "disabled")
        }
    }

    /**
     * Submit a document update based on the processed form data.
     * @param {SubmitEvent} event       The originating form submission event
     * @param {HTMLFormElement} form    The form element that was submitted
     * @param {*} submitData            Processed and validated form data to be used for a document update
     * @returns {Promise<void>}
     * @protected
     * @override
     */
    async _processSubmitData(event, form, submitData) {
        const updates = submitData

        // intercept stat handling
        if ("stats" in updates?.system) {
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



    // ---- Actions ----

    /**
     * Invokes the Stat configuration window for creating a Stat. 
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static onStatAdd (event, target) {
        const [color] = Object
            .entries(this.document.system._stats)
            .find(([_, stat]) => stat === null) // If the value is null, get the key

        new StatConfigV2({
            window: { 
                title: game.i18n.format("AC.StatConfig.AddStat.Title", { name: this.document.name }) 
            },
            document: this.document,
            stat: {
                color, 
                tag: "",
            }
        }).render(true)
    }

    /** 
     * Invokes the Stat configuration window for editing a Stat. 
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {CharacterSheetV2}
     */
    static onStatEdit (event, target) {
        const index = target.closest('.JS-Stat').dataset.stat
        const stat = this.document.system.colorStats[index];

        new StatConfigV2({ 
            window: {
                title: game.i18n.format("AC.StatConfig.EditStat.Title", { 
                    tag: stat.tag.toUpperCase(),
                    name: this.document.name
                })
            },
            document: this.document,
            stat,
        }).render(true)
    }

    /** 
     * Invokes a dialog for deleting a Stat.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {CharacterSheetV2}
     */
    static async onStatDelete (event, target) {            
        const index = target.closest('.JS-Stat').dataset.stat
        const { tag, color } = this.document.system.colorStats[index]

        const confirm = await ACDialogV2.confirm({
            window: {
                title: game.i18n.format("AC.DeleteColorStatDialog.Title", { 
                    tag: tag.toUpperCase(), 
                    name: this.document.name
                }),
            },
            content: game.i18n.format("AC.DeleteColorStatDialog.Content", {
                tag: tag.toUpperCase(), 
                color: color.toUpperCase()
            }),
            modal: true
        });
        
        if (confirm) {
            this.document.update({ [`system._stats.${color}`]: null })
        }
    }

    /**
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static onCategoryCollapse (event, target) {
        const element = target.closest(".JS-Category")

        element.classList.toggle("Category--Collapsed")
    }

    /**
     * Invokes the Category configuration window for editing.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static onCategoryEdit (event, target) {
        const index = target.closest('.JS-Category').dataset.category
        const category = this.document.system.categories[index]

        new CategoryConfigV2({ 
            window: {
                title: game.i18n.format("AC.CategoryConfig.EditCategory.Title", { 
                    name: this.document.name
                })
            },
            document: this.document,
            category,
        }).render(true)
    }

    /**
     * On confirm, sets every Feature's color to its Category's.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static async onCategoryFlood (event, target) {
        const index = target.closest('.JS-Category').dataset.category
        const category = this.document.system.categories[index]

        const confirm = await ACDialogV2.confirm({
            window: {
                title: game.i18n.format("AC.FloodCategoryDialog.Title", { 
                    category: category.name.toUpperCase(), 
                    name: this.document.name
                }),
            },
            content: game.i18n.format("AC.FloodCategoryDialog.Content"),
            modal: true
        });
        
        if (confirm) {
            const updates = category.features.map(item => {
                return { _id: item._id, 'system.color': category.palette.primary }
            })
            this.document.updateEmbeddedDocuments("Item", updates)
        }
    }
    
    /**
     * Invokes a dialog for deleting a Category. 
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static async onCategoryDelete (event, target) {
        const index = target.closest('.JS-Category').dataset.category
        const category = this.document.system.categories[index]

        const confirm = await ACDialogV2.confirm({
            window: {
                title: game.i18n.format("AC.DeleteCategoryDialog.Title", { 
                    category: category.name.toUpperCase(), 
                    name: this.document.name
                }),
            },
            content: game.i18n.format("AC.DeleteCategoryDialog.Content", {
                category: category.name.toUpperCase(), 
            }),
            modal: true
        })

        if (confirm) {
            const updates = category.features.map(item => item._id)
            this.document.deleteEmbeddedDocuments("Item", updates)

            const categories = this.document.system.categories
            categories.splice(index, 1)

            this.document.update({ 'system.categories': categories })
        }
    }

    /**
     * Invokes the Category configuration window for creating a new Category.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static async onCategoryCreate (event, target) {
        const category = {
            name: "",
            trackers: [],
            details: {
                editor: "prosemirror",
                formula: "1d20",
                action: "Main",
                usage: {
                    multiple: "1",
                    timeframe: "Round"
                }
            },
        }

        new CategoryConfigV2({ 
            window: {
                title: game.i18n.format("AC.CategoryConfig.CreateCategory.Title", { 
                    name: this.document.name
                })
            },
            document: this.document,
            category,
        }).render(true)
    }

    /**
     * Creates a Feature under a Category.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static onFeatureAdd (event, target) {
        const index = target.closest('.JS-Category').dataset.category
        const category = this.document.system.categories[index]

        this.document.createEmbeddedDocuments("Item", [{
            name: `New ${category.name.capitalize()}`, 
            type: "Feature", 
            system: { 
                category: category.name,
                color: category.palette.primary,
                details: category.details,
                stats: category.trackers.map(t => {
                    return { tag: t.tag, view: t.display }
                })
            }
        }])
    }

    /**
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static onFeatureCollapse (event, target) { }

    /**
     * Renders a Feature's sheet.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static onFeatureEdit (event, target) {
        const { id } = target.closest(".JS-FeatureEntry").dataset

        /** @type {ACItem} */
        const item = this.document.items.get(id)
        item.sheet.render(true)
    }

    /**
     * On confirm, deletes a Feature.
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     * @this {CharacterSheetV2}
     */
    static async onFeatureDelete (event, target) {
        const { id } = target.closest(".JS-FeatureEntry").dataset
        const item = this.document.items.get(id)
        console.log(item)

        const confirm = await ACDialogV2.confirm({
            window: {
                title: game.i18n.format("AC.DeleteFeatureDialog.Title", { 
                    id,
                    name: this.document.name
                }),
            },
            content: game.i18n.format("AC.DeleteFeatureDialog.Content", {
                feature: item.name,
            }),
            modal: true
        })

        if (confirm) {
            this.document.deleteEmbeddedDocuments("Item", [id])
        }
    }

}