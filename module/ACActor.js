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
                ladder: []
            },
            'system.stats.movement': {
                value: 0,
                build: "Average"
            }
        });

        ui.notifications.info(`Anime Campaign | Added default stats for ${this.parent.name}.`);
    }

    generateProficiencyLadder(x = 1, y = 100) {
        if (x < 1) {
            ui.notifications.error(`Anime Campaign | Initial value cannot be less than 1.`);
            return;
        }
        if (x > y) {
            ui.notifications.error(`Anime Campaign | Initial value cannot be greater than the max value`);
            return;
        }

        const bounds = _n => {
            let lowerBound = _n * (_n + 1) + 2;
            let upperBound = lowerBound + _n + 2;
            return [lowerBound, upperBound];
        }
        const delta = _n => Math.ceil( (_n - 79) / 25 ) + 1;
        const rand = (_l, _u) => Math.floor(Math.random() * (_u - _l + 1) + _l);
    
        let n = x;
        let output = [n];
    
        for (let i = 0; n < y; i++) {
            let l, u;
    
            if ( n < 45 ) {
                [l, u] = bounds(0)
            } else if ( (n >= 45) && (n < 80) ) {
                [l, u] = bounds(1)
            } else {
                [l, u] = bounds(delta(n));
            }
    
            if ( ((n + u) > 60) && (n < 60) ) {
                n = 60;
            }  else if ( ((n + u) > 100) && (n < 100) ) {
                n = 100;
            } else {
                n += rand(l, u);
            }
    
            output.push(n)
        }
        
        ui.notifications.info(`Anime Campaign | Generated proficiency ladder for ${this.parent.name}.`);
        this.parent.update({ 'system.stats.proficiency.ladder': output });
    }
}

Object.assign(CharacterData.prototype, ACEntityMixin);