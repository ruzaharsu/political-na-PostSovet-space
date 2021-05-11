(function() {
    'use strict';
    /*                               Vue data                                 */
    const data = {
        phones    : '',
        russian   : true,
        info      : null,

        sort_by : null,
        sort_dir: 'asc',

        progress: false
    };


    /*                       Vue computed properties                          */
    const computed = {
        sorted: function() {
            if (!this.info) {
                return null;
            };

            if (this.sort_by === null) {
                return this.info;
            }

            const sort_by = this.sort_by.split('.');

            const sorted = [...this.info];
            return sorted.sort((a, b) => {
                let modifier = 1;
                if (this.sort_dir === 'desc') {
                    modifier = -1;
                }

                let compare_by_a = '\uffff';
                let compare_by_b = '\uffff';

                try {
                    compare_by_a = sort_by.length === 1 ? a[sort_by[0]] : a[sort_by[0]][sort_by[1]];
                    if (typeof compare_by_a === 'undefined') compare_by_a = '\ufffe';
                } catch(err) {}

                try {
                    compare_by_b = sort_by.length === 1 ? b[sort_by[0]] : b[sort_by[0]][sort_by[1]];
                    if (typeof compare_by_b === 'undefined') compare_by_b = '\ufffe';
                } catch(err) {}

                if (compare_by_a > compare_by_b) {
                    return modifier;
                } else if (compare_by_a < compare_by_b) {
                    return -1 * modifier;
                } else {
                    return 0;
                }
            });
        }
    };


    /*                         Vue watched properties                         */
    const watch = {
        russian: function(val) {
            localStorage.setItem('russian_numbers_group', val);
        }
    };


    /*                              Vue methods                               */
    const methods = {
        getinfo: function(event) {
            if (this.progress) { return; }

            // disable form
            this.progress = true;

            fetch(
                `/api/group_def/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify({
                        phones : this.phones,
                        russian: this.russian
                    })
                }
            )
                .then(res => res.json())
                .then(json => {
                    this.info = json;
                })
                .catch(err => console.log('parsing failed', err))

                // enable form
                .then(() => this.progress = false);
        },

        sort: function(sort_by) {
            // already sorted by this field
            if (sort_by === this.sort_by) {

                // already sorted ascending order
                if (this.sort_dir === 'asc') {
                    this.sort_dir = 'desc';

                // already sorted descendant order
                } else if (this.sort_dir === 'desc') {
                    this.sort_dir = 'asc';
                    this.sort_by = null;
                }

            // sort by the field first time
            } else {
                this.sort_dir = 'asc';
                this.sort_by = sort_by;
            }
        }
    };


    /*                              Vue events                                */
    const mounted = function() {
        // get user choice for later use
        if (localStorage.getItem('russian_numbers_group') !== null) {
            this.russian = localStorage.getItem('russian_numbers_group') === 'true' ? true : false;
        }
    }


    /*                    Create and run Vue application                      */
    const app = new Vue({
        el      : '#app',
        data    : data,
        computed: computed,
        watch   : watch,
        methods : methods,
        mounted : mounted
    });
})();
