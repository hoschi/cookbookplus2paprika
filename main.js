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
	s = s.replace(/notes: "([^"]*)"/g, 'notes: |\n    $1');
	s = s.replace(/ingredients: "([^"]*)"/g, 'ingredients: |\n  $1');
	s = s.replace(/\\n/g, '\n    ');

	return s;
};

// get all user recipes
db.each("SELECT * FROM staging WHERE member_id=0 LIMIT 11", function(err, row) {
	var entry, timeMatch, time, timeUnit, ingredients, comsp, ingredientsStrange,
		timeStrange;

	if (row.recipe_url === 'atebites.com') {
		return;
	}

	entry = {};
	entry.name = row.title;
	entry.notes = row.desc;
	entry.source = row.recipe_url;
	entry.photo = row.image_data;
	entry.categories = [ row.course ];

	entry.on_favorites = false;
	if (row.is_pinned === 1) {
		entry.on_favorites = true;
	}

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
		timeStrange = row.prep_time;
	}

	ingredientsStrange = [];
	ingredients = JSON.parse(row.ingredients);
	ingredients = ingredients.components;
	comps = '  ';
	ingredients.forEach(function(item) {
		item = item.component;
		if (item.floor_m &&
			item.floor_m !== "") {
			comps += item.floor_m + ' ';
		}

		if (item.unit_m &&
			item.unit_m !== "") {
			comps += item.unit_m + ' ';
		}

		comps += item.ingredient;
		comps += "\n";

		if (item.fraction_m !== "") {
			ingredientsStrange.push(item.ingredient);
		}
	});
	entry.ingredients = comps;

	if (timeStrange || ingredientsStrange.length > 0) {
		strangItem = {
			title:row.title
		};

		if (timeStrange) {
			strangItem.time = timeStrange;
		}

		if (ingredientsStrange.length > 0) {
			strangItem.ingredients = ingredientsStrange;
		}

		recipesStrange.push(strangItem);
	}

	recipesNormal.push(entry);
	//console.log(stringify(entry));
}, function () {
	fs.writeFile("./strange.yml", stringify(recipesStrange));
	fs.writeFile("./converted.yml", stringify(recipesNormal));
});

db.close();
