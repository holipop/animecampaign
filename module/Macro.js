/** A namespace for macros.
 * @module Macro
 */

/** Creates a feature macro on drop.
 * @param {*} data
 * @param {Number} slot
 */
export async function createMacro (_, data, slot) {
    if (data.type !== 'Feature') return;
    if (!('obj' in data)) {
        return ui.notification.warn('You can only create macro buttons for owned Items');
    }
    const item = data.obj;

    // Macro creation.
    const command = `AC.Macro.roll('${data.id}')`;
    let macro = game.macros.find(m => (m.name === item.name) && (m.command == command));
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: 'script',
            img: item.img,
            command,
        });
    }

    game.user.assignHotbarMacro(macro, slot);
    return false;
}

/** Rolls a feature via the hotbar.
 * @param {String} id 
 */
export function roll (id) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    actor ??= game.actors.get(speaker.actor)

    if (!actor) {
        ui.notifications.warn(game.i18n.localize("AC.NOTIFY.Macro.ControlActorWarning"));
        return
    }

    console.log(id)

    const item = actor.getEmbeddedDocument('Item', id);
    if (!item) {
        ui.notifications.warn(game.i18n.format("AC.NOTIFY.Macro.MissingItemWarning", { id }));
        return;
    }

    item.roll();
}
