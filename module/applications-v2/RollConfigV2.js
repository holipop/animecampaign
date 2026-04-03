import ACActor from "../documents/ACActor.js"
import ACItem from "../documents/ACItem.js"
import * as Description from "../Description.js"

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 * The configuration window for Stats.
 */
export default class RollConfigV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    
    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "dialog", "config"],
        tag: "form",
        position: {
            width: 400,
            height: "auto",
        },
        window: {
            minimizable: false,
        },
        form: {
            handler: RollConfigV2.onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    }

    /** @inheritdoc */
    static PARTS = {
        hbs: { template: "systems/animecampaign/templates/dialog/roll-config.hbs" }
    }

    /** @inheritdoc */
    async _prepareContext () {
        console.log(this)

        return {
            app: this,
            config: CONFIG.AC,
            document: this.options.document,
            rollmodes: CONFIG.Dice.rollModes,
            formula: this.options.document.system.details.formula
        }
    }

    /** 
     * Form submission handler.
     * @param {SubmitEvent} event 
     * @param {HTMLFormElement} form 
     * @param {*} data 
     * @this {CategoryConfigV2}
     */
    static async onSubmit (event, form, formData) {
        const data = formData.object

        let formula = data.formula + data.modifier ?? ""
        if (!Roll.validate(formula)) {
            formula = "1"
        }

        const feature = this.options.document
        const rollData = feature.getRollData()
        const [roll, max, min] = await Promise.all([
            new Roll(formula, rollData),
            new Roll(formula, rollData).evaluate({ maximize: true }),
            new Roll(formula, rollData).evaluate({ minimize: true }),
        ])
        
        const rollType = event.submitter.dataset.type 
        const firstDie = roll.terms[0]
        switch (rollType) {
            case "disadvantage":
                firstDie.alter(1, 1)
                firstDie.modifiers.push("kl")
                break
            case "advantage":
                firstDie.alter(1, 1)
                firstDie.modifiers.push("kh")
                break
        }

        await roll.evaluate()
        console.log(roll)

        let crit
        if (roll.isDeterministic) { }
        else if (roll.total == max.total) {
            crit = "ChatMessage__Total--CritSuccess"
        } else if (roll.total == min.total) {
            crit = "ChatMessage__Total--CritFailure"
        }

        const [tooltip, enrichedDescription] = await Promise.all([
            roll.getTooltip(),
            Description.enrichChatMessage(feature.system.description, feature)
        ])
        const template = "systems/animecampaign/templates/roll/template.hbs"
        const context = {
            roll,
            result: roll.result,
            //post,
            crit,
            tooltip,
            enrichedDescription,

            feature: feature,
            palette: feature.system.palette,
        }
        const message = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(template, context),
        }

        if (false) {
            ChatMessage.create(message, { rollMode: data.rollmode });
        } else {
            roll.toMessage(message, { rollMode: data.rollmode })
            
        }
    }

}