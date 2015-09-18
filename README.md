# ensure-nano

Adds the ability to ensure a database exists in your [CouchDB](http://couchdb.apache.org/) database when using [nano](https://github.com/dscape/nano).

You simply use `ensure-nano` instead of `nano.use()` when setting up your database connection:

```js
var ensureNano = require("ensure-nano");
var nano = require("nano")(connectionString);
var database = ensureNano(nano, "database");

database.insert(...);
```
