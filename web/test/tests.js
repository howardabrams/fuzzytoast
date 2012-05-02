module("Global Fuzzytoast tests");
asyncTest("Population from external template and external data", function() {
	expect(1);
	$.fuzzytoast({
		destination : '#target',
		template : '../templates/users.html',
		data : '../data/user.json',
		finished : function() {
			var contentPopulated = $.trim($('#target').text()).length > 0;
			ok(contentPopulated, "Population from external template and external data passed");
			start();
		},
		error : function() {
			ok(false, "Population from external template and external data failed");
			start();
		}
	});
});
asyncTest("Population from local HTML template and local data using a jquery object for destination", function() {
	expect(1);
	$.fuzzytoast({
		template : $('#template2'),
		destination : $('#target2'),
		data : '../data/user.json',
		finished : function() {
			var contentPopulated = $.trim($('#target2').text()).length > 0;
			ok(contentPopulated, "Population from local HTML template and data passed");
			start();
		},
		error : function() {
			ok(false, "Population from local HTML template and data failed");
			start();
		}
	});
});


module("Template Includes");
asyncTest("single level includes", function(){
    expect(1);
    var templateData = "abc {{INCLUDE templates/first.html}} " +
    		           "def {{INCLUDE templates/second.html}} ghi";
    $.fuzzytoast.templateProcess( templateData, function(templateStr) {
        equal("abc foo def bar ghi", templateStr);
        start();
    });
});

asyncTest("nested includes", function(){
    expect(1);
    var templateData = "abc {{INCLUDE templates/third.html}} def";
    $.fuzzytoast.templateProcess( templateData, function(templateStr) {
        equal("abc foo bazinga bar def", templateStr);
        start();
    });
});

asyncTest("Partial Templates Top-Level", function(){
    expect(1);
    $.fuzzytoast({
        template: 'templates/partial-top.html',
        destination: '#target3',
        data : '../data/user.json',
        finished : function() {
            var contentPopulated = $.trim($('#target3').text());
            // console.log(contentPopulated);
            equal("Partial Template foo bazinga bar", contentPopulated, "Population from external template and external data passed");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});

asyncTest("Embedded Partial Templates", function(){
    expect(1);
    $.fuzzytoast({
        template: $("#template4"),
        destination: '#target4',
        data : '../data/user.json',
        finished : function() {
            var contentPopulated = $.trim($('#target4').text());
            equal("Embedded Partial Template             foo bazinga bar", contentPopulated, "Population from external template and external data passed");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});