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
        const aliasStr = this.#model.getDeviceAlias().replace(/\s+/g, '+');
        const numDays = this.#model.getNumDays();
        const frequency = this.#model.getFrequency();
        const connectionStr = `/emeter?numDays=${numDays}&alias=${aliasStr}&frequency=${frequency}`;
        console.log(`Fetch: ${connectionStr}`);
        fetch(connectionStr)
            .then(res => {
                res.json()
                    .then(raw => raw.data.map(v => {
                        return {
                            currentMA: v.current_ma,
                            voltageMV: v.voltage_mv,
                            powerMW: v.power_mw,
                            totalWH: v.total_wh,
                            timestamp: (new Date(v.timestamp)).getTime()
                        }   
                    }))
                    .then(data => {
                        return [
                            {
                                label: 'currentMA',
                                borderColor: 'rgb(201, 203, 207)',
                                backgroundColor: 'rgb(201, 203, 207)',
                                data: data.map(v => {
                                    return {
                                        x: v.timestamp,
                                        y: v.currentMA
                                    };
                                })
                            },
                            {
                                label: 'voltageMV',
                                borderColor: 'rgb(54, 162, 235)',
                                backgroundColor: 'rgb(54, 162, 235)',
                                data: data.map(v => {
                                    return {
                                        x: v.timestamp,
                                        y: v.voltageMV
                                    };
                                })
                            },
                            {
                                label: 'powerMW',
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgb(75, 192, 192)',
                                data: data.map(v => {
                                    return {
                                        x: v.timestamp,
                                        y: v.powerMW
                                    };
                                })
                            },
                            {
                                label: 'totalWH',
                                borderColor: 'rgb(153, 102, 255)',
                                backgroundColor: 'rgb(153, 102, 255)',
                                data: data.map(v => {
                                    return {
                                        x: v.timestamp,
                                        y: v.totalWH
                                    };
                                })
                            }
                        ]
                    })
                    .then(datasets => {
                        this.#chart = new Chart(this.#canvasId, {
                            type: 'scatter',
                            data: {
                                datasets
                            },
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
            });
    }

}

customElements.define('app-graph', Graph);