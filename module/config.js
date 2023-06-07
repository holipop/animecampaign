//  A helper class for utility functions and brevity.
export class AC {

    //*     (string | number | boolean) : void
    static log(_string) {
        console.log(`%cAnime Campaign | ${_string}`, 'color: orange');
    }

    //*     (string | number | boolean) : void
    static error(_string) {
        console.error(`%cAnime Campaign | ${_string}`, 'color: orange');
    }

    //  Returns an object of custom Handlebars helpers.
    //*     () : Object
    static get hbsHelpers() {
        return {

            //  Logs the context of the Handlebars object.
            //*     () : void
            debug: function(_options) {
                console.log(_options);
                return;
            },

            //  Matches the color of this element with the entity's color.
            //*     (system: { color: string }, style?: string, attr?: string, alpha?: string) 
            //*     : SafeString
            match: function({ color }, _options) {
                let { style='color', attr='true', alpha='1' } = _options.hash;

                attr = attr == 'true';
                alpha = Number(alpha);

                if (!color) return;

                let [red, green, blue] = [color.slice(1, 3), color.slice(3, 5), color.slice(5)]
                    .map(element => Number(`0x${element}`));

                const injection = attr
                    ? `style="${style}: rgb(${red}, ${green}, ${blue}, ${alpha});"` 
                    : `${style}: rgb(${red}, ${green}, ${blue}, ${alpha});`;

                return new Handlebars.SafeString(injection);
            },

            //  Changes the color of this element to either black or white to contrast with 
            //  the entity's color.
            //*     (system: { color: string }, img?: string, style?: string, attr?: string, 
            //*     threshold?: string, alpha?: string) : SafeString
            contrast: function({ color }, _options) {
                let { style='color', img='false', attr='true', threshold='.5', alpha='1' } = _options.hash;

                img = img == 'true';
                attr = attr == 'true';
                threshold = Number(threshold);
                alpha = Number(alpha);

                if (!color) return;
                
                let rgb = [color.slice(1, 3), color.slice(3, 5), color.slice(5)]
                    .map(element => Number(`0x${element}`));
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;
                
                if (img) {
                    const invert = luma <= threshold
                        ? 'invert(100%)'
                        : '';
                    const injection = attr
                        ? `style="filter: brightness(0) saturate(100%) ${invert};"`
                        : `brightness(0) saturate(100%) ${invert};`;
                    return new Handlebars.SafeString(injection);
                }

                const contrast = luma <= threshold 
                    ? `rgb(255, 255, 255, ${alpha})` 
                    : `rgb(0, 0, 0, ${alpha})`;

                const injection = attr 
                    ? `style="${style}: ${contrast};"` 
                    : `${style}: ${contrast};` ;

                return new Handlebars.SafeString(injection);
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