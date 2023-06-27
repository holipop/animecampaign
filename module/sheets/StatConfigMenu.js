import AC from "../AC.js";

//  Defining the application for Stat configuration.
export class StatConfigMenu extends FormApplication {
    
    //  Sets the default options of this application.
    //*     () : ApplicationOptions
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 300,
            height: 174,
            template: 'systems/animecampaign/templates/stats-config.hbs',
        });
    }

    //  Sets the title of this application.
    //*     () : string
    get title() {
        return `Stat Configuration: ${this.object.label}`;
    }

    //  Defining the data object to use within the Handlebars template.
    //*     () : object
    async getData() {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.stat = this.object;
        data.AC = AC;
        data.resourceOptions = [ 'None', ...AC.resourceKeys];

        return data;
    }

    //  Passing submitted data into the Stat object to be updated.
    //*     (_event: jQuery, _formData: object) : void
    _updateObject(_event, _formData) {
        const entity = this.object.parent.parent;

        entity.system.updateStat(this.object.label, expandObject(_formData));
    }
}