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
▄███▄   ▄████▄ ▀▀█████▀   v2.0`

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
AC.defaultCategories = [
    { 
        name: "weapon",
        snap: true,
        trackers: [
            { tag: "damage", display: "value" },
            { tag: "range", display: "value" },
        ],
        details: {
            formula: "1d20",
            action: "Main",
            usage: { multiple: "1", timeframe: "Turn" }
        }
    },
    { 
        name: "talent",
        snap: true,
        trackers: [],
        details: {
            formula: "",
            action: "",
            usage: { multiple: "", timeframe: "" }
        }
    },
    { 
        name: "passive",
        snap: true,
        trackers: [],
        details: {
            formula: "",
            action: "",
            usage: { multiple: "", timeframe: "" }
        }
    },
    { 
        name: "ability", 
        snap: true,
        trackers: [
            { tag: "cost", display: "value" },
        ],
        details: {
            formula: "1d20",
            action: "Main",
            usage: { multiple: "1", timeframe: "Round" }
        }
    },
]