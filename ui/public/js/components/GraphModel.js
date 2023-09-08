class GraphModel {

    #allowedDeviceAliases = [];
    #deviceAlias;
    #allowedFrequencies = ['FIVE_MINUTE'];
    #frequency = 'FIVE_MINUTE';
    #numDays = 5;

    #listeners = [];

    constructor() {}

    addListener(l) {
        this.#listeners.push(l);
    }
    removeListener(l) {
        const index = this.#listeners.indexOf(l);
        if (index >= 0) this.#listeners.splice(index, 1);
    }

    // Device alias
    setAllowedDeviceAliases(allowedAliases) {
        this.#allowedDeviceAliases = allowedAliases;
        this.#listeners.forEach(l => l.allowedDeviceAliasesChanged(allowedAliases))
    }
    getAllowedDeviceAliases() {
        return this.#allowedDeviceAliases;
    }
    setDeviceAlias(alias) {
        this.#deviceAlias = alias;
        this.#listeners.forEach(l => l.deviceChanged(alias));
    }
    getDeviceAlias() {
        return this.#deviceAlias;
    }

    // Frequency
    setAllowedFrequencies(allowedFrequencies) {
        this.#allowedFrequencies = allowedFrequencies;
        this.#listeners.forEach(l => l.allowedFrequenciesChanged(this.#allowedFrequencies));
    }
    getAllowedFrequenies() {
        return this.#allowedFrequencies;
    }
    setFrequency(frequency) {
        this.#frequency = frequency;
        this.#listeners.forEach(l => l.frequencyChanged(frequency));
    }
    getFrequency() {
        return this.#frequency;
    }

    // NumDays
    setNumDays(numDays) {
        if (!numDays || numDays <= 0) {
            console.error(`Invalid numDays chosen. Given '${numDays}'`);
            return;
        }
        this.#numDays = numDays;
        this.#listeners.forEach(l => l.numDaysChanged(numDays));
    }
    getNumDays() {
        return this.#numDays;
    }

}