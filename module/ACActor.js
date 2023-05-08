import { ACEntityMixin } from "./config.js";

export class CharacterData extends foundry.abstract.DataModel {

    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            description: new fields.HTMLField(),
            class: new fields.StringField({
                initial: "Class"
            }),
            word: new fields.StringField(),
            type: new fields.StringField(),
            color: new fields.StringField({
                required: true,
                initial: "#CCCCCC"
            }),
            stats: new fields.ObjectField()
        }
    }

    get profClass() {
        const proficiency = this.parent.system.stats.proficiency.value;

        if (proficiency < 60) {
            return "I";
        } else if ((60 <= proficiency) && (proficiency < 100)) {
            return "II";
        } else {
            return "III";
        }
    }

    get isInscribed() {
        let inscribedValues = Object
            .values(CONFIG.animecampaign.type.inscribed)
            .map(element => game.i18n.localize(element).toLowerCase());
        const type = this.parent.system.type;

        return inscribedValues.includes(type);
    }

    addDefaultStats() {
        this.parent.update({ 
            'system.stats.stamina': {
                value: 0,
                max: 0
            },
            'system.stats.proficiency': {
                value: 0,
                advancement: []
            },
            'system.stats.movement': {
                value: 0,
                build: "Average"
            }
        });

        ui.notifications.info(`Anime Campaign | Added default stats for ${this.parent.name}.`);
    }

    generateProficiencyAdvancement(start = 1, end = 100) {
        if (start < 1) {
            ui.notifications.error(`Anime Campaign | Initial value cannot be less than 1.`);
            return;
        }
        if (start > end) {
            ui.notifications.error(`Anime Campaign | Initial value cannot be greater than the max value`);
            return;
        }

        const bounds = _n => {
            let _lower = _n * (_n + 1) + 2;
            let _upper = _lower + _n + 2;
            return [_lower, _upper];
        }
        const delta = _prof => Math.ceil( (_prof - 79) / 25 ) + 1;
        const rand = (_lower, _upper) => Math.floor(Math.random() * (_upper - _lower + 1) + _lower);
    
        let prof = start;
        let output = [
            [prof, {}]
        ];
    
        for (let i = 0; prof < end; i++) {
            let lowerBound, upperBound;
    
            if ( prof < 45 ) {
                [lowerBound, upperBound] = bounds(0)
            } else if ( (prof >= 45) && (prof < 80) ) {
                [lowerBound, upperBound] = bounds(1)
            } else {
                [lowerBound, upperBound] = bounds(delta(prof));
            }
    
            if ( ((prof + upperBound) > 60) && (prof < 60) ) {
                prof = 60;
            }  else if ( ((prof + upperBound) > 100) && (prof < 100) ) {
                prof = 100;
            } else if ((prof + upperBound) > end) {
                prof = end;
            } else {
                prof += rand(lowerBound, upperBound);
            }
    
            output.push([prof, {}]);
        }
        
        ui.notifications.info(`Anime Campaign | Generated proficiency advancement for ${this.parent.name}.`);
        this.parent.update({ 'system.stats.proficiency.advancement': output });
    }

    getUpgrade(_proficiency) {
        const PROFICIENCY_INDEX = 0;
        const advancement = this.parent.system.stats.proficiency.advancement;

        return advancement.find(element => element[PROFICIENCY_INDEX] == _proficiency);
    }

    changeUpgradeValue(_proficiency, _newValue) {
        const PROFICIENCY_INDEX = 0;
        const advancement = this.parent.system.stats.proficiency.advancement;

        let upgradeIndex = advancement.findIndex(element => {
            return element[PROFICIENCY_INDEX] == _proficiency;
        });

        advancement[upgradeIndex][PROFICIENCY_INDEX] = _newValue;
        this.parent.update({ 'system.stats.proficiency.advancement': advancement });
    }
}

Object.assign(CharacterData.prototype, ACEntityMixin);