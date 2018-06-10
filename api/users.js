const router = require('express').Router();
const bcrypt = require('bcryptjs');
const ObjectId = require('mongodb').ObjectId;

const { getReviewsByUserID } = require('./reviews');
const { getPhotosByUserID } = require('./photos');

const { generateAuthToken, requireAuthentication } = require('../lib/auth');

function validateUserObject(user) {
  return user && user.userID && user.name && user.email && user.password;
}


function insertNewUser(user, mongoDB) {
  return bcrypt.hash(user.password, 8)
    .then((passwordHash) => {
      const userDocument = {
        userID: user.userID,
        name: user.name,
        email: user.email,
        password: passwordHash,
        businesses: [],
        reviews: [],
        photos: []
      };
      const usersCollection = mongoDB.collection('users');
      return usersCollection.insertOne(userDocument);
    })
    .then((result) => {
      return Promise.resolve(result.insertedId);
    })
    .catch((err) => {
      console.log("Insertion Error: ", err);
    });
}


router.post('/', function (req, res) {
  const mongoDB = req.app.locals.mongoDB;
  if (validateUserObject(req.body)) {
    insertNewUser(req.body, mongoDB)
      .then((id) => {
        res.status(201).json({
          _id: id,
          userID: req.body.userID,
          links: {
            user: `/users/${id}`
          }
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Failed to insert new user."
        });
      });
  } else {
    res.status(400).json({
      error: "Request doesn't contain a valid user."
    })
  }
});

// -----------------------------------------------------------------------------

router.post('/login', function (req, res) {
  const mongoDB = req.app.locals.mongoDB;
  if (req.body && req.body.userID && req.body.password) {
    getUserByID(req.body.userID, mongoDB, true)
      .then((user) => {
        if (user) {
          console.log("Input password: ", req.body.password);
          console.log("Db password: ", user.password);
          return bcrypt.compare(req.body.password, user.password);
        } else {
          return Promise.reject(401);
        }
      })
      .then((loginSuccessful) => {
        if (loginSuccessful) {
          return generateAuthToken(req.body.userID);
        } else {
          return Promise.reject(401);
        }
      })
      .then((token) => {
        res.status(200).json({
          token: token
        });
      })
      .catch((err) => {
        console.log(err);
        if (err === 401) {
          res.status(401).json({
            error: "Invalid credentials."
          });
        } else {
          res.status(500).json({
            error: "Failed to fetch user."
          });
        }
      });
  } else {
    res.status(400).json({
      error: "Request needs a user ID and password."
    })
  }
});

// -----------------------------------------------------------------------------

function getUserByID(userID, mongoDB, includePassword) {
  const usersCollection = mongoDB.collection('users');
  const projection = includePassword ? {} : { password: 0 };
  return usersCollection
    .find({ userID: userID })
    .project(projection)
    .toArray()
    .then((results) => {
      return Promise.resolve(results[0]);
    });
}

router.get('/:userID', requireAuthentication, function (req, res, next) {
  const mongoDB = req.app.locals.mongoDB;
  if (req.user !== req.params.userID) {
    res.status(403).json({
      error: "Unauthorized to access that resource"
    });
  } else {
    getUserByID(req.params.userID, mongoDB)
      .then((user) => {
        if (user) {
          res.status(200).json(user);
        } else {
          next();
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: "Failed to fetch user."
        });
      });
  }
});

// -----------------------------------------------------------------------------

router.get('/:userID/businesses', requireAuthentication, function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const ownerID = req.params.userID;
  getBusinessesByOwnerID(ownerID, mysqlPool)
    .then((ownerBusinesses) => {
      res.status(200).json({
        businesses: ownerBusinesses
      });
    })
    .catch((err) => {
      console.log("  -- err:", err);
      res.status(500).json({
        error: `Unable to fetch businesses for user ${ownerID}`
      });
    });
});


function getBusinessesByOwnerID(ownerID, mysqlPool) {
 return new Promise((resolve, reject) => {
   mysqlPool.query(
     'SELECT * FROM businesses WHERE ownerid = ?',
     [ ownerID ],
     function (err, results) {
       if (err) {
         reject(err);
       } else {
         resolve(results);
       }
     }
   );
 });
}


// -----------------------------------------------------------------------------


router.get('/:userID/reviews', requireAuthentication, function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const ownerID = req.params.userID;
  getReviewsByOwnerID(ownerID, mysqlPool)
    .then((ownerReviews) => {
      res.status(200).json({
        reviews: ownerReviews
      });
    })
    .catch((err) => {
      console.log("  -- err:", err);
      res.status(500).json({
        error: `Unable to fetch reviews for user ${ownerID}`
      });
    });
});

function getReviewsByOwnerID(ownerID, mysqlPool) {
 return new Promise((resolve, reject) => {
   mysqlPool.query(
     'SELECT * FROM reviews WHERE userid = ?',
     [ ownerID ],
     function (err, results) {
       if (err) {
         reject(err);
       } else {
         resolve(results);
       }
     }
   );
 });
}

// -----------------------------------------------------------------------------

router.get('/:userID/photos', requireAuthentication, function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const ownerID = req.params.userID;
  getPhotosByOwnerID(ownerID, mysqlPool)
    .then((ownerPhotos) => {
      res.status(200).json({
        photos: ownerPhotos
      });
    })
    .catch((err) => {
      console.log("  -- err:", err);
      res.status(500).json({
        error: `Unable to fetch photos for user ${ownerID}`
      });
    });
});

function getPhotosByOwnerID(ownerID, mysqlPool) {
 return new Promise((resolve, reject) => {
   mysqlPool.query(
     'SELECT * FROM photos WHERE userid = ?',
     [ ownerID ],
     function (err, results) {
       if (err) {
         reject(err);
       } else {
         resolve(results);
       }
     }
   );
 });
}

// -----------------------------------------------------------------------------

function addBusinessToUser(businessID, userID, mongoDB) {
  const usersCollection = mongoDB.collection('users');
  return usersCollection.updateOne(
    { userID: userID },
    { $push: { businesses: businessID } }
  ).then(() => {
    return Promise.resolve(businessID);
  });
}

function addReviewToUser(reviewID, userID, mongoDB) {
  const usersCollection = mongoDB.collection('users');
  return usersCollection.updateOne(
    { userID: userID },
    { $push: { reviews: reviewID } }
  ).then(() => {
    return Promise.resolve(reviewID);
  });
}


exports.router = router;
exports.getUserByID = getUserByID;
exports.addBusinessToUser = addBusinessToUser;
exports.addReviewToUser = addReviewToUser;
