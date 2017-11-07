const { authenticate } = require('feathers-authentication').hooks;
const { iff, isProvider, populate } = require('feathers-hooks-common');

const processUpload = require('../../hooks/process-upload');

const finishUpload = require('../../hooks/finish-upload');

module.exports = {
  before: {
    all: [ authenticate('jwt')],//iff(isProvider('external'),authenticate('jwt')) ],
    find: [],
    get: [],
    create: [processUpload()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      populate({
        schema: {
          include: [{
            service: 'users',
            nameAs: 'user',
            parentField: 'userId',
            childField: '_id'
          }]
        }
      })],
    find: [],
    get: [],
    create: [finishUpload()],
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
