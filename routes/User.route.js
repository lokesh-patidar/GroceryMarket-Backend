const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/user.model");
const { addAdminId } = require("../middlewares/addAdminId.middleware");
const { AuthValidator } = require("../middlewares/Auth.middleware");
const { ValidationForProducts } = require("../middlewares/ValidationForProducts");
require('dotenv').config();


const userRouter = express.Router();
userRouter.use(addAdminId);


userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (user) {
            console.log(user);
            if (user.adminID) {
                bcrypt.compare(password, user.password, async (err, result) => {

                    if (result) {
                        const token = jwt.sign({ userID: user._id, adminID: user.adminID }, process.env.key);
                        res.send({
                            Message: "Admin Login Successful",
                            adminID: user.adminID,
                            userKey: user._id,
                            token
                        });
                    }
                    else {
                        res.send({ Message: "Wrong admin credential!" });
                    }
                });
            }
            else {
                bcrypt.compare(password, user.password, async (err, result) => {

                    if (result) {
                        const token = jwt.sign({ userID: user._id }, process.env.key);
                        res.send({
                            Message: "User Login Successful",
                            userKey: user._id,
                            token
                        });
                    }
                    else {
                        res.send({ Message: "Wrong user credential!" });
                    }
                });
            }
        }
        else {
            res.send({ Message: "Wrong credential!" });
        }
    }
    catch (err) {
        res.send({ Message: "Usen can not login!" });
        console.log(err);
    }
});


userRouter.post("/admin/signup", async (req, res) => {
    const { username, email, password,mobileNo, adminID } = req.body;
    const isAlready = await UserModel.findOne({ "email": email });

    try {
        if (isAlready === null || isAlready.email !== email) {
            bcrypt.hash(password, 4, async (err, hash) => {
                if (err) {
                    console.log(err);
                    res.send("Err");
                }
                else {
                    let user = new UserModel({ username, email, password: hash,mobileNo, adminID });
                    await user.save();
                    res.send({ Message: "Admin Registered Successfully!" });
                    console.log(user);
                }
            });
        }
        else {
            res.send({ Message: "Admin already registered!" });
        }
    }
    catch (err) {
        res.send({ Message: "Admin Registration Failed!" });
        console.log(err);
    }
});


userRouter.post("/user/signup", async (req, res) => {
    const { username, email, password,mobileNo } = req.body;
    const isAlready = await UserModel.findOne({ "email": email });

    try {
        if (isAlready === null || isAlready.email !== email) {
            bcrypt.hash(password, 4, async (err, hash) => {
                if (err) {
                    console.log(err);
                    res.send("Err");
                }
                else {
                    let user = new UserModel({ username, email, password: hash, mobileNo });
                    await user.save();
                    res.send({ Message: "User Registered Successfully!" });
                    console.log(user);
                }
            });
        }
        else {
            res.send({ Message: "User already registered!" });
        }
    }
    catch (err) {
        res.send({ Message: "User Registration Failed!" });
        console.log(err);
    }
});


// validation for users to get their profile only
userRouter.use(AuthValidator);

userRouter.get("/profile/:userKey", async (req, res) => {
    const { userKey } = req.params;
    const token = req.headers["authorization"].split(" ")[0];
    console.log("Userkey:", userKey);
    try {
        const singleUser = await UserModel.findById({ "_id": userKey });
        res.send(singleUser);
    }
    catch (err) {
        res.send({ Message: "Can not get user profile!" });
        console.log(err);
    }
});


// After this validation only admin can perform actions
userRouter.use(ValidationForProducts);

userRouter.get("/", async (req, res) => {
    try {
        let user = await UserModel.find();
        res.send(user);
    }
    catch (err) {
        res.send({ Message: "Can not get users data!" });
        console.log(err);
    }
});


userRouter.delete("/deletemany", async (req, res) => {
    try {
        await UserModel.deleteMany();
        res.send({ Message: "All users deleted successfully!" });
    }
    catch (err) {
        console.log(err);
        res.send({ Message: "Can't delete all users!" });
    }
});


userRouter.patch("/update/:id", async (req, res) => {
    let id = req.params.id;
    let payload = req.body;
    try {
        await UserModel.findByIdAndUpdate({ "_id": id }, payload);
        res.send({ Message: "User updated successfully!" });
    }
    catch (err) {
        res.send({ Message: "User can'nt be updated!" });
        console.log(err);
    }
});


userRouter.delete("/delete/:id", async (req, res) => {
    let id = req.params.id;
    try {
        await UserModel.findByIdAndDelete({ "_id": id });
        res.send({ Message: "User deleted successfully!" });
    }
    catch (err) {
        res.send({ Message: "User can'nt be deleted!" });
        console.log(err);
    }
});

module.exports = {
    userRouter
};