/**
 * Extending the Item class for system-specific logic.
 */
export default class ACItem extends Item { 

    /** The file path to the roll template.
     * @returns {String}
     */
    get rollTemplate () { return 'systems/animecampaign/templates/roll/roll-template.hbs' }

    /** Sends a chat message of this feature.
     */
    async roll () {
        const data = { ...this }
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(this.rollTemplate, data),
        }

        return ChatMessage.create(message);
    }

}
