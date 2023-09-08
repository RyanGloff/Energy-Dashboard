class BackendClient {

    constructor() {}

    /**
     * Pull data required for creating chart
     * Data includes:
     *  - Emeter data
     *  - Alarms on Emeter data
     * @param {String} alias
     * @param {Number} numDays
     * @param {Number} frequency
     */
    async getDeviceChartData(alias, numDays, frequency) {
        const aliasStr = alias.replace(/\s+/g, '+');
        const connectionStr = `/emeter?numDays=${numDays}&alias=${aliasStr}&frequency=${frequency}`;
        const emeterDataPromise = fetch(connectionStr)
            .then(res => res.json())
            .then(this.#convertRawEmeter)
            .then(this.#convertToGraphData);
        
        const alarmPromise = fetch(`/alarms?deviceAlias=${alias}`)
            .then(res => res.json());

        return await Promise.all([emeterDataPromise, alarmPromise])
            .then(promises => {
                const datasets = promises[0];
                const alarms = promises[1];
                alarms.forEach(alarm => {
                    const minX = datasets[0].data[0].x;
                    const maxX = datasets[0].data[datasets[0].data.length - 1].x;
                    if (alarm.low_value !== null) {
                        datasets.push({
                            label: `Alarm-${alarm.name}-LOW`,
                            borderColor: '#0F0',
                            backgroundColor: '#0F0',
                            borderDash: [10, 5],
                            data: [
                                { x: minX, y: alarm.low_value },
                                { x: maxX, y: alarm.low_value }
                            ]
                        });
                    }
                    if (alarm.high_value !== null) {
                        datasets.push({
                            label: `Alarm-${alarm.name}-HIGH`,
                            borderColor: '#F00',
                            backgroundColor: '#F00',
                            borderDash: [10, 5],
                            data: [
                                { x: minX, y: alarm.high_value },
                                { x: maxX, y: alarm.high_value }
                            ]
                        })
                    }
                });
                return datasets;
            });
    }

    #convertRawEmeter(raw) {
        return raw.data.map(v => {
            return {
                currentMA: v.current_ma,
                voltageMV: v.voltage_mv,
                powerMW: v.power_mw,
                totalWH: v.total_wh,
                timestamp: (new Date(v.timestamp)).getTime()
            }
        });
    }

    #convertToGraphData(emeter) {
        return [
            // {
            //     label: 'currentMA',
            //     borderColor: 'rgb(201, 203, 207)',
            //     backgroundColor: 'rgb(201, 203, 207)',
            //     data: emeter.map(v => {
            //         return {
            //             x: v.timestamp,
            //             y: v.currentMA
            //         };
            //     })
            // },
            // {
            //     label: 'voltageMV',
            //     borderColor: 'rgb(54, 162, 235)',
            //     backgroundColor: 'rgb(54, 162, 235)',
            //     data: emeter.map(v => {
            //         return {
            //             x: v.timestamp,
            //             y: v.voltageMV
            //         };
            //     })
            // },
            {
                label: 'powerMW',
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgb(75, 192, 192)',
                data: emeter.map(v => {
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
                data: emeter.map(v => {
                    return {
                        x: v.timestamp,
                        y: v.totalWH
                    };
                })
            }
        ];
    }

}

const backendClient = new BackendClient();