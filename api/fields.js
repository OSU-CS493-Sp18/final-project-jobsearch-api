const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a position object.
 */
const fieldSchema = {
  id: { required: false },
  fieldName: {required: true },
  description: { required: false },
  averageSalary: { required: true },
  lowSalary: { required: true },
  highSalary: { required: true }
};


function getFieldsCount(mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT COUNT(*) AS count FROM fields', function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].count);
      }
    });
  });
}


function getFieldsPage(page, totalCount, mysqlPool) {
  return new Promise((resolve, reject) => {

    const numPerPage = 10;
    const lastPage = Math.max(Math.ceil(totalCount / numPerPage), 1);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * numPerPage;

    mysqlPool.query(
      'SELECT * FROM fields ORDER BY id LIMIT ?,?',
      [ offset, numPerPage ],
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve({
            fields: results,
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
  getFieldsCount(mysqlPool)
    .then((count) => {
      return getFieldsPage(parseInt(req.query.page) || 1, count, mysqlPool);
    })
    .then((fieldsPageInfo) => {
      /*
       * Generate HATEOAS links for surrounding pages and then send response.
       */
      fieldsPageInfo.links = {};
      let { links, pageNumber, totalPages } = fieldsPageInfo;
      if (pageNumber < totalPages) {
        links.nextPage = `/fields?page=${pageNumber + 1}`;
        links.lastPage = `/fields?page=${totalPages}`;
      }
      if (pageNumber > 1) {
        links.prevPage = `/fields?page=${pageNumber - 1}`;
        links.firstPage = '/fields?page=1';
      }
      res.status(200).json(fieldsPageInfo);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Error fetching fields list.  Please try again later."
      });
    });
});

////////////////////////////////////////////////////////////////////////////////

function insertNewField(field, mysqlPool, mongoDB) {
  return new Promise((resolve, reject) => {
    field = validation.extractValidFields(field, fieldSchema);
    field.id = null;
    mysqlPool.query(
      'INSERT INTO fields SET ?',
      field,
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}

/*
 * Route to create a new position.
 */
router.post('/', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
   const mongoDB = req.app.locals.mongoDB;
  if (validation.validateAgainstSchema(req.body, fieldSchema)) {
    insertNewField(req.body, mysqlPool, mongoDB)
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            field: `/fields/${id}`
          }
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error inserting field into DB.  Please try again later.",
          output: err
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid field object."
    });
  }
});


////////////////////////////////////////////////////////////////////////////////

function getFieldByID(fieldID, mysqlPool) {

  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM fields WHERE id = ?', [ fieldID ], function (err, results) {
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
router.get('/:fieldID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const fieldID = parseInt(req.params.fieldID);
  getFieldByID(fieldID, mysqlPool)
    .then((field) => {
      if (field) {
        res.status(200).json(field);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch field.  Please try again later."
      });
    });
});

////////////////////////////////////////////////////////////////////////////////

function replaceFieldByID(fieldID, field, mysqlPool) {
  return new Promise((resolve, reject) => {
    field = validation.extractValidFields(field, fieldSchema);
    mysqlPool.query('UPDATE fields SET ? WHERE id = ?', [ field, fieldID ], function (err, result) {
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
router.put('/:fieldID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const fieldID = parseInt(req.params.fieldID);
  if (validation.validateAgainstSchema(req.body, fieldSchema)) {
    replaceFieldByID(fieldID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              field: `/fields/${fieldID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Unable to update specified field.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid field object"
    });
  }
});

////////////////////////////////////////////////////////////////////////////////

function deleteFieldByID(fieldID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM fields WHERE id = ?', [ fieldID ], function (err, result) {
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
router.delete('/:fieldID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const fieldID = parseInt(req.params.fieldID);
  deleteFieldByID(fieldID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete field.  Please try again later."
      });
    });
});


exports.router = router;
