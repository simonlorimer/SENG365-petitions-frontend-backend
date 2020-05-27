const usersPhotos = require('../controllers/users.photos.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(usersPhotos.getUsersPhoto)
        .put(usersPhotos.setUsersPhoto)
        .delete(usersPhotos.deleteUsersPhoto);
};
