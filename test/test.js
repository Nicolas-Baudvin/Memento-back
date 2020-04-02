const { describe, it } = require("mocha");
const request = require("supertest");
const app = require("../app");
const expect = require("chai").expect;

describe("authentification routes", () => {
    describe("Signup route", () => {
        // it("should return status 201 with message", (done) => {
        //     request(app)
        //         .post("/api/auth/signup/")
        //         .send({ "email": "test.test@test.com", "password": "tester", "username": "tester" })
        //         .expect("Content-Type", /json/)
        //         .expect((res) => {
        //             res.body.message = "Votre compte a bien été créer.";
        //         })
        //         .expect(201, {
        //             "message": "Votre compte a bien été créer."
        //         })
        //         .end((err) => {
        //             if (err) {
        //                 return done(err);
        //             }
        //             done();
        //         });
        // });

        it("should return status 422 with email error message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "test.test@test.com", "password": "testing", "username": "testing_again" })
                .expect("Content-Type", /json/)
                .expect(422, {
                    "message": "Cet email existe déjà"
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should return status 422 with username error message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "tic.tac@tic.tac", "password": "testing", "username": "tester" })
                .expect("Content-Type", /json/)
                .expect(422, {
                    "message": "Ce pseudonyme existe déjà"
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should return status 422 with email invalid error message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "wrongEmail", "password": "testing", "username": "TestingWrongEmail" })
                .expect("Content-Type", /json/)
                .expect(422)
                .then((res) => {
                    expect(res.body.errors).to.have.lengthOf(1);
                });
            done();

        });

        it("should return status 422 with username empty + invalid error message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "wrong.username@wrong.fr", "password": "testing", "username": "" })
                .expect("Content-Type", /json/)
                .expect(422)
                .then((res) => {
                    expect(res.body.errors).to.have.lengthOf(2);

                });
            done();
        });

        it("should return status 422 with username invalid error message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "wrong.username@wrong.fr", "password": "testing", "username": "io" })
                .expect("Content-Type", /json/)
                .expect(422, {
                    "errors": [
                        {
                            "value": "io",
                            "msg": "Le pseudonyme doit comporter 3 caractères minimum",
                            "param": "username",
                            "location": "body"
                        }
                    ]
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should return status 422 with password invalid error message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "wrong.username@wrong.fr", "password": "wrong", "username": "iolo" })
                .expect("Content-Type", /json/)
                .expect(422, {
                    "errors": [
                        {
                            "value": "wrong",
                            "msg": "Le mot de passe doit comporter 6 caractères minimum",
                            "param": "password",
                            "location": "body"
                        }
                    ]
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    describe("Login Route", () => {
        it("should connect the user", (done) => {
            request(app)
                .post("/api/auth/login")
                .send({ "username": "testerlogin", "password": "123456" })
                .expect("Content-Type", /json/)
                .expect(200)
                .then((res) => {
                    expect(res.body.email).to.be.a("string");
                    expect(res.body.username).to.be.a("string");
                    expect(res.body.token).to.be.a("string");
                    expect(res.body.userID).to.be.a("string");
                    expect(res.body.message).to.be.a("string");
                    done();
                });
        });
    });
});
