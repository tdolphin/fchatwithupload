'use strict';

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function() {
  return function(hook) {
    // The authenticated user
    const user = hook.params.user;
    if (!hook.data.attchfile && hook.params.file){
      const file = hook.params.file;
      hook.data = {
        filename: file.originalname,
        mimetype: file.mimetype,
        filesize: file.size,
        // Set the user id
        userId: user._id,
        // Add the current time via `getTime`
        createdAt: new Date().getTime()
      };
    }
    
    // Override the original data
    

    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations
    return Promise.resolve(hook);
  };
};