/**
 * This service also exposes an interface to a parent container, given this application
 * is within an IFrame. The file JSAPI.md in the root of this project has more information
 * on how to use this API.
 *
 * @typedef {{}} QueryItem; //See JSAPI.md for more information
 * @typedef {Object} Filter;    //See JSAPI.md for more information
 * @typedef {Config} Config;    //Not yet implemented.
 *
 */
define([
    'angular',
    'lodash'
  ], function (angular, _) {

    'use strict';

    var module = angular.module('kibana.services');
    module.service('kibanaJsApiSrv', function ($rootScope, dashboard, querySrv, filterSrv) {

      // Save a reference to this
      var self = this;

      /**
       * Attach event listeners to some internal kibana events so we can expose them.
       */
      self.init = function () {
        //console.log("[kibanaJsApi] init");

        window.kibanaJsApi = this;

        //Monitor Kibana events so we can expose them
        $rootScope.$on('refresh', function () {
          //console.log("[kibanaJsApi] Refresh observed");
          //TODO expose refresh event
        });
      };

      /**
       * Add the kibanaJsApi instance to this window's parent container.
       * @returns {Boolean} True on success.
       */
      self.installToParent = function(){
        //Install the KibanaJsApi to Kibana's container's document if it exists
        if (window.parent !== window) {
          //console.log("[kibanaJsApi->installToParent] Install API to IFrame Parent");
          window.parent.kibanaJsApi = this;
        }
        return true;
      };

      /**
       * Refresh the current dashboard
       * @returns {Boolean} True on success.
       */
      self.refreshDashboard = function () {
        //console.log("[KibanaJsApi->refreshDashboard] Refreshing dashboard");
        dashboard.refresh();
        $rootScope.$apply();
        return true;
      };

      /**
       * Add a new query item to the queryList
       * @param {QueryItem} queryItem Query item definition
       * @returns {Boolean} True on success.
       */
      self.addQuery = function( queryItem ) {
        //console.log("[KibanaJsApi->addQuery] New Item: ", queryItem);

        //If nothing was passed add an empty query item
        if( !queryItem ) {
          queryItem = {};
        }

        //Add an empty item
        querySrv.set(queryItem);

        //refresh and apply
        this.refreshDashboard();

        return true;
      };

      /**
       * Get the dashboards current queryList
       * @returns {Array<QueryItem>} An array of query items
       */
      self.getQueryList = function(){
        //console.log("[KibanaJsApi->getQueryList]");
        return querySrv.getQueryObjs();
      };

      /**
       * Get the dashboards current queryList as a JSON String
       * @returns {String} A JSON String representing the current array of query items
       */
      self.getQueryListJson = function () {
        //console.log("[KibanaJsApi->getQueryListJson]");
        var queryListJson = angular.toJson( this.getQueryList(), false);
        //console.log("[KibanaJsApi->getQueryListJson] Query: ", queryListJson);
        return queryListJson;
      };

      /**
       * Replace the current query list with a new one
       * @param {Array<QueryItem>} newList An array of query items
       * @param {Boolean} skipReset Don't reset the Query List to '*'
       * @param {Boolean} appendOnly Only add elements, don't update using IDs
       * @returns {Boolean} True on success.
       */
      self.setQueryList = function( newList, skipReset, appendOnly ){

        //console.log("[KibanaJsApi->setQueryList] Setting query", newList);

        //If skip reset wasn't set or isn't true, then we reset.
        if( skipReset !== true ) {
          //console.log("[KibanaJsApi->setQueryList]    Clearing query before setting items");
          //Empty the query but don't $apply yet
          this.resetQueryList(true /*No Refresh*/);
        }

        _.each( newList, function(q){

          if( appendOnly === true && q.hasOwnProperty('id') ) {
            delete q.id; //unset ID - Forces new item
          }

          if( q.hasOwnProperty('id') && q.id === 0 ) {
            querySrv.set( q, 0 );
          } else {
            querySrv.set( q );
          }
        });

        //refresh and apply
        this.refreshDashboard();

        return true;
      };

      /**
       * Replace the current query list with a new one using a json string
       * @param {String} queryListJson A JSON String representing an array of query items.
       * @param {Boolean} skipReset Don't reset the Query List to '*'
       * @param {Boolean} appendOnly Only add elements, don't update using IDs
       * @returns {Boolean} True on success.
       */
      self.setQueryListJson = function (queryListJson, skipReset, appendOnly) {
        //console.log("[KibanaJsApi->setQueryListJson] setting query list from json text");
        var queryList = angular.fromJson(queryListJson);
        return this.setQueryList(queryList, skipReset, appendOnly );
      };

      /**
       * Replace the current query list with a single '*'
       * @param {Boolean} noRefresh When boolean true, the dashboard will not be refreshed
       * @returns {Boolean} True on success.
       */
      self.resetQueryList = function( noRefresh ){
        //console.log("[KibanaJsApi->resetQueryList] Resetting query to single '*'");

        _.each(querySrv.ids(), function(qId){
          querySrv.remove(qId);
        });

        //Reset the first item to '*'
        querySrv.set({
          "query":"*",
          "alias":"",
          "color":"#7EB26D",
          "pin":false,
          "type":"lucene",
          "enable":true
        });

        //refresh and apply
        if( noRefresh !== true ) {
          this.refreshDashboard();
        }

        return true;
      };

      /**
       * Get the dashboards current filters as an array of Filters
       * @returns Array<Filter>
       */
      self.getFilters = function() {
        //console.log("[KibanaJsApi->getFilters]");
        return filterSrv.list();
      };

      /**
       * Get the dashboards current filters as a JSON string representing array of filters
       * @returns {String} JSON String representation of an array of Filters.
       */
      self.getFiltersJson = function () {
        //console.log("[KibanaJsApi->getFiltersJson]");
        var filtersJson = angular.toJson(this.getFilters(), false);
        //console.log("[KibanaJsApi->getFiltersJson] Filters: ", filtersJson);
        return filtersJson;
      };

      /**
       * Replace the dashboards current filters with a new set. UpdateOnly will not
       * remove any items before setting the new ones in place.
       * @param {Array<Filter>} filters An array of filters
       * @param {Boolean} skipReset Don't clear all filters before adding / setting new items.
       * @param {Boolean} appendOnly Only add elements, don't update using IDs
       * @returns {Boolean} True on success.
       */
      self.setFilters = function( filters, skipReset, appendOnly ){
        //console.log("[KibanaJsApi->setFilters] setting filters", filters);

        if (skipReset !== true) {
          this.removeFilters( true ); //true for no refresh
        }

        _.each(filters, function (filter) {

          if( appendOnly === true || !filter.hasOwnProperty('id') ) {

            //Remove IDs for less confusion
            if( filter.hasOwnProperty('id') ){
              delete filter.id;
            }

            //console.log("[KibanaJsApi->setFilters]   appending filter", filter);
            filterSrv.set(filter, undefined, true); // true for no refresh

          } else {

            //Even if the filter has an ID, if that ID does not exist we must add it. Updating will fail.
            var filterExists = false;
            _.each( self.getFilters(), function(f){
              if(f.id === filter.id) {
                filterExists = true;
              }
            });

            if( filterExists ) {
              //console.log("[KibanaJsApi->setFilters]   updating filter", filter);
              filterSrv.set(filter, filter.id, true); // true for no refresh
            } else {
              //console.log("[KibanaJsApi->setFilters]   adding filter", filter);
              filterSrv.set(filter, undefined, true); // true for no refresh
            }
          }

        });

        //refresh and apply
        this.refreshDashboard();

        return true;
      };

      /**
       * See setFilters above. Accepts a JSON String representing an array of filters.
       * @param {String} filtersJson JSON String representing an array of Filters.
       * @param {Boolean} skipReset Don't clear all filters before adding / setting new items.
       * @param {Boolean} appendOnly Only add elements, don't update using IDs
       * @returns {Boolean} True on success.
       */
      self.setFiltersJson = function (filtersJson, skipReset, appendOnly) {
        //console.log("[KibanaJsApi->setFiltersJson] setting filters", filtersJson);
        var filters = angular.fromJson(filtersJson);
        return this.setFilters(filters, skipReset, appendOnly);
      };

      /**
       * Remove all the filters from the dashboard
       * @returns {Boolean} True on success.
       */
      self.removeFilters = function ( noRefresh ) {
        //console.log("[KibanaJsApi->removeFilters]");
        _.each( filterSrv.ids(), function(fId){
          filterSrv.remove(fId, true); //true for noRefresh
        });
        if( noRefresh !== true ){
          this.refreshDashboard();
        }
        return true;
      };

      /**
       * Get an object representing the current state of the dashboard.
       * This object can be used for the import functionality.
       *
       * This has not been tested
       *
       * @returns {{queryList: Array.<QueryItem>, filters: Array.<Filter>}}
       */
      self.exportConfig = function(){
        return {
          queryList: this.getQueryList(),
          filters: this.getFilters()
        };
      };

      /**
       * Get a JSON String representing the current config. See exportConfig above.
       *
       * This has not been tested
       *
       * @returns {String} JSON String of current dashboard config
       */
      self.exportConfigJson = function(){
        return angular.toJson(this.exportConfig(), true);
      };

      /**
       * Import a previously exported dashboard state.
       *
       * This has not been tested.
       *
       * @param {Config} config
       * @returns {Boolean} True on success.
       */
      self.importConfig = function( config ){
        this.setFilters( config.filters );
        this.setQueryList( config.queryList );
        this.refreshDashboard();
        return true;
      };

      /**
       * Import a previously exported dashboard state from a JSON String.
       *
       * This has not been tested
       *
       * @param {String} configJson JSON String representing a Config object.
       * @returns {Boolean} True on success.
       */
      self.importConfigJson = function( configJson ){
        return this.importConfig( angular.fromJson(configJson) );
      };

      // Now init
      self.init();

    });
  }
);