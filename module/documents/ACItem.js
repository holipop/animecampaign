// Extending the Item class for system-specific logic.
export default class ACItem extends Item { 

    get rollTemplate () { return 'systems/animecampaign/templates/roll/roll-template.hbs' }

    async roll () {
        const data = {
            ...this
        }
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(this.rollTemplate, data),
        }

        return ChatMessage.create(message);
    }

}