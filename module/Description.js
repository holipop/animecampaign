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

/**
 * Gets rem units in terms of pixels.
 * By default, 1rem is 16px.
 * @param {number} px 
 */
function rpx (px = 1) {
    return `${px * (1 / 16)}rem`
}

/** @type {TextEditor.EnricherConfig} */
const enrichConfigStat = {
    pattern: new RegExp("@stat\\[([^\\]]+)]((?:{[^}]+}){0,1})", "gim"),
    replaceParent: false,
    
    async enricher (match, options) {
        const MAIN_STATS = ["stamina", "proficiency", "movement"]
        const [_, tag] = match
        tag.toLowerCase()

        const span = document.createElement("span")
        span.className = "Enricher Enricher--Stat"

        /** @type {Stat} */
        const stat = options.context[tag]
        if (!stat) {
            span.classList.add(`Enricher--Invalid`)
            span.innerText = tag
            return span
        }

        const isParentStat = (options.type == "character") || (tag.startsWith("actor."))
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
const enrichConfigIf = {
    pattern: buildPattern("if", "{1,2}"),
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
 * Enriches text for Character biographies.
 * @param {string} text 
 * @param {ACActor} document 
 * @returns string
 */
export async function enrichCharacterHTML (text, document) {
    CONFIG.TextEditor.enrichers.push(enrichConfigStat)

    const options = {
        type: "character",
        context: document.getStatContext()
    }

    const enrichedText = await TextEditor.enrichHTML(text || '', options)
  
    CONFIG.TextEditor.enrichers = []
  
    return enrichedText;
}

/**
 * Enriches text for Feature descriptions.
 * @param {string} text 
 * @param {ACItem} document 
 * @returns string
 */
export async function enrichFeatureHTML (text, document) {
    CONFIG.TextEditor.enrichers.push(enrichConfigStat)

    // TODO: merge this with enrichCharacterHTML since they're essentially the same

    const options = {
        type: "feature",
        context: document.getStatContext()
    }

    const enrichedText = await TextEditor.enrichHTML(text || '', options)
  
    CONFIG.TextEditor.enrichers = []
  
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