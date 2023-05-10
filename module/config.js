export const ACEntityMixin = {
    createStat(key, value = "") {
        const stats = Object.keys(this.parent.system.stats);
        if (stats.includes(key)) {
            ui.notifications.error(`Anime Campaign | ${this.parent.name} already has a "${key}" stat.`);
            return;
        }

        ui.notifications.info(`Anime Campaign | Created the "${key}" stat on ${this.parent.name}.`);
        this.parent.update({ [`system.stats.${key}`]: value });
    },

    deleteStat(key) {
        const stats = Object.keys(this.parent.system.stats);
        if (!stats.includes(key)) {
            ui.notifications.error(`Anime Campaign | ${this.parent.name} doesn't have a "${key}" stat.`);
            return;
        }

        ui.notifications.info(`Anime Campaign | Deleted the "${key}" stat on ${this.parent.name}.`);
        this.parent.update({ [`system.stats.-=${key}`]: null })
    },

    deleteAllStats() {
        const stats = Object.keys(this.parent.system.stats);

        if (stats.length == 0) {
            ui.notifications.error(`Anime Campaign | ${this.parent.name} doesn't have any stats.`);
            return;
        }

        ui.notifications.info(`Anime Campaign | Deleted all stats on ${this.parent.name}.`);
        stats.forEach(element => this.parent.update({ [`system.stats.-=${element}`]: null }));
    }
}

export const ACSheetMixin = {
    adjustFontSize(_div, _rem, _max) {
        const text = $(_div);

        text.css( 'fontSize', `${_rem}rem`);

        while (text.height() > _max) {
            _rem *= 0.85;
            text.css( 'fontSize', `${_rem}rem`);
            console.log('Anime Campaign | Resizing Text');
        } 
    },

    updateBackground(_html, _threshold) {
        const BACKGROUND = _html.find('.background');
        const BACKGROUND_INPUT = _html.find('.background-input');
        const NAME = _html.find('.name');
        const CLASS = _html.find('.class');
        const IMG = _html.find('.img');

        let color = BACKGROUND_INPUT[0].defaultValue

        let rgb = [color.slice(1, 3), color.slice(3, 5), color.slice(5)]
            .map(element => Number(`0x${element}`));
        rgb[0] *= 0.2126;
        rgb[1] *= 0.7152;
        rgb[2] *= 0.0722;

        let perceivedLightness = rgb.reduce((n, m) => n + m) / 255;

        if (perceivedLightness <= _threshold) {
            NAME.css( 'color', "#FFFFFF" );
            CLASS.css( 'color', "#FFFFFF" );
        } else {
            NAME.css( 'color', "#000000" );
            CLASS.css( 'color', "#000000" );
        }

        BACKGROUND.css( "background-color", BACKGROUND_INPUT[0].defaultValue );
        IMG.css( 'background-color', BACKGROUND_INPUT[0].defaultValue );
    },

    blankStatName() {
        // check how many stats in item are named "new stat"
        // return "new stat" or "new stat (x)" 
    }
}

export const animecampaign = {};

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
    ability: "animecampaign.kitTypes.ability"
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
    action: "animecampaign.statLabels.action"
}
animecampaign.navigationLabels = {
    kit: "animecampaign.navigationLabels.kit",
    upgrades: "animecampaign.navigationLabels.upgrades",
    biography: "animecampaign.navigationLabels.biography",
}

animecampaign.kitText = {
    kitbartitle: "animecampaign.kitText.kitbartitle",
    addkitpiece: "animecampaign.kitText.addkitpiece",
    newkitpiece: "animecampaign.kitText.newkitpiece",
    deletekitpiece: "animecampaign.kitText.deletekitpiece",
    editkitpiece: "animecampaign.kitText.editkitpiece"
}