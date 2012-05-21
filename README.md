The **jQuery Fuzzytoast** plugin aims to easily combine data from
standard REST calls with *templates* and insert the results back into
the HTML layout.

This goal removes xSP processing from the server to the client, making
the server work significantly more straight-forward and easier. However,
to help with the added complexity of the client, we've created this
project.

Usage
=====

Download a copy of the [`jquery.fuzzytoast.js`][1] code and include it in
your HTML document *after* including `jquery` and your favorite template
engine, as in:

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/libs/mustache.js"></script>
    <script type="text/javascript" src="js/libs/jquery.fuzzytoast.js"></script>  

  [1]: https://raw.github.com/howardabrams/fuzzytoast/master/web/js/jquery.fuzzytoast.js

Example
=======

The easiest way to use this plugin is to place a *fuzzytoast* aspect on
a button or some other object and have it grab an online template, some
data from a REST call and *insert* it as the child of some element, as
in:

    $('#some-buttom').fuzzytoast ({ 
        template   : 'templates/about.html',
        data       : 'rest/some-data.json',
        destination: "#main' 
    });

In this case, a `templates/about.html` template is download and processed with
the data model from calling the server with a URL of `rest/some-data.json`.
The results are put back into the HTML page based on the jQuery selector 
given with the `destination` property.

Pretty easy, eh?

Why?
====

Why did we write it and how does it compare to other, similar projects?

The approach of mapping REST documents with a template to display was a pattern
we were often implementing. Using FuzzyToast makes you web application much 
simpler to build and maintain.

The FuzzyToast plugin works best if you can answer yes to the following:

  * Is your web app small to medium in terms of size and complexity?
  * The data from your server is either under your control or is similar 
    to the data you want to display.
    
While this plugin has been used with larger apps, it seems that if your
web application is quite complex (or your widget behaviors are quite involved), 
you'll want to craft a solution with Backbone.


Release Notes
=============

The following is a brief summary of the major releases of this software.
Keep in mind that we release regularly with only one or two changes per release.

  * **v1.2.0** - Deprecated the `finished` callback in favor of `complete`. (Both work at this point).
  * **v1.1.5** - Added a `before` callback function called before an FT request for spinners and whatnot.
  * **v1.1.4** - Added a `refresh` option to FT calls to automatically redownload the data and re-render the template.
  * **v1.1.3** - Added a `.loadWithCache()` function to be a more efficient replacement for jQuery's `.load()` function. 
  * **v1.1.2** - Allow data from multiple REST API urls to be combined in a single document.
  * **v1.1.1** - Support for [Mustache][2], [Handlebars][3], [Underscore][4] and other template systems.
  * **v1.0.1** - Support for partial templates, where one template can include other templates.
  * **v1.0.0** - Initial release with a demonstration.

For details on these releases, please see [the FuzzyToast documentation][5].
