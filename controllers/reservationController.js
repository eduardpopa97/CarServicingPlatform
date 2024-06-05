const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('service.db');

module.exports.createReservation = (req, res) => {
    var body = req.body;
    db.run("INSERT INTO RESERVATIONS (RESERVATION_ID, USER_ID, CAR_ID, RESERVATION_METHOD, \
            REQUIRED_ACTION, RESERVATION_START_TIME, RESERVATION_END_TIME, MARKED_FOR_DISCOUNT, \
            DISCOVERED_PROBLEMS, ACTION_TAKEN, PROCESSING_TIME) VALUES (?, ?, ?, ?, ?, ?, ?, 'N', '', '', '')", 
            [body.RESERVATION_ID, body.USER_ID, body.CAR_ID, body.RESERVATION_METHOD, 
            body.REQUIRED_ACTION, body.RESERVATION_START_TIME, body.RESERVATION_END_TIME], 
            function (err) {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                if(!res.headersSent) res.status(200).json({"RESERVATION_ID": this.lastID});
            });
}

module.exports.getAllReservations = (req, res) => {
    db.all("SELECT * FROM RESERVATIONS", [], 
            (err, reservations) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({reservations});
            });
}

module.exports.getReservationById = (req, res) => {
    db.get("SELECT * FROM RESERVATIONS WHERE RESERVATION_ID=?", [req.params.id], 
            (err, reservation) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({reservation});
            });
}

module.exports.updateReservation = (req, res) => {
    var body = req.body;
    db.run("UPDATE RESERVATIONS \
            SET USER_ID=?, CAR_ID=?, RESERVATION_METHOD=?, \
            REQUIRED_ACTION=?, RESERVATION_START_TIME=?, RESERVATION_END_TIME=?, \
            DISCOVERED_PROBLEMS=?, ACTION_TAKEN=?, PROCESSING_TIME=? \
            WHERE RESERVATION_ID=?", 
            [body.USER_ID, body.CAR_ID, body.RESERVATION_METHOD, body.REQUIRED_ACTION, 
            body.RESERVATION_START_TIME, body.RESERVATION_END_TIME, 
            body.DISCOVERED_PROBLEMS, body.ACTION_TAKEN, body.PROCESSING_TIME, req.params.id],
            function (err) {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                if(!res.headersSent) res.status(200).json({"updatedID": this.changes});
            });
}

module.exports.cancelReservation = (req, res) => {
    db.run("DELETE FROM RESERVATIONS WHERE RESERVATION_ID=?", [req.params.id],
    function(err) {
        if(err) 
            {
                return res.status(500).json({"error": err.message});
            }
        res.status(200).json({"message": "The reservation has been cancelled"});
    })
}

module.exports.getEligibleUsersForDiscount = (req, res) => {
    db.all('SELECT USERS.* \
            FROM USERS, RESERVATIONS \
            WHERE USERS.USER_ID = RESERVATIONS.USER_ID \
            AND RESERVATIONS.MARKED_FOR_DISCOUNT = "N" \
            AND RESERVATIONS.RESERVATION_START_TIME <= ? \
            AND RESERVATIONS.RESERVATION_START_TIME >= ? \
            GROUP BY USERS.USER_ID \
            HAVING COUNT(*) >= 3', 
            [new Date().toISOString().split('T')[0], new Date(new Date().setMonth(new Date().getMonth()-6)).toISOString().split('T')[0]], 
            (err, eligibleUsers) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({eligibleUsers});
            });
}

module.exports.applyDiscountForUser = (req, res) => {
    db.run(`UPDATE RESERVATIONS \
            SET MARKED_FOR_DISCOUNT=\"Y\" \
            WHERE USER_ID=? \ 
            AND RESERVATION_START_TIME <= ? \ 
            AND RESERVATION_START_TIME >= ?`,
            [req.params.id, new Date().toISOString().split('T')[0], 
            new Date(new Date().setMonth(new Date().getMonth()-6)).toISOString().split('T')[0]],
            (err) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                if(!res.headersSent) res.status(200).json({"message": "The discount has been applied."});
            });
}