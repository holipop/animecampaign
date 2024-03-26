import * as Utils from "../Utils.js";
import ACDialog from "./ACDialog.js";
import StatConfig from "./StatConfig.js";
import SheetMixin from "./SheetMixin.js";
import CategoryConfig from "./CategoryConfig.js";

/**
 * The application for Characters.
 */
export default class CharacterSheet extends SheetMixin(ActorSheet) {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            width: 650,
            height: 550,
            classes: ["animecampaign", "sheet", "actor"],
            template: 'systems/animecampaign/templates/character/character-sheet.hbs',
            dragDrop: [{ dragSelector: "[data-drag]", dropSelector: '[data-drop]' }],
            tabs: [{ navSelector: "[data-nav]", contentSelector: "[data-content]" }],
            scrollY: [".scrollable"],
        });

        return options;
    }

    /** The path to the background .svg file.
     * @returns {String}
     */
    get svgBackground () {
        return "systems/animecampaign/assets/space/MoonDraft.svg#moon-draft"
    }

    /** The text displayed in the background.
     * @returns {String}
     */
    get svgText () {
        return "character"
    }

    /** Fetches the context for this application's template.
     * @returns {*}
     */
    async getData () {
        return {
            ...super.getData(),
            ...this.object,
            config: CONFIG.AC,
            palette: this.palette,
            stats: this.object.system.colorStats, 

            svg: {
                bg: this.svgBackground,
                text: this.svgText,
            },
        }
    }

    /** Fires when a draggable element is picked up.
     * @param {Event} event 
     */
    _onDragStart (event) {
        const dataset = $(event.target).data()
        const type = dataset.drag
        const data = { type, index: null, object: null }

        switch (type) {
            case 'stat':
                const index = Number(dataset.stat)
                data.index = index
                data.object = this.object.system.colorStats[index]
                break

            // case 'feature': break
            // case 'category': break
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(data))
    }

    /** Fires when a draggable element is dropped.
     * @param {Event} event 
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
        const stats = this.object.system.colorStats
        if (stats.length === 1) return  // can't sort single entry

        const target = $(event.target).closest('[data-drag="stat"]')
        if (target.length === 0) return  // no target found
        if (target.data('stat') === data.index) return  // don't sort on self 

        const sort = SortingHelpers.performIntegerSort(data.object, {
            target: stats[target.data('stat')],
            siblings: stats.toSpliced(data.index, 1)
        })
        const updates = sort.map(({ target, update }) => [target.color, update])

        this.object.update({ 'system._stats': Object.fromEntries(updates) })
    }

    /** Hook up event listeners for Characters.
     * @param {jQuery} html 
     * @override
     */
    activateListeners (html) {
        super.activateListeners(html)
        
        // TODO: Clean this up, it looks fucking gross.
        // Dynamically change the little stamina bar.
        let staminaRatio = this.object.system.staminaRatio
        if (staminaRatio >= 1) {
            staminaRatio = 1
        } else if (staminaRatio <= 0) {
            staminaRatio = 0
        }
        staminaRatio *= 100
        html.find('[data-stam-bar]').height(`${staminaRatio}%`);

        // Only show the class level badge only if number is valid AND an epithet user.
        if (this.object.system.classLevel === "" || this.object.system.type !== "epithet") {
            html.find('[data-prof-class]').hide()
        }

        html.find('[data-stat-delete]').on('click', this.onStatDelete.bind(this))
        html.find('[data-stat-edit]').on('click', this.onStatEdit.bind(this))
        html.find('[data-stat-add]').on('click', this.onStatAdd.bind(this))

        html.find('[data-category-edit]').on('click', this.onCategoryEdit.bind(this))
    }

    /** Delete a color stat from the stat list.
     * @param {Event} event 
     */
    onStatDelete (event) {
        const index = $(event.target).closest('[data-stat]').data("stat")
        const { tag, color } = this.object.system.colorStats[index]

        ACDialog.confirm({
            title: game.i18n.format("AC.DIALOG.DeleteColorStat.Title", { 
                tag: tag.toUpperCase(), 
                name: this.object.name
            }),
            content: game.i18n.format("AC.DIALOG.DeleteColorStat.Content", {
                tag: tag.toUpperCase(), 
                color: color.toUpperCase()
            }),
            yes: () => this.object.update({ [`system._stats.${color}`]: null }),
            no: () => { },
            defaultYes: true
        });
    }

    /** Invoke the Stat Configuration dialog.
     * @param {Event} event 
     */
    onStatEdit (event) {
        const index = $(event.target).closest('[data-stat]').data("stat")
        const stat = this.object.system.colorStats[index];

        const config = new StatConfig({ 
            ...stat,
            parent: this.object
        }, {
            title: game.i18n.format("AC.DIALOG.EditStat.Title", { 
                tag: stat.tag.toUpperCase(),
                name: this.object.name
            })
        })
        config.render(true)
    }

    /** Add the first available color stat to the list.
     */
    onStatAdd () {
        const [color] = Object
            .entries(this.object.system._stats)
            .find(([_, stat]) => stat === null) // If the value is null, get the key

        const config = new StatConfig({ 
            color,
            parent: this.object
        }, {
            title: game.i18n.format("AC.DIALOG.AddStat.Title", { name: this.object.name })
        })
        config.render(true)
    }

    /** Invoke the Category Configuration dialog.
     * @param {Event} event 
     */
    onCategoryEdit (event) {
        const index = $(event.target).closest('[data-category]').data("category")
        const category = this.object.system.categories[index];

        const config = new CategoryConfig(Object.assign({
            ...category,
            index,
            features: category.features,
            parent: this.object
        }), {
            title: "Edit Category"
        })
        config.render(true)
    }

    /** Handle how Characters update.
     * @param {SubmitEvent} event 
     * @param {*} data 
     */
    async _updateObject (event, data) {
        const updates = expandObject(data)

        // intercept stat handling
        if ("stats" in updates.system) {
            const statData = Object
                .entries(updates.system.stats)
                .map(([index, statChanges]) => {
                    const stat = this.object.system.colorStats[index]
                    return [stat.color, { ...stat, ...statChanges }]
                })

            updates.system.stats = null // v1.0 bandaid
            updates.system._stats = Object.fromEntries(statData)
        }

        super._updateObject(event, updates)
    }

}