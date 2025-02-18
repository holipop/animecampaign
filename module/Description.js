import Stat from "./data-models/Stat.js"
import ACActor from "./documents/ACActor.js"
import ACItem from "./documents/ACItem.js"

/**
 * Returns a Regular Expression for system enrichers.
 * All regex for custom enrichers follow the @tag[input]{output} schema.
 * @param {string} tag 
 * @param {string} quantifier 
 * @returns {RegExp}
 */
function buildPattern (tag, quantifier) {
    return new RegExp(`@${tag}\\[([^\\]]+)]((?:{[^}]+})${quantifier})`, "gim")
}

/** @type {TextEditor.EnricherConfig} */
const enrichConfigStat = {
    pattern: new RegExp("@stat\\[([^\\]]+)]((?:{[^}]+}){0,1})", "gim"),
    replaceParent: false,
    
    async enricher (match, options) {
        const MAIN_STATS = ["stamina", "proficiency", "movement"]
        const [_, input] = match
        const tag = input.toLowerCase()

        const span = document.createElement("span")
        span.className = "Enricher Enricher--Stat"

        /** @type {Stat} */
        const stat = options.context[tag]
        if (!stat) {
            span.classList.add(`Enricher--Invalid`)
            span.innerText = tag
            return span
        }

        const isParentStat = (options.type == "Character") || (tag.startsWith("actor."))
        if (isParentStat) {
            if (MAIN_STATS.includes(stat.tag)) {
                span.classList.add(`Enricher--${stat.tag}`)
            } else {
                span.classList.add(`Enricher--${stat.color}`)
                span.classList.add(`Enricher--ColorStat`)
            }
        }

        span.innerText = (stat.view == "label") ? stat.label : stat.value

        switch (stat.view) {
            case "label":
                span.innerText = stat.label
                break
            case "value":
                span.innerText = stat.value
                break
            case "resource":
                span.innerHTML = `${stat.value} <span class="Enricher__Max">/ ${stat.max}</span>`
                break
            default: break
        }

        return span
    }
}

/** @type {TextEditor.EnricherConfig} */
const enrichConfigStatic = {
    pattern: new RegExp("@(if|unless|input|select)\\[([^\\]]+)]((?:{[^}]+}){0,})", "gim"),
    replaceParent: false,
    
    async enricher (match, options) {
        const [_, type, input] = match // TODO :3

        const span = document.createElement("span")
        span.className = "Enricher Enricher--Static"
        span.innerHTML = `${type.toLowerCase()}<span class="Enricher__Input">${input}</span>`

        return span
    }
}

/** @type {TextEditor.EnricherConfig} */
const enrichConfigIf = {
    pattern: null,
    replaceParent: false,
    
    async enricher (match, options) {
        const [all, condition, outputs] = match // TODO :3
    }
}

/** @type {TextEditor.EnricherConfig} */
const enrichConfigUnless = {
    pattern: buildPattern("unless", "{1,2}"),
    replaceParent: false,
    
    async enricher (match, options) {
        const [all, condition, outputs] = match
    }
}

/** @type {TextEditor.EnricherConfig} */
const enrichConfigInput = {
    pattern: buildPattern("input", "{0,1}"),
    replaceParent: false,
    
    async enricher (match, options) {
        const [all, condition, outputs] = match
    }
}

/** @type {TextEditor.EnricherConfig} */
const enrichConfigSelect = {
    pattern: buildPattern("select", "{1,}"),
    replaceParent: false,
    
    async enricher (match, options) {
        const [all, condition, outputs] = match
    }
}

/**
 * Enriches text with system-specific enrichers.
 * @param {string} text 
 * @param {ACActor|ACItem} document 
 * @returns string
 */
export async function enrichStaticHTML (text, document) {
    const enrichers = [
        enrichConfigStat,
        enrichConfigStatic
    ]
    CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat(enrichers)

    const options = {
        type: document.type,
        context: document.getStatContext(),
    }

    const enrichedText = await TextEditor.enrichHTML(text || '', options)
  
    CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers
        .filter(e => !enrichers.includes(e))
  
    return enrichedText;
}

/**
 * Enriches posted ChatMessages with system-specific enrichers.
 * @param {string} text 
 * @param {ACItem} item
 * @returns string
 */
export async function enrichChatMessage (text, item) {
    const enrichers = [
        enrichConfigStat,
    ]
    CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat(enrichers)

    const options = {
        type: "message",
        context: item.getStatContext()
    }

    const enrichedText = await TextEditor.enrichHTML(text || '', options)
  
    CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers
        .filter(e => enrichers.includes(e))
  
    return enrichedText;
}

/**
 * Attaches Sections to an enriched description.
 * @param {Element} element     The root element to query.
 */
export function attachSections (element) {
    const HEADER_NAMES = ["H1", "H2", "H3", "H4", "H5", "H6"]
    
    /** @type {NodeListOf<HTMLElement>} */
    const sections = element.querySelectorAll("h1, h2, h3, h4, h5, h6")
    if (!sections) return

    sections.forEach(header => {
        header.classList.add("Section__Header")

        // Attach button on Section header
        const collapseButton = document.createElement("button")
        collapseButton.setAttribute("type", "button")
        collapseButton.classList = "Section__Collapse ACButton ACButton--Inline"
        collapseButton.innerHTML = 
            `<span class="Section__CollapseIcon ACButton__Icon MSO">
                arrow_drop_down
            </span>`

        header.insertAdjacentElement("afterbegin", collapseButton)

        // Wrap siblings in a Section div
        const siblings = []
        let sibling = header.nextElementSibling

        while (sibling) {
            if (HEADER_NAMES.includes(sibling.nodeName)) break
            siblings.push(sibling)
            if (sibling.nodeName == "HR") break

            sibling = sibling.nextElementSibling
        }

        const section = document.createElement("div")
        section.classList.add("Section__Content")
        siblings.forEach(v => section.append(v))
        
        header.insertAdjacentElement("afterend", section)

        const headerText = header.childNodes[1]?.textContent
        if (headerText && header.hasAttribute("data-hide")) {
            header.classList.add("Section__Header--Collapsed")
            section.classList.add("Section__Content--Collapsed")
        }

        collapseButton.addEventListener("click", () => {
            header.classList.toggle("Section__Header--Collapsed")
            section.classList.toggle("Section__Content--Collapsed")
        })
    })

}