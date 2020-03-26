'use strict';

var Arrow = require('apache-arrow');
var DatasaurBase = require('datasaur-base');

/** @typedef {object} columnSchemaObject
 * @property {string} name - The required column name.
 * @property {string} [header] - An override for derived header
 * @property {function} [calculator] - A function for a computed column. Undefined for normal data columns.
 * @property {string} [type] - Used for sorting when and only when comparator not given.
 * @property {object} [comparator] - For sorting, both of following required:
 * @property {function} comparator.asc - ascending comparator
 * @property {function} comparator.desc - descending comparator
 */


/**
 * @param {object} [options]
 * @param {object[]} [options.data]
 * @param {object[]} [options.schema]
 * @constructor
 */
var ArrowDataModel = DatasaurBase.extend('ArrowDataModel',  {

    initialize: function(datasaur, options, data) {
        // this.reset();
        this.data = data
        let schemaFields = this.data.schema.fields.map( (field) => field.name )
        this.schema = schemaFields
        // this.schema = []
        // this.schema = this.getSchema()
    },

    reset: function() {
        /**
         * @summary The array of column schema objects.
         * @name schema
         * @type {columnSchemaObject[]}
         * @memberOf DatasaurLocal#
         */
        this.schema = [];

        /**
         * @summary The array of uniform data objects.
         * @name data
         * @type {object[]}
         * @memberOf DatasaurLocal#
         */
        this.data = [];
    },

    /**
     * Establish new data and schema.
     * If no data provided, data will be set to 0 rows.
     * If no schema provided AND no previously set schema, new schema will be derived from data.
     * @param {object[]} [data=[]] - Array of uniform objects containing the grid data.
     * @param {columnSchemaObject[]} [schema=[]]
     * @memberOf DatasaurLocal#
     */
    setData: function(data, schema) {
        /**
         * @summary The array of uniform data objects.
         * @name data
         * @type {object[]}
         * @memberOf DatasaurLocal#
         */
        this.data = data || [];
        let schemaFields = this.data.schema.fields.map( (field) => field.name )
        this.setSchema(schemaFields)

        // if (schema) {
        //     this.setSchema(schema);
        // } else if (this.data.length && !this.schema.length) {
        //     this.setSchema([]);
        // }

        this.dispatchEvent('fin-hypergrid-data-loaded');
    },

    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#getSchema}
     * @memberOf DatasaurLocal#
     */
    getSchema:  function(){
        return this.schema
    },
    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#setSchema}
     * @memberOf DatasaurLocal#
     */
    setSchema: function(newSchema){
        if (!newSchema.length) {
            var dataRow = this.getFirstRow();
            if (dataRow) {
                newSchema = Object.keys(dataRow);
            }
        }

        this.schema = newSchema;
        this.dispatchEvent('fin-hypergrid-schema-loaded');
    },

    /**
     * @summary Find first extant AND defined element.
     * @desc Uses for...in to find extant rows plus a truthiness test to return only a defined row.
     * @returns {dataRow|undefined} Returns undefined if there are no such rows.
     */
    getFirstRow: function() {
        for (var i in this.data) {
            if (this.data[i]) {
                return this.data[i];
            }
        }
    },

    /**
     * @param y
     * @returns {dataRowObject}
     * @memberOf DatasaurLocal#
     */
    getRow: function(y) {
        return this.data.get(y);
    },

    /**
     * Update or blank row in place.
     *
     * _Note parameter order is the reverse of `addRow`._
     * @param {number} y
     * @param {object} [dataRow] - if omitted or otherwise falsy, row renders as blank
     * @memberOf DatasaurLocal#
     */
    setRow: function(y, dataRow) {
        this.data[y] = dataRow || undefined;
    },

    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#getRowMetadata}
     * @memberOf DatasaurLocal#
     */
    getRowMetadata: function(y, prototype) {
        var dataRow = this.data[y];
        return dataRow && (dataRow.__META || (prototype !== undefined && (dataRow.__META = Object.create(prototype))));
    },

    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#setRowMetadata}
     * @memberOf DatasaurLocal#
     */
    setRowMetadata: function(y, metadata) {
        var dataRow = this.data[y];
        if (dataRow) {
            if (metadata) {
                dataRow.__META = metadata;
            } else {
                delete dataRow.__META;
            }
        }
        return !!dataRow;
    },

    /**
     * Insert or append a new row.
     *
     * _Note parameter order is the reverse of `setRow`._
     * @param {object} dataRow
     * @param {number} [y=Infinity] - The index of the new row. If `y` >= row count, row is appended to end; otherwise row is inserted at `y` and row indexes of all remaining rows are incremented.
     * @memberOf DatasaurLocal#
     */
    addRow: function(y, dataRow) {
        if (arguments.length === 1) {
            dataRow = arguments[0];
            y = undefined;
        }
        if (y === undefined || y >= this.getRowCount()) {
            this.data.push(dataRow);
        } else {
            this.data.splice(y, 0, dataRow);
        }
        this.dispatchEvent('fin-hypergrid-data-shape-changed');
    },

    /**
     * Rows are removed entirely and no longer render.
     * Indexes of all remaining rows are decreased by `rowCount`.
     * @param {number} y
     * @param {number} [rowCount=1]
     * @returns {dataRowObject[]}
     * @memberOf DatasaurLocal#
     */
    delRow: function(y, rowCount) {
        var rows = this.data.splice(y, rowCount === undefined ? 1 : rowCount);
        if (rows.length) {
            this.dispatchEvent('fin-hypergrid-data-shape-changed');
        }
        return rows;
    },

    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#getValue}
     * @memberOf DatasaurLocal#
     */
    getValue(x, y) {
        if (this.data) { 
            return this.data.getColumnAt(x).get(y)
        }
        else {
            return null
        }
    },

    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#setValue}
     * @memberOf DatasaurLocal#
     */
    setValue: function(x, y, value) {
        this.data[y][this.schema[x].name] = value;
    },

    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#getRowCount}
     * @memberOf DatasaurLocal#
     */
    getRowCount: function() {
        return this.data? this.data.count() : 0
    },

    /**
     * @see {@link https://fin-hypergrid.github.io/3.0.0/doc/dataModelAPI#getColumnCount}
     * @memberOf DatasaurLocal#
     */
    getColumnCount: function() {
        return this.schema.length;
    }
});

module.exports = ArrowDataModel;