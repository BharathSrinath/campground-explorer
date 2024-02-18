Create a new folder and cd git bash to that path of the folder
npm init -y
npm i express mongoose ejs

setup the basic code in index.js
create seeds folder and setup the basic required data
create schema and models in models folder

come back to index.js and start creating routes and the corresponding pages to display when they render
routes. First npm i method-override for POST requests.
    1. '/' - home 
    2. '/campgrounds', - index 
    3. '/campgrounds/new' - new
    4. '/campgrounds/:id' - show
    5. '/campgrounds/:id/edit' - edit

Styling:
npm i ejs-mate
require that and update app.engine
cleanup the template codes in .ejs files by creating a layout folder within which we will have biolerplate.ejs
So now if we want to anything that is common to all the pages, we can do it in biolerplate.ejs (Example: navbar)
add bootsrap link in boilerplate.ejs
Now copy and paste the respective stylings from bootstrap and edit it based on our needs.
In some places we have used grid system. I hope you remember that with grid system in bootstrap,  the unit of measurement is divided into 12 equal parts, which are referred to as columns. This means that the width of each column is expressed as a fraction of the total width available in the grid system, with the entire width being divided into 12 parts.
