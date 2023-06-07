export default class ACItem extends Item {
    chatTemplates = {
        'Kit Piece': 'systems/animecampaign/templates/kit-piece-roll.hbs'
    };

    async roll() {
        const chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        const templateData = {
            ...this,
            owner: this.actor._id
        }

        chatData.content = await renderTemplate(this.chatTemplates[this.type], templateData);

        return ChatMessage.create(chatData);
    }
}