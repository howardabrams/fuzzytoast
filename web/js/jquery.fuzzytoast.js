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
            method      : $.fuzzytoast.default_method,
            append      : $.fuzzytoast.default_append,
            finished    : $.fuzzytoast.default_finished,
            success     : $.fuzzytoast.default_success,
            parameters  : parameters
        }, $.fuzzytoast.linkdata[id]);

        debug("Starting fuzzytoast request", id);

        // Start work on gathering up the data sources
        // while we start work on the getting the template.
        linkdata.sourceCount = -1;
        
        getDataSources(linkdata);
        
        // Currently, we are caching all templates in memory. This might be
        // too harsh for a large application. How should determine if we
        // should or shouldn't cache the template?

        if (! linkdata.templateData) {
            // Download the template, and on success, call the 'getdata' to
            // download the data from a web service.
            if( typeof linkdata.template === "string") { //assume it is a URL
                $.ajax({
                    url : linkdata.template,
                    dataType : 'text',
                    success : function(templateData) {
                        debug("Retrieved '", + id + "' template:", $.fuzzytoast.linkdata[id].template);
                        // debug(templateData);
                        processTemplate(templateData, function(completeTemplate){
                            linkdata.templateData = completeTemplate;
                            processDataAndTemplate(linkdata);
                        });
                    },
                    error : function(jqXHR, textStatus, errorThrown) {
                        $.fuzzytoast.errorHandler('template', linkdata, jqXHR, textStatus, errorThrown);
                    }
                });
            }
            else { //assume it is a jQuery object
                debug("Retrieved '" + id + "' template from jQuery object:", $.fuzzytoast.linkdata[id].template);
                processTemplate($(linkdata.template).html(), function(completeTemplate){
                    linkdata.templateData = completeTemplate;
                    //TODO: is this compatible with the above method? do we need an outerhtml method?
                    processDataAndTemplate(linkdata);
                });
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

    $.fuzzytoast.idCount = 0;
    
    /**
     * Predefine a fuzzytoast that will be referred to later by a unique
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

        // No ID is given, just parameters, so let's first create an ID
        // based on idCount and the contents of the parameters:
        if (typeof (idx) !== 'string') {
            options = idx;
            id = ($.fuzzytoast.idCount++).toString();
            
            if (typeof options.template === 'string') {
                id += "-" + options.template;
            }
            if (typeof options.data === 'string') {
                id += "-" + options.data;
            }
        }

        if ($.fuzzytoast.default_error && !options.error) {
            options.error = $.fuzzytoast.default_error;
        }

        $.fuzzytoast.linkdata[id] = options;

        return id;
    };

    /**
     * Changes the template engine settings (instead of the default feature of
     * auto discovery). The options specified by the `engine` variable must
     * include a `type`, and one of the following:
     * 
     *  - `engine`: The name of the template engine. Only used in log messages.
     *  - `type`: The type of template engine. See below for accepted values.
     *  - `render`: Function that takes both template and data and returns results (e.g. HTML)
     *  - `compiler`: Function that compiles the template into an intermediate form.
     *  - `processor`: Function that takes the compiled template and the data. Currently, only used for the `global-variables` type.
     *  
     * The behavior for how the engine is called is based on its `type`:
     * 
     *  - `functional`: The approach uses the `render` function with both the template and the model at once, and returns the generated results, e.g. Mustache.
     *  - `variable`: This approach uses the return value of the `compiler` as a function and passes the "data" to it for the output results, e.g. Handlebars.
     *  - `global-storage`: This stores the results of the `compiler` in a global variable string and then calls the `processor` function, e.g. jQuery Templates.
     */
    $.fuzzytoast.setTemplateEngine = function(engine) {
        if (typeof engine === 'string') {
            discoverTemplateSetup(engine);
        }
        else if (engine.type) {
            $.fuzzytoast.template = engine;
        }
        else {
            throw "Unsupport template engine";
        }
    };

    // Sure, this regular expression could be overwritten:
    $.fuzzytoast.templateIncludes = /\{\{\s*INCLUDE\s+(\S+)\s*\}\}/m;

    // -------------------------------------------------------------
    // Following functions are not intended to be called directly.
    // -------------------------------------------------------------

    /**
     * Once we have a template, we want to be able to include other templates
     * in it. This allows us to reuse templates, so we parse the template data
     * for keywords:  {{INCLUDE url}}
     */
    processTemplate = function( templateData, callback ) {
        var match = $.fuzzytoast.templateIncludes.exec(templateData);
        // console.log("completeTemplate:", templateData, "match():", match);
        if (match) {
            debug("Retrieving sub-template:", match[1]);
            $.ajax({
                url : match[1],
                success : function( templateString ) {
                    var newTemplate = 
                        templateData.substring(0, match.index) +
                        templateString +
                        templateData.substring(match.index + match[0].length);
                    processTemplate(newTemplate, callback);
                },
                error : function( err ) {
                    console.log("Could not retrieve embedded template: ", err);
                }
            });
        }
        else {
            callback(templateData);
        }
    };

    /**
     * Function called to retrieve the data sources specified in the `data`
     * property. This can either be a single string to a single URL, or it
     * can be an object containing multiple sources and the name used in 
     * inserting the results back into the model, as in:
     * 
     *     data: {
     *       user: '/user/45.json',
     *       account: '/account/3.json'
     *     }
     * 
     * Will result in a model containing some like this:
     * 
     *     {
     *       'user': {
     *         'first': 'Bob',
     *         'last': 'Barker', //... More data from the REST call
     *       },
     *       'account': {
     *         '
     *       }
     *     }
     */
    getDataSources = function(linkdata) {
        if ( typeof linkdata.data === 'string' ) {
            linkdata.sourceCount = 1;
            getDataSource(linkdata, linkdata.data);
        }
        else {
            linkdata.model = {};
            linkdata.sourceCount = dataSourcesLength(linkdata.data);
            for (i in linkdata.data) {
                // debug("Asking for ", i, "in", linkdata.data[i], "Count", linkdata.sourceCount);
                getDataSource(linkdata, linkdata.data[i], i);
            }
        }
    };
    
    dataSourcesLength = function(obj){
        var count = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        };
        return count;
    };
    
    getDataSource = function(linkdata, src, dataid) {
        // Download the data from a web service, and on success,
        // call the 'process' to combine the template and results
        // and insert back into the DOM.

        $.ajax({
            url : src,
            type : linkdata.method,
            dataType : 'text',
            data : linkdata.parameters,
            success : function(data, textStatus, jqXHR) {
                debug("Retrieved data: ", data);

                // Safari is stupid and can't seem to parse anything, so
                // we use this clever approach stolen from jQuery's source.
                var model;
                if ($.browser.safari) {
                    model = (new Function("return " + data))();
                }
                else {
                    model = $.parseJSON(data);
                }
                
                // Did we just get the results of our of many data sources?
                if ( dataid ) {
                    linkdata.model[dataid] = model;
                }
                else {   // We just got the only data source...
                    // JQuery tmpl plugin will iterate all the templates if the json
                    // in an Array, you can't simply use the each to iterate all
                    // the values, to makes it works for each, add a default wrapper
                    // 'data' outside of Array, that you can use ${{each(index, value) data}}
                    // for this case.
                    // JSON example: [ { name: 1 }, { name: 2} ]
                    if( typeof model !== 'object' || model.length >= 0 ) {
                        model = { data : model };
                    }
                    linkdata.model = model;
                }
                linkdata.sourceCount--;
                processDataAndTemplate(linkdata);
            },
            error : function(jqXHR, textStatus, errorThrown) {
                $.fuzzytoast.errorHandler('model', linkdata, jqXHR, textStatus,
                        errorThrown);
            }
        });
    };

    // Once each data source and the template has been retrieved (and 
    // individually processed), we call this function. It doesn't do anything
    // unless everything was successfully gathered and processed...
    
    processDataAndTemplate = function(linkdata) {
        debug("We are in ", linkdata, "with", linkdata.sourceCount, "and", linkdata.templateData);
        // Only process once we have the template data and all data sources:
        if ( linkdata.sourceCount === 0 && linkdata.templateData ) {
            // The template passed in could be either a string (which
            // works fine) or an HTML Object.
            
            var destination;
            if (typeof linkdata.destination === 'string') { //assume it is a selector
                destination = $(linkdata.destination);
            } else{
                destination = linkdata.destination; //assume it is a jQuery object
            } 
            
            debug("Processing into", destination);
            
            // Clear out the destination section:
            if (!linkdata.append) {
                destination.empty();
            }
            
            var html = templateRender(linkdata.templateData, linkdata.model);
            debug( $.fuzzytoast.template.engine, html);

            destination.append(html);
            
            if (linkdata.success) {
                linkdata.success(destination, linkdata.model);
            }
            if (linkdata.finished) {
                linkdata.finished();
            }
            
            // If the link contains a "refresh" tag, we will reget the 
            // data sources and process things again, without bothering
            // to get the template.
            if (linkdata.refresh) {
                setTimeout( function(){
                    getDataSources(linkdata);
                }, linkdata.refresh);
            }
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
        
        if (linkdata.finished) {
            linkdata.finished();
        }
    };

    /**
     * Given the data source (the `model` variable), and the template source,
     * we process everything based on the type of the template engine.
     */
    templateRender = function(template_source, model) {
        discoverTemplate();
        
        with ( $.fuzzytoast.template ) {
            // A "functional" approach is the easiest, as this function takes 
            // both the template and the model at once, and returns the 
            // generated results.
            if ( type === 'functional' ) {
                return render(template_source, model);
            }

            // Global storage is obnoxious, because it isn't functional. We'll
            // store all of our templates with the key: fuzzytoast-template
            if ( type === 'global-storage' ) {
                compiler('fuzzytoast-template', template_source);
                return processor('fuzzytoast-template', model);
            }

            // The "variable" approach compiles the template and returns it.
            // We then use that to process the "model"...
            if ( type === 'variable' ) {
                var template = compiler(template_source);
                return template(model);
            }
        }
    };

    /**
     * Analyze the current JavaScript environment and guess which
     * template engine we should use.
     * 
     * If the template engine has already been setup, calling this function
     * is a noop.
     */
    discoverTemplate = function() {
        if ( ! $.fuzzytoast.template ) {
            // First preference: Handlebars
            if (typeof Handlebars !== 'undefined') {
                discoverTemplateSetup("Handlebars");
            }
            // Second preference: Mustache
            else if (typeof Mustache !== 'undefined' ) {
                discoverTemplateSetup("Mustache");
            }
            else if (typeof _ !== 'undefined') {
                discoverTemplateSetup("Underscore");
            }
            else {
                discoverTemplateSetup("jQuery Templates");
            }
            console.log("Template setup: ", $.fuzzytoast.template.engine, "(",
                    $.fuzzytoast.template.type, ")");
        }
    };
    
    /**
     * Given a single letter key, set up our template processing based
     * on the template engine we will be using.
     * 
     * This is called by `discoverTemplate()` (which picks what is available),
     * as well as by `setTemplateEngine()` (which allows the user to pick one). 
     */
    discoverTemplateSetup = function(type) {
        $.fuzzytoast.template = {};

        switch(type.substring(0,1).toLowerCase()) {
            case "h":
                $.fuzzytoast.template.engine    = "Handlebars";
                $.fuzzytoast.template.type      = "variable";
                $.fuzzytoast.template.compiler  = Handlebars.compile;
                $.fuzzytoast.template.processor = null;
                break;
            case "m":
                $.fuzzytoast.template.engine    = "Mustache";
                $.fuzzytoast.template.type      = "functional";
                $.fuzzytoast.template.render    = Mustache.render;
                break;
            case "_":
            case "u":
                $.fuzzytoast.template.engine    = "Underscore";
                $.fuzzytoast.template.type      = "functional";
                $.fuzzytoast.template.render    = _.template;
                break;
            default:
                $.fuzzytoast.template.engine    = "jQuery Template";
                $.fuzzytoast.template.type      = "global-storage";
                $.fuzzytoast.template.compiler  = $.template;
                $.fuzzytoast.template.processor = $.tmpl;
                break;
        }
    };

    /**
     * A way to display log messages only if the user tells us too, as in:
     * 
     *         $.fuzzytoast.debug = false;
     */
    debug = function() {
        if($.fuzzytoast.debug) {
            var log = Function.prototype.bind.call(console.log, console);
            var args = Array.prototype.slice.call(arguments);
            args.unshift("FuzzyToast:");

            log.apply( this, args );
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
