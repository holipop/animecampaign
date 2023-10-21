// Extending the Item class for system-specific logic.
export default class ACItem extends Item { 

    get messageTemplate () { return 'systems/animecampaign/templates/rolled-feature.hbs' }

    async roll () {
        const data = {
            ...this
        }
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(this.messageTemplate, data),
        }

        return ChatMessage.create(message);
    }

}