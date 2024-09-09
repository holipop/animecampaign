/**
 * The ac-button web component.
 */
export default class ButtonComponent extends HTMLElement {

    constructor () {
        super()
    }

    static observedAttributes = ["icon", "action"]

    connectedCallback () {
        const icon = this.getAttribute("icon") ?? "circle"
        const action = this.getAttribute("action") ?? ""

        this.innerHTML = /* html */ `
            <button class="ac-button" type="button" data-action="${action}">
                <span class="material-symbols-outlined">${icon}</span>
            </button>
        `
    }

}