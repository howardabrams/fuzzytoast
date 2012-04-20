// ---------------------------------------------------------------------------
// The FuzzyToast project aims to easily combine data from standard REST
// calls with "templates" and insert the results back into the HTML layout.

// This goal removes xSP processing from the server to the client, making
// the server work significantly more straight-forward and easier. However,
// to help with the added complexity of the client, we've created this
// project.
// ---------------------------------------------------------------------------
// Created using an MIT Open Source Licence (similar to jQuery).
// (c) 2010, Howard Abrams
// ---------------------------------------------------------------------------

// The following black magic wrapper is a safe way to create a jQuery plugin.

(function($) {

    /**
     * The `$.fuzzytoast()` function is the primary way to kick off the download
     * of a template and REST data for combining and inserting into a DOM
     * element.
     * 
     * The first parameter is either the options that contains all of the needed
     * information to perform this task, as in:
     * 
     * $.fuzzytoast({ template : 'templates/profile.html', data :
     * 'data/user/'+$(this).attr('id')+'.json', destination : '#main' });
     * 
     * Or you can create an store the options separately, and then call the
     * `$.fuzzytoast()` function using the returned identification, as in:
     * 
     * var id = $.fuzzytoast.create({ template: 'templates/details.html', data :
     * '/person/4', method : 'GET', destination: '#main' });
     * 
     * And then trigger it later:
     * 
     * $('#some-button).fuzzytoast('unique-id-value');
     */
    $.fuzzytoast = function(idx, parameters) {
        var id = idx;
        if (typeof (idx) !== 'string') {
            id = $.fuzzytoast.create(idx);
        }

        // Allow option properties in the link (and passed in parameters)
        // will override default values set elsewhere.

        var linkdata = $.extend({
            id : id,
            destination : $.fuzzytoast.default_destination,
            method : $.fuzzytoast.default_method,
            append : $.fuzzytoast.default_append,
            finished : $.fuzzytoast.default_finished,
            parameters : parameters
        }, $.fuzzytoast.linkdata[id]);

        if ($.fuzzytoast.debug) {
            console.log("Starting fuzzytoast request for " + id);
        }

        // Currently, we are caching all templates in memory. This might be
        // too harsh for a large application. How should determine if we
        // should or shouldn't cache the template?

        if (linkdata.templateData) {
            $.fuzzytoast.getdata(linkdata);
        }
        else {
            // Download the template, and on success, call the 'getdata' to
            // download the data from a web service.
          if( typeof linkdata.template === "string") { //assume it is a URL
				$.ajax({
					url : linkdata.template,
					dataType : 'text',
					success : function(templateData) {
						if($.fuzzytoast.debug) {
							console.log("Retrieved '" + id + "' template: " + $.fuzzytoast.linkdata[id].template);
							console.log(templateData);
						}
						linkdata.templateData = templateData;
						$.fuzzytoast.getdata(linkdata);
					},
					error : function(jqXHR, textStatus, errorThrown) {
						$.fuzzytoast.errorHandler('template', linkdata, jqXHR, textStatus, errorThrown);
					}
				});
			} else { //assume it is a jQuery object
				if($.fuzzytoast.debug) {
					console.log("Retrieved '" + id + "' template from jQuery object: " + $.fuzzytoast.linkdata[id].template);
					console.log(templateData);
				}
				linkdata.templateData = $(linkdata.template).html();
				//TODO: is this compatible with the above method? do we need an outerhtml method?
				$.fuzzytoast.getdata(linkdata);
			}
        }
    };

    /**
     * This stores the collection of links. Required to make it easy to keep all
     * of the utility functions (below) coordinated.
     */
    $.fuzzytoast.linkdata = {};

    /**
     * Default values that can be overridden for the needs of the application
     * using this plugin.
     */
    $.fuzzytoast.default_destination = "#main";
    $.fuzzytoast.default_method = "GET";
    $.fuzzytoast.default_append = false;

    /**
     * The user can change this value in order to display more debugging
     * information.
     */
    $.fuzzytoast.debug = false;

    /**
     * Predefine a fuzzytoast that will be referred to later by a uniqu
     * identifier:
     * 
     * $.fuzzytoast.create( 'unique-id-value', { template:
     * 'templates/details.html', data : '/person/4', method : 'GET',
     * destination: '#main' });
     * 
     * Select the triggering button, as in:
     * 
     * $('#some-button).fuzzytoast('unique-id-value');
     * 
     * The `id` is optional, for you could do this:
     * 
     * var id = $.fuzzytoast.create({ template: 'templates/details.html', data :
     * '/person/4' }); $('#some-button).fuzzytoast(id);
     */
    $.fuzzytoast.create = function(idx, options) {

        var id = idx;

        if (typeof (idx) !== 'string') {
            options = idx;
            id = options.template + "-" + options.data;
        }

        if ($.fuzzytoast.default_error && !options.error) {
            options.error = $.fuzzytoast.default_error;
        }

        $.fuzzytoast.linkdata[id] = options;

        return id;
    };

    // -------------------------------------------------------------
    // Following functions are not intended to be called directly.
    // -------------------------------------------------------------

    $.fuzzytoast.getdata = function(linkdata) {

        // Download the data from a web service, and on success,
        // call the 'process' to combine the template and results
        // and insert back into the DOM.

        $.ajax({
            url : linkdata.data,
            type : linkdata.method,
            dataType : 'text',
            data : linkdata.parameters,
            success : function(data, textStatus, jqXHR) {
                if ($.fuzzytoast.debug) {
                    console.log("Retrieved data: " + data);
                }

                // Safari is stupid and can't seem to parse anything, so
                // we use this clever approach stolen from jQuery's source.
                var model;
                if ($.browser.safari) {
                    model = (new Function("return " + data))();
                }
                else {
                    model = $.parseJSON(data);
                }
                // JQuery tmpl plugin will iterate all the templates if the json
                // in an Array, you can't simplely use the each to iterate all
                // the values, to makes it works for each, add a default wrapper
                // 'data' outside of Array, that you can use ${{each(index, value) data}}
                // for this case.
                // JSON example: [ { name: 1 }, { name: 2} ]
                if( model.length >= 0 ) {
                    model = { data : model };
                }
                linkdata.model = model;
                $.fuzzytoast.process(linkdata);
            },
            error : function(jqXHR, textStatus, errorThrown) {
                $.fuzzytoast.errorHandler('model', linkdata, jqXHR, textStatus,
                        errorThrown);
            }
        });
    };

    $.fuzzytoast.process = function(linkdata) {
        // The template passed in could be either a string (which
        // works fine) or an HTML Object.
		
		var $destination;
		if (typeof linkdata.destination === 'string') { //assume it is a selector
			$destination = $(linkdata.destination);
		} else{
			$destination = linkdata.destination; //assume it is a jQuery object
		} 
		
        if ($.fuzzytoast.debug) {
            console.log("Processing into ", $destination);
        }

        // Clear out the destination section:
        if (!linkdata.append) {
            $destination.empty();
        }

        // Create our template and assign it to the global template space.
        $.template('fuzzytoast-template', linkdata.templateData);

        if ($.fuzzytoast.debug) {
            console.log($.tmpl('fuzzytoast-template', linkdata.model));
        }

        // Call the template with the data model and add it to the destination
        // Could use prependTo()
        // appendTo()

        $.tmpl('fuzzytoast-template', linkdata.model).appendTo(
                $destination);

        if (linkdata.finished) {
            linkdata.finished();
        }
    };

    /**
     * Called when an AJAX error happens. We build up a data object with details
     * about the error, and then call the user's error handler.
     */
    $.fuzzytoast.errorHandler = function(requestType, linkdata, jqXHR,
            textStatus, errorThrown) {
        var url = "unknown";
        switch (requestType) {
        case 'template':
            url = linkdata.template;
            break;
        case 'model':
            url = linkdata.data;
            break;
        }

        console.error("The '" + linkdata.id + "' request for the "
                + requestType + ", " + url + ", returned a " + jqXHR.status
                + ".");
        console.error("jqXHR", jqXHR);

        if (linkdata.error) {
            var errorDetails = {
                type : requestType,
                url : url,
                link : linkdata,
                status : jqXHR.status,
                statusText : jqXHR.statusText,
                jqXHR : jqXHR
            };

            linkdata.error(errorDetails);
        }
    };

})(jQuery);

/**
 * jQuery method for attaching a fuzzytoast to the results of a selector. For
 * example:
 * 
 * $('#landing_link').fuzzytoast ({ template: 'templates/about.html', // The
 * template we should load data : 'data/nothing.json' // The REST call for the
 * data. });
 */
$.fn.fuzzytoast = function(options) {

    var id;

    // Calling a pre-created fuzzytoast...
    if (typeof (options) === 'string') {
        id = options;
        options = $.fuzzytoast.linkdata[id];
    }
    // Need to create a fuzzytoast first...
    else {
        // Does the selected 'element' have an ID attribute?
        // If so, we will use that as the ID into the
        // fuzzytoast hashmap.

        if (this.attr('id')) {
            id = $.fuzzytoast.create('#' + this.attr('id'), options);
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

    if (options.template && options.data) {
        if ($.fuzzytoast.debug) {
            console.log("Processing", id, "data", options.data);
        }
        $.fuzzytoast.linkdata[id] = options;
        this.css('cursor', 'pointer').click(function() {
            $.fuzzytoast(id);
        });
    }
    else {
        console.log("The 'fuzzytoast' method requires both a 'data' and 'template' option.");
    }
};
