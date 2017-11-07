// Initializes the `jjj` service on path `/jjj`
const createService = require('./jjj.class.js');
const hooks = require('./jjj.hooks');
const filters = require('./jjj.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'jjj',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/jjj', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('jjj');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
