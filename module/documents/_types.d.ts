import ACActor from "./ACActor.js"
import ACItem from "./ACItem.js"
import CharacterSheetV2 from "../applications-v2/CharacterSheetV2.js"
import FeatureSheetV2 from "../applications-v2/FeatureSheetV2.js"

import CharacterData from "../data-models/CharacterData.js"
import FeatureData from "../data-models/FeatureData.js"

declare module "./ACActor.js" {
    export default interface ACActor {
        system: CharacterData
        sheet: CharacterSheetV2
    }
}

declare module "./ACItem.js" {
    export default interface ACItem {
        system: FeatureData
        sheet: FeatureSheetV2
    }
}