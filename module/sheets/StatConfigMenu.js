export class StatConfigMenu extends FormApplication {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 300,
            height: 145,
            template: 'systems/animecampaign/templates/sheets/stats-config.hbs',
        });
    }

    get title() {
        return `Stat Configuration: ${this.object.label}`;
    }

    async getData() {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.stat = this.object;

        return data;
    }

    _updateObject(_event, _formData) {
        const entity = this.object.parent.parent;

        console.log(_formData);

        entity.system.updateStat(this.object.label, _formData);
    }
}