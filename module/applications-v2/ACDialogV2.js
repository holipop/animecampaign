const { DialogV2 } = foundry.applications.api

/**
 * An extension of the Dialog class.
 */
export default class ACDialogV2 extends DialogV2 {

    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "dialog"],
        position: {
            width: 400,
            height: "auto"
        }
    }

    /** @override */
    async _renderHTML(_context, _options) {
        const form = document.createElement("form")
        form.className = "dialog-form standard-form"
        form.autocomplete = "off"
        /* form.innerHTML = `
            ${this.options.content ? `<div class="dialog-content standard-form">${this.options.content}</div>` : ""}
            <footer class="form-footer">${this._renderButtons()}</footer>
        ` */
        form.innerHTML = /* html */`
            <div class="dialog__content">${this.options.content}</div>
            <div class="dialog__button-list">${this._renderButtons()}</div>
        `
        form.addEventListener("submit", event => this._onSubmit(event.submitter, event))
        return form
    }

    /** @override */
    _renderButtons() {
        return Object.values(this.options.buttons).map(button => {
            const { action, label, icon, default: isDefault, class: cls="" } = button;
            /* return `
                <button type="${isDefault ? "submit" : "button"}" data-action="${action}" class="${cls}"
                        ${isDefault ? "autofocus" : ""}>
                ${icon ? `<i class="${icon}"></i>` : ""}
                <span>${game.i18n.localize(label)}</span>
                </button>
            `; */
            return /* html */`
                <button class="button dialog__button dialog-button ${cls}" data-action="${action}" ${isDefault ? "autofocus" : ""}>
                    <span class="material-symbols-outlined">
                        ${icon}
                    </span>
                    <span class="button__text">
                        ${label}
                    </span>
                </button>

                <div class="dialog__button-svg--wrapper">
                    <svg class="dialog__button-svg" viewBox="0 0 100 100">
                        <text class="dialog__button-icon" x="0" y="100">
                            ${icon}
                        </text>
                    </svg>
                </div>
            `
        }).join("");
    }

    /** @override */
    static async confirm({ yes = {}, no = {}, ...options }={}) {
        const { mergeObject } = foundry.utils
        options.buttons ??= [];
        options.buttons.unshift(mergeObject({
            action: "yes", label: "Yes", icon: "check", callback: () => true
        }, yes), mergeObject({
            action: "no", label: "No", icon: "close", default: true, callback: () => false
        }, no));
        return this.wait(options);
    }

    /** @override */
    static async prompt({ ok = {}, ...options } = {}) {
        const { mergeObject } = foundry.utils
        options.buttons ??= [];
        options.buttons.unshift(mergeObject({
            action: "ok", label: "Confirm", icon: "check", default: true
        }, ok));
        return this.wait(options);
    }

}