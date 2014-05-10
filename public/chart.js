var packageParts = /\?p=([\w\.\-\_]+)$/.exec(window.location),
    packageName  = (packageParts && packageParts[1]) || 'express'
    width = 800,
    height = 750,
    outerRadius  = height / 2,
    innerRadius  = outerRadius - 100,
    header = document.getElementsByTagName("h1")[0],
    header.innerHTML += packageName;

// TODO: change colors
var fill = d3.scale.category20c();

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

d3.json("samples/" + packageName + '-display.json', function(error, display) {

  var names  = display.names,
      matrix = [],
      n = 0;

  chord.matrix(display.matrix);

  /* Create arcs (dependent packages) */
  var g = svg.selectAll("g.group")
      .data(chord.groups())
    .enter().append("svg:g")
      .attr("class", "group")
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { d3.rgb(fill(d.index)).darker() })
      .on("mouseover", gMouseover)
      .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

  g.append("svg:path")
      .style("fill", function(d) { return fill(d.index); })
      .attr("d", arc);

  /* Package labels */
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

  /* Create chords */
  var chordPaths = svg.selectAll("path.chord")
      .data(chord.chords())
    .enter().append("svg:path")
      .attr("class", "chord")
      .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
      .style("fill", function(d) { return fill(d.source.index); })
      .attr("d", d3.svg.chord().radius(innerRadius))
      .on("mouseover", cMouseover)
      .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

  /* Chord information */
  function chordTip (d, i) {
    var p = d3.format(".2%"), q = d3.format(",.3r")
    // return d;
    return "chord";
  }

  function cMouseover(d, i) {
    d3.select("#tooltip")
    .style("visibility", "visible")
    .html(chordTip(d, i))
    .style("top", function () { return (d3.event.pageY - 100)+"px"})
    .style("left", function () { return (d3.event.pageX - 100)+"px";})
  };

  /* Group (dependency) information */
  function groupTip (d) {
    var p = d3.format(".1%"), q = d3.format(",.3r")
    // return d;
    return "group";
  }

  function gMouseover(d, i) {
    d3.select("#tooltip")
      .style("visibility", "visible")
      .html(groupTip(d))
      .style("top", function () { return (d3.event.pageY - 80)+"px"})
      .style("left", function () { return (d3.event.pageX - 130)+"px";});

    chordPaths.classed("fade", function(p) {
      return p.source.index != i
          && p.target.index != i;
    });
  }

}, 100);

d3.select(self.frameElement).style("height", outerRadius * 2 + "px");
