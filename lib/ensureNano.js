function ensureNano(nano, db) {
    var nanoDb = nano.use(db);
    return wrapNano(nano, nanoDb, db);
}

function wrapNano(nano, nanoDb, db) {
    var nanoObject = {};
    Object.keys(nanoDb).forEach(function(method) {
        if (typeof nanoDb[method] == "function") {
            return nanoObject[method] = function() {
                ensureDatabase.call(nano, nano, nanoDb, db, method, arguments)
            };
        }

        if (typeof nanoDb[method] == "object") {
            return nanoObject[method] = wrapNano(nano, nanoDb[method], db);
        }

        return nanoObject[method] = nanoDb[method];
    });

    return nanoObject;
}

function ensureDatabase(nano, nanoDb, db, method, args) {
    var originalCallback = replaceCallback(args, function(error) {
        if (error && error.reason == "Database does not exist.") {
            nano.db.create(db, function(error) {
                if (error) {
                    return originalCallback.apply(arguments);
                }
                replaceCallback(args, originalCallback);
                nanoDb[method].apply(this, args)
            })
        }
        else {
            originalCallback.apply(this, arguments);
        }
    });
    nanoDb[method].apply(this, args)
}

function replaceCallback(args, newCallback) {
    var callback = function() {};
    if (typeof args[args.length - 1] == "function") {
        callback = args[args.length - 1];
    }
    args[args.length - 1] = newCallback;
    return callback;
}

module.exports = ensureNano;
