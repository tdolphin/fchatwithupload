// Initializes the `uploads` service on path `/uploads`
const createService = require('feathers-nedb');
const createModel = require('../../models/uploads.model');
const hooks = require('./uploads.hooks');

const filters = require('./uploads.filters');
var multer = require('multer');


const imageFilter = function (req, file, cb) {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};


module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const filestore = app.get('filestore');
  const upload = multer({ dest: filestore, fileFilter: imageFilter });

  const options = {
    name: 'uploads',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/uploads', 
    upload.single('attchfile'),
    function(req,res,next) {
      req.feathers.file = req.file;
      next();
    },
    createService(options)
  );

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('uploads');

  service.hooks(hooks);
 
  if (service.filter) {
    service.filter(filters);
  }
};
