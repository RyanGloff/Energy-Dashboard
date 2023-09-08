class Graph extends HTMLElement {

    #deviceSelector;
    #numDaysInput;
    #numDaysSubmit;
    #frequencySelector;
    #canvasId;
    #chart;
    #newChartLoading = false;

    #model = new GraphModel();

    constructor() {
        super();

        this.#canvasId = window.uniqueId('canvas');
    }

    connectedCallback() {
        this.innerHTML =
        `
        <div class="app-graph">
            <div class="graph-controller">
                <label>Device:</label>
                <select name="device" id="device-selector"></select>
                <label>NumDays:</label>
                <input id="num-days-input" type="number"/>
                <button id="num-days-submit">Submit</button>
                <select name="frequency" id="frequency-selector"></select>
            </div>
            <canvas id="${this.#canvasId}" style="width:100%"></canvas>
        </div>
        `;
        this.#model.addListener({
            allowedDeviceAliasesChanged: allowedDeviceAliases => {
                const optionsListHTML = allowedDeviceAliases.map(d => `<option value="${d.alias}">${d.alias}</option>`).join();
                this.#deviceSelector.innerHTML = optionsListHTML;
                this.#deviceSelector.value = this.#model.getDeviceAlias();
            },
            deviceChanged: alias => {
                this.setAttribute('device-alias', alias);
                this.#reload();
            },
            numDaysChanged: numDays => {
                this.setAttribute('numDays', numDays);
                this.#numDaysInput.value = numDays;
                this.#reload();
            },
            allowedFrequenciesChanged: allowedFrequencies => {
                const optionsListHTML = allowedFrequencies.map(f => `<option value="${f}">${f}</option>`).join();
                this.#frequencySelector.innerHTML = optionsListHTML;
                this.#frequencySelector.value = this.#model.getFrequency();
            },
            frequencyChanged: frequency => {
                this.setAttribute('frequency', frequency);
                this.#reload();
            }
        });

        this.#deviceSelector = document.getElementById('device-selector');
        this.#deviceSelector.addEventListener('change', e => this.#model.setDeviceAlias(e.target.value));
        this.#numDaysInput = document.getElementById('num-days-input');
        this.#numDaysSubmit = document.getElementById('num-days-submit');
        this.#numDaysSubmit.addEventListener('click', e => this.#model.setNumDays(this.#numDaysInput.value));
        this.#frequencySelector = document.getElementById('frequency-selector');
        this.#frequencySelector.addEventListener('change', e => this.#model.setFrequency(e.target.value));

        // Pull defaults
        fetch('/devices')
            .then(res => res.json())
            .then(response => this.#model.setAllowedDeviceAliases(response));

        fetch('/emeter/frequencies')
            .then(res => res.json())
            .then(response => this.#model.setAllowedFrequencies(response.options));

            
        // Check attribute and populate if value found
        if (this.getAttribute('device-alias'))
            this.#model.setDeviceAlias(this.getAttribute('device-alias'));
        if (this.getAttribute('num-days'))
            this.#model.setNumDays(this.getAttribute('num-days'));
        else
            this.#model.setNumDays(this.#model.getNumDays());   // Use the default in GraphModel. Just triggering reload to UI
        if (this.getAttribute('frequency'))
            this.#model.setFrequency(this.getAttribute('frequency'));
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'device-alias') {
            this.#model.setDeviceAlias(newVal);
        }
    }

    #reload = () => {
        if (this.#chart)
            this.#chart.destroy();
        this.#loadChart();
    }

    #loadChart = async () => {
        if (this.#newChartLoading) {
            console.log('Chart already loading');
            setTimeout(() => this.#reload(), 500);
            return;
        }
        this.#newChartLoading = true;

        backendClient.getDeviceChartData(this.#model.getDeviceAlias(), this.#model.getNumDays(), this.#model.getFrequency())
            .then(datasets => {
                this.#chart = new Chart(this.#canvasId, {
                    type: 'scatter',
                    data: { datasets },
                    options: {
                        showLine: true,
                        scales: {
                            x: {
                                type: 'time',
                                ticks: {
                                    autoSkip: true,
                                    maxTicksLimit: 20
                                },
                                time: {
                                    unit: 'minute',
                                    displayFormats: {
                                        minute: 'yy/MM/dd HH:mm'
                                    },
                                    tooltipFormat: 'yy/MM/dd HH:mm'
                                },
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            }
                        }
                    }
                });
                this.#newChartLoading = false;
            });
    }

}

customElements.define('app-graph', Graph);