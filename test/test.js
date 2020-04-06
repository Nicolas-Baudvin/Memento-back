const { describe, it, before } = require("mocha");
const request = require("supertest");
const app = require("../app");
const expect = require("chai").expect;

describe("authentification routes", () => {
    let token;
    let id;

    /**
     * Tests for POST /signup Route
     */
    describe("POST /signup", () => {
        it("should return status 201 with message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "test.test@test.com", "password": "tester", "username": "tester" })
                .expect("Content-Type", /json/)
                .expect((res) => {
                    res.body.message = "Votre compte a bien été créer.";
                })
                .expect(201, {
                    "message": "Votre compte a bien été créer."
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

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
                    done();
                })
                .catch((err) => {
                    return done(err);
                });

        });

        it("should return status 422 with username empty + invalid error message", (done) => {
            request(app)
                .post("/api/auth/signup/")
                .send({ "email": "wrong.username@wrong.fr", "password": "testing", "username": "" })
                .expect("Content-Type", /json/)
                .expect(422)
                .then((res) => {
                    expect(res.body.errors).to.have.lengthOf(2);
                    done();
                })
                .catch((err) => {
                    return done(err);
                });
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

    /**
     * Tests for POST /login Route
     */
    describe("POST /login", () => {
        it("should connect the user", (done) => {
            request(app)
                .post("/api/auth/login")
                .send({ "username": "tester", "password": "tester" })
                .expect("Content-Type", /json/)
                .expect(200)
                .then((res) => {
                    expect(res.body.email).to.be.a("string");
                    expect(res.body.username).to.be.a("string");
                    expect(res.body.token).to.be.a("string");
                    expect(res.body.userID).to.be.a("string");
                    expect(res.body.message).to.be.a("string");
                    token = res.body.token;
                    id = res.body.userID;
                    done();
                })
                .catch((err) => {
                    return done(err);
                });
        });

        it("should return error message", (done) => {
            request(app)
                .post("/api/auth/login")
                .send({ "username": "badUsername", "password": "badPassword" })
                .expect("Content-Type", /json/)
                .expect(401)
                .then((res) => {
                    expect(res.body.message).to.be.a("string");
                    done();
                })
                .catch((err) => {
                    return done(err);
                });
        });

        it("should return error invalid username message", (done) => {
            request(app)
                .post("/api/auth/login")
                .send({ "username": "", "password": "badPassword" })
                .expect("Content-Type", /json/)
                .expect(422)
                .then((res) => {
                    expect(res.body.errors).to.have.lengthOf(1);
                    done();
                })
                .catch((err) => {
                    return done(err);
                });
        });

        it("should return error invalid password message", (done) => {
            request(app)
                .post("/api/auth/login")
                .send({ "username": "badUsername", "password": "" })
                .expect("Content-Type", /json/)
                .expect(422)
                .then((res) => {
                    expect(res.body.errors).to.have.lengthOf(1);
                    expect(res.body.errors[0].msg).to.be.a("string");
                    done();
                })
                .catch((err) => {
                    return done(err);
                });
        });
    });

    /**
     * Tests for GET /user/:id Route
     */
    describe("GET /user/:id", () => {
        it("should give user datas", (done) => {
            request(app)
                .get(`/api/auth/user/${id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .then((res) => {
                    expect(res.body.userID).to.be.a("string");
                    expect(res.body.email).to.be.a("string");
                    expect(res.body.username).to.be.a("string");
                    done();
                })
                .catch((err) => {
                    return done(err);
                });
        });

        it("should return invalid id error message", (done) => {
            request(app)
                .get("/api/auth/user/5e85c31988187b1e23f31470")
                .set("Authorization", `Bearer ${token}`)
                .expect(401)
                .then((res) => {
                    expect(res.body.error).to.be.a("string");
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("should return invalid userID message (false token)", (done) => {
            request(app)
                .get(`/api/auth/user/${id}`)
                .expect(401)
                .then((res) => {
                    expect(res.body.error).to.be.a("string");
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    /**
     * Tests for POST /delete Route
     */
    describe("POST /delete", () => {
        it("should delete the user", (done) => {
            request(app)
                .post("/api/auth/delete/")
                .set("Authorization", `Bearer ${token}`)
                .send({ "userID": id })
                .expect(200, {
                    "message": "Votre compte a bien été supprimé"
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should throw invalid user id error (bad token)", (done) => {
            request(app)
                .post("/api/auth/delete/")
                .send({ "userID": id })
                .expect(401, {
                    "error": "Vous n'avez pas le droit d'accéder à cette url."
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should throw invalid user id error", (done) => {
            request(app)
                .post("/api/auth/delete/")
                .set("Authorization", `Bearer ${token}`)
                .send({ "userID": "5e85c31988187b1e23f31470" }) // id bidon
                .expect(401)
                .then((res) => {
                    expect(res.body.error).to.be.a("string");
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

    });
});
