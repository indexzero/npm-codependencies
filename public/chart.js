var query = location.search.substring(1).split("&");
var params = {};
for(var i = 0; i < query.length; i++) {
  var item = query[i].split("=");
  params[item[0]] = item[1];
}

var packageName  = params.p || 'express'
    width        = 800,
    height       = 750,
    outerRadius  = height / 2,
    innerRadius  = outerRadius - 100,
    numResults   = params.t;

function draw(codeps) {
  var fill = d3.scale.category20c();

  var fmt = {
    percent: d3.format('.2%'),
    decimal: d3.format(',.2f'),
    integer: d3.format('n')
  }

  var chord = d3.layout.chord()
    .padding(.08)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

  var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 20);

  var svg = d3.select("body")
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("svg:g")
      .attr("id", "circle")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      svg.append("circle")
          .attr("r", innerRadius + 20);

  var graph = svg.append("g")
    .attr("transform", "translate(" + outerRadius * 1.25 + "," + outerRadius + ")");

  var pkg    = codeps.name,
      names  = codeps.names,
      matrix = codeps.matrix,
      values = codeps.values,
      totals;

  //
  // Compute all the totals for
  // all packages
  //
  totals = values.map(function (arr) {
    return arr.reduce(function (sum, val) {
      return sum + val;
    }, 0);
  });

  //
  // ### function chordTip (d, i)
  // Returns the text for the chord tooltip
  //
  function chordTip (d, i) {
    var source = d.source.index,
        target = d.target.index;

    return [
      '<table>',
      '  <thead>',
      '    <tr>',
      '      <td></td>',
      '      <td>Raw</td>',
      '      <td>Weighted</td>',
      '      <td>Total</td>',
      '    </tr>',
      '  </thead>',
      '  <tbody>',
      '    <tr>',
      '      <td>' + names[source] + '</td>',
      '      <td>' + fmt.integer(values[source][target]) + '</td>',
      '      <td>' + fmt.decimal(matrix[source][target]) + '%</td>',
      '      <td>' + fmt.integer(totals[source]) + '</td>',
      '    </tr>',
      '    <tr>',
      '      <td>' + names[target] + '</td>',
      '      <td>' + fmt.integer(values[target][source]) + '</td>',
      '      <td>' + fmt.decimal(matrix[target][source]) + '%</td>',
      '      <td>' + fmt.integer(totals[target]) + '</td>',
      '    </tr>',
      '  </tbody>',
      '</table>'
    ].join('\n');
  }

  //
  // ### function cMouseover (d, i)
  // Mouse enter handler for individual chords
  //
  function cMouseover(d, i) {
    d3.select("#tooltip")
      .style("visibility", "visible")
      .html(chordTip(d, i))
      .style("top", function () { return (d3.event.pageY - 100)+"px"})
      .style("left", function () { return (d3.event.pageX - 100)+"px";})
  };

  // //
  // // ### function groupTip (d, i)
  // // Returns the text for the group tooltip
  // //
  // function groupTip (d) {
  //   var name    = names[d.index],
  //       source  = d.index,
  //       headers = [],
  //       rows    = [];

  //   return [
  //     '<table>',
  //     '  <thead>',
  //     '    <tr>',
  //   ].concat(headers).concat([
  //     '    </tr>',
  //     '  </thead>',
  //     '  <tbody>'
  //   ]).concat(rows).concat([
  //     '  </tbody>',
  //     '</table>'
  //   ]).join('\n');
  // }

  // //
  // // ### function cMouseover (d, i)
  // // Mouse enter handler for individual groups (i.e. packages)
  // //
  // function gMouseover(d, i) {
  //   d3.select("#tooltip")
  //     .style("visibility", "visible")
  //     .html(groupTip(d))
  //     .style("top", function () { return (d3.event.pageY - 80)+"px"})
  //     .style("left", function () { return (d3.event.pageX - 130)+"px";});

  //   chordPaths.classed("fade", function(p) {
  //     return p.source.index != i
  //         && p.target.index != i;
  //   });
  // }

  //
  // Hides the tooltip overlay
  //
  function hide() {
    d3.select("#tooltip").style("visibility", "hidden");
  }

  document.getElementById("package-name").innerHTML = pkg + ' ' + codeps.type;
  chord.matrix(codeps.matrix);

  //
  // Create arcs representing the codependent
  // package relationships
  //
  var g = svg.selectAll("g.group")
      .data(chord.groups())
    .enter().append("svg:g")
      .attr("class", "group")
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { d3.rgb(fill(d.index)).darker() })
      .on("mouseover", gMouseover)
      .on("mouseout", hide);

  g.append("svg:path")
    .style("fill", function(d) { return fill(d.index); })
    .attr("d", arc);

  //
  // Set outer package labels
  //
  g.append("svg:text")
    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (innerRadius + 26) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .text(function(d) { return names[d.index]; });

  //
  // Create chords
  //
  var chordPaths = svg.selectAll("path.chord")
      .data(chord.chords())
    .enter().append("svg:path")
      .attr("class", "chord")
      .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
      .style("fill", function(d) { return fill(d.source.index); })
      .attr("d", d3.svg.chord().radius(innerRadius))
      .on("mouseover", cMouseover)
      .on("mouseout", hide);

  d3.select(window.frameElement).style("height", outerRadius * 2 + "px");
}

d3.json("samples/" + packageName + '-display.json', function(error, display) {
  display.name = packageName;
  display.type = 'dependencies';
  draw(display);
});