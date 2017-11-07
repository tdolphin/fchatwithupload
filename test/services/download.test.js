const assert = require('assert');
const app = require('../../src/app');

describe('\'download\' service', () => {
  it('registered the service', () => {
    const service = app.service('download/:fileId');

    assert.ok(service, 'Registered the service');
  });
});
