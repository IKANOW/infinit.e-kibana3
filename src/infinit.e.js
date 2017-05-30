/*******************************************************************************
 * Copyright 2012 The Infinit.e Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

// INITIALIZATION

var infiniteJsConnector = infiniteJsConnector || {

	_flashMovie: null,			// Container FLEX Application
	_jsConnectorParent: null,
	_mode: 'stashed',			// 'stashed' or 'live'

	/**
	 * Initialization consists of defining flashMove in order to communicate
	 * with the actionscript
	 */
	init: function () {
		if (null == this._flashMovie) {
			if (document.getElementById) {
				this._flashMovie = parent.document.getElementById("Index");
			}
		}
	},

	getFlashMovie: function(){
		return this._flashMovie;
	},

	/**
	 * Grabs the infinit.e.parent js connector object;
	 */
	getJsConnectorParent: function(){
		this._jsConnectorParent = parent.infiniteJsConnectorParent;
		return parent.infiniteJsConnectorParent;
	},

	/**
 	 *	possible values:
	 *	- live 			... append: &mode=live
	 *	- stashed 		... append: &mode=stashed
	 *   ignore for now   - all records 	... append: &mode=all_records
	 **/
	getMode: function(){
		return this._mode;
	},

	/** sets mode **/
	setMode:function(modeString){
		this._mode = modeString;
		return this._mode;
	},

	/** returns set cids **/
	getCIds: function(url){
		return this.getCommunityIds(url);
	},

	getParentId: function() {
        var parentDoc = window;
        while(parentDoc !== parentDoc.parent)
        {
            parentDoc = parentDoc.parent;
        }
        parentDoc = parentDoc.document;
        var iFrames = parentDoc.getElementsByTagName('iframe');
        return iFrames[0].getAttribute("id");
	},

	/**
	* Asks actionscript for communityIds.
	*/
	getCommunityIds: function(url)
	{
		var me = this;
		try {
			var cIdsStr = me.getFlashMovie().getCommunityIds(url);
		}
		catch (e) {
		}
		return cIdsStr;
	},
	/**
	* Asks actionscript for data set flags (docs vs custom vs map/reduce).
	*/
	getDatasetFlags: function()
	{
		var me = this;
		try {
			var datasetFlags = me.getFlashMovie().getDatasetFlags();
		}
		catch (e) {
		}
		return datasetFlags;
	},

	/**
	*	grabs community ids and current search state
	*	returns string ex: ?cids=1,2,3&mode=live
	**/
	getExtraUrlParams:function(url)
	{
		try{
			var params =  { 'cids': this.getCIds(url), 'mode': this.getMode() };
			var datasetFlags = this.getDatasetFlags();
			if (datasetFlags && (datasetFlags.length > 0)) {
				var datasetFlagsObj = datasetFlags.split('&');
				for (var x in datasetFlagsObj) {
					var paramPair = datasetFlagsObj[x].split("=", 2);
					if ((2 == paramPair.length) && (paramPair[0].length > 0)) {
						params[paramPair[0]] = paramPair[1];
					}
				}
			}
			if (url.length > 512) { // use substitution 
				var startOfIndex = url.indexOf('/proxy/');
				if (startOfIndex > 0) {
					var indexSet = url.substring(startOfIndex + 7);
					var endOfIndex = indexSet.indexOf('/');
					if (endOfIndex > 0) {
						indexSet = indexSet.substring(0, endOfIndex);
						params.indexes = indexSet;
						url = url.replace(indexSet, '$indexes');
						params.url = url;
					}
				}
			}
			
			return params;
		}catch(error){
			console.log("getExtraUrlParams: " + error.message)
			return null;
		}
	},

	/**
	* Generally called from actionscript with a true if live, false if stashed.
	* This function will set the mode within the infiniteJsConnector object
	* to be grabbed whenever an httpservice call is made and "mode" is required.
	**/
	setLive:function(isLive){
		if(isLive==true){
			//development location
			//window.location = "kibanaBin/dist/index.html#Kibana_LiveTemplate.json";
			//production location
			window.location = "/infinit.e.records/static/kibana/index.html#/dashboard/file/Kibana_LiveTemplate.json";
			infiniteJsConnector.setMode('live');

		}else if(isLive==false){
			//development location
			//window.location = "kibanaBin/dist/index.html#Kibana_StashedTemplate.json";
			//production location
			window.location = "/infinit.e.records/static/kibana/index.html#/dashboard/file/Kibana_StashedTemplate.json";
			infiniteJsConnector.setMode('stashed');
		}
	},

	/**
	* Called before init when url parameters are provided.
	* URL parameters are only ever supplied when the widget is run outside
	* of an actionscript iframe.
	*
	* Takes the provided parameter string and grabs the cids and mode.
	* With this information, cids and mode are stored in the infiniteJsConnector
	* object to be used in anything kibana would need.
	*
	* (param) paramString:String example: "?cids=1,2,3&mode=live
	*/
	onWidgetLoadWithParameters:function(paramString){
		var str = paramString;
		var params = str.split("&");
		if (params.length > 0) {
			for (var x in params) {
				var keyval = params[x].split('=');
				if (keyval.length > 1) {
					var key = keyval[0];
					if ((key == '?cids') || (key == 'cids')) {
						infiniteJsConnector.setCIds(keyval[1]);
					}
					if ((key == '?mode') || (key == 'mode')) {
						infiniteJsConnector.setMode(keyval[1]);
					}
				}
			}
		}
	}
};

