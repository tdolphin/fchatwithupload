// Initializes the `download` service on path `/download
const createService = require('./download.class.js');
const hooks = require('./download.hooks');
const filters = require('./download.filters');
var path = require('path');
var fs = require('fs');

module.exports = function () {
  const app = this;
  const options = {
    name: 'download',
  };
  const filestore = app.get('filestore');
  // Initialize our service with any options it requires
  app.use('/download', 
    function(req,res,next) {
      if(!req.headers.authorization && req.query.t) {
        req.headers.authorization = req.query.t;
        req.feathers.headers.authorization = req.query.t;
      }
      next();
    },
    createService(options),
    function(req,res) {   
      const a = res.data;
      const fileondisk = path.join(filestore,'' + a._id);
      if(!fs.existsSync(fileondisk)) {
        res.status(404).end();
      } else {
        res.sendFile( fileondisk,
          {
            headers: {
              'Content-Type' : a.mimetype,
              'Content-Disposition' : 'attachment; filename="' + a.filename + '"',
              'Content-Length' : a.filesize,
              'Expires':0,
              'Cache-Control': 'must-revalidate'
            }
          },function(err){
            if(err) console.log(err);
          }
        );
      }
    }
  );

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('download');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
