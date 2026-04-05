import SheetMixinV2 from "./SheetMixinV2.js"
import CharacterSheetV2 from "./CharacterSheetV2.js"
import ACActor from "../documents/ACActor.js"
import ACItem from "../documents/ACItem.js"

declare global {
    interface ApplicationTab {
        id: string
        group: string
        icon: string
        label: string
        active: boolean
        css: "active" | ""
        permission: 1 | 2 | 3
    }

    interface Query {
        type: "input"|"select"
        options?: Record<string, string>
        defaultValue?: string
    }
}

declare module "./ACDialogV2.js" {
    export default interface ACDialogV2 {
        options: foundry.applications.api.DialogV2.Configuration
    }
}

declare module "./SheetMixinV2.js" {
    // TypeScript is really weird about documenting mixins.
    type ConstructorOf<T> = new (...args: any[]) => T

    type ACSheetInstance = {
        private dragDrop: DragDrop[]
        get dragDrop(): DragDrop[]
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
    }

    export default function SheetMixin<T extends ConstructorOf<foundry.applications.api.ApplicationV2>>(Base: T):
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