import { ACEntityMixin } from "./EntityMixin.js";
import { Stat } from "./ACStat.js";

//
//  Defining the schema for Characters.
//
export class CharacterData extends foundry.abstract.DataModel {

    //  The object being returned is everything a Character will have on creation.
    //? Foundry uses the DataField object to allow for strongly-typed data and strictness.
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
            stats: new fields.ArrayField( new fields.EmbeddedDataField( Stat ) )
        }
    }

    //  Returns 'true' if the Character's type is a valid inscribed value, 'false' otherwise.
    get isInscribed() {
        let inscribedValues = Object
            .values(CONFIG.animecampaign.type.inscribed)
            .map(element => game.i18n.localize(element).toLowerCase());
        const type = this.type;

        return inscribedValues.includes(type);
    }
    
    // !!!
    // !!! EVERYTHING BELOW IS DEPRECIATED
    // !!!
    __addDefaultStats() {
        let defaultStats = [
            {
                name: "stamina",
                value: 0,
                max: 0
            },
            {
                name: "proficiency",
                value: 0,
            },
            {
                name: "movement",
                value: 5
            }
        ]

        this.createStats(defaultStats);
    }
    
    //  Returns the proficiency class of a character in roman numerals for the Actor Sheet.
    get __profClass() {
        const proficiency = this.stats.proficiency.value;

        if (proficiency < 60) {
            return "I";
        } else if ((60 <= proficiency) && (proficiency < 100)) {
            return "II";
        } else {
            return "III";
        }
    }

    //  Adds the main three stats to a Character's 'stats' object.
    //  TODO for allowing new Stat objects.
    //? If the Character already has these stats, they are reset to the ones assigned here.
    __addDefaultStats() {
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
                value: "0",
                build: "Average"
            }
        });

        ui.notifications.info(`Anime Campaign | Added default stats for ${this.parent.name}.`);
    }

    //  Generates an array of arrays, the 0th index of each array being the proficiency value
    //  and the rest containing the Kit Piece objects.
    //* Note that proficiency values 60 and 100 are hard-coded
    //? This generation method is based off of how GansleyBot generates proficiency advancements,
    //? however it is not entirely true in order to scale infinitely.
    //      _start  (?integer)  : The first proficiency value in the advancement
    //      _end    (?integer)  : The last proficiency value in the advancement
    __generateAdvancement(_start = 1, _end = 100) {
        if (_start < 1) {
            ui.notifications.error(`Anime Campaign | Initial value cannot be less than 1.`);
            return;
        }
        if (_start > _end) {
            ui.notifications.error(`Anime Campaign | Initial value cannot be greater than the max value`);
            return;
        }

        //  Returns the lower and upper bounds for the randomInt() function.
        //      _n  (integer) : The term of the sequence
        const bounds = _n => {
            let _lower = _n * (_n + 1) + 2;
            let _upper = _lower + _n + 2;
            return [_lower, _upper];
        }
        const randomInt = (_lower, _upper) => Math.floor(Math.random() * (_upper - _lower + 1) + _lower);

        //? I'm not entirely sure how to explain this. Its purpose is to be inputed 
        //? into the bounds function so this can scale infinitely.
        const delta = _prof => Math.ceil( (_prof - 79) / 25 ) + 1;
    
        let currentProficiency = _start;
        let advancementOutput = [{
            value: currentProficiency,
            upgrades: {}
        }];
    
        for (let i = 0; currentProficiency < _end; i++) {
            let lowerBound, upperBound;
    
            if ( currentProficiency < 45 ) {
                [lowerBound, upperBound] = bounds(0)
            } else if ( (currentProficiency >= 45) && (currentProficiency < 80) ) {
                [lowerBound, upperBound] = bounds(1)
            } else {
                [lowerBound, upperBound] = bounds(delta(currentProficiency));
            }
    
            if ( ((currentProficiency + upperBound) > 60) && (currentProficiency < 60) ) {
                currentProficiency = 60;
            }  else if ( ((currentProficiency + upperBound) > 100) && (currentProficiency < 100) ) {
                currentProficiency = 100;
            } else if ((currentProficiency + upperBound) > _end) {
                currentProficiency = _end;
            } else {
                currentProficiency += randomInt(lowerBound, upperBound);
            }
    
            advancementOutput.push({ value: currentProficiency, upgrades: {} });
        }
        
        ui.notifications.info(`Anime Campaign | Generated proficiency advancement for ${this.parent.name}.`);
        this.parent.update({ 'system.stats.proficiency.advancement': advancementOutput });
    }

    //  Returns the object of a proficiency upgrade.
    //      _proficiency    (integer)   : The proficiency value of the upgrade
    __getUpgrade(_proficiency) {
        const PROFICIENCY_INDEX = 0;
        const advancement = this.parent.system.stats.proficiency.advancement;

        return advancement.find(element => element[PROFICIENCY_INDEX].value == _proficiency);
    }

    //  Deletes an upgrade on the proficiency advancement.
    //      _proficiency    (integer)   : The proficiency value of the upgrade
    __deleteUpgrade(_proficiency) {
        const advancement = this.parent.system.stats.proficiency.advancement;

        let upgradeIndex = advancement.findIndex(element => {
            return element.value == _proficiency;
        });
        
        advancement.splice(upgradeIndex, upgradeIndex);
        this.parent.update({ 'system.stats.proficiency.advancement': advancement });
    }

    //  Adds a blank entry onto the proficiency advancement.
    __addUpgrade() {
        const advancement = this.parent.system.stats.proficiency.advancement;
        advancement.push({ value: '', upgrades: {} });
        this.parent.update({ 'system.stats.proficiency.advancement': advancement });
    }

    //  Changes the proficiency value of an upgrade.
    //      _proficiency    (integer)   : The proficiency value of the upgrade
    //      _newValue       (integer)   : Self-explanatory
    __changeUpgradeValue(_proficiency, _newValue) {
        const advancement = this.parent.system.stats.proficiency.advancement;

        let upgradeIndex = advancement.findIndex(element => {
            return element.value == _proficiency;
        });

        advancement[upgradeIndex].value = _newValue;
        this.parent.update({ 'system.stats.proficiency.advancement': advancement });
    }
}

//  Composites mixins with this class
Object.assign(CharacterData.prototype, ACEntityMixin);