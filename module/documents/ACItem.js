/**
 * Extending the Item class for system-specific logic.
 */
export default class ACItem extends Item { 

    /** @override */
    _preCreate (data, options, user) {
        super._preCreate(data, options, user);
        this.updateSource({ img: null })
    }

    /**
     * Returns a record of this character's color stats and main stats.
     * Color stats appear twice with their tag and their color being used as keys.
     * @returns {Record<string, Stat>}
     */
    getStatContext() {
        const data = this.system.stats
            .map(stat => [stat.tag, stat])
            .concat((this.isOwned) 
                ? Object
                    .entries(this.parent.getStatContext())
                    .map(([tag, stat]) => [`actor.${tag}`, stat])
                : []
            )

        return Object.fromEntries(data)
    }

    /** 
     * @override 
     * @inheritdoc 
     * @returns {Record<string, number>}
     */
    getRollData() {
        const data = Object
            .entries(this.getStatContext())
            .map(([tag, stat]) => [tag.replace(" ", "_"), stat.value])
            .filter(([_, value]) => value)

        return Object.fromEntries(data)
    }

    /**
     * Sends a chat message displaying this feature, rolling if a valid roll formula is provided. 
     * @param {boolean} options.post
     */
    async roll ({ post = false } = {}) {
        let formula = this.system.details.formula ?? ""
        if (!Roll.validate(formula)) {
            formula = "1"
            post = true
        }

        const rollData = this.getRollData()
        const [roll, max, min] = await Promise.all([
            new Roll(formula, rollData).evaluate(),
            new Roll(formula, rollData).evaluate({ maximize: true }),
            new Roll(formula, rollData).evaluate({ minimize: true }),
        ])

        let crit
        if (roll.isDeterministic) { }
        else if (roll.total == max.total) {
            crit = "ChatMessage__Total--CritSuccess"
        } else if (roll.total == min.total) {
            crit = "ChatMessage__Total--CritFailure"
        }

        const [tooltip, enrichedDescription] = await Promise.all([
            roll.getTooltip(),
            TextEditor.enrichHTML(this.system.description)
        ])
        const context = {
            formula,
            roll,
            post,
            crit,
            tooltip,
            enrichedDescription,

            feature: this,
            palette: this.system.palette,
        }
        const template = "systems/animecampaign/templates/roll/template.hbs"
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(template, context),
        }

        if (post) {
            ChatMessage.create(message);
        } else {
            roll.toMessage(message);
        }
    }

}
