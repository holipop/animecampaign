/** A namespace for chat messages.
 * @module ChatMessage
 */


/** Event listeners for chat messages.
 * @param {ChatMessage} message 
 * @param {JQuery} html 
 * @param {*} data 
 */
export function activateListeners (message, html, data) {

    const messageElement = html[0].querySelector(".JS-ChatMessage")
    if (!messageElement) return

    // Expand roll tooltip on click
    const roll = messageElement.querySelector(".JS-ExpandTooltip")
    if (roll) {
        const tooltip = messageElement.querySelector("div.dice-tooltip")

        roll.addEventListener("click", event => {
            const display = tooltip.style.display
            tooltip.style.display = (display) ? "" : "block"
        })
    }

    // Inject sections
    const headers = ["h1", "h2", "h3", "h4", "h5", "h6"]
    const query = headers.map(v => `.JS-Content ${v}`).join()

    /** @type {NodeListOf<HTMLElement>} */
    const sections = messageElement.querySelectorAll(query)
    if (sections) {
        sections.forEach((header, index, parent) => {
            // Wrap siblings in a Section div
            const siblings = []
            let sibling = header.nextElementSibling

            while (sibling) {
                if (headers.map(v => v.toUpperCase()).includes(sibling.nodeName)) break
                siblings.push(sibling)
                if (sibling.nodeName == "HR") break

                sibling = sibling.nextElementSibling
            }

            const section = document.createElement("div")
            section.classList.add("JS-SectionContent")
            section.hidden = header.textContent.startsWith("<")
            siblings.forEach(v => section.append(v))
            
            header.insertAdjacentElement("afterend", section)

            //! TODO: CLEAN THIS UP, MAKE IT NEATER

            header.addEventListener("click", () => {
                section.hidden = !section.hidden
            })
        })
    }
    
}