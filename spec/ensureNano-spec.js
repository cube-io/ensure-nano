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
        it("checks if the database requested exists", function(done) {});

        it("creates the database if it does not exists", function(done) {});
    });
});
