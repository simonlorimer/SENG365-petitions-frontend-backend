const Users = require('../models/users.model');

function checkEmailValid(email) {
    return email.includes('@');
}

exports.checkDataValid = async function(data, id) {
    console.log('Checking data is valid...');
    try {
        if ('email' in data) { //check email is valid
            if (checkEmailValid(data.email) == false) {
                return [false, 'Email is not valid...'];
            } else if (await Users.checkEmailNotUsed(data.email) == false) {
                return [false, 'Email is taken...'];
            }
        }

        if ('name' in data) { //check name is valid
            if (data.name.length < 1) {
                return [false, 'Name is empty...'];
            }
        }

        if ('password' in data) { //check name is valid
            if ('currentPassword' in data) {
                if (data.password == data.currentPassword) {
                    return [false, 'Password is the same...'];
                }
                if ((data.password.length < 1)) {
                    return [false, 'Password is not valid...'];
                } else if (data.currentPassword.length < 1) {
                    return [false, 'currentPassword is not valid...'];
                }

                const passwordMatch = await Users.checkPassId(id, data.currentPassword);
                if (passwordMatch == null) {
                    return [false, 'Cannot find User in database...'];
                } else if (passwordMatch == false) {
                    return [false, 'Password does not match User in database...'];
                }
            }
        }

        if ('city' in data) { //check city is valid
            if (data.city.length < 1) {
                return [false, 'City is not valid...'];
            }
        }

        if ('country' in data) { //check country is valid
            if (data.country.length < 1) {
                return [false, 'Country is not valid...'];
            }
        }
        return [true, 'Data is valid...'];
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.register = async function(req, res) {
    console.log('Attempting to register a user in the database...');
    try {
        if (checkEmailValid(req.body.email)) {
            if (('name' in req.body) && (req.body.name.length > 0)) {
                if (('password' in req.body) && (req.body.password.length > 0)) {
                    const result = await Users.register(req.body);
                    if (result == -1) {
                        res.statusMessage = "Email already exists in database";
                    } else {
                        console.log('Registration successful...');
                        res.statusMessage = "OK";
                        res.status(201).send(result);
                    }
                }
            }
        }
        res.statusMessage = "Bad Request";
        res.status(400).send();
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.login = async function(req, res) {
    console.log(`Request to login to User ${req.body.email}...`);
    try {
        if (('email' in req.body) && (checkEmailValid(req.body.email))) {
            if (('password' in req.body) && (req.body.password.length > 0)) {
                const result = await Users.login(req.body);
                if (result == -1) {
                    res.statusMessage = "Bad Request";
                    res.status(400).send();
                } else if (result == -2) {
                    res.statusMessage = "Bad Request";
                    res.status(400).send();
                } else {
                    res.statusMessage = "OK";
                    res.status(200).send(result);
                }
            } else {
                res.statusMessage = "Bad Request";
                res.status(400).send();
            }
        } else {
            res.statusMessage = "Bad Request";
            res.status(400).send();
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.logout = async function(req, res) {
    console.log('Request to logout of current User...');
    try {
        const header = req.header('X-Authorization');
        const logout = await Users.logout(header);
        if (logout) {
            res.removeHeader('X-Authorization');
            res.statusMessage = "OK";
            res.status(200).send();
        } else {
            res.statusMessage = "Unauthorized";
            res.status(401).send();
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.getUser = async function(req, res) {
    console.log('Request to get information about User...');
    const id = req.params.id;
    const header = req.header('X-Authorization');
    try {
        const result = await Users.getUser(id, header);
        if (result == -1) {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else {
            res.statusMessage = "OK";
            res.status(200).send(result);
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.modifyUser = async function(req, res) {
    console.log('Requesting to modify User in database...');
    const id = req.params.id;
    try {
        const dataValid = await exports.checkDataValid(req.body, id);
        if (!dataValid[0]) {
            console.log(`Data is not valid: ${dataValid[1]}...`);
            res.statusMessage = 'Bad Request';
            res.status(400).send();
        } else {
            console.log('Checking authentication...');
            const header = req.header('X-Authorization');
            const checkAuth = await Users.checkAuth(id, header);
            let auth = checkAuth[0]
            if (!checkAuth[0]) {
                res.statusMessage = 'Unauthorized';
                res.status(401).send();
            } else {
                console.log('Requesting to modify User in database...');
                const result = await Users.modifyUser(id, req.body);
                if (result) {
                    res.statusMessage = "OK";
                    res.status(200).send();
                } else {
                    res.statusMessage = "Bad Request";
                    res.status(400).send();
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};
