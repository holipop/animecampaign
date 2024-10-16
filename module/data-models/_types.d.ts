import CharacterData from "./CharacterData.js"
import FeatureData from "./FeatureData.js"
import Category from "./Category.js"
import Details from "./Details.js"
import Section from "./Section.js"
import Stat from "./Stat.js"

type ColorKeys = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'cyan' | 'purple' | 'grey'

declare module "./CharacterData.js" {
    export default interface CharacterData {
        stamina: Stat
        proficiency: Stat
        movement: Stat
        _stats: Record<ColorKeys, Stat>
        categories: Category[]
        biography: {
            editor: string
            plaintext: string
            richtext: string
        }
        class: string
        word: string
        type: string
        color: string
    }
}

declare module "./FeatureData.js" {
    export default interface FeatureData {
        color: string
        category: string
        stats: Stat[]
        sections: Section[]
        details: Details
    }
}

declare module "./Category.js" {
    export default interface Category {
        name: string
        color: string
        collapsed: boolean
        details: Details
        trackers: { tag: string, img: string }[]
    }
}

declare module "./Details.js" {
    export default interface Details {
        editor: "markdown" | "prosemirror"
        formula: string
        action: string
        usage: {
            multiple: string
            timeframe: string
        }
    }
}

declare module "./Stat.js" {
    export default interface Stat {
        tag: string
        img: string
        color: ColorKeys
        view: "value" | "resource" | "label"
        value: number
        max: number
        label: string
        size: "big" | "small"
        sort: number
    }
}

declare module "./Section.js" {
    export default interface Section {
        name: string
        visible: boolean
        plaintext: string
        richtext: string
        collapsed: boolean
    }
}