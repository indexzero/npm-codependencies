/*
 * index.js: Top-level include for codependencies logic
 *
 * (C) 2014 Charlie Robbins
 *
 */

var async = require('async'),
    inspect = require('./inspect'),
    matrix = require('./matrix');

//
// ### function zeroArray(len)
// Return a zero-filled array of len
//
function zeroArray(len) {
  return Array.apply(null, new Array(len))
    .map(Number.prototype.valueOf, 0);
}

//
// ### @private {Array} defaultViews
// List of all default views to query against.
//
var defaultViews = {
  'dependencies':         'latest',
  'devDependencies':      'latestDev',
  'peerDependencies':     'latestPeer',
  'optionalDependencies': 'latestOptional'
};

//
// ### function codependencies (options, callback)
// #### @options {Object}
// ####   - package  {string}   Package to calculate weights for
// ####   - registry {string}   Registry to calculate against
// ####   - top      {number}   **Optional** If set, returns only the top N codeps
// ####   - views    {Array}    **Optional** View to calculate weights against.
//
// Calculates the codependencies for the specified `package` against all of the `views`
// in the `registry`. Defaults to include all *Dependencies:
//   - dependencies
//   - devDependencies
//   - peerDependencies
//   - optionalDependencies
//
var codependencies = module.exports = function (options, callback) {
  var views   = options.views || Object.keys(defaultViews),
      results = {};

  async.forEachLimit(
    views, 2,
    function oneType(type, next) {
      codependencies.type(options, defaultViews[type], function (err, data) {
        if (err) { return next(err); }

        results[type] = data;
        next();
      });
    },
    function (err) {
      return !err
        ? callback(null, results)
        : callback(err);
    }
  );
};

//
// ### function
//
codependencies.type = function (options, view, callback) {
  var debug   = options.debug;

  matrix({
    package:  options.package,
    registry: options.registry,
    skip:     options.skip,
    top:      options.top,
    view:     view
  }, function (err, codeps, pkg) {
    if (err) { throw err; }

    var names  = Object.keys(codeps).sort().filter(function (n) { return n !== 'total' }),
        matrix = [],
        values = [];

    //
    // For each of the codeps in rows
    // return an Array of values for only
    // its peers
    //
    names.forEach(function (name) {
      //
      // TODO: What if you don't have a top N?
      //
      var row   = zeroArray(top),
          value = zeroArray(top);

      names.forEach(function (coname) {
        if (name === coname) { return }

        var index = names.indexOf(coname);
        if (index !== -1 && codeps[name][coname]) {
          value[index] = codeps[name][coname].count;
          row[index]   = codeps[name][coname].count
            * (codeps[name][coname].count / codeps[name].total)
            * pkg[name].relative;

          //
          // TODO: Make this logging configurable with more
          // granularity than just DEBUG=true
          // console.log(index, row[index], name, coname);
          //
        }
      });

      matrix.push(row);
      values.push(value);
    });

    if (debug) {
      inspect.codeps({
        name: options.package,
        lattice: pkg,
        names: names,
        codeps: codeps,
        matrix: matrix,
        values: values
      });
    }

    callback(null, {
      //package: pkg,
      //lattice: lattice,
      names: names,
      matrix: matrix,
      values: values
    });
  });
};