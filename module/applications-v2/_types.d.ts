import SheetMixinV2 from "./SheetMixinV2.js"
import CharacterSheetV2 from "./CharacterSheetV2.js"
import ACActor from "../documents/ACActor.js"

import ApplicationV2 from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/api/application.mjs"
import ActorSheetV2 from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/sheets/actor-sheet.mjs"
import ItemSheetV2 from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/sheets/item-sheet.mjs"

declare module "./SheetMixinV2.js" {
    // ! This is all close as we'll get lmao
    type ConstructorOf<T> = new (...args: any[]) => T

    type ACSheetInstance = {
        private dragDrop: DragDrop[]
        get dragDrop(): DragDrop[]
        get palette(): { primary: string, secondary: string, contrast: string }
        private createDragDropHandlers(): DragDrop[]
        protected _canDragStart (selector: string): boolean 
        protected _canDragDrop (selector: string): boolean 
        protected _onDragStart (event: DragEvent): void
        protected _onDragOver (event: DragEvent): void
        protected _onDrop (event: DragEvent): void
        protected _onRender (context: any, options: any): void 
    }
    
    type ACSheetStatic = {
        static onInvokeColorPicker(): void
        static onEditImage(): void
        static onStatAdd(): void
        static onStatEdit (event: PointerEvent, target: HTMLElement): void
        static async onStatDelete (event: PointerEvent, target: HTMLElement): void
    }

    export default function SheetMixin<T extends ConstructorOf<ApplicationV2>>(Base: T):
        ((new (...args: any[]) => ACSheetInstance) & ACSheetStatic) & T
}

declare module "./CharacterSheetV2.js" {
    export default interface CharacterSheetV2 {
        document: ACActor
    }
}

declare module "./FeatureSheetV2.js" {
    export default interface FeatureSheetV2 {
        document: ACItem
    }
}