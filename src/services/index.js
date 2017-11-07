const messages = require('./messages/messages.service.js');
const users = require('./users/users.service.js');
const uploads = require('./uploads/uploads.service.js');
const download = require('./download/download.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(messages);
  app.configure(users);
  app.configure(uploads);
  app.configure(download);
};
