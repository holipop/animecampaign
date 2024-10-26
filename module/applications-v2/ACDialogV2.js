const { DialogV2 } = foundry.applications.api

/**
 * An extension of the Dialog class.
 */
export default class ACDialogV2 extends DialogV2 {

    /** The default configuration options which are assigned to every instance of this Application class. */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "dialog"],
        position: {
            width: 400,
            height: "auto"
        }
    }

    /** The HTMLElement this application renders.
     * @param {*} context
     * @param {*} options
     * @returns {Promise<HTMLFormElement>}
     * @override
     */
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

    /** The string template of Dialog buttons.
     * @returns {String}
     * @override
     */
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

    /** @override */
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

    /** @override */
    static async prompt ({ ok = {}, ...options } = {}) {
        const { mergeObject } = foundry.utils
        options.buttons ??= []
        options.buttons.unshift(mergeObject({
            action: "ok", label: "Confirm", icon: "check", default: true
        }, ok))
        return this.wait(options)
    }

}