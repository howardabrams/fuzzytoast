
function offline()
{
    // console.log("Went into offline mode.");
    $('#state b').text('Offline');
}

function online()
{
    // console.log("Came back into online mode.");
    $('#state b').text('Online');
}

function access_error(jqXHR, textStatus, errorThrown)
{
    $('#error-dialog').empty();

    $( "#errorTemplate" ).template( "errorTemplate" );
    $.tmpl( "errorTemplate", {
	textStatus: textStatus,
	errorThrown: errorThrown,
	readyState: jqXHR.readyState,
	status: jqXHR.status,
	statusText: jqXHR.statusText
    } ).appendTo( "#error-dialog" );

    $('#error-dialog').dialog('open');
}


$(function() {
	
    $('.top-button').hover(
        function() { $(this).addClass('ui-state-hover'); }, 
        function() { $(this).removeClass('ui-state-hover'); }
    );

    // $.fuzzytoast.default_online  = online;
    // $.fuzzytoast.default_offline = offline;
    $.fuzzytoast.default_error   = access_error;

    // Error Dialog
    $('#error-dialog').dialog({
	autoOpen: false,
	width: 600,
	buttons: {
	    "Ok": function() { 
		$(this).dialog("close"); 
	    }
	}
    });
});
