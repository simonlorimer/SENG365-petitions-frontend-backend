const PetitionSignatures = require('../models/petitions.signatures.model');
const Petitions = require('../models/petitions.model');

exports.getSignatures = async function(req, res) {
    console.log('Request to get signatures of given Petition...');
    try {
        const id = req.params.id;
        const petitionExists = await Petitions.viewPetition(id);
        if (petitionExists == false) {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else {
            const result = await PetitionSignatures.getSignatures(req.params.id);
            res.statusMessage = "OK";
            res.status(200).send(result);
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.signPetition = async function(req, res) {
    console.log('Request to sign Petition...');
    try {
        const id = req.params.id;
        const checkClosed = await Petitions.checkPetitionClosed(id);
        if (checkClosed == null) {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else if (checkClosed == false) {
            res.statusMessage = "Forbidden";
            res.status(403).send();
        } else {
            const header = req.header('X-Authorization');
            if ((header == null) || (header == '')) {
                res.statusMessage = "Unauthorized";
                res.status(401).send();
            } else {
                const checkToken = await Petitions.getTokenUser(header);
                if ((checkToken[0] == false) && (checkToken[1] == null)) {
                    res.statusMessage = "Unauthorized";
                    res.status(401).send();
                } else {
                    const userId = checkToken[1];
                    const checkSigned = await PetitionSignatures.checkAlreadySigned(id, userId);
                    if (checkSigned == true) {
                        res.statusMessage = "Forbidden";
                        res.status(403).send();
                    } else {
                        await PetitionSignatures.signPetition(id, userId);
                        res.statusMessage = "OK";
                        res.status(201).send();
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.removeSignature = async function(req, res) {
    console.log('Request to remove Signature from Petition...');
    try {
        const id = req.params.id;
        const checkClosed = await Petitions.checkPetitionClosed(id);
        if (checkClosed == null) {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else if (checkClosed == false) {
            res.statusMessage = "Forbidden";
            res.status(403).send();
        } else {
            const header = req.header('X-Authorization');
            const checkToken = await Petitions.getTokenUser(header);
            if ((checkToken[0] == false) && (checkToken[1] == null)) {
                res.statusMessage = "Unauthorized";
                res.status(401).send();
            } else {
                const userId = checkToken[1];
                const checkSigned = await PetitionSignatures.checkAlreadySigned(id, userId);
                if (checkSigned == false) {
                    res.statusMessage = "Forbidden";
                    res.status(403).send();
                } else {
                    await PetitionSignatures.removeSignature(id, userId);
                    res.statusMessage = "OK";
                    res.status(200).send();

                }
            }
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};
