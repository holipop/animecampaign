import { ACSheetMixin } from "../config.js";

export default class ACItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"]
        });
    }

    get template() {
        if (this.item.type == 'Kit Piece') {
            return `systems/animecampaign/templates/sheets/kit-piece-sheet.hbs`;
        }
    }

    async getData() {
        const data = super.getData()

        data.config = CONFIG.animecampaign;
        data.system = data.item.system; 

        return data;
    }

    activateListeners(html) {
        // Adjust Name Font Size
        const NAME = html.find('.name');
        const nameResize = new ResizeObserver(e => {
            this.adjustFontSize(NAME, 2.5, 60)
        })
        nameResize.observe(NAME[0]);
        nameResize.observe(html[0]);

        html.ready(() => this.adjustFontSize(NAME, 2.5, 60));

        // Update Name
        NAME.on('blur', e => this.item.update({ 'name': NAME.text() }));
        NAME[0].addEventListener('paste', e => e.preventDefault())

        // Add Stat
        const CREATE_STAT = html.find('.stat-create');
        CREATE_STAT.on('click', e => {
            let d = new Dialog({
                title: `Create Stat: ${this.item.name}`,
                content: `<p>Enter stat name:</p><input type="text" placeholder="Stat name"><hr>`,
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: e => {
                            this.item.system.createStat(e.find('input').val())
                            //if stat name is already taken, throw error
                        }
                    }
                },
                default: "confirm",
                render: html => {},
                close: html => {}
            });
            d.render(true);
        })

        this.updateBackground(html, 0.5);
        super.activateListeners(html)
    }
}

Object.assign(ACItemSheet.prototype, ACSheetMixin);