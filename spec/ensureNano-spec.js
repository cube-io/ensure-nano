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
    it("can take a Nano-object as an argument", function(done) {});

    describe("on first request", function() {
        it("checks if the database requested exists", function(done) {});

        it("creates the database if it does not exists", function(done) {});
    });
});
