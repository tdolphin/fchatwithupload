const assert = require('assert');
const app = require('../../src/app');

describe('\'jjj\' service', () => {
  it('registered the service', () => {
    const service = app.service('jjj');

    assert.ok(service, 'Registered the service');
  });
});
