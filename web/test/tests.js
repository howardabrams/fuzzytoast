module("Fuzzytoast tests");
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
		template : $('#template'),
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
