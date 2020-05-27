const petitionSignature = require('../controllers/petitions.signatures.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitionSignature.getSignatures)
        .post(petitionSignature.signPetition)
        .delete(petitionSignature.removeSignature);
};
