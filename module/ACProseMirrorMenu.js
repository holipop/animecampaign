const { ProseMirrorMenu } = foundry.prosemirror

/**
 * An extension of the ProseMirrorMenu plugin for system-specific buttons
 */
export default class ACProseMirrorMenu extends ProseMirrorMenu {

    /**
     * @override
     */
    _getMenuItems() {
        const scopes = ProseMirrorMenu._MENU_ITEM_SCOPES
        const items = super._getMenuItems()

        items.unshift({
            action: "toggle-visibility",
            title: "AC.ToggleVisibility",
            icon: '<i class="fa-solid fa-eye-slash"></i>',
            scope: "text",
            cmd: (state, dispatch) => {
                const { $from } = state.selection
                const node = $from.parent
                if (node.type.name != "heading") return false

                // I'm assuming without using the -1, this position points to the TextNode and not the heading Node itself
                const nodePos = $from.pos - $from.parentOffset - 1
                dispatch(state.tr.setNodeAttribute(nodePos, "hidden", !node.attrs.hidden))
                return true
            }
        })

        return items
    }
    
}