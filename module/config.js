//  A helper class for utility functions and brevity.
export class AC {

    //*     (string) : void
    static log(_string) {
        console.log(`%cAnime Campaign | ${_string}`, 'color: orange');
    }

    //*     (string) : void
    static error(_string) {
        console.error(`%cAnime Campaign | ${_string}`, 'color: orange');
    }

    //  Returns an object of custom Handlebars helpers.
    //*     () : Object
    static get hbsHelpers() {
        return {

            //  Matches the color of this element with the entity's color.
            //*     (_obj: DataModel, bg: boolean) : string
            match: function(_obj, bg = false) {
                const color = Object.hasOwn(_obj, 'color') ? _obj.color : '#cccccc';
                return `style="${bg ? 'background-' : ''}color: ${color}"`;
            },

            //  Changes the color of this element to constrast with the entity's color brightness.
            //*     (_obj: DataModel) : string
            contrast: function(_obj, _threshold) {
                const color = Object.hasOwn(_obj, 'color') ? _obj.color : '#cccccc';
                let rgb = [color.slice(1, 3), color.slice(3, 5), color.slice(5)]
                    .map(element => Number(`0x${element}`));
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;

                if (luma <= .5) {
                    return `style="color: white"`;
                } else {
                    return `style="color: black"`;
                }
            }
        }
    }
}

//  A config object, currently for containing all our localization paths.
export const animecampaign = {};

animecampaign.title = "animecampaign.title"

animecampaign.test = "animecampaign.test"
animecampaign.build = {
    svelte: "animecampaign.build.svelte",
    average: "animecampaign.build.average",
    heavyset: "animecampaign.build.heavyset",
}
animecampaign.type = {
    inscribed: {
        epithet: "animecampaign.type.inscribed.epithet"
    },
    mundie: {
        expert: "animecampaign.type.mundie.expert",
        powerhouse: "animecampaign.type.mundie.powerhouse"
    }
}
animecampaign.kitTypes = {
    weapon: "animecampaign.kitTypes.weapon",
    talent: "animecampaign.kitTypes.talent",
    passive: "animecampaign.kitTypes.passive",
    ability: "animecampaign.kitTypes.ability",
    custom: "animecampaign.kitTypes.custom"
}
animecampaign.kitTypesPlural = {
    weapons: "animecampaign.kitTypesPlural.weapons",
    talents: "animecampaign.kitTypesPlural.talents",
    passives: "animecampaign.kitTypesPlural.passives",
    abilities: "animecampaign.kitTypesPlural.abilities"
}
animecampaign.powerset = {
    inscribed: "animecampaign.powerset.inscribed",
    mundie: "animecampaign.powerset.mundie"
}
animecampaign.statLabels = {
    stamina: "animecampaign.statLabels.stamina",
    proficiency: "animecampaign.statLabels.proficiency",
    movement: "animecampaign.statLabels.movement",
    damage: "animecampaign.statLabels.damage",
    range: "animecampaign.statLabels.range",
    cost: "animecampaign.statLabels.cost",
    bonus: "animecampaign.statLabels.bonus",
}
animecampaign.statButtons = {
    addDefault: "animecampaign.statButtons.addDefault",
    addLeft: "animecampaign.statButtons.addLeft",
    addRight: "animecampaign.statButtons.addRight",
    createBlank: "animecampaign.statButtons.createBlank",
    configure: "animecampaign.statButtons.configure",
    delete: "animecampaign.statButtons.delete"
}
animecampaign.navigationLabels = {
    kit: "animecampaign.navigationLabels.kit",
    upgrades: "animecampaign.navigationLabels.upgrades",
    biography: "animecampaign.navigationLabels.biography",
}
animecampaign.kitText = {
    addKitPiece: "animecampaign.kitText.addKitPiece",
    newKitPiece: "animecampaign.kitText.newKitPiece",
    deleteKitPiece: "animecampaign.kitText.deleteKitPiece",
    editKitPiece: "animecampaign.kitText.editKitPiece"
}
animecampaign.statDisplay = {
    single: "animecampaign.statDisplay.single",
    double: "animecampaign.statDisplay.double",
    phase: "animecampaign.statDisplay.phase",
    state: "animecampaign.statDisplay.state",
    advancement: "animecampaign.statDisplay.advancement"
}
animecampaign.statConfigLabels = {
    image: "animecampaign.statConfigLabels.image",
    display: "animecampaign.statConfigLabels.display"
}