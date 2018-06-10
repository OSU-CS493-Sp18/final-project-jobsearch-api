const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false },
  data: { required: true }
};

/*
 * Executes a MySQL query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
function insertNewPhoto(photo, mysqlPool, mongoDB) {
  return new Promise((resolve, reject) => {
    photo = validation.extractValidFields(photo, photoSchema);
    photo.id = null;
    mysqlPool.query(
      'INSERT INTO photos SET ?',
      photo,
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      }
    );
  }).then((id) => {
    return addPhotoToUser(id, photo.userid, mongoDB);
  });
}

function addPhotoToUser(photoID, userID, mongoDB) {
  const usersCollection = mongoDB.collection('users');
  return usersCollection.updateOne(
    { userID: userID },
    { $push: { photos: photoID } }
  ).then(() => {
    return Promise.resolve(photoID);
  });
}

/*
 * Route to create a new photo.
 */
router.post('/', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const mongoDB = req.app.locals.mongoDB;
  if (validation.validateAgainstSchema(req.body, photoSchema)) {
    insertNewPhoto(req.body, mysqlPool, mongoDB)
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            photo: `/photos/${id}`,
            business: `/businesses/${req.body.businessid}`
          }
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error inserting photo into DB.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Executes a MySQL query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
function getPhotoByID(photoID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM photos WHERE id = ?', [ photoID ], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const photoID = parseInt(req.params.photoID);
  getPhotoByID(photoID, mysqlPool)
    .then((photo) => {
      if (photo) {
        res.status(200).json(photo);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch photo.  Please try again later."
      });
    });
});

/*
 * Executes a MySQL query to replace a specified photo with new data.
 * Returns a Promise that resolves to true if the photo specified by
 * `photoID` existed and was successfully updated or to false otherwise.
 */
function replacePhotoByID(photoID, photo, mysqlPool) {
  return new Promise((resolve, reject) => {
    photo = validation.extractValidFields(photo, photoSchema);
    mysqlPool.query('UPDATE photos SET ? WHERE id = ?', [ photo, photoID ], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

/*
 * Route to update a photo.
 */
router.put('/:photoID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const photoID = parseInt(req.params.photoID);
  if (validation.validateAgainstSchema(req.body, photoSchema)) {
    let updatedPhoto = validation.extractValidFields(req.body, photoSchema);
    /*
     * Make sure the updated photo has the same businessID and userID as
     * the existing photo.  If it doesn't, respond with a 403 error.  If the
     * photo doesn't already exist, respond with a 404 error.
     */
    getPhotoByID(photoID, mysqlPool)
      .then((existingPhoto) => {
        if (existingPhoto) {
          if (updatedPhoto.businessid === existingPhoto.businessid && updatedPhoto.userid === existingPhoto.userid) {
            return replacePhotoByID(photoID, updatedPhoto, mysqlPool);
          } else {
            return Promise.reject(403);
          }
        } else {
          next();
        }
      })
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              business: `/businesses/${updatedPhoto.businessid}`,
              photo: `/photos/${photoID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        if (err === 403) {
          res.status(403).json({
            error: "Updated photo must have the same businessID and userID"
          });
        } else {
          res.status(500).json({
            error: "Unable to update photo.  Please try again later."
          });
        }
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object."
    });
  }
});

/*
 * Executes a MySQL query to delete a photo specified by its ID.  Returns
 * a Promise that resolves to true if the photo specified by `photoID`
 * existed and was successfully deleted or to false otherwise.
 */
function deletePhotoByID(photoID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM photos WHERE id = ?', [ photoID ], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });

}

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const photoID = parseInt(req.params.photoID);
  deletePhotoByID(photoID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete photo.  Please try again later."
      });
    });
});

/*
 * Executes a MySQL query to fetch all photos for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested photos.  This array could be empty if the
 * specified business does not have any photos.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
function getPhotosByBusinessID(businessID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM photos WHERE businessid = ?',
      [ businessID ],
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

/*
 * Executes a MySQL query to fetch all photos by a specified user, based on
 * on the user's ID.  Returns a Promise that resolves to an array containing
 * the requested photos.  This array could be empty if the specified user
 * does not have any photos.  This function does not verify that the specified
 * user ID corresponds to a valid user.
 */
function getPhotosByUserID(userID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query(
      'SELECT * FROM photos WHERE userid = ?',
      [ userID ],
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

exports.router = router;
exports.getPhotosByBusinessID = getPhotosByBusinessID;
exports.getPhotosByUserID = getPhotosByUserID;
