var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./source.sqlite');

db.serialize(function() {
	// get all user recipes
	db.each("SELECT * FROM staging WHERE member_id=0", function(err, row) {
		console.log(row.title);
	});
});

db.close();
