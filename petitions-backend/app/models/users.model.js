const db = require('../../config/db');

const randtoken = require('rand-token');
const passwords = require('../services/passwords');

exports.checkAuth = async function(id, header) {
    console.log('Checking authorization of User ...');
    try {
        const conn = await db.getPool().getConnection();
        const authSQL = 'SELECT * from User WHERE (user_id)=?';
        const [result] = await conn.query(authSQL, id);
        conn.release();

        if (result.length == 0) {
            console.log(`User ${id} does not exist...`);
            return [null];
        } else if ((header == result[0].auth_token) && (header != null)) {
            console.log(`User ${id} is fully authorised...`)
            return [true, result[0]];
        } else {
            console.log(`User ${id} is not fully authorised...`)
            return [false, result[0]];
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.checkPhotoAuth = async function(id, header) {
    console.log('Checking authorization of User ...');
    try {
        const conn = await db.getPool().getConnection();
        const authSQL = 'SELECT * from User WHERE (auth_token)=?';
        const [result] = await conn.query(authSQL, header);
        conn.release();

        if (result.length == 0) {
            console.log(`No user with Auth Token provided ${id}...`);
            return null;
        } else if (result[0].user_id == id) {
            console.log(`Auth matches with User ${id}...`);
            return true;
        } else {
            console.log(`Auth does not match with User ${id}...`);
            return false;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.checkEmailNotUsed = async function(email) {
    console.log(`Checking if ${email} is taken...`);
    try {
        const conn = await db.getPool().getConnection();
        const emailSQL = 'SELECT * from User WHERE (email)=?';
        const [result] = await conn.query(emailSQL, email);
        conn.release();

        if (result.length == 0) {
            console.log(`${email} is available...`);
            return true;
        } else {
            console.log(`${email} is not available...`);
            return false;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.checkPassId = async function(id, password) {
    console.log(`Checking if User ${id}'s password "${password}" matches...`);
    try {
        const conn = await db.getPool().getConnection();
        const passSQL = 'SELECT * from User WHERE (user_id)=?';
        const [result] = await conn.query(passSQL, id);
        conn.release();

        if (result.length == 0) {
            console.log(`Cannot find User ${id} in the database...`);
            return null;
        } else {
            if (await passwords.compare(password, result[0].password)) {
                console.log(`Password matches with User ${id}...`);
                return true;
            } else {
                console.log(`Password does not match with User ${id}...`);
                return false;
            }
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.checkPassEmail = async function(email, password) {
    console.log(`Checking if User ${email} password "${password}" matches...`);
    try {
        const conn = await db.getPool().getConnection();
        const passSQL = 'SELECT * from User WHERE (email)=?';
        const [result] = await conn.query(passSQL, email);
        conn.release();

        if (result.length == 0) {
            console.log(`Cannot find User ${email} in the database...`);
            return [null];
        } else {
            const correct = await passwords.compare(password, result[0].password);
            if (correct) {
                console.log(`Password matches with User ${email}...`);
                return [true, result[0].user_id];
            } else {
                console.log(`Password does not match with User ${email}...`);
                return [false, result[0].user_id];
            }
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.getRows = async function(id) {
    console.log(`Requesting for details of User ${id}...`);
    try {
        const conn = await db.getPool().getConnection();
        const checkEmailSQL = 'Select * from User WHERE (user_id)=?';
        const [rows] = await conn.query(checkEmailSQL, id);
        conn.release();

        return rows[0];
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.register = async function(user) {
    console.log('Register a User in the database...');
    try {
        const conn = await db.getPool().getConnection();
        const checkEmailSQL = 'Select * from User where (email)=?'
        const [rows] = await conn.query(checkEmailSQL, user.email);
        conn.release();

        if (rows.length == 1) {
            return -1;
        }

        const createSQL = 'INSERT INTO User (name, password, email, city, country) VALUES (?, ?, ?, ?, ?)';
        var userValues = [
            user.name, await passwords.hash(user.password), user.email,
            null, null,
        ];

        if ('city' in user) {
            userValues[3] = user.city;
        }
        if ('country' in user) {
            userValues[4] = user.country;
        }

        const result = await conn.query(createSQL, userValues);
        conn.release();
        return {
            "userId": result[0].insertId
        };
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.login = async function(user) {
    console.log('Request to login User into server...');
    const found = await exports.checkPassEmail(user.email, user.password);

    if (found[0] == null) {
        return -1;
    } else if (found[0]) {
        const randToken = randtoken.generate(32);

        try {
            const conn = await db.getPool().getConnection();
            const checkEmailSQL = 'UPDATE User SET auth_token=? WHERE email=?'
            await conn.query(checkEmailSQL, [randToken, user.email]);
            conn.release();
            return {
                "userId": found[1],
                "token": randToken
            };
        } catch (err) {
            console.error('An error occured when attempting to query database..');
            console.log(err.sql);
            throw err;
        }

    } else {
        return -2;
    }
};

exports.logout = async function(header) {
    console.log('Request to logout User...');
    var userId;
    const conn = await db.getPool().getConnection();

    try {
        const searchSQL = 'SELECT * from User where (auth_token)=?';
        const [rows] = await conn.query(searchSQL, header);
        conn.release();

        if (rows.length == 0) {
            return false;
        } else {
            userId = rows[0].user_id;

            const logoutSQL = 'UPDATE User SET auth_token = NULL WHERE (user_id) = ?';
            await conn.query(logoutSQL, userId);
            conn.release();
            console.log(`Logged out of User ${userId}...`);
            return true;
        }
    } catch (err) {
        console.log(err);
        console.error('An error occured when attempting to query database..');
        err.hasbeenLogged = true;
    }
};

exports.getUser = async function(id, header) {
    console.log('Request to get User from database...');
    try {
        const correct = await exports.checkAuth(id, header);

        let auth = correct[0];
        let rows = correct[1];

        if (auth == null) {
            return -1;
        } else if (auth) {
            if ((rows.city == null) && (rows.country == null)) {
                return {
                    "name": rows.name,
                    "email": rows.email
                };
            } else if (rows.city == null) {
                return {
                    "name": rows.name,
                    "country": rows.country,
                    "email": rows.email
                };
            } else if (rows.country == null) {
                return {
                    "name": rows.name,
                    "city": rows.city,
                    "email": rows.email
                };
            } else {
                return {
                    "name": rows.name,
                    "city": rows.city,
                    "country": rows.country,
                    "email": rows.email
                };
            }
        } else {
            if ((rows.city == null) && (rows.country == null)) {
                return {
                    "name": rows.name
                };
            } else if (rows.city == null) {
                return {
                    "name": rows.name,
                    "country": rows.country
                };
            } else if (rows.country == null) {
                return {
                    "name": rows.name,
                    "city": rows.city
                };
            } else {
                return {
                    "name": rows.name,
                    "city": rows.city,
                    "country": rows.country
                };
            }
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.modifyUser = async function(id, data) {
    console.log('Request to modify User in database...');
    const beforeData = await exports.getRows(id);
    var dataSame = true;

    if ('name' in data) {
        if (beforeData.name != data.name) {
            dataSame = false;
        }
    }

    if ('email' in data) {
        if (beforeData.email != data.email) {
            dataSame = false;
        }
    }

    if ('password' in data) {
        if (data.password != data.currentPassword) {
            dataSame = false;
        }
    }

    if ('city' in data) {
        if (beforeData.city != data.city) {
            dataSame = false;
        }
    }
    if ('country' in data) {
        if (beforeData.country != data.country) {
            dataSame = false;
        }
    }

    if (dataSame) {
        console.log(`Changes were not made to User ${id}...`);
        return false;
    }

    var prepareSQL = 'UPDATE User SET ';
    var count = 0;
    var values = [];

    if ('name' in data) {
        prepareSQL += 'name = ?, ';
        values.push(data.name);
    }
    if ('email' in data) {
        prepareSQL += 'email = ?, ';
        values.push(data.email);
    }
    if ('password' in data) {
        prepareSQL += 'password = ?, ';
        values.push(await passwords.hash(data.password));
    }
    if ('city' in data) {
        prepareSQL += 'email = ?, ';
        values.push(data.city);
    }
    if ('country' in data) {
        prepareSQL += 'country = ?, ';
        values.push(data.country);
    }
    prepareSQL = prepareSQL.substring(0, prepareSQL.length - 2);

    prepareSQL += ' WHERE user_id = ?';
    values.push(id)

    try {
        const conn = await db.getPool().getConnection();
        const result = await conn.query(prepareSQL, values);
        console.log(`Changes were made to User ${id}...`);
        return true;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.getUsersPhoto = async function(id) {
    console.log('Request to get Users photo...');
    try {
        const conn = await db.getPool().getConnection();
        const photoSQL = 'SELECT photo_filename from User where user_id=?';
        const [result] = await conn.query(photoSQL, id);
        conn.release();

        console.log(result);

        if (result.length) {
            return result[0].photo_filename;
        } else {
            return null;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.setUsersPhoto = async function(id, filename) {
    console.log('Request to set Users photo...');
    try {
        const conn = await db.getPool().getConnection();
        const setSQL = 'UPDATE User SET photo_filename=? WHERE user_id=?';
        await conn.query(setSQL, [filename, id]);
        conn.release();
        return;

    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};

exports.deleteUsersPhoto = async function(id) {
    console.log('Request to delete Users photo...');
    try {
        const rows = await exports.getRows(id);

        if (rows.photo_filename == null) {
            console.log('No file to delete...');
            return -1;
        } else {
            console.log('File found, trying to delete...');
            const conn = await db.getPool().getConnection();
            const deleteSQL = 'UPDATE User SET photo_filename=? WHERE user_id=?';
            await conn.query(deleteSQL, [null, id]);
            conn.release();
            console.log('Removed filename from database...');
            return rows.photo_filename;
        }
    } catch (err) {
        console.error('An error occured when attempting to query database..');
        console.log(err.sql);
        throw err;
    }
};
