const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('service.db');

module.exports.reservationTimesValidator = (req, res, next) => {
    var errors = [];

    var startTime = new Date(req.body.RESERVATION_START_TIME);
    var hour = startTime.getHours();
    if(hour < 8) errors.push("The start time must begin at least at 08:00");

    var endTime = new Date(req.body.RESERVATION_END_TIME);
    var hour = endTime.getHours();
    if(hour > 17 || (hour == 17 && endTime.getMinutes() > 0)) errors.push("The end time must end before 17:00");

    var minutesDifference = Math.round(((endTime - startTime)) / 1000) / 60;
    if(minutesDifference % 30 > 0) errors.push("The expected working interval must be a multiple of 30 minutes");
    
    if(errors.length > 0) return res.status(200).json({"error": errors});

    next();
}

module.exports.reservationRepairTimeValidator = (req, res, next) => {
    if(req.body.PROCESSING_TIME % 10 > 0) return res.status(200).json({"errors": "The repairing time must be a multiple of 10 minutes"});
    next();
}

module.exports.checkIntervalAvailability = (req, res, next) => {
    var body = req.body;
    db.get("SELECT * FROM RESERVATIONS WHERE (? > RESERVATION_START_TIME AND ? < RESERVATION_END_TIME) OR \
    ((? > RESERVATION_START_TIME AND ? < RESERVATION_END_TIME) OR (? <= RESERVATION_START_TIME AND \
    ? >= RESERVATION_END_TIME))", [body.RESERVATION_START_TIME, body.RESERVATION_START_TIME, 
    body.RESERVATION_END_TIME, body.RESERVATION_END_TIME, body.RESERVATION_START_TIME, 
    body.RESERVATION_END_TIME], 
        (err, rows) => {
            if(err) 
                {
                    return res.status(500).json({"error": err.message});
                }
            else if(rows) 
                {     
                    return res.status(200).json({"error": "The selected reservation interval is not entirely available."});           
                }
        });

    next();
}

module.exports.checkIntervalAvailabilityForModifyingReservation = (req, res, next) => {
    var body = req.body;
    db.get("SELECT * FROM RESERVATIONS WHERE ((? > RESERVATION_START_TIME AND ? < RESERVATION_END_TIME) OR \
    ((? > RESERVATION_START_TIME AND ? < RESERVATION_END_TIME) OR (? <= RESERVATION_START_TIME AND \
    ? >= RESERVATION_END_TIME)) AND RESERVATION_ID <> ?)", [body.RESERVATION_START_TIME, body.RESERVATION_START_TIME, 
    body.RESERVATION_END_TIME, body.RESERVATION_END_TIME, body.RESERVATION_START_TIME, 
    body.RESERVATION_END_TIME, req.params.id], 
        (err, rows) => {
            if(err) 
                {
                    return res.status(500).json({"error": err.message});
                }
            else if(rows) 
                {   
                    return res.status(200).json({"error": "The selected reservation interval is not entirely available."});           
                }
        });

    next();
}

module.exports.checkUserIsDisabled = (req, res, next) => {
    db.get("SELECT * FROM USERS WHERE USER_DISABLED='Y' AND USER_ID=?", [req.params.id],
        (err, rows) => {
            if(err) 
                {
                    return res.status(500).json({"error": err.message});
                }
            else if(rows) 
                {
                    return res.status(200).json({"message": "The user is already disabled"});
                }
    });

    next();
}

module.exports.checkCarIsDisabled = (req, res, next) => {
    db.get("SELECT * FROM CARS WHERE CAR_DISABLED='Y' AND USER_ID=?", [req.params.id],
        (err, rows) => {
            if(err) 
                {
                    return res.status(500).json({"error": err.message});
                }
            else if(rows) 
                {
                    return res.status(200).json({"message": "The car is already disabled"});
                }
    });

    next();
}

module.exports.checkPowerEquality = (req, res, next) => {
    if(req.body.CAR_HORSEPOWER != "" && req.body.CAR_KW_POWER != "") {
        if(parseInt(req.body.CAR_KW_POWER) != Math.floor((1/0.7457)*parseInt(req.body.CAR_HORSEPOWER))) {
            return res.status(200).json({"error": "The two provided powers (Horsepower and KW) are not matching"});
        }
    }

    if(req.body.CAR_HORSEPOWER === "" && req.body.CAR_KW_POWER === "") {
        return res.status(200).json({"error": "At least one type of power is required"});
    }

    if(req.body.CAR_HORSEPOWER != "" && req.body.CAR_KW_POWER === "") {
        req.body.CAR_KW_POWER = Math.floor((1/0.7457)*parseInt(req.body.CAR_HORSEPOWER));
    }

    if(req.body.CAR_HORSEPOWER === "" && req.body.CAR_KW_POWER != "") {
        req.body.CAR_HORSEPOWER = Math.floor(0.7457*parseInt(req.body.CAR_KW_POWER));
    }

    next();
}

module.exports.noReservationForDisabledUsers = (req, res, next) => {
    db.get("SELECT * FROM USERS WHERE USER_DISABLED='Y' AND USER_ID=?", [req.body.USER_ID],
        (err, rows) => {
            if(err) 
                {
                    return res.status(500).json({"error": err.message});
                }
            else if(rows) 
                {
                    return res.status(200).json({"message": "You cannot make a reservation for a disabled user"});
                }
    });

    next();
}

module.exports.noReservationForDisabledCars = (req, res, next) => {
    db.get("SELECT * FROM CARS WHERE CAR_DISABLED='Y' AND USER_ID=?", [req.body.CAR_ID],
        (err, rows) => {
            if(err) 
                {
                    return res.status(500).json({"error": err.message});
                }
            else if(rows) 
                {
                    return res.status(200).json({"message": "You cannot make a reservation for a user with a disabled car"});
                }
    });

    next();
}

module.exports.checkIfUserOwnsTheCar = (req, res, next) => {
    db.get("SELECT * FROM CARS WHERE USER_ID=? AND CAR_ID=?", [req.body.USER_ID, req.body.CAR_ID],
        (err, rows) => {
            if(err) 
                {
                    return res.status(500).json({"error": err.message});
                }
            else if(!rows) 
                {
                    return res.status(200).json({"message": "The reservation is not possible because the user does not own the car"});
                }
    });

    next();
}