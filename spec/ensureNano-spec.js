var mockCouch = require("mock-couch");
var nanoLib = require("nano");

var ensureNano = require("../index.js");

var couchDb;
var connectionString;
var nano;

beforeEach(function() {
    var tcpPort = 32125;
    couchDb = mockCouch.createServer({ keepAlive: false });
    couchDb.listen(tcpPort);
    connectionString = "http://localhost:" + tcpPort;
    nano = nanoLib(connectionString);
});

afterEach(function() {
    couchDb.close();
});

describe("ensureNano", function() {
    it("can take a nano-object and a database name as an argument and return a nano.db object", function(done) {
        var database = ensureNano(nano, "test-database");

        function recursiveCheck(originalObject, testObject) {
            Object.keys(originalObject).forEach(function(method) {
                expect(testObject[method]).toBeDefined();

                if (typeof testObject[method] == "object") {
                    recursiveCheck(originalObject[method], testObject[method]);
                }
            })
        }

        recursiveCheck(nano.use("test-database"), database);

        expect(database.config.url).toBe(connectionString);
        expect(database.config.db).toBe("test-database");

        done();
    });

    describe("on first request", function() {
        it("it creates the database and insert the document", function(done) {
            var db = ensureNano(nano, "test-database");

            db.insert({"test": true}, "test", function(error, body) {
                expect(Object.keys(couchDb.databases)[0]).toBe("test-database");
                expect(error).toBeNull();
                expect(body).toBeDefined();
                done();
            });
        });

        it("It inserts the document into the database", function(done) {
            couchDb.addDB("test-database");
            var db = ensureNano(nano, "test-database");

            db.insert({"test": true}, "test", function(error, body) {
                expect(error).toBeNull();
                expect(body).toBeDefined();
                done();
            });
        });
    });

    describe("multiple databases", function() {
        it("can handle more than one database or nano object", function(done) {
            var nano1 = nano;
            var nano2 = nanoLib("http://localhost:5984");

            var db1 = ensureNano(nano1, "db1");
            var db2 = ensureNano(nano2, "db2");

            expect(db1.config.url).toBe(connectionString);
            expect(db1.config.db).toBe("db1");

            expect(db2.config.url).toBe("http://localhost:5984");
            expect(db2.config.db).toBe("db2");

            done();
        });

        it("can insert (and get) documents into/from two different databases", function(done) {
            var db1 = ensureNano(nano, "db1");
            var db2 = ensureNano(nano, "db2");

            db1.insert({"test": true}, "test1", function(error, body) {
                expect(Object.keys(couchDb.databases)[0]).toBe("db1");
                expect(error).toBeNull();
                expect(body).toBeDefined();
                db2.insert({"test": true}, "test2", function(error, body) {
                    expect(Object.keys(couchDb.databases)[1]).toBe("db2");
                    expect(error).toBeNull();
                    expect(body).toBeDefined();
                    db1.get("test1", function(error, document) {
                        expect(error).toBeNull();
                        expect(document).toBeDefined();
                        db2.get("test2", function(error, document) {
                            expect(error).toBeNull();
                            expect(document).toBeDefined();
                            done();
                        });
                    });
                });
            });
        });
    });
});
