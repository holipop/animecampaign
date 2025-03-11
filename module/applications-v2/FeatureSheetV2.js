import SheetMixinV2 from "./SheetMixinV2.js"
import StatConfigV2 from "./StatConfigV2.js"
import ACDialogV2 from "./ACDialogV2.js"
import * as Description from "../Description.js"

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ItemSheetV2 } = foundry.applications.sheets

/**
 * The application for Features.
 */
export default class FeatureSheetV2 extends HandlebarsApplicationMixin(SheetMixinV2(ItemSheetV2)) {

    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "item", "sheet"],
        position: {
            width: 600,
            height: 500,
        },
        window: {
            resizable: true,
        },
        actions: {
            onInvokeColorPicker: super.onInvokeColorPicker,
            onEditImage: super.onEditImage,
            onRemoveImage: FeatureSheetV2.onRemoveImage,
            onRoll: FeatureSheetV2.onRoll,
            onStatAdd: FeatureSheetV2.onStatAdd,
            onStatEdit: FeatureSheetV2.onStatEdit,
            onStatDelete: FeatureSheetV2.onStatDelete,
            onToggleSectionVisibility: FeatureSheetV2.onToggleSectionVisibility,
        },
        form: {
            submitOnChange: true,
        },
        dragDrop: [{ dragSelector: '.JS-Drag', dropSelector: '.JS-Drop' }],
    }

    /** @inheritdoc */
    static PARTS = {
        part: { 
            template: "systems/animecampaign/templates/feature-v2/template.hbs",
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
                data.object = this.document.system.stats[data.index]
                break

            // case 'section': break
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

            /* case 'section': 
                this.onDropSection(event, data)
                break
                */
        }

        event.stopPropagation()
    }

    /** 
     * Handles the drop event for Stats, shifting their indeces.
     * @param {Event} event 
     * @param {*} data 
     */
    onDropStat (event, data) {
        const stats = [...this.document.system.stats]
        if (stats.length === 1) return  // can't sort single entry

        const target = event.target.closest('.JS-Stat')
        if (target.length === 0) return  // no target found
        if (target.dataset.stat === data.index) return  // don't sort on self

        stats.splice(data.index, 1)
        stats.splice(target.dataset.stat, 0, data.object)

        this.document.update({ "system.stats": stats })
    }



    // ---- Context ----

    /** @inheritdoc */
    tabGroups = {
        feature: "description"
    }

    /**
     * Returns a record of navigation tabs.
     * @returns {Record<string, ApplicationTab>}
     */
    getTabs () {
        const tabs = {
            description: { id: "description", group: "feature", permission: 1, icon: "notes", label: "AC.FeatureSheet.Description" },
            details:     { id: "details", group: "feature", permission: 2, icon: "info", label: "AC.FeatureSheet.Details" }
        }
        
        for (const tab of Object.values(tabs)) {
            tab.active = this.tabGroups[tab.group] === tab.id
            tab.css = tab.active ? "active" : ""
        }
        return tabs
    }

    /** @inheritdoc */
    async _prepareContext () {
        this.document.queries = []

        const enrichedDescription = await Description.enrichStaticHTML(this.document.system.description, this.document)

        return {
            ...super._prepareContext(),
            config: CONFIG.AC,
            permission: this.document.permission,
            document: this.document,
            system: this.document.system,
            palette: this.document.system.palette,
            tabs: this.getTabs(),
            enrichedDescription
        }
    }

    /**
     * Attaches visibility toggles to each header
     * Each button invokes FeatureSheetV2.onToggleSectionVisibility.
     */
    attachSectionControls () {
        const ownerDescriptionContent = this.element.querySelector(".JS-TextEditor .editor-content")

        /** @type {NodeListOf<HTMLElement>} */
        const sections = ownerDescriptionContent.querySelectorAll("h1, h2, h3, h4, h5, h6")
        if (!sections) return

        sections.forEach((header, key) => {
            header.classList.add("Section__Header")
            const isHidden = header.hasAttribute("data-hide")
            if (isHidden) header.classList.add("Section__Header--Collapsed")

            // Attach button on Section header
            const visibilityToggle = document.createElement("button")
            visibilityToggle.setAttribute("type", "button")
            visibilityToggle.setAttribute("data-action", "onToggleSectionVisibility")
            visibilityToggle.setAttribute("data-index", key)
            visibilityToggle.classList = "Section__ToggleVisibility ACButton ACButton--Inline"
            visibilityToggle.innerHTML = 
                `<span class="ACButton__Icon MSO">
                    ${(isHidden) ? "visibility_off" : "visibility"}
                </span>`

            const wrapper = document.createElement("div")
            wrapper.classList = "Section__ToggleVisibilityWrapper"
            wrapper.append(visibilityToggle)

            header.insertAdjacentElement("afterbegin", wrapper)
        })
    }

    /** @inheritdoc */
    _onRender (context, options) {
        super._onRender(context, options)

        const descriptionContent = this.element.querySelector(".JS-AttachSections")
        if (descriptionContent) {
            Description.attachSections(descriptionContent)
        }

        this.attachSectionControls()

        // Attaches the visibility toggles for when a re-render hasn't been invoked.
        // This is incredibly hack-y. Do not touch.
        const toggleEditor = this.element.querySelector(`.JS-TextEditor button.icon.toggle`)
        toggleEditor.addEventListener("click", () => {
            const saveButton = this.element.querySelector(`.JS-TextEditor button[data-action="save"]`)
            saveButton.addEventListener("click", () => this.attachSectionControls())
        })
    }



    // ---- Actions ----

    /** 
     * Removes the Features's image.
     * @this {FeatureSheetV2}
     */
    static onRemoveImage () {
        this.document.update({ img: null })
    }

    /** 
     * Sends a chat message and rolls if this Feature has a valid formula.
     * @this {FeatureSheetV2}
     */
    static onRoll () {
        this.document.roll()
    }

    /** 
     * Invokes the Stat configuration window for creating a Stat. 
     * @this {FeatureSheetV2}
     */
    static onStatAdd () {
        new StatConfigV2({
            window: { 
                title: game.i18n.format("AC.StatConfig.AddStat.Title", { name: this.document.name }) 
            },
            document: this.document,
            stat: {
                view: "value", 
                tag: "",
            }
        }).render(true)
    }

    /** 
     * Invokes the Stat configuration window for editing a Stat. 
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {FeatureSheetV2}
     */
    static onStatEdit (event, target) {
        const index = target.closest('.JS-Stat').dataset.stat
        const stat = this.document.system.stats[index];

        new StatConfigV2({
            window: { 
                title: game.i18n.format("AC.StatConfig.EditStat.Title", { name: this.document.name }) 
            },
            document: this.document,
            stat
        }).render(true)
    }

    /** 
     * Deletes a targetted Stat.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {FeatureSheetV2}
     */
    static async onStatDelete (event, target) {
        const index = target.closest('.JS-Stat').dataset.stat
        const { tag } = this.document.system.stats[index]

        const confirm = await ACDialogV2.confirm({
            window: {
                title: game.i18n.format("AC.DeleteStatDialog.Title", { 
                    tag: tag.toUpperCase(), 
                    name: this.document.name
                }),
            },
            content: game.i18n.format("AC.DeleteStatDialog.Content", {
                tag: tag.toUpperCase(), 
            }),
            modal: true
        });
        
        if (confirm) {
            const stats = [...this.document.system.stats]
            stats.splice(index, 1)

            this.document.update({ "system.stats": stats })
        }
    }

    /** 
     * Toggles each section's visibility by inserting data-hide in the HTML string.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {FeatureSheetV2}
     */
    static onToggleSectionVisibility (event, target) {
        const index = Number(target.dataset.index)
        const descriptionHTML = document.createElement("div")
        descriptionHTML.innerHTML = this.document.system.description

        const section = descriptionHTML.querySelectorAll("h1, h2, h3, h4, h5, h6")[index]

        if (section.hasAttribute("data-hide")) {
            section.removeAttribute("data-hide")
        } else {
            section.setAttribute("data-hide", "")
        }

        this.document.update({ "system.description": descriptionHTML.innerHTML })
    }

}