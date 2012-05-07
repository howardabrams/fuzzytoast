// $.fuzzytoast.debug = true;
$.fuzzytoast.setTemplateEngine("jQuery");

module("Global Fuzzytoast tests");
asyncTest("Population from external template and external data", function() {
	expect(1);
    $.fuzzytoast.debug = false;
    var target = "#target1";
    
	$.fuzzytoast({
		destination : target,
		template : '../templates/users.html',
		data : '../data/user.json',
		finished : function() {
			var contentPopulated = $.trim($(target).text()).length > 0;
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
    $.fuzzytoast.debug = false;
    var target = "#target2";
    
    $.fuzzytoast({
		template : $('#template2'),
		destination : $(target),
		data : '../data/user.json',
		finished : function() {
			var contentPopulated = $.trim($(target).text()).length > 0;
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
    $.fuzzytoast.debug = false;
    var target = '#target3';
    
    $.fuzzytoast({
        template: 'templates/toplevel.html',
        data: '../data/user/34.json',
        destination: target,
        success: function() {
            var content = $.trim($(target).text());
            equal(content, "abc foo def bar ghi");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});

asyncTest("nested includes", function(){
    expect(1);
    $.fuzzytoast.debug = false;
    var target = "#target4";
    
    $.fuzzytoast({
        template: 'templates/toplevel2.html',
        data: '../data/user/42.json',
        destination: target,
        success: function() {
            var content = $.trim($(target).text());
            equal(content, "abc foo bazinga bar def");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});

asyncTest("Partial Templates Top-Level", function(){
    expect(1);
    $.fuzzytoast.debug = false;
    var target = "#target5";
    
    $.fuzzytoast({
        template: 'templates/partial-top.html',
        destination: target,
        data : '../data/user.json',
        finished : function() {
            var contentPopulated = $.trim($(target).text());
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
    $.fuzzytoast.debug = true;
    var target = "#target6";
    
    $.fuzzytoast({
        template: $("#template6"),
        destination: target,
        data : '../data/user/20.json',
        finished : function() {
            var content = $.trim($(target).text().replace(/\s+/g, ' '));
            equal(content, "Embedded Partial Template foo bazinga bar", 
                    "Population from external template and external data passed");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});

module("Alternate Template Engines");

asyncTest("Mustache Templates", function(){
    expect(3);
    $.fuzzytoast.debug = false;
    var target = "#target7";

    $.fuzzytoast.setTemplateEngine("Mustache");
    equal($.fuzzytoast.template.engine, "Mustache");
    equal($.fuzzytoast.template.type,   "functional");

    $.fuzzytoast({
        template: 'templates/amustache.html',
        destination: target,
        data : '../data/user/9.json',
        success : function() {
            var contentPopulated = $.trim($(target).text());
            // console.log(contentPopulated);
            equal(contentPopulated, "Ernest Taylor", "Mustache template rendered correctly.");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});

asyncTest("Handlebars Templates", function(){
    expect(3);
    $.fuzzytoast.debug = false;
    var target = "#target8";

    $.fuzzytoast.setTemplateEngine("Handlebars");
    equal($.fuzzytoast.template.engine, "Handlebars");
    equal($.fuzzytoast.template.type,   "variable");

    Handlebars.registerHelper('fullname', function(person) {
        return person.first + " " + person.last;
    });
    
    $.fuzzytoast({
        template: 'templates/ahandlebar.html',
        destination: target,
        data : '../data/user/8.json',
        success : function() {
            var contentPopulated = $.trim($(target).html());
            // console.log(contentPopulated);
            equal(contentPopulated, "Thomas Dalton", "Handlebars template rendered correctly.");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});

module("Many Data Sources");

asyncTest("Multiple Sources", function(){
    expect(1);
    $.fuzzytoast.debug = false;
    $.fuzzytoast.setTemplateEngine("jQuery");
    var target = "#target9";

    $.fuzzytoast({
        destination : target,
        template : 'templates/manyusers.html',
        data : {
            userA: '../data/user/12.json', 
            userB: '../data/user/13.json', 
            userC: '../data/user/14.json' 
        },
        finished : function() {
            var content = $.trim($(target).text().replace(/\s+/g, ' '));
            equal(content, "Mabel Newman Wendy Storms Sanjuana Thompson", "Population from external template and external data passed");
            start();
        },
        error : function() {
            ok(false, "Population from external template and external data failed");
            start();
        }
    });
});

asyncTest("Multiple Sources and one error", function(){
    expect(1);
    $.fuzzytoast.debug = false;
    $.fuzzytoast.setTemplateEngine("jQuery");
    var target = "#target10";

    $.fuzzytoast({
        destination : target,
        template : 'templates/manyusers.html',
        data : {
            userA: '../data/user/12.json', 
            userB: '../data/user/13.json', 
            userC: '../data/user/71.json' 
        },
        success : function() {
            ok(false, "Population from external template and external data failed");
            start();
        },
        error : function() {
            ok(true, "Expected an error on one data source.");
            start();
        }
    });
});
