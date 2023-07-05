//  Defining the schema for Section objects.
export class Section extends foundry.abstract.DataModel {

    //*     () : Object
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            label: new fields.StringField(),
            value: new fields.StringField(),
            hidden: new fields.BooleanField({initial: false}),
            stat: new fields.StringField(),
            text: new fields.HTMLField()
        }
    }

    get markdown() {
        const convert = new showdown.Converter();
        const markdown = this.text;

        console.log({this: this, convert});

        return convert.makeHtml(markdown);
    }
}