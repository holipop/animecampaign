import * as AC from "../AC.js"

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
        const roll = new Roll('3d20[Fire Damage] + 10d10 + 20d4');

        const data = { 
            ...this,
            _id: this._id,
            
            match: this.system.color,
            contrast: (() => {
                const rgb = AC.hexToRGB(this.system.color);
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;
                return (luma <= .5) ? "white" : "black";
            })(),

            roll: await roll.evaluate(),
            tooltip: await roll.getTooltip(),

            stats: this.system.stats,
            sections: this.system.sections,
        }
        
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(this.rollTemplate, data),
        }

        roll.toMessage(message);

        //return ChatMessage.create(message);
    }

}
