db.createUser({
  user: "mdbuser",
  pwd: "password1",
  roles: [ { role: "readWrite", db: "usersmdb" } ]
});
