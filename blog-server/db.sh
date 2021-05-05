use BlogServer
var postFile = cat('./posts.json');
var postJSON = JSON.parse(postFile);
db.Posts.insertMany(postJSON)

var userFile = cat('./users.json');
var userJSON = JSON.parse(userFile);
db.Users.insertMany(userJSON)
