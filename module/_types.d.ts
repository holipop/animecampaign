import ACActor from "./documents/ACActor.js"
import ACItem from "./documents/ACItem.js"
import Stat from "./data-models/Stat.js"

declare global {
    type Query = {
        type: "input"|"select"
        label: string,
        options?: Record<string, string>
        defaultValue?: string
    }
}

declare module "./Description.js" {
    interface ACEnricherConfigOptions extends TextEditor.EnrichmentOptions {
        document: ACActor|ACItem
        type: "Character"|"Feature"
        context: Record<string, Stat>
    }

    interface ACEnricherConfig extends TextEditor.EnricherConfig {
        enricher: (match: RegExpMatchArray, options: ACEnricherConfigOptions) => HTMLElement
    }
}