import AC from "../AC.js";
import { StatMixin } from "../mixins/StatMixin.js";
import { Stat } from "./Stat.js";
import { Section } from "./Section.js";

//  Defining the schema for Kit Pieces.
export class KitPieceData extends foundry.abstract.DataModel {

    //*     () : KitPieceSchema
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
                initial: "weapon",
            }),
            customType: new fields.StringField(defaultSettings),
            formula: new fields.StringField({
                ...defaultSettings,
                initial: "1d20"
            }),
            stats: new fields.ArrayField( new fields.EmbeddedDataField( Stat ) ),
            sections: new fields.ArrayField( new fields.EmbeddedDataField( Section ) )
        }
    }

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

    createSections(_sections = [{}], _index = null) {
        let sections = this.sections;
        let createdSections = _sections.map(obj => new Stat(obj, { parent: this }));

        if (_index == null) {
            sections = [...sections, ...createdSections];
        } else {
            sections.splice(_index, 0, ...createdSections);
        }

        this.parent.update({ 'system.sections': sections });
        AC.log(`Created ${createdSections.length} section(s) for ${this.parent.name}`);
    }

    deleteSectionIndex(_index) {
        let sections = this.sections;

        sections.splice(_index, 1);

        this.parent.update({ 'system.sections': sections });
        AC.log(`Deleted section at index ${_index} for ${this.parent.name}`);
    }
}

//  Composites mixins with this class
Object.assign(KitPieceData.prototype, StatMixin );