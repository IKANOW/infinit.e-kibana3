define([
  'angular',
  'jquery',
  'lodash',
  'moment'
], function (angular, $, _, moment) {
  'use strict';

  var module = angular.module('kibana.filters');

  module.filter('stringSort', function() {
    return function(input) {
      return input.sort();
    };
  });

  module.filter('pinnedQuery', function(querySrv) {
    return function( items, pinned) {
      var ret = _.filter(querySrv.ids(),function(id){
        var v = querySrv.list()[id];
        if(!_.isUndefined(v.pin) && v.pin === true && pinned === true) {
          return true;
        }
        if((_.isUndefined(v.pin) || v.pin === false) && pinned === false) {
          return true;
        }
      });
      return ret;
    };
  });

  module.filter('slice', function() {
    return function(arr, start, end) {
      if(!_.isUndefined(arr)) {
        return arr.slice(start, end);
      }
    };
  });

  module.filter('stringify', function() {
    return function(arr) {
      if(_.isObject(arr) && !_.isArray(arr)) {
        return angular.toJson(arr);
      } else {
        return _.isNull(arr) ? null : arr.toString();
      }
    };
  });

  module.filter('bucketLinks', function() {
    return function(val) {
      if (typeof val === 'string') {
        // Check string for repeating JSON elements and iterate over them
        val = val.replace(/\{.*?\},?\s*/gm, function (objVal) {

          // Check for a rec_id and bucket field in each nested JSON object and if there is one, replace the plain text
          // record ID with a clickable link that messages the parent window.
          var recIdMatch = /&quot;rec_id&quot;:&quot;([\w\-]+)&quot;/gm.exec(objVal);
          if (recIdMatch) {
            var bucketMatch = /&quot;bucket&quot;:&quot;([\w\-/]+)&quot;/gm.exec(objVal);
            if (bucketMatch) {
              return objVal.replace(recIdMatch[1], function (recIdVal) {
                return '<a onclick="window.parent.postMessage(\'drilldown,' + bucketMatch[1] + ',' + recIdVal +
                    '\', window.location.origin)">' + recIdVal + '</a>';
              });
            }
          }
          return objVal;
        });
      }
      return val;
    };
  });

  module.filter('assetLinks', function() {
    return function(val, key, event) {
      // This filter has intimate knowledge of the dashboards it is displaying, but looking at the name of the key is
      // currently the only way that we safely target ONLY fields that are a hostname or an IP address.  This approach
      // should be replaced with something more general purpose in the future.
      if (key === 'asset') {
        return '<a onclick="window.parent.postMessage(\'assetClick,' + val.trim() + ',' +
            event.kibana._source.company_id + '\', window.location.origin)">' + val.trim() + '</a>';
      } else {
        return val;
      }
    };
  });

  module.filter('moment', function() {
    return function(date,mode) {
      switch(mode) {
      case 'ago':
        return moment(date).fromNow();
      }
      return moment(date).fromNow();
    };
  });

  module.filter('noXml', function() {
    var noXml = function(text) {
      return _.isString(text)
        ? text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
        : text;
    };
    return function(text) {
      return _.isArray(text)
        ? _.map(text, noXml)
        : noXml(text);
    };
  });

  module.filter('urlLink', function() {
    var  //URLs starting with http://, https://, or ftp://
      r1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
      //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
      r2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
      //Change email addresses to mailto:: links.
      r3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;

    var urlLink = function(text) {
      var t1,t2,t3;
      if(!_.isString(text)) {
        return text;
      } else {
        _.each(text.match(r1), function() {
          t1 = text.replace(r1, "<a href=\"$1\" target=\"_blank\">$1</a>");
        });
        text = t1 || text;
        _.each(text.match(r2), function() {
          t2 = text.replace(r2, "$1<a href=\"http://$2\" target=\"_blank\">$2</a>");
        });
        text = t2 || text;
        _.each(text.match(r3), function() {
          t3 = text.replace(r3, "<a href=\"mailto:$1\">$1</a>");
        });
        text = t3 || text;
        return text;
      }
    };
    return function(text) {
      return _.isArray(text)
        ? _.map(text, urlLink)
        : urlLink(text);
    };
  });

  module.filter('editable', function () {
    return function (data) {
      return _.filter(data, function (item) {
        return item.editable !== false;
      });
    };
  });

  module.filter('gistid', function() {
    var gist_pattern = /(\d{5,})|([a-z0-9]{10,})|(gist.github.com(\/*.*)\/[a-z0-9]{5,}\/*$)/;
    return function(input) {
      if(!(_.isUndefined(input))) {
        var output = input.match(gist_pattern);
        if(!_.isNull(output) && !_.isUndefined(output)) {
          return output[0].replace(/.*\//, '');
        }
      }
    };
  });

});
