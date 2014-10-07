/*
 * inspect.js: Object inspection functions for module stats
 *
 * (C) 2014 Charlie Robbins
 *
 */

var Table = require('cli-table');

var inspect = module.exports;

//
// ### function codependencies (context)
// #### context {Object} co-*dependencies context to inspect
// ####   - name    {string} Name of the "package domain"
// ####   - lattice {Object} Lattice representing the "package domain", D
// ####   - names   {Array}  Names of co-*dependencies in D
// ####   - codeps  {string} Sublattices for each of the co-*dependencies in D
// ####   - matrix  {Array*} Weighted matrix representing a summary of D.
//
// Inspects the context of the co-*dependencies "package domain" D for
// a given package, options.name.
//
inspect.codependencies = inspect.codeps = function (context) {
  var name    = context.name,
      lattice = context.lattice,
      names   = context.names,
      codeps  = context.codeps,
      matrix  = context.matrix,
      values  = context.values;

  //
  // ### function dump (name, latt)
  // Dumps debug values for the lattice
  //
  function dumpLattice(name, latt) {
    Object.keys(latt).forEach(function (coname) {
      if (coname === 'total') { return; }
      console.log('%s | %d %s %s', name, latt[coname].count, coname, latt[coname].relative)
    });
  }

  names.map(function (n) { console.log(n) });
  console.log();

  //
  // Display the information for the lattice and the
  // sublattices (i.e. co-*dependencies).
  //
  dumpLattice(name, lattice);
  names.forEach(function (coname) {
    console.log();
    dumpLattice(coname, codeps[coname]);
  });

  function displayMatrix(rows) {
    //
    // Copy the matrix so we can modify it for
    // display.
    //
    var table   = new Table(),
        display;

    display = rows.map(function (row) {
      return row.slice();
    });

    //
    // Modify the matrix as follows and then display it
    // 1. Truncate to 6 significant figures.
    // 2. Add the row headers.
    // 3. Add the column headers.
    //
    // TODO: Make precision configurable.
    // TODO: Make dumping the raw matrix configurable
    // console.dir(matrix);
    //
    display.forEach(function (row, i) {
      for (var j = 0; j < row.length; j++) {
        row[j] = typeof row[j] === 'number'
          ? row[j].toFixed(4)
          : '';
      }

      row.unshift(names[i].slice(0, 4) + '…');
    });

    display.unshift(
      names.slice().map(function (name) {
        return name.slice(0, 4) + '…';
      })
    );

    display[0].unshift('');
    table.push.apply(table, display);
    console.log(table.toString());
  }

  displayMatrix(values);
  displayMatrix(matrix);
  //
  // This could be useful later.
  //
  // function logRatio(x, y) {
  //   console.log(
  //     '(%s, %s) %s/%s = %s/%s = %s',
  //     x, y,
  //     display[0][x], display[y][0],
  //     display[x][y], display[y][x],
  //     (display[x][y]/display[y][x]).toFixed(2)
  //   );
  // }
  //
  // for (var i = 1; i < display.length; i++) {
  //   for (var j = 1; j < display.length; j++) {
  //     if (i !== j) {
  //       logRatio(i,j);
  //       logRatio(j,i);
  //       console.log();
  //     }
  //   }
  // }
};
