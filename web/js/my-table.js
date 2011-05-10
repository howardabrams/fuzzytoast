$(".name-table tr:odd").addClass("alt");

$(".name-table tr").each( function(index){
    var id = $(this).attr('id');

    // Note: The header doesn't have an id. ;-)
    if ( id ) {
	// console.log("Getting data: " + id );
	
	$.fuzzytoast({
		template    : 'templates/table-row.html',
		data        : 'data/user/'+id+'.json',
		destination : '#'+id,
		append      : true,
		finished	: function() {
			$('#'+id+' .name').click( edit_field );
			$('#'+id+' .phone').click( edit_field );
			$('#'+id+' .city').click( edit_field );

			$('#'+id+' .email-button').button().click( function() {
				open($(this).attr('link'));
			});
			$('#'+id+' .delete-button').button().click( function(){
				$(this).parent().parent().hide('slow');
				$(this).parent().parent().remove();
				$(".name-table tr:odd").addClass("alt");
				$(".name-table tr:even").removeClass("alt");
			});
		}
	});
    }
});

/**
 * Magic that allows you to "edit" any of the fields in the table.
 * The idea would be that this would submit the changes via a REST interface
 * back to the server. We just pretend that it does...
 */
function edit_field()
{
	var t = $.trim ( $(this).text() );
	
	$(this).html('<input type="text" value="'+t+'"/>');
	$(this).children('input').keyup( function(event) {
		if (event.keyCode == '13') {
			event.preventDefault();

			var val = $(this).val();       // Store off the field value
			var parent = $(this).parent();
			$(this).remove();
			
			parent.text(val);
			parent.click(edit_field);
		}
	}).focus();				// Put the text cursor in that field.
	
	$(this).unbind('click');  // Don't want to rerun this function if you
	                          // click again.
}
