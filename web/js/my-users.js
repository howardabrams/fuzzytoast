/**
 * Create a dynamic, "fuzzy toast" link for each user entry.
 */

$('#side').addClass("ui-corner-all");

$('#user-list li').
	hover(
        function() { $(this).addClass('ui-state-hover'); }, 
        function() { $(this).removeClass('ui-state-hover'); }
    ).
    css('mouse','pointer').
    click( function(){
    	
    	/* Two ways to do the same thing. First create a link and then 
    	 * call it, as in:
     	 *
        var id = $.fuzzytoast.create({
    		template    : 'templates/profile.html',
    		data        : 'data/user/'+$(this).attr('id')+'.json',
    		destination : '#main'
    	});
        $.fuzzytoast(id);
         */
    	$.fuzzytoast({
    		template    : 'templates/profile.html',
    		data        : 'data/user/'+$(this).attr('id')+'.json',
    		destination : '#right',
            before      : insertSpinner
    	});
    });