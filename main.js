var sqlite3 = require('sqlite3').verbose();
var yaml = require('js-yaml');
var fs = require('fs');
var db = new sqlite3.Database('./source.sqlite');

var recipesStrange, recipesNormal, stringify;

recipesNormal = [];
recipesStrange = [];

stringify = function (obj) {
	var s;

	s = yaml.safeDump(obj);

	// fake multi line strings because this isn't yet in js-yaml
	s = s.replace(/notes: "([^"]*)"/, 'notes: |\n  $1');
	s = s.replace('\\n', '\n  ');

	return s;
};

// get all user recipes
// TODO remove limit
db.each("SELECT * FROM staging WHERE member_id=0 LIMIT 11", function(err, row) {
	var entry, timeMatch, time, timeUnit;

	if (row.recipe_url === 'atebites.com') {
		return;
	}

	entry = {};
	entry.name = row.title;
	//entry.notes = "| " + row.desc;
	entry.notes = row.desc;
	entry.source = row.recipe_url;
	// TODO enable
	//entry.photo = "!!binary " + row.image_data;
	entry.categories = [ row.course ];

	entry.on_favorites = false;
	if (row.is_pinned === 1) {
		entry.on_favorites = true;
	}

	// TODO components

	timeMatch = row.prep_time.match(/^(\d+|\d+,\d+)\s*(\w+)$/);
	if (timeMatch) {
		time = timeMatch[1];
		timeUnit = timeMatch[2];

		switch(timeUnit) {
			case 'hours':
				timeUnit = 'h';
				break;

			case 'minutes':
				timeUnit = 'm';
				break;
		}

		entry.cook_time = time + ' ' + timeUnit;
	} else if (row.prep_time !== "") {
		recipesStrange.push({
			title:row.title,
			time:row.prep_time
		});
	}

	recipesNormal.push(entry);
	console.log(stringify(entry));
}, function () {
	fs.writeFile("./strange.yaml", stringify(recipesStrange));
	fs.writeFile("./converted.yaml", stringify(recipesNormal));
});

db.close();