/**
 * If the widget is loaded on its own (outside of an iframe), the URL parameters
 * must be checked in order to get cids and search mode.
 *
 * On Page load added in order to check URL parameters and set them appropriately.
 */
window.onload = function(){
	try {

		if (window.location.search.length > 0){
			infiniteJsConnector.onWidgetLoadWithParameters(window.location.search);
		}

		infiniteJsConnector.init();
	}
	catch (e) {
		//alert("infinite init error: " + e);
	}
}

/**
 * Helper function to allow a parent container to trigger the installation on the parent.
 * After installation, window.kibanaJsApi should be available on the parent container.
 *
 * eg. ( from Flex )
 * kibanaFrame.callIFrameFunction('installKibanaJsApiToParent'); //Trigger parent install
 * ExternalInterface.call("kibanaJsApi.refreshDashboard");			 //Use API Locally
 */
function installKibanaJsApiToParent(){
	//console.log("Installing to parent via IFrame helper function.");
	kibanaJsApi.installToParent();
}

function QueryTerm(q, index)
{
    this.query = q;
    this.alias = "";
	this.id = index;
    this.pin = false;
    this.type = "lucene";
    this.enable = true;
    this.parent = index;
}

function TimeTerm(from_value, to_value)
{
	this.type = "time";
	this.field = "@timestamp";
	this.from = from_value;
	this.to = to_value;
	this.mandate = "must";
	this.active = true;
	this.alias = "";
}

function FilterString(q, index)
{
	this.id = index;
	this.type = "querystring";
	this.query = q;
	this.mandate = "must";
	this.active = true;
	this.alias = "";
}

mirrorQuery = function(query_string){
	var query = JSON.parse(query_string);
	var kibana_q = [];
    var kibana_f = [];
    for( var i = 0; i < query.qt.length; i++ ){
        var term = query.qt[i];
	    
	    if ( null != term)
	    {
	        if (null != term.etext)
	        {
	            kibana_q.push(new QueryTerm(term.etext, kibana_q.length));
	        }
	        else if ( null != term.ftext)
	        {
	        	kibana_q.push(new QueryTerm(term.ftext, kibana_q.length));
	        }
	        else if ( null != term.entity)
	        {
	        	kibana_q.push(new QueryTerm(term.entity.split("/")[0], kibana_q.length));
	        }
	        else if ( null != term.time && null != term.time.min && null != term.time.max)
	        {
	        	kibana_f.push(new TimeTerm(term.time.min, term.time.max));
	        }
	    }
	   
	}
    
    if (null != kibana_q)
	{
    	kibanaJsApi.setQueryList(kibana_q, false, false);
	}
    
    if (null != kibana_f)
	{
    	kibanaJsApi.setFilters(kibana_f, false, false);
	}
}

refreshKibana = function(){
	kibanaJsApi.refreshDashboard();
}

