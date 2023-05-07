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