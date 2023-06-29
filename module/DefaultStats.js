import AC from "./AC.js";

//  An object containing default StatSchema for Characters and Kit Pieces.
export const defaultStats = {
    characterStats: [
        {
            name: 'stamina',
            value: '15',
            max: '15',
            img: AC.load('health-normal.png'),
            settings: {
                display: 'double',
                resource: 'A'
            }
        },
        {
            name: 'proficiency',
            value: '0',
            img: AC.load('polar-star.png')
        },
        {
            name: 'movement',
            img: AC.load('walking-boot.png'),
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
            img: AC.load('whirlpool-shuriken.png')
        },
        {
            name: 'range',
            img: AC.load('horizontal-flip.png')
        }
    ],

    talentStats: [
        {
            name: 'bonus',
            img: AC.load('heart-plus.png')
        }
    ],

    // passiveStats = [];

    abilityStats: [
        {
            name: 'cost',
            img: AC.load('plain-arrow.png')
        }
    ]
};