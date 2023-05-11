export class Stat {
    constructor({ name = "", value = null, max = null}) {
        this.name = name;
        this.value = value;
        this.max = max;
    }

    get percent() {
        let value = Number(this.value)
        let max = Number(this.max)
        if (!value || !max) {
            //console.error("Anime Campaign | Stats cannot be converted to percentage.");
            return NaN;
        }
        return value / max;
    }
}