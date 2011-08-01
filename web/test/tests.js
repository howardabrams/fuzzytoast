module("Fuzzytoast tests");

asyncTest("Population from external template and external data", function() {
	expect(1);
	$.fuzzytoast({
		template : '../templates/users.html',
		data : '../data/user.json',
		finished : function() {
			ok(true, "Population from external template and external data passed");
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
		destination : $('#destination'),
		data : '../data/user.json',
		finished : function() {
			ok(true, "Population from local HTML template and data passed");
			start();
		},
		error : function() {
			ok(false, "Population from local HTML template and data failed");
			start();
		}
	});
});
