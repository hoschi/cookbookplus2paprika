# Usage

* install dependencies with `npm install`
* export your Cookbook+ recipes and move the file into this directory
* rename it to source.sqlite
* run `node main.js`
* your recipes are in `converted.yml`
* not parsable time stamps or ingredients are listed in `strange.yml`

# mappings

title: name
desc: notes |
recipe url: source
is pinned: on_favorites
course: [ categories ]
prep time: cook_time
image data: photo |
ingredients (JSON): ingredients |

