import Stat from "./data-models/Stat.js"
import ACActor from "./documents/ACActor.js"
import ACItem from "./documents/ACItem.js"

/** @type {ACEnricherConfig} */
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

const tags = {
    input: ">",
    select: "?",
}

/** @type {ACEnricherConfig} */
const enrichConfigStatic = {
    pattern: new RegExp(`@(${Object.keys(tags).join("|")})\\[([^\\]]+)]((?:{[^}]+}){0,})`, "gim"),
    replaceParent: false,
    
    async enricher (match, options) {
        let [_, type, label, entries] = match
        type = type.toLowerCase()

        if (options.document instanceof ACItem) {
            const query = { type, label }
            
            entries = entries
                .slice(1, entries.length - 1)
                .split("}{")

            switch (type) {
                case "input":
                    query.defaultValue = entries[0]
                    break
                case "select":
                    entries = entries.map(e => e.split("|"))
                    query.options = Object.fromEntries(entries)
                    break
            }

            options.document.queries.push(query)
        }

        const span = document.createElement("span")
        span.className = "Enricher Enricher--Static"
        span.innerHTML = `${tags[type]}<span class="Enricher__Input">${label}</span>`

        return span
    }
}

/** @type {ACEnricherConfig} */
const enrichConfigQuery = {
    pattern: new RegExp(`@(${Object.keys(tags).join("|")})\\[([^\\]]+)]((?:{[^}]+}){0,})`, "gim"),
    replaceParent: false,
    
    async enricher (match, options) {
        const current = options.currentQuery
        const answer = options.answers[current]
        /** @type {Query} */
        const query = options.document.queries[current]

        const span = document.createElement("span")
        switch (query.type) {
            case "input":
                span.innerHTML = answer || query.defaultValue
                break
            case "select":
                span.innerHTML = query.options[answer]
                break
        }

        options.currentQuery++
        return span
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
        document,
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
 * @param {string[]} answers
 * @returns string
 */
export async function enrichChatMessage (text, item, answers) {
    const enrichers = [
        enrichConfigStat,
        enrichConfigQuery,
    ]
    CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat(enrichers)

    const options = {
        document: item,
        type: "message",
        context: item.getStatContext(),
        answers,
        currentQuery: 0,
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