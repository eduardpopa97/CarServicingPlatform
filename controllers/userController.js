const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('service.db');

module.exports.createUser = (req, res) => {
    var body = req.body;
    db.run("INSERT INTO USERS (USER_ID, USER_FIRST_NAME, USER_LAST_NAME, USER_PHONE_NUMBERS, \
            USER_MAIL, USER_DISABLED) VALUES (?, ?, ?, ?, ?, 'N')", 
            [body.USER_ID, body.USER_FIRST_NAME, body.USER_LAST_NAME, body.USER_PHONE_NUMBERS, body.USER_MAIL], 
            function (err) {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({"USER_ID": this.lastID});
            });
}

module.exports.getAllUsers = (req, res) => {
    db.all("SELECT * FROM USERS", [], 
            (err, users) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({users});
            });
}

module.exports.getUserById = (req, res) => {
    db.get("SELECT * FROM USERS WHERE USER_ID=?", [req.params.id], 
            (err, user) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({user});
            });
}

module.exports.updateUser = (req, res) => {
    var body = req.body;
    db.run("UPDATE USERS \
            SET USER_FIRST_NAME=?, USER_LAST_NAME=?, USER_PHONE_NUMBERS=?, USER_MAIL=? \
            WHERE USER_ID=?", 
            [body.USER_FIRST_NAME, body.USER_LAST_NAME, body.USER_PHONE_NUMBERS, body.USER_MAIL, 
            req.params.id],
            function (err) {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({"updatedID": this.changes});
            });
}

module.exports.disableUser = (req, res) => {
    db.run("UPDATE USERS SET USER_DISABLED='Y' WHERE USER_ID=?", [req.params.id],
    (err) => {
        if(err) 
            {
                return res.status(500).json({"error": err.message});
            }
        if(!res.headersSent) res.status(200).json({"message": "The user has been disabled"});
    });
}
