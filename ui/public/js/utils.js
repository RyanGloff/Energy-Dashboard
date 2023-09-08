(function() {
    let counters = {}
    window.uniqueId = function(prefix) {
        let count;
        if (counters.hasOwnProperty(prefix)) {
            count = counters[prefix]++;
        } else {
            counters[prefix] = 0;
            count = 0;
        }
        return `${prefix}-${count}`;
    }
})();