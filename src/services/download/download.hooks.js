const { authenticate } = require('feathers-authentication').hooks;

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [
      function getdownloadfileinfo (hook) {
        //console.log(hook.result.id);
        return hook.app.service('uploads').get(hook.result.id).then(fileinfo=> {
          hook.result = fileinfo;
          return hook;
        });
      }  
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
