db.createUser({
  user: "mdbuser",
  pwd: "pass",
  roles: [ { role: "readWrite", db: "yelpmdb" } ]
});
