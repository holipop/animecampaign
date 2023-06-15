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
        }

        chatData.content = await renderTemplate(this.chatTemplates[this.type], templateData);

        return ChatMessage.create(chatData);
    }
}