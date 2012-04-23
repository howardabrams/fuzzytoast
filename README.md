The **jQuery Fuzzytoast** plugin aims to easily combine data from
standard REST calls with “templates” and insert the results back into
the HTML layout.

This goal removes xSP processing from the server to the client, making
the server work significantly more straight-forward and easier. However,
to help with the added complexity of the client, we’ve created this
project.

Usage
=====

The easiest way to use this plugin is to place a *fuzzytoast* aspect on
a button or some other object and have it grab an online template, some
data from a REST call and *insert* it as the child of some element, as
in:

    $('#some-buttom').fuzzytoast ({ 
        template: 'templates/about.html',
        data    : 'rest/some-data.json' 
    });

This call makes many assumptions, but the `fuzzytoast` parameters are
the following:

  * `template` - The URL of the template to use

  * `data` - The URL to a REST interface that responds with a data model
    used to substitute in the template.

  * `destination` - The jQuery selector to use when adding the results
    (as a child element). If not specified, it defaults to
    `$.fuzzytoast.default_destination` (see below).

  * `method` - The HTTP method used when retrieving the data. Defaults
    to `$.fuzzytoast.default_method` (see below).

  * `append` - Should the results be inserted as the only child of the
    destination (`false`) or *appended* to the end of the existing
    children (`true`). Defaults to `$.fuzzytoast.default_append` (see
    below).

  * `finished` - A function to call after the template and data have
    been inserted into the document. Defaults to
    `$.fuzzytoast.default_finished` (see below).

  * `error` - A function to call if either the template or data could
    not be downloaded. Defaults to `$.fuzzytoast.default_error` (see
    below).

You can also set up defaults for all requests. These defaults include:

  * `$.fuzzytoast.default_destination` - The jQuery selector that
    references an HTML element where the results will be place. Defaults
    to `#main`.

  * `$.fuzzytoast.default_method` - The HTTP method to use when retrieving
    the data from a web service. Defaults to `GET` (didn’t see that
    coming, did you?)

  * `$.fuzzytoast.default_append` - Should the results of the request be
    appended to the destination. Defaults to `false`

  * `$.fuzzytoast.default_debug` - Specifies the extra `console.log`ging
    features of the system. Defaults to `false`.

  * `$.fuzzytoast.default_error` - A function name to be used for all
    `error` requests.

  * `$.fuzzytoast.default_finished` - A function name to be used for all
    `finished` requests.

Utility Functions
=================

Templates themselves may contain data that needs to call the fuzzytoast
system, and in this case, you can build up the dynamic aspects by first
creating the action, and then calling it, as in:

    var id = $.fuzzytoast.create({
        template    : 'templates/profile.html',
        data        : 'data/user/'+$(this).attr('id')+'.json',
        destination : '#main'
    });                                                         
    $.fuzzytoast(id);

Or doing this with a single call to `$.fuzzytoast()` as in:

    $.fuzzytoast({
        template    : 'templates/profile.html',
        data        : 'data/user/'+$(this).attr('id')+'.json',
        destination : '#main'
    });

A couple of reasons why you would want to use the *utility function*
form of `$.fuzzytoast()` instead of the initial *selector method* usage
described above, e.g. `$('#selector').fuzzytoast()`:

First, the `$(this)` is not available without being *inside* a function
call.

Second, you might want to kick off the call with something other than a
`click`, as in:

    $('#user-list li').
        hover(
            function() {
                $(this).addClass('ui-state-hover');             
                $.fuzzytoast({
                        template    : 'templates/profile.html', 
                        data        : 'data/user/'+$(this).attr('id')+'.json', 
                        destination : '#main'                   
                    });
            },
            function() { $(this).removeClass('ui-state-hover'); }   
        );

JQuery tmpl plugin will iterate all the templates if the json in an Array, you
can't simplely use the each to iterate all the values, to makes it works for each
, add a default wrapper `data` outside of Array, that you can use

    ${{each(index, value) data}}

for this case.

Example:

    // if we have a json like: [ { name: 1 }, { name: 2} ]
    {{each(i, obj) data}}
      <p>{obj.name}</p>
    {{/each}}