ikanowObjectsToKibana = function(ikanowControlObject){
	if (null != ikanowControlObject)
	{
		try{
			var obj = JSON.parse(ikanowControlObject.toString());
		}
		catch (err) {
			try{
				var obj = JSON.parse(ikanowControlObject.toString().replace(/[\b]/g, '\\b').replace(/[\f]/g, '\\f').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/[\t]/g, '\\t'));
			}
			catch (err2) {
				alert("Unable to Process Data:  " + err2);
			}
		}
		
		if (null != obj) {
	        var termsOverride = 'AND';
	        var decomposeInfiniteQuery = false;
	        var appendToExistingKibanaQueries = false;
	        var applyToFilter = false;
	        var singleQ = "";
	        var kibana_q = [];
	        var kibana_f = [];
	        
	        if (null != obj.termsOverride){
	             termsOverride = obj.termsOverride;   
	        }
	        if (null != obj.decomposeInfiniteQuery){
	             decomposeInfiniteQuery = obj.decomposeInfiniteQuery;   
	        }
	        if (null != obj.appendToExistingKibanaQueries){
	             appendToExistingKibanaQueries = obj.appendToExistingKibanaQueries;   
	        }
	        if (null != applyToFilter) {
	        	applyToFilter = obj.applyToFilter;
	        }
	        
	        //Entities
	        if ( null != obj.entities && null != obj.entities.source)
	        {
	            for( var i = 0; i < obj.entities.source.length; i++ ){
	                 var ent = obj.entities.source[i];
	                
	                if ( null != ent)
	                {        
	                	var ent_term = null;
	                	if (null != ent.actual_name)
	                	{
	                		ent_term = ent.actual_name;
	                	}
	                	else if ( null != ent.etext)
	                	{
	                		ent_term = ent.etext;
	                	}
	                	else if ( null != ent.ftext)
	                	{
	                		ent_term = ent.ftext;
	                	}
	                	else if ( null != ent.entity)
	                	{
	                		ent_term = ent.entity.substring(0,ent.entity.lastIndexOf("/"));
	                	}
	                	else if ( null != ent.time && null != ent.time.min && null != ent.time.max)
		     	        {
		     	        	kibana_f.push(new TimeTerm(ent.time.min, ent.time.max));
		     	        }
	                	
	                	if (null != ent_term)
	                	{
		                    if (decomposeInfiniteQuery == true)
		                    {
		                    	if (applyToFilter == true)
		                    		kibana_q.push(new FilterString('"' + ent_term + '"', kibana_q.length));
		                    	else
		                    		kibana_q.push(new QueryTerm('"' + ent_term + '"', kibana_q.length));
		                    }
		                    else
		                    {
		                        if (singleQ == '')
		                            singleQ = '"' + ent_term + '"';
		                        else
		                            singleQ += ' ' + termsOverride + ' "' + ent_term + '"';
		                    }
	                	}
	                }// if (null != ent)
	            } //for loop
	        } //if ( null != obj.entities && null != obj.entities.source)
	        
	        //Associations
	        if (null != obj.associations && null != obj.associations.source)
        	{
	        	for( var i = 0; i < obj.associations.source.length; i++ ){
	        		var association = obj.associations.source[i];
	        		var entity1 = null;
	        		var entity2 = null;
	        		if (null != association.entity1)
	        			entity1 = association.entity1;
	        		if (null != association.entity2)
	        			entity2 = association.entity2;
	        		if (null == entity1 && null != association.entity1_index)
	        			entity1 = association.entity1_index.substring(0,association.entity1_index.lastIndexOf("/"));
	        		if (null == entity2 && null != association.entity2_index)
	        			entity2 = association.entity2_index.substring(0,association.entity2_index.lastIndexOf("/"));
	        		
	        		if ( null != association && (null != entity1 || null != entity2))
	                {
	        			var term = '';
	        			if (null !=  entity1 && null != entity2)
	        			{
	        				term = '("' + entity1 + '" AND "' + entity2 + '")';
	        			}
	        			else
	        			{
	        				if (null !=  entity1)
	        					term = '"' + entity1 + "'";
	        				else if (null !=  entity2)
	        					term = '"' + entity2 + '"';
	        			}
	        			
	        			if (decomposeInfiniteQuery == true)
	                    {
        					if (applyToFilter == true)
        						kibana_q.push(new FilterString(term, kibana_q.length));
        					else
        						kibana_q.push(new QueryTerm(term, kibana_q.length));
	                    }
	                    else
	                    {
	                        if (singleQ == '')
	                            singleQ = term;
	                        else
	                            singleQ += ' ' + termsOverride + ' ' + term ;
	                    }
	        			
	                }
	        	}
        	}
	        
	        if (null != singleQ && singleQ != '')
	        {
	        	if (applyToFilter == true)
	        		kibana_q.push(new FilterString(singleQ, kibana_q.length)); 
	        	else
	        		kibana_q.push(new QueryTerm(singleQ, kibana_q.length)); 
	        }
	        
	        if (null != kibana_q && kibana_q.length > 0)
	        {
	        	if (applyToFilter == true)
	        		kibanaJsApi.setFilters(kibana_q, appendToExistingKibanaQueries, appendToExistingKibanaQueries);
	        	else
	        		kibanaJsApi.setQueryList(kibana_q, appendToExistingKibanaQueries, appendToExistingKibanaQueries);
	        } 
	        
	        if (null != kibana_f && kibana_f.length > 0)
	        {
	        	if (applyToFilter == true)
	        		kibanaJsApi.setFilters(kibana_f, true, true);
	        	else
	        		kibanaJsApi.setFilters(kibana_f, appendToExistingKibanaQueries, appendToExistingKibanaQueries);
	        }
	        
	    }//Null check on JsonParse
	}// Null Check on ikanowControlObject
}
