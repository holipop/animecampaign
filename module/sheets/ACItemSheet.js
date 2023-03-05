export default class ACItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 100,
      height: 100,
      classes: ["animecampaign", "sheet", "item"]
    });
  }

  get template() {
    return `systems/animecampaign/templates/sheets/${this.item.type}-Sheet.hbs`
  }

  async getData() {
    const context = super.getData();
    context.description = await TextEditor.enrichHTML(this.item.system.description, {async: true});
    context.config = CONFIG.animecampaign;
    context.system = context.item.system;
    return context;
  }
}