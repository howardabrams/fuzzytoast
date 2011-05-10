// ---------------------------------------------------------------------------
// The FuzzyToast project aims to easily combine data from standard REST
// calls with "templates" and insert the results back into the HTML layout.
//
// This goal removes xSP processing from the server to the client, making
// the server work significantly more straight-forward and easier. However, 
// to help with the added complexity of the client, we've created this 
// project.
// ---------------------------------------------------------------------------
// Created using an MIT Open Source Licence (similar to jQuery).
//  (c) 2010, Howard Abrams
// ---------------------------------------------------------------------------

// The following black magic wrapper is a safe way to create a jQuery plugin.

(function($) {

    /**
     * The `$.fuzzytoast()` function is the primary way to kick off the
     * download of a template and REST data for combining and inserting into
     * a DOM element.
     * 
     * The first parameter is either the options that contains all of the
     * needed information to perform this task, as in:
     * 
     *	$.fuzzytoast({
     *		template    : 'templates/profile.html',
     *		data	    : 'data/user/'+$(this).attr('id')+'.json',
     *		destination : '#main'
     *	});
     *
     * Or you can create an store the options separately, and then call the
     * `$.fuzzytoast()` function using the returned identification, as in:
     * 
     *	var id = $.fuzzytoast.create({
     *		template: 'templates/details.html',
     *		data	: '/person/4',
     *		method	: 'GET',
     *		destination: '#main'
     *	});
     * 
     * And then trigger it later:
     * 
     *	$('#some-button).fuzzytoast('unique-id-value');
     */
    $.fuzzytoast = function( idx, parameters )	{
	var id = idx;
	if ( typeof(idx) !== 'string' ) {
	    id = $.fuzzytoast.create(idx);
	}
	
	// Before we get too far, let's check to see if we should display all
	// of the console messages during this process...
	var debug = $.fuzzytoast.default_debug;
	if ( $.fuzzytoast.linkdata[id].debug ) {
	    debug = $.fuzzytoast.linkdata[id].debug;
	}
	if ( debug ) {
	    console.log("Starting fuzzytoast request for "+ id);
	}

	$.ajax({
	    url: $.fuzzytoast.linkdata[id].template,
	    dataType: 'text',
	    success: function(template) {
		if ( debug ) {
		    console.log ( "Retrieved '"+id+"' template: " + $.fuzzytoast.linkdata[id].template );
		    console.log ( template );
		}
		
		$.fuzzytoast.getdata(template, id, debug, parameters );
	    },
	    error: function( jqXHR, textStatus, errorThrown ) {
		if ( $.fuzzytoast.linkdata[id].error ) {
		    $.fuzzytoast.linkdata[id].error( jqXHR, textStatus, errorThrown );
		}
	    }
	});
    };
    
    /**
     * This stores the collection of links. Required to make it easy to keep
     * all of the utility functions (below) coordinated.
     */
    $.fuzzytoast.linkdata = {};
    
    /**
     * Default values that can be overridden for the needs of the application
     * using this plugin.
     */
    $.fuzzytoast.default_destination = "#main";
    $.fuzzytoast.default_type	     = "GET";
    $.fuzzytoast.default_append      = false;
    $.fuzzytoast.default_debug       = false;
    
     /**
     * Predefine a fuzzytoast that will be referred to later by a uniqu
     * identifier:
     * 
     *		$.fuzzytoast.create( 'unique-id-value', {
     *			template: 'templates/details.html',
     *			data	: '/person/4',
     *			method	: 'GET',
     *			destination: '#main'
     *		});
     * 
     * Select the triggering button, as in:
     * 
     *		$('#some-button).fuzzytoast('unique-id-value');
     *
     * The `id` is optional, for you could do this:
     * 
     *		var id = $.fuzzytoast.create({
     *			template: 'templates/details.html',
     *			data	: '/person/4'
     *		});
     *		$('#some-button).fuzzytoast(id);
     */
    $.fuzzytoast.create = function( idx, options )	{
	
	var id = idx;
	
	if ( typeof(idx) !== 'string' ) {
	    options = idx;
	    id = options.template + "-" + options.data;
	}
	
	if ( $.fuzzytoast.default_error && !options.error ) {
	    options.error = $.fuzzytoast.default_error;
	}
	
	$.fuzzytoast.linkdata[id] = options;
	
	return id;
    };
    
    // -------------------------------------------------------------
    // Following functions are not intended to be called directly.
    // -------------------------------------------------------------
    
    $.fuzzytoast.getdata = function( template, id, debug, parameters ) {

	// TODO: Refactor this section so that function calls are objects
	//       and objects can merge with "default" values more easily.

	var domdest = $.fuzzytoast.default_destination;
	var type    = $.fuzzytoast.default_type;
	var append  = $.fuzzytoast.default_append;
	var finished = $.fuzzytoast.default_finished;

	if ( $.fuzzytoast.linkdata[id].destination ) {
	    domdest = $.fuzzytoast.linkdata[id].destination;
	}
	if ( $.fuzzytoast.linkdata[id].method ) {
	    type    = $.fuzzytoast.linkdata[id].method;
	}
	if ( $.fuzzytoast.linkdata[id].append ) {
	    append  = $.fuzzytoast.linkdata[id].append;
	}
	if ( $.fuzzytoast.linkdata[id].finished ) {
	    finished  = $.fuzzytoast.linkdata[id].finished;
	}
	
	$.ajax({
	    url: $.fuzzytoast.linkdata[id].data,
	    type: type,
	    dataType: 'text',
	    data: parameters,
	    success: function(data, textStatus, jqXHR) {
		if ( debug ) {
		    console.log ( "Retrieved '"+id+"' data: " + data );
		}

		// Safari is stupid and can't seem to parse anything, so
		// we use this clever approach stolen from jQuery's source.
		var model;
		if ( $.browser.safari ) {
		    model = (new Function("return " + data))();
		}
		else {
		    model = $.parseJSON(data);
		}
		$.fuzzytoast.process(template, model, domdest, append, finished, debug);
	    },
	    error: function( jqXHR, textStatus, errorThrown ) {
		
		// Call the associated error function.
		if ( $.fuzzytoast.linkdata[id].error ) {
		    $.fuzzytoast.linkdata[id].error( jqXHR, textStatus, errorThrown );
		}
	    }
	});
    };
    
    $.fuzzytoast.process = function(template, model, dest, append, finished, debug) {
	// The template passed in could be either a string (which
	// works fine) or an HTML Object.
	
	if ( debug ) {
	    console.log( "Processing template", dest );
	    console.log( "Template", template);
	    console.log( "Model", model);
	    console.log( "Destination", dest);
	}
	
	// Clear out the destination section:
	if ( ! append ) {
	    $(dest).empty();
	}

	// Create our template and assign it to the global template space.
	$.template( 'fuzzytoast-template', template );
	
	if ( debug ) {
	    console.log ( $.tmpl('fuzzytoast-template', model) );
	}

	// Call the template with the data model and add it to the destination
	// Could use prependTo()
	//	     appendTo()
	
	$.tmpl('fuzzytoast-template', model).appendTo(dest);
	
	if ( finished ) {
	    finished();
	}
    };

 

})(jQuery);

