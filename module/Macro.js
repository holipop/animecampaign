/** 
 * Creates a feature macro on drop.
 * @param {*} data
 * @param {number} slot
 */
export async function createMacro (hotbar, data, slot) {
    if (data.type !== 'feature') return
    if (!('object' in data)) {
        ui.notifications.warn(game.i18n.format('AC.Macro.NotOwnedItemWarning'))
        return 
    }
    const item = data.object

    // Macro creation.
    const command = `AC.Macro.roll('${item._id}')`
    let macro = game.macros.find(m => (m.name === item.name) && (m.command == command))
    if (!macro) {
        const data = {
            name: item.name,
            type: 'script',
            command,
        }
        if (item.img) {
            data.img = item.img
        }

        macro = await Macro.create(data)
    }

    game.user.assignHotbarMacro(macro, slot)
}

/** 
 * Rolls a feature via the hotbar.
 * @param {string} id 
 * @param {*} options
 */
export function roll (id, options = {}) {
    const speaker = ChatMessage.getSpeaker()
    let actor
    if (speaker.token) actor = game.actors.tokens[speaker.token]
    actor ??= game.actors.get(speaker.actor)

    if (!actor) {
        ui.notifications.warn(game.i18n.format("AC.Macro.ControlledActorWarning"))
        return
    }

    const item = actor.getEmbeddedDocument('Item', id)
    if (!item) {
        ui.notifications.warn(game.i18n.format("AC.Macro.MissingItemWarning"), { id })
        return
    }
 
    item.roll(options)
}
