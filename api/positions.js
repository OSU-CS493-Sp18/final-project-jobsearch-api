const router = require('express').Router();
const validation = require('../lib/validation');
const { getReviewsByBusinessID } = require('./reviews');
const { getPhotosByBusinessID } = require('./photos');
const { addPositionToUser, getUserByID } = require('./users');

/*
 * Schema describing required/optional fields of a position object.
 */
const positionSchema = {
  id: { required: false },
  applicantID: {required: true },
  positionName: { required: true },
  description: { required: true },
  requirements: { required: false },
  posted_date: { required: true },
  city: { required: true },
  state: { required: true },
  salary: { required: false },
  denied: { required: false },
};


function getPositionsCount(mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT COUNT(*) AS count FROM positions', function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].count);
      }
    });
  });
}


function getPositionsPage(page, totalCount, mysqlPool) {
  return new Promise((resolve, reject) => {

    const numPerPage = 10;
    const lastPage = Math.max(Math.ceil(totalCount / numPerPage), 1);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * numPerPage;

    mysqlPool.query(
      'SELECT * FROM positions ORDER BY id LIMIT ?,?',
      [ offset, numPerPage ],
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve({
            positions: results,
            pageNumber: page,
            totalPages: lastPage,
            pageSize: numPerPage,
            totalCount: totalCount
          });
        }
      }
    );
  });
}

/*
 * Route to return a paginated list of positions.
 */
router.get('/', function (req, res) {
  const mysqlPool = req.app.locals.mysqlPool;
  getPositionsCount(mysqlPool)
    .then((count) => {
      return getPositionsPage(parseInt(req.query.page) || 1, count, mysqlPool);
    })
    .then((positionsPageInfo) => {
      /*
       * Generate HATEOAS links for surrounding pages and then send response.
       */
      positionsPageInfo.links = {};
      let { links, pageNumber, totalPages } = positionsPageInfo;
      if (pageNumber < totalPages) {
        links.nextPage = `/positions?page=${pageNumber + 1}`;
        links.lastPage = `/positions?page=${totalPages}`;
      }
      if (pageNumber > 1) {
        links.prevPage = `/positions?page=${pageNumber - 1}`;
        links.firstPage = '/positions?page=1';
      }
      res.status(200).json(positionsPageInfo);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Error fetching positions list.  Please try again later."
      });
    });
});

////////////////////////////////////////////////////////////////////////////////

function insertNewPosition(position, mysqlPool, mongoDB) {
  return new Promise((resolve, reject) => {
    position = validation.extractValidFields(position, positionSchema);
    position.id = null;
    mysqlPool.query(
      'INSERT INTO positions SET ?',
      position,
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      }
    );
  }).then((id) => {
    console.log("TEST");
    return addPositionToUser(id, position.applicantID, mongoDB);
});
}

/*
 * Route to create a new position.
 */
router.post('/', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
   const mongoDB = req.app.locals.mongoDB;
  if (validation.validateAgainstSchema(req.body, positionSchema)) {
    getUserByID(req.body.applicantID, mongoDB, false)
      .then ((user) => {
          if (user) {
            return insertNewPosition(req.body, mysqlPool, mongoDB);
          } else {
            return Promise.reject(400);
          }
      })
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            position: `/position/${id}`
          }
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error inserting position into DB.  Please try again later.",
          output: err
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid position object."
    });
  }
});

////////////////////////////////////////////////////////////////////////////////

function getPositionByID(positionID, mysqlPool) {

  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM positions WHERE id = ?', [ positionID ], function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  })
}

/*
 * Route to fetch info about a specific position.
 */
router.get('/:positionID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const positionID = parseInt(req.params.positionID);
  getPositionByID(positionID, mysqlPool)
    .then((position) => {
      if (position) {
        res.status(200).json(position);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch position.  Please try again later."
      });
    });
});

////////////////////////////////////////////////////////////////////////////////

function replacePositionByID(positionID, position, mysqlPool) {
  return new Promise((resolve, reject) => {
    position = validation.extractValidFields(position, positionSchema);
    mysqlPool.query('UPDATE positions SET ? WHERE id = ?', [ position, positionID ], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });
}

/*
 * Route to replace data for a position.
 */
router.put('/:positionID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const positionID = parseInt(req.params.positionID);
  if (validation.validateAgainstSchema(req.body, positionSchema)) {
    replacePositionByID(positionID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              position: `/positions/${positionID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Unable to update specified position.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid position object"
    });
  }
});

////////////////////////////////////////////////////////////////////////////////

function deletePositionByID(positionID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM positions WHERE id = ?', [ positionID ], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.affectedRows > 0);
      }
    });
  });

}

/*
 * Route to delete a position.
 */
router.delete('/:positionID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const positionID = parseInt(req.params.positionID);
  deletePositionByID(positionID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete position.  Please try again later."
      });
    });
});


exports.router = router;
// exports.getBusinessesByOwnerID = getBusinessesByOwnerID;
