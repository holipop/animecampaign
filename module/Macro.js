/** A namespace for macros.
 * @module Macro
 */

/** Creates a feature macro on drop.
 * @param {*} data
 * @param {Number} slot
 */
export async function createMacro (data, slot) {
    if (data.type !== 'Feature') return;
    if (!('obj' in data)) {
        return ui.notification.warn('You can only create macro buttons for owned Items');
    }
    const item = data.obj;

    // Macro creation.
    const command = `game.animecampaign.macros.roll('${data.id}')`;
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

export function roll (id) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    actor ??= game.actors.get(speaker.actor)

    if (!actor) {
        ui.notifications.warn('You must control an Actor to roll from the hotbar.');
        return
    }

    const item = actor.getEmbeddedDocument('Item', id);
    if (!item) {
        ui.notifications.warn(`Your controlled Actor doesn't have an item with id [${id}].`);
    }

    item.roll();
}
