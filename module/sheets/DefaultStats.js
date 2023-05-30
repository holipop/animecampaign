//  An object containing default StatSchema for Characters and Kit Pieces.
export const defaultStats = {
    characterStats: [
        {
            name: 'stamina',
            img: 'NB-healing.png',
            settings: {
                display: 'double'
            }
        },
        {
            name: 'proficiency',
            img: 'NB-proficiency.png'
        },
        {
            name: 'movement',
            img: 'NB-transport.png',
            settings: {
                display: 'double'
            }
        }
    ],

    weaponStats: [
        {
            name: 'damage'
        },
        {
            name: 'range'
        }
    ],

    talentStats: [
        {
            name: 'bonus'
        }
    ],

    // passiveStats = [];

    abilityStats: [
        {
            name: 'cost'
        }
    ]
};