/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }
  get (id, params) { 
    return Promise.resolve({id});
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
