// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
'use strict';

var fs = require('fs');


// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function() {
  return function finishUpload(hook) {
    const storepath = hook.params.file.destination + '/';
    
    fs.rename(storepath + hook.params.file.filename, storepath + hook.result._id, function(err) {
      if ( err ) console.log('File rename ERROR: ' + err);
    });

    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations
    return Promise.resolve(hook);
  };
};