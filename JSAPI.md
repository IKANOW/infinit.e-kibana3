#Kibana JS API
-

Built by Ikanow to expose some internal kibana functionality via a simple JavaScript API. Currently only tested using Kibana 3. Some simple tests for this application exist as a FlashBuilder application. The test application opens Kibana within an IFrame and tests the exposed functionality. For more information and source code [Check out the BitBucket git repository](https://bitbucket.org/mike_grill/com.ikanow.infinite.kibana.tests/src).

**Function Summary**

Dashboard Functions
* installToParent( void )
* refreshDashboard( void )
* exportConfig
* exportConfigJson
* importConfig
* importConfigJson

Query & Filter Functions
* addQuery( void )
* getQueryList( void )
* getQueryListJson( void )
* setQueryList( newList, skipReset, appendOnly )
* setQueryListJson( newListJson, skipReset, appendOnly )
* resetQueryList( void )
* getFilters( void )
* getFiltersJson( void )
* setFilters( filters, skipReset, appendOnly ) 
* setFiltersJson( filtersJson, skipReset, appendOnly )
* removeFilters( void )

**Sample Objects**

Query Item
```javascript
{
  "alias": "",
  "type": "lucene",
  "enable": true,
  "id": 0,
  "pin": false,
  "color": "#7EB26D",
  "query": "*"
}
```

Filter
```javascript
{
  "alias": "",
  "type": "querystring",
  "mandate": "either",
  "query": "*",
  "id": 0,
  "active": true
}
```

**Sample Usage**

This distribution of Kibana has an additional Angular service. This service is already included in `/serc/app/services/all.js` and will be available upon app startup. Using Angular's dependency injection, we simply need to reference the service and the API will be avilable at `window.kibanaJsApi`.
>```javascript
>require(['app'], function (app) {
>  //Inject the kibanaJsApi when angular is done loading the app
>  app.run(function(kibanaJsApiSrv) {});
>});
>```

If the API needs to be installed on a parent window use the installToParent method during app startup.
>```javascript
>require(['app'], function (app) {
>  //Inject the kibanaJsApi when angular is done loading the app
>  app.run(function(kibanaJsApiSrv) {
>    //Add the api to the window and the window's parent if it exists
>    kibanaJsApiSrv.installToParent();
>  });
>});
>```

#Function List#
-
###.installToParent()###

  _Add this instance of the API to the window's parent element to expose this API to an IFrame's parent._

* **Params: none**
* **Returns:**

  void

###.refreshDashboard()###

  _Used to forcefully refresh the Kibana Dashboard after changes._

* **Params: none**
* **Returns: boolean**

  True on success

###.addQuery()###

  _Add a new (empty) query item._

* **Params: none**
* **Returns: boolean**

  True on success


###.getQueryList()###

  _Get the current queryList as an array of Query objects._

* **Returns:**

  An array of Query Objects.

###.getQueryListJson()###

  _Get the current query list as a JSON String. Useful for passing complex objects through simple interfaces. Eg. Flash's ExternalInterface._
  
* **Returns:**

  JSON String representation of .getQueryList();  
  
###.setQueryList( queryList, skipReset, appendOnly )###

  _Update the QueryList by replacing all elements in the query. Or optionally appending the elements from QueryList._

* **Params**

  **queryList: Array\<QueryItem\>**
  
  **skipReset: Boolean**
  
  When true,the current query list will not be removed before add or updating items.
  
  **appendOnly: Boolean**
  
  When append is boolean TRUE, IDs on new items will be ignored and all items are trested as new.

* **Returns: Boolean**

  true on success
  
###.setQueryListJson( queryListJson, skipReset, appendOnly )###

  _Same as setQueryList but accepts a JSON String as the source data. Useful for passing complex objects through simple interfaces. Eg. Flash's ExternalInterface._
  
###.resetQueryList()###

  _Reset the current query to a single '*' query.
  
* **Params: none**

* **Returns: boolean**

  True on success
  
###.getFilters()###

  _Get the current filters as an array of Filter objects._

* **Returns:**

  An array of Filter Objects.

###.getFiltersJson()###

  _Get the current filters list as a JSON String. Useful for passing complex objects through simple interfaces. Eg. Flash's ExternalInterface._
  
* **Returns:**

  JSON String representation of .getFilters();  
  
###.setFilters( filters, skipReset, appendOnly )###

  _Update the filters by replacing all filters. Or optionally only updating and appending using the new filters provided._

* **Params**

  **filters: Array\<Filter\>**
  
  **skipReset: Boolean**
  
  When true,the current query list will not be removed before add or updating items.
  
  **appendOnly: Boolean**
  
  When append is boolean TRUE, IDs on new items will be ignored and all items are trested as new.

* **Returns: boolean**

  True on success
  
###.setFiltersJson( filtersJson, skipReset, appendOnly )###

  _Same as setFilters but accepts a JSON String as the source data. Useful for passing complex objects through simple interfaces. Eg. Flash's ExternalInterface._

###.removeFilters()###

  _Remove all filters and refresh the dashboard._
  
* **Returns: boolean**

  True on success
  

