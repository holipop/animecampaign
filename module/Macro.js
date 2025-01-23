/** 
 * Creates a feature macro on drop.
 * @param {*} data
 * @param {number} slot
 */
export async function createMacro (_, data, slot) {
    if (data.type !== 'Feature') return
    if (!('obj' in data)) {
        ui.notifications.warn('You can only create macro buttons for owned Items')
        return 
    }
    const item = data.obj

    // Macro creation.
    const command = `AC.Macro.roll('${data.id}')`
    let macro = game.macros.find(m => (m.name === item.name) && (m.command == command))
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: 'script',
            img: item.img,
            command,
        })
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
        ui.notifications.warn(game.i18n.localize("AC.NOTIFY.Macro.ControlActorWarning"))
        return
    }

    const item = actor.getEmbeddedDocument('Item', id)
    if (!item) {
        ui.notifications.warn(game.i18n.format("AC.NOTIFY.Macro.MissingItemWarning", { id }))
        return
    }

    item.roll(options)
}
