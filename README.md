# npm-codependencies

Analyze codependency relationships between package `dependencies`, `devDependencies`, `peerDependencies`, and/or `optionalDependencies`.

## Usage

There are two distinct ways to use `npm-static-stats`:

### 1. Use it programmatically

``` js
var codeps = require('npm-codependencies');

codeps({
  package:  package,
  registry: registry,
  skip:     skip,
  top:      top,
  debug:    process.env['DEBUG']
}, function (err, results) {
  //
  // The returned `results` will be the set of the
  // types of dependencies with respective counts for
  // the co*dependencies.
  //
  console.dir(results.dependencies);
  console.dir(results.devDependencies);
});
```

### 2. Use from the command line

```
npm install npm-codependencies -g
npm-codependencies -r http://skimdb.nodejitsu.com -p $PACKAGE_NAME
cat "$PACKAGE_NAME.json"
```

##### Author: [Charlie Robbins](https://github.com/indexzero)
##### License: Apache 2