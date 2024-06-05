const express = require('express');
const userController = require('../controllers/userController');
const carController = require('../controllers/carController');
const reservationController = require('../controllers/reservationController');
const validator = require('./validators');

const router = express.Router();

router.post("/user", userController.createUser);
router.get("/user", userController.getAllUsers);
router.get("/user/:id", userController.getUserById);
router.patch("/user/:id", userController.updateUser);
router.patch("/user/disable/:id", validator.checkUserIsDisabled, userController.disableUser);

router.post("/car", validator.checkPowerEquality, carController.createCar);
router.get("/car", carController.getAllCars);
router.get("/car/:id", carController.getCarById);
router.patch("/car/:id", carController.updateCar);
router.patch("/car/disable/:id", validator.checkCarIsDisabled, carController.disableCar);

router.post("/reservation", [validator.reservationTimesValidator, validator.checkIntervalAvailability, validator.noReservationForDisabledUsers, validator.noReservationForDisabledCars, validator.checkIfUserOwnsTheCar], reservationController.createReservation);
router.get("/reservation", reservationController.getAllReservations);
router.get("/reservation/:id", reservationController.getReservationById);
router.patch("/reservation/:id", [validator.reservationTimesValidator, validator.reservationRepairTimeValidator, validator.checkIntervalAvailabilityForModifyingReservation], reservationController.updateReservation);
router.delete("/reservation/:id", reservationController.cancelReservation);

router.get("/eligible", reservationController.getEligibleUsersForDiscount);
router.patch("/eligible/applyDiscount/:id", reservationController.applyDiscountForUser);

module.exports = router;