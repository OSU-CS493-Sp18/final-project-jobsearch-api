const router = require('express').Router();
const validation = require('../lib/validation');

/*
 * Schema describing required/optional fields of a position object.
 */
const companySchema = {
  id: { required: false },
  companyName: {required: true },
  description: { required: false },
  glassdoorRating: { required: true },
  website: { required: false },
  sizeCategory: { required: true },
  hqCity: { required: true },
  hqState: { required: true }
};


function getCompaniesCount(mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT COUNT(*) AS count FROM companies', function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].count);
      }
    });
  });
}


function getCompaniesPage(page, totalCount, mysqlPool) {
  return new Promise((resolve, reject) => {

    const numPerPage = 10;
    const lastPage = Math.max(Math.ceil(totalCount / numPerPage), 1);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * numPerPage;

    mysqlPool.query(
      'SELECT * FROM companies ORDER BY id LIMIT ?,?',
      [ offset, numPerPage ],
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve({
            companies: results,
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
  getCompaniesCount(mysqlPool)
    .then((count) => {
      return getCompaniesPage(parseInt(req.query.page) || 1, count, mysqlPool);
    })
    .then((companiesPageInfo) => {
      /*
       * Generate HATEOAS links for surrounding pages and then send response.
       */
      companiesPageInfo.links = {};
      let { links, pageNumber, totalPages } = companiesPageInfo;
      if (pageNumber < totalPages) {
        links.nextPage = `/companies?page=${pageNumber + 1}`;
        links.lastPage = `/companies?page=${totalPages}`;
      }
      if (pageNumber > 1) {
        links.prevPage = `/companies?page=${pageNumber - 1}`;
        links.firstPage = '/companies?page=1';
      }
      res.status(200).json(companiesPageInfo);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "Error fetching companies list.  Please try again later."
      });
    });
});

////////////////////////////////////////////////////////////////////////////////

function insertNewCompany(company, mysqlPool, mongoDB) {
  return new Promise((resolve, reject) => {
    company = validation.extractValidFields(company, companySchema);
    company.id = null;
    mysqlPool.query(
      'INSERT INTO companies SET ?',
      company,
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
  if (validation.validateAgainstSchema(req.body, companySchema)) {
    insertNewCompany(req.body, mysqlPool, mongoDB)
      .then((id) => {
        res.status(201).json({
          id: id,
          links: {
            company: `/companies/${id}`
          }
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error inserting company into DB.  Please try again later.",
          output: err
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid company object."
    });
  }
});


////////////////////////////////////////////////////////////////////////////////

function getCompanyByID(companyID, mysqlPool) {

  return new Promise((resolve, reject) => {
    mysqlPool.query('SELECT * FROM companies WHERE id = ?', [ companyID ], function (err, results) {
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
router.get('/:companyID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const companyID = parseInt(req.params.companyID);
  getCompanyByID(companyID, mysqlPool)
    .then((company) => {
      if (company) {
        res.status(200).json(company);
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to fetch company.  Please try again later."
      });
    });
});

////////////////////////////////////////////////////////////////////////////////

function replaceCompanyByID(companyID, company, mysqlPool) {
  return new Promise((resolve, reject) => {
    company = validation.extractValidFields(company, companySchema);
    mysqlPool.query('UPDATE companies SET ? WHERE id = ?', [ company, companyID ], function (err, result) {
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
router.put('/:companyID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const companyID = parseInt(req.params.companyID);
  if (validation.validateAgainstSchema(req.body, companySchema)) {
    replaceCompanyByID(companyID, req.body, mysqlPool)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              company: `/companies/${companyID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Unable to update specified company.  Please try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid company object"
    });
  }
});

////////////////////////////////////////////////////////////////////////////////

function deleteCompanyByID(companyID, mysqlPool) {
  return new Promise((resolve, reject) => {
    mysqlPool.query('DELETE FROM companies WHERE id = ?', [ companyID ], function (err, result) {
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
router.delete('/:companyID', function (req, res, next) {
  const mysqlPool = req.app.locals.mysqlPool;
  const companyID = parseInt(req.params.companyID);
  deleteCompanyByID(companyID, mysqlPool)
    .then((deleteSuccessful) => {
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: "Unable to delete company.  Please try again later."
      });
    });
});


exports.router = router;
