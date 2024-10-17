import ACActor from "./ACActor.js"
import ACItem from "./ACItem.js"

import CharacterData from "../data-models/CharacterData.js"
import FeatureData from "../data-models/FeatureData.js"

declare module "./ACActor.js" {
    export default interface ACActor {
        system: CharacterData
    }
}

declare module "./ACItem.js" {
    export default interface ACItem {
        system: FeatureData
    }
}