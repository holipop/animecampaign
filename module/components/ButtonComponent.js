/**
 * The ac-button web component.
 */
export default class ButtonComponent extends HTMLElement {

    constructor () {
        super()
    }

    static observedAttributes = ["icon", "action", "color"]

    style = /* css */`
        .ac-button {
            border: none;
            border-radius: 0;
            box-shadow: none;
            background: transparent;
            display: grid;
            place-items: center;
            height: 1.5rem;
            width: 1.5rem;
            border: 0.0625rem solid currentColor;
            border-radius: 100%;
            padding: 0;
            background-color: #f4f3ed;
            transition: 0.075s;
        }
        .ac-button > .material-symbols-outlined {
            font-size: 1.25rem;
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .ac-button:hover {
            box-shadow: 0 0 0 0.0625rem currentColor;
        }
        .ac-button:active {
            background-color: currentColor;
        }
        .ac-button:focus {
            outline: 0.125rem rgba(205, 50, 50, 0.5) solid;
        }
    `

    connectedCallback () {
        const icon = this.getAttribute("icon") ?? "circle"
        const action = this.getAttribute("action") ?? ""
        const color = this.getAttribute("color") ?? "#1f1e1e"

        const shadow = this.attachShadow({ mode: "open" })

        shadow.innerHTML = /* html */ `
            <style>${this.style}</style>
            <button class="ac-button" type="button" data-action="${action}" data-color="${color}">
                <span class="material-symbols-outlined">${icon}</span>
            </button>
        `

        this.appendChild(shadow)
    }

}