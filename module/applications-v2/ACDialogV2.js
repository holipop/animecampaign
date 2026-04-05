const { DialogV2 } = foundry.applications.api

/**
 * An extension of the Dialog class for system styling and Material Symbols.
 */
export default class ACDialogV2 extends DialogV2 {

    /** 
     * The default configuration options which are assigned to every instance of this Application class. 
     */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "dialog", "config"],
        position: {
            width: 400,
            height: "auto"
        }
    }

    /** @inheritdoc */
    async _renderHTML (context, options) {
        const form = document.createElement("form")
        //form.className = "dialog-form standard-form"
        form.autocomplete = "off"
        form.innerHTML = /* html */`
            <div class="Dialog__Content Config">${this.options.content}</div>
            <div class="Dialog__Buttons">${this._renderButtons()}</div>
        `
        form.addEventListener("submit", event => this._onSubmit(event.submitter, event))
        return form
    }

    /** @inheritdoc */
    _renderButtons () {
        return Object.values(this.options.buttons).map(button => {
            return /* html */`
                <button class="ACButton ACButton--Dialog ${button.class}" data-action="${button.action}" ${button.default ? "autofocus" : ""}>
                    ${(button.icon) ? `<span class="ACButton__Icon MSO">${button.icon}</span>` : ""}
                    <span class="ACButton__Text">
                        ${game.i18n.localize(button.label)}
                    </span>
                </button>
            `
        }).join("")
    }

    /**
     * A utility helper to generate a dialog given a Handlebars template.
     * @param {*} options
     * @param {string} options.template 
     * @param {*} options.context 
     * @returns {Promise<*>} Resolves to a FormData's object if a button was pressed. If the dialog was dismissed and rejectClose is false, returns null.
     */
    static async from ({ template = "", context = {}, ...options } = {}) {
        options.content ??= await renderTemplate(template, context)
        
        options.buttons ??= []
        options.buttons.map(button => {
            button.callback = (_, button) => {
                const data = new FormDataExtended(button.form)
                data.object.button = button.dataset.action
                return data.object
            }
        })

        return this.wait(options)
    }

    /** @inheritdoc */
    static async confirm ({ yes = {}, no = {}, ...options } = {}) {
        const { mergeObject } = foundry.utils

        options.buttons ??= []
        options.buttons.unshift(mergeObject({
            action: "yes", label: "Yes", icon: "check", callback: () => true
        }, yes), mergeObject({
            action: "no", label: "No", icon: "close", default: true, callback: () => false
        }, no))

        return this.wait(options)
    }

    /** @inheritdoc */
    static async prompt ({ ok = {}, ...options } = {}) {
        const { mergeObject } = foundry.utils

        options.buttons ??= []
        options.buttons.unshift(mergeObject({
            action: "ok", label: "Confirm", icon: "check", default: true
        }, ok))

        return this.wait(options)
    }

}