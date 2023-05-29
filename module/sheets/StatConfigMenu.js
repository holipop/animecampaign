export class StatConfigMenu extends Application {
    constructor(_options = {}, _stat = {}) {
        super(_options);
        this.stat = _stat;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 400,
            height: 300,
            template: 'systems/animecampaign/templates/sheets/stats-config.hbs',
            resizable: true
        });
    }

    get title() {
        return `Stat Configuration: ${this.stat.label}`;
    }

    async getData() {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.stat = this.stat;

        return data;
    }
}