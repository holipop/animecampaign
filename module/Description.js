import Stat from "./data-models/Stat.js"
import ACActor from "./documents/ACActor.js"

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
    pattern: buildPattern("stat", "{0,1}"),
    replaceParent: false,
    
    async enricher (match, options) {
        const MAIN_STATS = ["stamina", "proficiency", "movement"]
        const [_, tag] = match
        const { context } = options
        console.log({ tag, context })

        const span = document.createElement("span")
        span.style.padding = "0 .2rem"
        span.style.borderRadius = rpx(2)

        if (tag in context) {
            /** @type {Stat} */
            const stat = context[tag]
            span.style.border = `${rpx()} solid`
    
            if (!MAIN_STATS.includes(stat.tag)) {
                span.style.borderColor = CONFIG.AC.colors[stat.color]
            } else {
                span.style.borderColor = "grey"
            }
            
            span.innerText = (stat.view == "label") ? stat.label : stat.value
        } else {
            span.style.border = `${rpx()} dashed`
            span.style.borderColor = "red"
            span.innerText = tag
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

    const { system } = document
    const context = system.colorStats
        .map(stat => {
            return [[stat.tag, stat], [`stat.${stat.color}`, stat]]
        })
        .flat()
        .concat([
            ["stamina", system.stamina],
            ["proficiency", system.proficiency],
            ["movement", system.movement],
        ])

    const options = {
        type: "character",
        context: Object.fromEntries(context)
    }

    const enrichedText = await TextEditor.enrichHTML(text || '', options)
  
    CONFIG.TextEditor.enrichers.filter(e => {
        return (e != enrichConfigStat)// || (e != enrichConfigUnless)
    })
  
    return enrichedText;
}

/**
 * Attaches Sections to an enriched description.
 * @param {Element} element     The root element to query.
 * @param {string} selecter     Parent selector of the descriptions. 
 */
export function attachSections (element) {
    const HEADER_NAMES = ["H1", "H2", "H3", "H4", "H5", "H6"]
    const DEFAULT_COLLAPSED_CHARACTER = "_"
    
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
        if (headerText && headerText.startsWith(DEFAULT_COLLAPSED_CHARACTER)) {
            header.childNodes[1].textContent = headerText.slice(1)
            header.classList.add("Section__Header--Collapsed")
            section.classList.add("Section__Content--Collapsed")
        }

        collapseButton.addEventListener("click", () => {
            header.classList.toggle("Section__Header--Collapsed")
            section.classList.toggle("Section__Content--Collapsed")
        })
    })

}