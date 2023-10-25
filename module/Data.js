/** A module containing all DataModels
 * @module Data 
 */


import * as List from "./helper/List.js"

const DataModel = foundry.abstract.DataModel;
const fields = foundry.data.fields;

/** 
 * Data structure for characters. 
 */
export class Character extends DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const colorStats = {};
        for (const element of CONFIG.animecampaign.colorKeys) {
            colorStats[element] = new fields.EmbeddedDataField(Stat, {
                initial: null,
                nullable: true
            });
        }

        return {
            stamina: new fields.EmbeddedDataField(Stat),
            proficiency: new fields.EmbeddedDataField(Stat),
            movement: new fields.EmbeddedDataField(Stat),

            stats: new fields.SchemaField(colorStats),

            categories: new fields.ArrayField(new fields.EmbeddedDataField(Category), {
                initial: CONFIG.animecampaign.defaultCategories
            }),

            biography: new fields.SchemaField({
                editor: new fields.StringField({ initial: 'markdown' }),
                text: new fields.HTMLField(),
            }),

            class: new fields.StringField(),
            word: new fields.StringField(),
            type: new fields.StringField(),
            color: new fields.StringField({
                required: true,
                initial: CONFIG.animecampaign.defaultColor
            }),
        };
    }

    /** Returns the class level as a roman numeral.
     * @returns {number} 
     */
    get classLevel () {
        const prof = this.proficiency.value;

        if (prof >= 100) return "III";
        else if (prof >= 60) return "II";
        else if (prof >= 0) return "I";
        return "";
    }
}


/** 
 * Data structure for Kit Features. 
 * */
export class Feature extends DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        return {
            color: new fields.StringField({
                required: true,
                initial: CONFIG.animecampaign.defaultColor
            }),
            category: new fields.StringField({ initial: 'weapon' }),

            stats: new fields.ArrayField(new fields.EmbeddedDataField(Stat)),
            
            sections: new fields.ArrayField(new fields.EmbeddedDataField(Section), {
                initial: [{ visible: true, text: '' }],
            }),

            details: new fields.SchemaField({
                editor: new fields.StringField({ initial: 'markdown' }),
                formula: new fields.StringField(),
                action: new fields.StringField(),
                usage: new fields.SchemaField({
                    multiple: new fields.NumberField(),
                    timeframe: new fields.StringField()
                }),
            })
        };
    }

    /** If this Feature is owned, returns the stats that are being tracked in its category.
     * @returns {Object[]}
     */
    get trackedStats () {
        if (!this.parent.isOwned) return null;
        const categories = this.parent.parent.system.categories;
        const trackers = List.get(categories, { name: this.category }).trackers;

        return trackers.map(tracker => {
            const fallback = {
                view: 'value',
                value: '',
                img: 'icons/svg/circle.svg',
            };
            return List.get(this.stats, { tag: tracker.tag }) ?? fallback;
        })
    }
}


/** Data structure for stats.
 * @abstract
 */ 
export class Stat extends DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        return {
            tag: new fields.StringField(),
            
            img: new fields.FilePathField({
                categories: ['IMAGE'],
                initial: 'icons/svg/circle.svg'
            }),
            color: new fields.StringField(),

            view: new fields.StringField({ initial: 'value' }),

            value: new fields.NumberField(),
            max: new fields.NumberField(),
            label: new fields.StringField(),
        }
    }
}

/** Data structure for categories.
 * @abstract
 */
export class Category extends DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        return {
            name: new fields.StringField(),
            color: new fields.StringField(),

            trackers: new fields.ArrayField(new fields.SchemaField({
                tag: new fields.StringField(),
                img: new fields.FilePathField({
                    categories: ['IMAGE'],
                    initial: 'icons/svg/circle.svg'
                })
            }))
        };
    }
}

/** Data structure for sections.
 * @abstract
 */
export class Section extends DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        return {
            name: new fields.StringField(),
            text: new fields.HTMLField(),
            visible: new fields.BooleanField({ initial: true }),
        }
    }
}
