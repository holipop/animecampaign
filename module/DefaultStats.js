//  An object containing default StatSchema for Characters and Kit Pieces.
export const defaultStats = {
    characterStats: [
        {
            name: 'stamina',
            value: '15',
            max: '15',
            img: 'health-normal.png',
            settings: {
                display: 'double'
            }
        },
        {
            name: 'proficiency',
            img: 'polar-star.png'
        },
        {
            name: 'movement',
            img: 'walking-boot.png',
            value: '5',
            max: 'Average',
            settings: {
                display: 'double'
            }
        }
    ],

    weaponStats: [
        {
            name: 'damage',
            img: 'whirlpool-shuriken.png'
        },
        {
            name: 'range',
            img: 'overhead.png'
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