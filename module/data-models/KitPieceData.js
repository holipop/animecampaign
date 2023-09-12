import AC from "../AC.js";
import { StatMixin } from "../mixins/StatMixin.js";
import { _Stat } from "./_Stat.js";
import { Section } from "./Section.js";

//  Defining the schema for Kit Pieces.
export class KitPieceData extends foundry.abstract.DataModel {

    //*     () : Object
    static defineSchema() {
        const fields = foundry.data.fields;

        const defaultSettings = {
            required: false, 
            nullable: true
        }

        return {
            color: new fields.StringField({ 
                ...defaultSettings, 
                initial: "#CCCCCC" 
            }),
            type: new fields.StringField({
                ...defaultSettings,
                initial: "ability",
            }),
            customType: new fields.StringField(defaultSettings),

            formula: new fields.StringField({
                ...defaultSettings,
                initial: "1d20"
            }),
            usage: new fields.StringField(),
            action: new fields.StringField({initial: "blank"}),

            sections: new fields.ArrayField( new fields.EmbeddedDataField( Section ) )
        }
    }

    //  Moves the given indexed Section object to a desired index.
    //*     (_index: number, _moveTo: number) : void
    moveSection(_index, _moveTo) {
        if (_moveTo == -1 || _moveTo == this.sections.length) return AC.log('Invalid section placement.');

        let sections = this.sections;
        let targetSection = sections[_index];
        sections.splice(_index, 1);

        let topSections = sections.splice(_moveTo);
        sections = [...sections, targetSection, ...topSections];

        this.parent.update({ 'system.sections': sections });
        AC.log(`Moved a section from index ${_index} to ${_moveTo} for ${this.parent.name}`);
    }

    //  Creates a series of Section objects in the sections array, optionally starting at a
    //  given index.
    //*     (_sections: Object[], _index?: number) : void
    createSections(_sections = [{}], _index = null) {
        let sections = this.sections;
        let createdSections = _sections.map(obj => new Section(obj, { parent: this }));

        if (_index == null) {
            sections = [...sections, ...createdSections];
        } else {
            sections.splice(_index, 0, ...createdSections);
        }

        this.parent.update({ 'system.sections': sections });
        AC.log(`Created ${createdSections.length} section(s) for ${this.parent.name}`);
    }

    updateSection(_index, _schema) {
        const sections = [...this.sections];
        if (_index == -1 || _index >= sections.length) return AC.error(`"Index ${_name}" is not a section.`);
        
        const targetSection = sections[_index].toObject();
        sections[_index] = Object.assign(targetSection, _schema);;

        console.log(sections)

        this.parent.update({ 'system.sections': sections });
        AC.log(`Updated the section at index "${_index}" for ${this.parent.name}`);
    }

    //  Deletes a Section object at the desired index.
    //*     (_index: number) : void
    deleteSectionIndex(_index) {
        let sections = this.sections;

        sections.splice(_index, 1);

        this.parent.update({ 'system.sections': sections });
        AC.log(`Deleted section at index ${_index} for ${this.parent.name}`);
    }
}

//  Composites mixins with this class
Object.assign(KitPieceData.prototype, StatMixin );