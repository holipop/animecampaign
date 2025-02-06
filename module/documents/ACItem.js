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
     * Sends a chat message displaying this feature, rolling if a valid roll formula is provided. 
     * @param {boolean} options.post
     */
    async roll ({ post = false } = {}) {
        let formula = this.system.details.formula ?? ""
        if (!Roll.validate(formula)) {
            formula = "1"
            post = true
        }

        let rollData = this.system.stats
            .filter(stat => stat.view != "label")
            .map(stat => [stat.tag.replace(" ", "_"), stat.value])

        if (this.isOwned) {
            const actorRollData = this.parent.system.colorStats
                .filter(stat => stat.view != "label")
                .map(stat => [[`actor.${stat.tag.replace(" ", "_")}`, stat.value], [`actor.stat.${stat.color}`, stat.value]])
                .flat()
                .concat([
                    ["actor.stamina", this.parent.system.stamina.value],
                    ["actor.proficiency", this.parent.system.proficiency.value],
                    ["actor.movement", this.parent.system.movement.value],
                ])

            rollData = rollData.concat(actorRollData)
        }
        rollData = Object.fromEntries(rollData)

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