/**
 * jQuery method for attaching a fuzzytoast to the results of a selector.
 * For example:
 * 
 *	$('#landing_link').fuzzytoast ({
 *	    template: 'templates/about.html',	// The template we should load
 *	    data    : 'data/nothing.json'		// The REST call for the data.
 *	});	
 */
$.fn.fuzzytoast = function(options) {
    
    var id;

    // Calling a pre-created fuzzytoast...
    if ( typeof(options) === 'string' ) {
	id = options;
	options = $.fuzzytoast.linkdata[id];
    }
    // Need to create a fuzzytoast first...
    else {
	// Does the selected 'element' have an ID attribute?
	// If so, we will use that as the ID into the
	// fuzzytoasts hashmap.
	
	if ( this.attr('id') ) {
	    id = $.fuzzytoast.create( '#' + this.attr('id'), options);
	}
	// If not, we'll make an ID based on the template and
	// REST URL, which should be unique enough... and may
	// be reusable.
	
	else {
	    id = $.fuzzytoast.create(options);
	}
    }
    // Make sure the template and data are specified, since the 'options'
    // given to us go right into the map for us to use later.
    
    if ( options.template && options.data ) {
	if ( options.debug ) {
	    console.log("Processing", id, "data", options.data);
	}
	$.fuzzytoast.linkdata[id] = options;
	this.css('cursor','pointer').click ( function() {
	    $.fuzzytoast(id);
	});
    }
    else {
	console.log("The 'fuzzytoast' method requires both a 'data' and 'template' option.");
    }
};
