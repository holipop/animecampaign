const { DialogV2 } = foundry.applications.api

/**
 * An extension of the Dialog class for system styling and Material Symbols.
 */
export default class ACDialogV2 extends DialogV2 {

    /** 
     * The default configuration options which are assigned to every instance of this Application class. 
     */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "dialog"],
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
            <div class="Dialog__Content">${this.options.content}</div>
            <div class="Dialog__Buttons">${this._renderButtons()}</div>
        `
        form.addEventListener("submit", event => this._onSubmit(event.submitter, event))
        return form
    }

    /** @inheritdoc */
    _renderButtons () {
        return Object.values(this.options.buttons).map(button => {
            const { action, label, icon, default: isDefault, class: cls = "" } = button
            return /* html */`
                <button class="ACButton ACButton--Dialog ${cls}" data-action="${action}" ${isDefault ? "autofocus" : ""}>
                    <span class="ACButton__Icon MSO">
                        ${icon}
                    </span>
                    <span class="ACButton__Text">
                        ${label}
                    </span>
                </button>
            `
        }).join("")
    }

    /** @inheritdoc */
    static async confirm ({ yes = {}, no = {}, ...options }={}) {
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