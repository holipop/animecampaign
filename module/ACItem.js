import { RolledItem } from "./RolledItem.js";

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

        templateData.roll = await new Roll(this.system.formula).roll({ async: false });
        templateData.roll.color = RolledItem.critColor(templateData.roll);
        templateData.roll.totalInt = Math.round(templateData.roll.total);

        chatData.content = await renderTemplate(this.chatTemplates[this.type], templateData);

        return ChatMessage.create(chatData);
    }
}