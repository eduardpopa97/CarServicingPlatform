const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('service.db');

module.exports.createCar = (req, res) => {
    var body = req.body;
    db.run("INSERT INTO CARS (CAR_ID, USER_ID, CAR_REGISTRATION_NUMBER, CAR_CHASSIS_NUMBER, \
            CAR_BRAND, CAR_MODEL, CAR_MANUFACTURING_YEAR, CAR_ENGINE_TYPE, CAR_ENGINE_CAPACITY, \
            CAR_HORSEPOWER, CAR_KW_POWER, CAR_DISABLED) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'N')", 
            [body.CAR_ID, body.USER_ID, body.CAR_REGISTRATION_NUMBER, body.CAR_CHASSIS_NUMBER, 
            body.CAR_BRAND, body.CAR_MODEL, body.CAR_MANUFACTURING_YEAR, body.CAR_ENGINE_TYPE, 
            body.CAR_ENGINE_CAPACITY, body.CAR_HORSEPOWER, body.CAR_KW_POWER], 
            function (err) {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({"CAR_ID": this.lastID});
            });
}

module.exports.getAllCars = (req, res) => {
    db.all("SELECT * FROM CARS", [], 
            (err, cars) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({cars});
            });
}

module.exports.getCarById = (req, res) => {
    db.get("SELECT * FROM CARS WHERE CAR_ID=?", [req.params.id], 
            (err, car) => {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({car});
            });
}

module.exports.updateCar = (req, res) => {
    var body = req.body;
    db.run("UPDATE CARS \
            SET USER_ID=?, CAR_REGISTRATION_NUMBER=?, CAR_CHASSIS_NUMBER=?, \
            CAR_BRAND=?, CAR_MODEL=?, CAR_MANUFACTURING_YEAR=?, CAR_ENGINE_TYPE=?, CAR_ENGINE_CAPACITY=?, \
            CAR_HORSEPOWER=?, CAR_KW_POWER=? \
            WHERE CAR_ID=?", 
            [body.USER_ID, body.CAR_REGISTRATION_NUMBER, body.CAR_CHASSIS_NUMBER, body.CAR_BRAND, 
            body.CAR_MODEL, body.CAR_MANUFACTURING_YEAR, body.CAR_ENGINE_TYPE, body.CAR_ENGINE_CAPACITY, 
            body.CAR_HORSEPOWER, body.CAR_KW_POWER, req.params.id],
            function (err) {
                if(err) 
                    {
                        return res.status(500).json({"error": err.message});
                    }
                res.status(200).json({"updatedID": this.changes});
            });
}

module.exports.disableCar = (req, res) => {
    db.run("UPDATE CARS SET CAR_DISABLED='Y' WHERE CAR_ID=?", [req.params.id],
    (err) => {
        if(err) 
            {
                return res.status(500).json({"error": err.message});
            }
            if(!res.headersSent) res.status(200).json({"message": "The car has been disabled"});
        })  
}