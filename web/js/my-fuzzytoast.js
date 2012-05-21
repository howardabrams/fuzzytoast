/*
 * This is an example of what the application should set up in order
 * to use the dynamic "fuzzy" links with application control for static
 * files (the "toasty" stuff like templates, JSON data, etc.)
 *
 * We add entries to the `fuzzytoast.linkdata` map indexed with a *unique* identification string.
 * If the index is a valid jQuery selector (usually begins with either '#' or '.'),
 * then the library will automatically add a click method to the `fuzzytoast()` function.
 * 
 * The properties of the link can be any of the following:
 *
 *   template - The URL of the template to use
 *
 *   data - The URL to a REST interface that responds with a data model used to
 *          substitute in the template.
 *
 *   destination - The jQuery selector to use when adding the results (as a child element).
 *                 If not specified, it defaults to `#main`
 *
 *   method - The HTTP method used when retrieving the data. Defaults to `get`
 *
 *   click - The jQuery selector used to associate an onclick event. You can associate your
 *           own in JavaScript via:
 *            	    $( '#your-button' ).click( function() { fuzzytoast('id-string'); } );
 */

//The problem with this file is the size and complexity that it might achieve.
//Options include breaking this up into separate files that could be $.getScript'd.

//However, the indexed values into the `fuzzytoasts` map must be unique, and that
//uniqueness isn't enforced in a dynamic "mapping" environment like this.
//We could enforce this if we were to create a *file* for each index.

//Let's see what this would look like if we tried to make the controlling association
//completely in this file.

//-----------------
//ABOUT
//-----------------


$(function() {

    // ------------------
    //   INSTRUCTIONS
    // ------------------
    //   The first button needs to load an HTML template/snippet, however,
    //   if doesn't need to be combined with any rest-like data, so we just
    //   use the `.load()` method:

    $('#landing_link').click ( function() {
        $('#main').loadWithCache ('templates/instructions.html');
    });

    // -----------------
    //   PROFILE
    // -----------------
    //   This is a way to associate a `fuzzytoast` with a click event. Of course,
    //   the `click` event is the default, so you really could just put a 
    //   `fuzzytoast()` method directly off of the selector (see the offline button below).

    $('#profile_link').click( function() {
        $.fuzzytoast({
            template    : 'templates/users.html',
            data        : 'data/user.json',
            before      : insertSpinner
        });
    });

    // -----------------
    //   TABLE
    // -----------------
    //   In this example, we create a fuzzytoast with a particular id, and then we
    //   associate this fuzzytoast with a trigger later ... well, just in the next
    //   line. ;-)

    $.fuzzytoast.create( 'table-link', {
        template    : 'templates/table.html',
        data        : 'data/user.json',
        method      : 'GET',
        before      : insertSpinner
    });

    $('#table_link').fuzzytoast('table-link');

    // ------------------
    //   TWITTER
    // ------------------
    
    $('#twitter_link').click ( function() {
        $('#main').loadWithCache ('templates/twitter.html');
    });

    // ------------------
    //   ERROR
    // ------------------

    $('#error_link').fuzzytoast ({
        template: 'templates/offline.html',
        data    : 'data/unavailable.json',
        error   : access_error
    });

    // ------------------
    //   FILES
    // ------------------

    $('#files_link').click ( function() {
        $('#main').loadWithCache ('templates/files.html').error(access_error);
    });

    // ------------------
    //   INITIAL LOAD
    // ------------------

    $('#main').loadWithCache ('templates/startup.html');
});

function insertSpinner(dest) {
    $(dest).html("<img src='img/ajax-spinner.gif' title='Please wait...loading data'/>");
}
