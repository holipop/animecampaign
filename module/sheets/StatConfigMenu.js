//  Defining the application for Stat configuration.
export class StatConfigMenu extends FormApplication {
    
    //*     () : ApplicationOptions
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 300,
            height: 145,
            template: 'systems/animecampaign/templates/sheets/stats-config.hbs',
        });
    }

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

        return data;
    }

    //  Passing submitted data into the Stat object to be updated.
    //*     (_event: jQuery, _formData: object) : void
    _updateObject(_event, _formData) {
        const entity = this.object.parent.parent;

        console.log(_formData);

        entity.system.updateStat(this.object.label, _formData);
    }
}