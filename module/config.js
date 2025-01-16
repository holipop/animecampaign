/** 
 * An object containing language localization paths and default configurations.
 */
export const AC = {};

AC.ascii = `
      ██       ▄▄█▀▀▀█▄█  ▀██▀▀▀▀█ ▀██▀  ▀█▀ █▀▀██▀▀█ █▀▀██▀▀█
     ▄██▄    ▄██▀     ▀█   ██  ▄    ▀█▄  ▄▀     ██       ██
    ▄█▀██▄   ██▀       ▀   ██▀▀█     ██  █      ██       ██
   ▄█  ▀██   ██            ██         ███       ██       ██
   ████████  ██▄          ▄██▄         █       ▄██▄     ▄██▄
  █▀      ██ ▀██▄     ▄▀
▄███▄   ▄████▄ ▀▀█████▀   v1.1`

AC.inscribed = {
    epithet: "AC.CharacterSheet.InscribedTypes.Epithet"
}
AC.mundie = {
    expert: "AC.CharacterSheet.MundieTypes.Expert",
    powerhouse: "AC.CharacterSheet.MundieTypes.Powerhouse"
}

AC.colorKeys = ['red', 'blue', 'yellow', 'green', 'orange', 'cyan', 'purple', 'grey'];
AC.colorStat = {
    red: 'AC.Red',
    blue: 'AC.Blue',
    yellow: 'AC.Yellow',
    green: 'AC.Green',
    orange: 'AC.Orange',
    cyan: 'AC.Cyan',
    purple: 'AC.Purple',
    grey: 'AC.Grey',
}
AC.contrastColors = {
    white: "#f4f3ed", 
    black: "#1f1e1e",
}
AC.colors = {
    red: '#df2d48',
    blue: '#4d86d1',
    yellow: '#f1cd00',
    green: '#3ea35a',
    orange: '#ee8420',
    cyan: '#28d5c1',
    purple: '#9639cf',
    grey: '#807f84',
};
AC.defaultColor = "#cd3232";

AC.displays = {
    value: "AC.StatConfig.Display.Options.Value",
    resource: "AC.StatConfig.Display.Options.Resource",
    label: "AC.StatConfig.Display.Options.Label",
}
AC.textEditors = {
    prosemirror: "AC.ProseMirror",
    markdown: "AC.Markdown",
}

AC.defaultCategories = [
    {
        name: 'weapon',
        trackers: [
            { tag: 'damage', img: "icons/svg/sword.svg" },
            { tag: 'range' , img: "icons/svg/thrust.svg" },
        ],
    },
    {
        name: 'talent',
        trackers: [
            { tag: 'bonus', img: "icons/svg/heal.svg" },
        ],
    },
    {
        name: 'passive',
        trackers: [],
    },
    {
        name: 'ability',
        trackers: [
            { tag: 'cost', img: "icons/svg/degen.svg" },
        ],
    }
];

AC.textDialog = (name, placeholder) => `
    <form autocomplete="off">
        <div class="form-group">
            <label>${name}</label>
            <div class="form-fields">
                <input type="text" name="name" placeholder="${placeholder}" autofocus>
            </div>
        </div>
    </form>`;

AC.colorDialog = hexcode => `
    <form autocomplete="off">
        <div class="form-group">
            <label>Color</label>
            <div class="form-fields">
                <input type="color" name="color" value="${hexcode}">
            </div>
        </div>
    </form>`;
