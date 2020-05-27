const petitions = require('../controllers/petitions.controller');

module.exports = function(app) {

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.getCategories);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.viewPetition)
        .patch(petitions.modifyPetition)
        .delete(petitions.deletePetition);

    app.route(app.rootUrl + '/petitions')
        .get(petitions.viewPetitions)
        .post(petitions.addPetition);
};
