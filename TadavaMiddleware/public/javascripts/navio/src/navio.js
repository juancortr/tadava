//eleId must be the ID of a context element where everything is going to be drawn
function navio(selection, _h) {
  "use strict";
  var nv = this || {},
    dataIs = [], //Contains the data, is an array of arrays, one for each level
    dData = d3.map(), // A hash for the data
    dDimensions = d3.map(),
    dimensionsOrder = [],
    dSortBy = d3.map(), //contains which attribute to sort by on each column
    dBrushes = d3.map(),
    yScales =[],
    xScale,
    x,
    height = _h!==undefined ? _h : 600,
    colScales = d3.map(),
    levelScale,
    canvas,
    context,
    // Taken from d3.chromatic https://github.com/d3/d3-scale-chromatic/blob/master/src/sequential-single/Blues.js
    defaultColorInterpolator =  d3.interpolateBlues ? d3.interpolateBlues : d3ScaleChromatic.interpolateBlues,
    defaultColorInterpolatorDate =  d3.interpolatePurples ? d3.interpolatePurples :  d3ScaleChromatic.interpolatePurples,
    defaultColorInterpolatorDiverging =  d3.interpolateBrBG ? d3.interpolateBrBG :  d3ScaleChromatic.interpolateBrBG,
    visibleColorRange = ["white", "#b5cf6b"],
    fmt = d3.format(",.0d"),
    x0=0,
    y0=100,
    id = "__seqId",
    //updateCallback = function () {},
    tadavaCB = function(){},
    filters = [],
    totalElemsTadava,   //Receives the total number of docs in ES cluster
    totalDocs = [], //Array to store total number of documents for filter made
    tadavaURL,
    tindex;

  nv.margin = 10;
  nv.attribWidth = 15;
  nv.levelsSeparation = 40;
  nv.divisionsColor = "white";
  nv.levelConvectionsColor = "rgba(205, 220, 163, 0.5)";
  nv.divisionsThreshold = 3;
  nv.attribFontSize = 13;
  nv.attribFontSizeSelected = 32;

  nv.startColor = "white";
  nv.endColor = "red";
  nv.legendFont = "14px Arial";
  nv.linkColor = "#2171b5";
  // nv.linkColor = "rgba(0,0,70,0.9)";
  selection = d3.select(selection);

  function nozoom() {
    console.log("nozoom");
    d3.event.preventDefault();
  }

  console.log(selection);
  selection.selectAll("*").remove();

  selection
    .on("touchstart", nozoom)
    .on("touchmove", nozoom)
    // .attr("width", 150)
    .style("height", height + "px")
    .attr("class", "navio")
    .append("div")
      // .style("float", "left")
      .attr("id", "navio")
      .style("position", "relative");
  selection
    .select("#navio")
    .append("canvas");
  var svg = selection
    .select("#navio")
    .append("svg")
      .style("overflow", "visible")
      .style("position", "absolute")
      .style("z-index", 99)
      .style("top", 0)
      .style("left", 0);


  svg.append("g")
    .attr("class", "attribs");

  svg.append("g")
    .attr("class", "tooltip")
    .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff")
    .attr("transform", "translate(-100,-10)")
    .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("pointer-events", "none")
      .style("font-family", "sans-serif")
      .style("font-size", "16pt")
      .style("text-anchor", "middle");

  svg.select(".tooltip > text")
    .append("tspan")
      .attr("class", "tool_id")
      .attr("x", 0)
      .attr("dy", "1.2em");

  svg.select(".tooltip > text")
    .append("tspan")
      .attr("class", "tool_value_name")
      .style("font-weight", "bold")
      .attr("x", 0)
      .attr("dy", "1.2em");

  svg.select(".tooltip > text")
    .append("tspan")
      .attr("class", "tool_value_val")
      .style("font-weight", "bold")
      .attr("x", 0)
      .attr("dy", "1.2em");

  svg.append("g")
    .attr("id", "closeButton")
    .style("fill", "white")
    .style("stroke", "black")
    .style("display", "none")
    .append("path")
    .call(function (sel) {
      var crossSize = 7,
        path = d3.path(); // Draw a cross and a circle
      path.moveTo(0, 0);
      path.lineTo(crossSize, crossSize);
      path.moveTo(crossSize, 0);
      path.lineTo(0, crossSize);
      path.moveTo(crossSize*1.2 + crossSize/2, crossSize/2);
      path.arc(crossSize/2, crossSize/2, crossSize*1.2, 0, Math.PI*2);
      sel.attr("d", path.toString());
    })
    .on("click", function () {
      deleteOneLevel();
    });

  xScale = d3.scaleBand()
    // .rangeBands([0, nv.attribWidth], 0.1, 0);
    .range([0, nv.attribWidth])
    .round(true)
    .paddingInner(0.1)
    .paddingOuter(0);
  levelScale = d3.scaleBand()
    .round(true);
  colScales = d3.map();

  x = function (val, level) {
    return levelScale(level) + xScale(val);
  };

  canvas = selection.select("canvas").node();
  // canvas.style.position = "absolute";
  canvas.style.top = canvas.offsetTop + "px";
  canvas.style.left = canvas.offsetLeft + "px";
  // canvas.style.width =  "150px";
  canvas.style.height = height + "px";

  const scale = window.devicePixelRatio;
  // canvas.width = width * scale;
  canvas.height = height * scale;

  context = canvas.getContext("2d");

  context.scale(scale,scale);


  // context.globalCompositeOperation = "source-over";
  // context.strokeStyle = "rgba(0,100,160,1)";
  // context.strokeStyle = "rgba(0,0,0,0.02)";



  function invertOrdinalScale(scale, x) {
    // Taken from https://bl.ocks.org/shimizu/808e0f5cadb6a63f28bb00082dc8fe3f
    // custom invert function
    var domain = scale.domain();
    var range = scale.range();
    var qScale = d3.scaleQuantize().domain(range).range(domain);

    return qScale(x);
  }

  function nvOnClickLevel(d) {
    if (d3.event.defaultPrevented) return; // dragged
    console.log("click ");
    console.log(d);
    var before = performance.now();

    console.log("Sorting by "+d.attrib);

    //dataIs[d.level] = dataIs[d.level].sort((a, b) => d3.ascending(a[d.attrib], b[d.attrib]));
    dataIs[d.level] = dataIs[d.level].sort(function(a, b) {
       return d3.ascending(parseInt(a[d.attrib]), parseInt(b[d.attrib])) ||
         d3.ascending(a[d.attrib], b[d.attrib]);
    });
    
    /*dataIs[d.level] = dataIs[d.level].sort(function (a, b) {
      return d3.ascending(dataIs[d.level][a.i][d.attrib], dataIs[d.level][b.i][d.attrib]);
      //return d3.ascending(a[d.attrib], b[d.attrib]);
    });*/
    var after = performance.now();
    console.log("Click sorting " + (after-before) + "ms");
    //dSortBy.set(d.level, d.attrib);
    nv.updateData(dataIs, colScales, d.level);
  }

  function getAttribs(obj) {
    var attr, res = [];
    for (attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        res.push(attr);
      }
    }
    return res;
  }

  function drawItem(item, level) {
    var attrib, i, y ;

    for (i = 0; i < dimensionsOrder.length; i++) {
      attrib = dimensionsOrder[i];
      y = Math.round(yScales[level](item[id]) + yScales[level].bandwidth()/2);

      //y = Math.round(yScales[level](item.i) + yScales[level].bandwidth()/2);
      // y = yScales[level](item[id]) + yScales[level].bandwidth()/2;

      context.beginPath();
      context.moveTo(Math.round(x(attrib, level)), y);
      context.lineTo(Math.round(x(attrib, level) + xScale.bandwidth()), y);
      context.lineWidth = Math.round(yScales[level].bandwidth());
      // context.lineWidth = 1;
      context.strokeStyle = item[attrib] === undefined ||
                item[attrib] === null ||
                item[attrib] === "none" ?
                  "white" :
                  colScales.get(attrib)(item[attrib]);

      context.stroke();


      //If the range bands are tick enough draw divisions
      if (yScales[level].bandwidth() > nv.divisionsThreshold) {
        var yLine = Math.round(yScales[level](item[id])) ;
        // y = yScales[level](item[id])+yScales[level].bandwidth()/2;
        context.beginPath();
        context.moveTo(x(attrib, level), yLine);
        context.lineTo(x(attrib, level) + xScale.bandwidth(), yLine);
        context.lineWidth = 1;
        // context.lineWidth = 1;
        context.strokeStyle = nv.divisionsColor;
        context.stroke();
      }

    }

  }

  function drawLevelBorder(i) {
    context.beginPath();
    context.rect(levelScale(i),
      yScales[i].range()[0],
      xScale.range()[1],
      yScales[i].range()[1]-100);
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.stroke();
  }

  function removeBrushOnLevel(lev) {
    d3.select("#level"+lev)
      .selectAll(".brush")
      .call(dBrushes.get(lev).move, null);
  }

  function removeAllBrushesBut(but) {
    //for (var lev=0; lev< dataLs.length ; lev+=1) {
    for (var lev=0; lev< dataIs.length ; lev+=1) {
      if (lev===but) continue;
      removeBrushOnLevel(lev);
    }
  }


  function addBrush(d, i) {
    dBrushes.set(i,
      d3.brushY()
        .extent([
          [x(xScale.domain()[0], i),yScales[i].range()[0]],
          [x(xScale.domain()[xScale.domain().length-1], i) + xScale.bandwidth()*1.1, yScales[i].range()[1]]
        ])
        .on("end", brushended));
    var _brush = d3.select(this)
      .selectAll(".brush")
      .data([{
        data : dataIs[d],
        //data : data[d],
        level : i
      }]);// fake data

    _brush.enter()
      .merge(_brush)
      .append("g")
      .on("mousemove", onMouseOver)
      .on("click", onSelectByValue)
      .on("mouseout", onMouseOut)
      .attr("class", "brush")
      .call(dBrushes.get(i))
      .selectAll("rect")
      // .attr("x", -8)
      .attr("width", x(xScale.domain()[xScale.domain().length-1], i) + xScale.bandwidth()*1.1);

    _brush.exit().remove();

    function brushended() {
      console.log("brushended", d3.event);
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection){
        console.log("Empty selection",d3.event.selection,d3.event.type, d3.event.sourceEvent);
        // return;
        // d3.event.preventDefault();
        // onSelectByValueFromCoords(d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY);
        return; // Ignore empty selections.
      }

      removeAllBrushesBut(i);
      var before = performance.now();
      var brushed = d3.event.selection;

      //console.log("Level scale I: "+i);
      //InvertScale give the id of the item
      console.log("InvertScale: "+invertOrdinalScale(yScales[i], brushed[0]));
      console.log("Brushed: "+brushed[0]);

      //var first = dData.get(invertOrdinalScale(yScales[i], brushed[0]));
      //var last = dData.get(invertOrdinalScale(yScales[i], brushed[1]));

      var first = dataIs[i][invertOrdinalScale(yScales[i], brushed[0])];
      var last = dataIs[i][invertOrdinalScale(yScales[i], brushed[1])];

      var screenX = d3.event.sourceEvent.offsetX;

      var itemAttr = invertOrdinalScale(xScale, screenX - levelScale(i));

      if (itemAttr === undefined) return;

      var filterElem = {};
      filterElem.type = "range";
      filterElem.params = {};
      filterElem.params.attr = itemAttr;
      filterElem.params.minValue = first[itemAttr];
      filterElem.params.maxValue = last[itemAttr];
      
      filters.push(filterElem);

      console.log("Filter Element", filterElem);

      if(nv.tadavaURL && nv.tindex){
        //Make request to URL and save in filtered data, add to dataIs.

        const Http = new XMLHttpRequest();
        
        var tadavaprequest = nv.tadavaURL+'/post/'+nv.tindex;
        console.log('Tadava Post Request', tadavaprequest);
        Http.open("POST", tadavaprequest, true);

        var jsonFilter = {
          filters: filters
        }
        console.log("JSONfilters", jsonFilter);
        Http.setRequestHeader("Content-Type", "application/json");
        Http.onreadystatechange=(e)=>{
          //Check reponse
          var newSampledFiltered = JSON.parse(Http.responseText).hits.hits;
          totalDocs.push(JSON.parse(Http.responseText).hits.total);

          var sourceSampledFiltered = [];
          newSampledFiltered.forEach(function(d, i){
            //Extract source
            var elem = d._source;
            elem.i = i; 
            sourceSampledFiltered.push(elem);
          });

          after = performance.now();
          console.log("Click filtering " + (after-before) + "ms");

          var newData = dataIs;
          //var newData = dataIs.slice(0, dataIs.length-1);
          newData.push(sourceSampledFiltered);

          nv.updateData(
            newData,
            colScales,
            newData.length-1
          );
        }
        Http.send(JSON.stringify(jsonFilter));
      }

      console.log("first and last");
      console.log(first);
      console.log(last);

      var after = performance.now();
      console.log("Brushend filtering " + (after-before) + "ms");
    }// brushend

    function onSelectByValue() {
      console.log("click");
      var clientY = d3.mouse(d3.event.target)[1],
        clientX = d3.mouse(d3.event.target)[0];
        console.log("Click Selection", clientX);

      onSelectByValueFromCoords(clientX, clientY);
    }


    function onSelectByValueFromCoords(clientX, clientY) {
      console.log("onSelectByValueFromCoords", clientX, clientY);
      removeAllBrushesBut(-1); // Remove all brushes
      var before = performance.now();
      var itemId = invertOrdinalScale(yScales[i], clientY);
      var after = performance.now();
      console.log("invertOrdinalScale " + (after-before) + "ms");

      var itemAttr = invertOrdinalScale(xScale, clientX - levelScale(i));

      if (itemAttr === undefined) return;

      //var sel = dData.get(itemId);
      var sel = dataIs[i][itemId];

      //Filter element construction
      var filterElem = {};
      filterElem.type  = "click";
      filterElem.params = {};
      filterElem.params.attr = itemAttr;
      filterElem.params.value = sel[itemAttr];
      
      filters.push(filterElem);

      console.log("Filter Element", filterElem);

      before = performance.now();

      var filteredData;

      console.log('Tadava URL', nv.tadavaURL);

      if(nv.tadavaURL && nv.tindex){
        //Make request to URL and save in filtered data, add to dataIs.

        const Http = new XMLHttpRequest();
        
        var tadavaprequest = nv.tadavaURL+'/post/'+nv.tindex;
        console.log('Tadava Post Request', tadavaprequest);
        Http.open("POST", tadavaprequest, true);

        var jsonFilter = {
          filters: filters
        }
        console.log("JSONfilters", jsonFilter);

        Http.setRequestHeader("Content-Type", "application/json");
        Http.onreadystatechange=(e)=>{
          //Check reponse
          var newSampledFiltered = JSON.parse(Http.responseText).hits.hits;
          console.log("#Documentos", JSON.parse(Http.responseText).hits.total);
          totalDocs.push(JSON.parse(Http.responseText).hits.total);

          var sourceSampledFiltered = [];
          newSampledFiltered.forEach(function(d, i){
            var elem = d._source;
            elem.i = i; 
            sourceSampledFiltered.push(elem);
          });

          after = performance.now();
          console.log("Click filtering " + (after-before) + "ms");

          var newData = dataIs;
          //var newData = dataIs.slice(0, dataIs.length-1);
          newData.push(sourceSampledFiltered);

          nv.updateData(
            newData,
            colScales,
            newData.length-1
          );
        }
        Http.send(JSON.stringify(jsonFilter));
      }
    }
  }


  function onMouseOver(overData) {
    var screenY = d3.mouse(d3.event.target)[1],
      screenX = d3.mouse(d3.event.target)[0];

    var itemId = invertOrdinalScale(yScales[overData.level], screenY);
    var itemAttr = invertOrdinalScale(xScale, screenX - levelScale(overData.level));
    //var d = dData.get(itemId);
    var d = dataIs[overData.level][itemId];
    // var itemId = d.data.filter(function (e) {
    //   var y = yScales[d.level](e[id]);
    //   e.visible = y >= screenY && y < screenY + yScales[d.level];
    //   return e.visible;
    // });

    svg.select(".tooltip")
      //.attr("transform", "translate(" + (screenX) + "," + (screenY+20) + ")")
      .attr("transform", "translate(" + (screenX) + "," + (screenY) + ")")
      .call(function (tool) {
        tool.select(".tool_id")
          .text(itemId);
        tool.select(".tool_value_name")
          .text(itemAttr + " : " );
        tool.select(".tool_value_val")
          .text(d[itemAttr]);

      });
  }

  function onMouseOut() {
    svg.select(".tooltip")
      .attr("transform", "translate(" + (-200) + "," + (-200) + ")")
      .call(function (tool) {
        tool.select(".tool_id")
          .text("");
        tool.select(".tool_value_name")
          .text("");
        tool.select(".tool_value_val")
          .text("");

      });

  }

  function drawBrushes() {
    // var attribHolder, attribsData;

    //Format the data to draw the phantom rects
    // attribsData = data.reduce(
    //   function (p, l, i) {
    //     return p.concat(xScale.domain().map(function (d) {
    //       return {attrib:d, level:i};
    //     }));
    //   },
    //   []
    // );

    // Send visible and seqId to the beginving
    var attribs = xScale.domain();

    var levelOverlay = svg.select(".attribs")
      .selectAll(".levelOverlay")
      .data(dataIs);

    var levelOverlayEnter = levelOverlay.enter()
      .append("g")
        .attr("class", "levelOverlay")
        .attr("id", function (d,i) { return "level" +i; })
        .each(addBrush);

    var attribOverlay = levelOverlayEnter.merge(levelOverlay)
      .selectAll(".attribOverlay")
      .data(function (_, i) {
        return attribs.map(function (a) {
          return {attrib:a, level:i};
        });
      });


    var attribOverlayEnter = attribOverlay
      .enter()
        .append("g")
        .attr("class", "attribOverlay")
        .style("cursor", "pointer");

    attribOverlayEnter
      .merge(attribOverlay)
      .attr("transform", function (d) {
        return "translate(" +
          x(d.attrib, d.level) +
          "," +
          yScales[d.level].range()[0] +
          ")";
      });

    attribOverlayEnter
      .append("rect")
      .merge(attribOverlay.select("rect"))

      .attr("fill", "none")
      // .style("opacity", "0.1")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", function () {
        return xScale.bandwidth()*1.1;
      })
      .attr("height", function (d) { return yScales[d.level].range()[1] - yScales[d.level].range()[0]; });

    attribOverlayEnter
      .append("text")
      .merge(attribOverlay.select("text"))
      .style("cursor", "grab")
      .style("-webkit-user-select", "none")
      .style("-moz-user-select", "none")
      .style("-ms-user-select", "none")
      .style("user-select", "none")
      .text(function (d) {
        return d.attrib === "__seqId" ?
          "sequential Index" :
          d.attrib;
      })
      .attr("x", xScale.bandwidth()/2)
      .attr("y", 0)
      .style("font-weight", function (d) {
        return dSortBy.has(d.level) &&
          dSortBy.get(d.level) === d.attrib ?
          "bolder" :
          "normal";
      })
      .style("font-family", "sans-serif")
      .style("font-size", nv.attribFontSize+"px")
      .on("click", nvOnClickLevel)
      .call(d3.drag()
        .container(attribOverlayEnter.merge(attribOverlay).node())
        .on("start", attribDragstarted)
        .on("drag", attribDragged)
        .on("end", attribDragended))
      .on("mousemove", function () {
        var sel = d3.select(this);
        sel = sel.transition!==undefined? sel.transition().duration(150) : sel;
        sel
          .style("font-size", nv.attribFontSizeSelected+"px");
      })
      .on("mouseout", function () {
        var sel = d3.select(this);
        sel = sel.transition!==undefined ? sel.transition().duration(150) : sel;
        sel
          .style("font-size", nv.attribFontSize+"px");
      })
      .attr("transform", "rotate(-45)");




    levelOverlayEnter
      .append("text")
      .attr("class", "numNodesLabel")
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .style("pointer-events", "none")
      .merge(levelOverlay.select(".numNodesLabel"))
      .attr("y", function (_, i) {
        return yScales[i].range()[1] + 15;
      })
      .attr("x", function (_, i) {
        return  levelScale(i);
      })
      .text(function (d, i) {
        //return "Showing "+fmt(d.length)+" \n of "+fmt(totalDocs[i])+" elements";
        return "Showing "+fmt(d.length)+" of "+fmt(totalDocs[i]);
      });


    attribOverlay.exit().remove();
    levelOverlay.exit().remove();
  }

  function attribDragstarted(d) {
    console.log("start", d);

    d3.select(this.parentNode)
      .attr("transform", function (d) {
        return "translate(" +
          (d3.event.x + nv.attribFontSize/2) +
          "," +
          yScales[d.level].range()[0] +
          ")";
      });

  }

  function attribDragged(d) {
    var attribInto = invertOrdinalScale(xScale, d3.event.x + nv.attribFontSize/2 - levelScale(d.level));

    console.log(d3.event.x, d3.event.y, attribInto);
    d3.select(this.parentNode)
      .attr("transform", function (d) {
        return "translate(" +
          (d3.event.x + nv.attribFontSize/2) +
          "," +
          yScales[d.level].range()[0] +
          ")";
      });
  }

  function attribDragended(d) {
    console.log("end", d);
    var attrDraggedInto = invertOrdinalScale(xScale, d3.event.x + nv.attribFontSize/2 - levelScale(d.level));
    var pos;
    d3.select(this.parentNode)
      .attr("transform", function (d) {
        return "translate(" +
          x(d.attrib, d.level) +
          "," +
          yScales[d.level].range()[0] +
          ")";
      });

    if (attrDraggedInto!== d.attrib) {
      pos = dimensionsOrder.indexOf(attrDraggedInto);
      moveAttrToPos(d.attrib, pos);
      nv.updateData(dataIs);
    }


  }

  function drawCloseButton() {
    var maxLevel = dataIs.length-1;
    svg.select("#closeButton")
      .style("display", dataIs.length === 1 ? "none":"block")
      .attr("transform", "translate(" + (levelScale(maxLevel) + levelScale.bandwidth() - nv.levelsSeparation +15)  + "," + yScales[maxLevel].range()[0] + ")")
  }


  function drawLine(points, width, color, close) {
    context.beginPath();
    points.forEach(function (p, i) {
      if (i === 0) {
        context.moveTo(p.x, p.y);
      } else {
        context.lineTo(p.x, p.y);
      }
    });
    context.lineWidth = width;
    if (close) {
      context.fillStyle = color;
      context.closePath();
      context.fill();
    } else {
      context.strokeStyle = color;
      context.stroke();
    }
  }

  function drawLevelConvections(level) {
    if (level <= 0) {
      return;
    }
    dataIs[level].representatives.forEach(function (item) {
      // Compute the yPrev by calculating the index of the corresponding representative

      var iOnPrev = dData.get(data[item][id]).__i[level-1];
      var iRep = Math.floor(iOnPrev - iOnPrev%dataIs[level-1].itemsPerpixel);
      // console.log("i rep = "+ iRep);
      // console.log(data[level-1][iRep]);
      // console.log(yScales[level-1](data[level-1][iRep][id]));
      var locPrevLevel = {
        x: levelScale(level-1) + xScale.range()[1],
        y: yScales[level-1]( data[dataIs[level-1][iRep]] [id])
      };
      var locLevel = {
        x: levelScale(level),
        y: yScales[level](data[item][id]) };

      var points = [ locPrevLevel,
        {x: locPrevLevel.x + nv.levelsSeparation * 0.3, y: locPrevLevel.y},
        {x: locLevel.x - nv.levelsSeparation * 0.3, y: locLevel.y},
        locLevel,
        {x: locLevel.x, y: locLevel.y + yScales[level].bandwidth()},
        {x: locLevel.x - nv.levelsSeparation * 0.3, y: locLevel.y + yScales[level].bandwidth()},
        {x: locPrevLevel.x + nv.levelsSeparation * 0.3, y: locPrevLevel.y + yScales[level - 1].bandwidth()},
        {x: locPrevLevel.x, y: locPrevLevel.y + yScales[level -1 ].bandwidth()},
        locPrevLevel

      ];
      drawLine(points, 1, nv.levelConvectionsColor);
      drawLine(points, 1, nv.levelConvectionsColor, true);
    });
  }



  nv.initData = function (mData,  mColScales) {
    var before = performance.now();
    // getAttribs(mData[0][0]);
    colScales  = mColScales;
    colScales.keys().forEach(function (d) {
      dDimensions.set(d, true);
    });
    //dData = d3.map();
    //for (var i = 0; i < data.length ; i++) {
    
    /*for (var i = 0; i < dataIs.length ; i++) {
      //var d = data[i];
      var d = dataIs[i];
      d.__seqId = i; //create a default id with the sequential number
      dData.set(d[id], d);
      d.__i={};
      d.__i[0] = i;

    }*/
    //Add
    // nv.updateData(mData, mColScales, mSortByAttr);

    var after = performance.now();
    console.log("Init data " + (after-before) + "ms");

  };

  function updateScales(levelToUpdate) {
    console.log("Update scales");
    var before = performance.now();
    // yScales=[];
    var lastLevel = dataIs.length-1;

    console.log("Delete unvecessary scales");
    // Delete unvecessary scales
    yScales.splice(lastLevel+1, yScales.length);
    levelToUpdate = levelToUpdate!==undefined ? levelToUpdate : lastLevel;
    yScales[levelToUpdate] = d3.scaleBand()
      .range([y0, height-nv.margin - 30])
      .paddingInner(0.0)
      .paddingOuter(0);



    console.log("Compute representatives")
    var representatives = [];
    console.log('Level to update', levelToUpdate);
    if (dataIs[levelToUpdate].length>height) {
      console.log("Height", height);
      var itemsPerpixel = Math.max(Math.floor(dataIs[levelToUpdate].length / (height*2)), 1);
      console.log("itemsPerpixel", itemsPerpixel);
      dataIs[levelToUpdate].itemsPerpixel = itemsPerpixel;
      for (var j = 0; j< dataIs[levelToUpdate].length; j+=itemsPerpixel ) {
        dataIs[levelToUpdate][j].i = j;
        representatives.push(dataIs[levelToUpdate][j]);
      }
    } else {
      dataIs[levelToUpdate].itemsPerpixel=1;
      //representatives = dataIs[levelToUpdate];
      dataIs[levelToUpdate].forEach(function(d,i){
        d.i = i;
        representatives.push(d);
      });      
    }
    dataIs[levelToUpdate].representatives = representatives;
    //yScales[levelToUpdate].domain(representatives.map(function (rep) { return data[rep.i][id];}));
    yScales[levelToUpdate].domain(representatives.map(function (rep) { return dataIs[levelToUpdate][rep.i][id];}));
    //yScales[levelToUpdate].domain(dataIs);





    // data.forEach(function (levelData, i) {
    //   yScales[i] = d3.scaleBand()
    //     .range([y0, height-nv.margin - 30])
    //     .paddingInner(0.0)
    //     .paddingOuter(0);
    //   yScales[i].domain(levelData.map(function (d) {
    //     return d[id];
    //   })
    //   );
    // });


    console.log("Update color scale domains");
    // Update color scales domains

    // colScales = d3.map();
    dDimensions.keys().forEach(
      function (attrib) {
        if (attrib === "visible" || attrib === "id" ) return;
        var scale = colScales.get(attrib);
        scale.domain(d3.extent(dataIs[0].representatives.map(function (rep) {
          return dataIs[0][rep.i][attrib];
        }))); 
        colScales.set(attrib, scale);
      }
    );

    xScale
      .domain(dimensionsOrder)
      // .domain(dDimensions.keys().sort(function (a,b) {
      //   if (a === "visible") {
      //     return -1;
      //   }
      //   else if (b === "visible") {
      //     return 1;
      //   } else if (a === "__seqId") {
      //     return -1;
      //   } else if (b === "__seqId") {
      //     return 1;
      //   } else {
      //     return 0;
      //   }

      // }))
      .range([0, nv.attribWidth * (dDimensions.keys().length)])
      .paddingInner(0.1)
      .paddingOuter(0);
    levelScale.domain(dataIs.map(function (d,i) { return i; }))
      .range([x0+nv.margin, ((xScale.range()[1] + nv.levelsSeparation) * dataIs.length) + x0])
      .paddingInner(0)
      .paddingOuter(0);

    var after = performance.now();
    console.log("Updating Scales " + (after-before) + "ms");
  }

  nv.updateData = function (mDataIs, mColScales, levelToUpdate) {
    console.log("updateData");
    var before = performance.now();
    var ctxWidth;
    if (typeof mDataIs !== typeof []) {
      console.error("navio updateData didn't receive an array");
      return;
    }
    // if (!dSortBy.has(mDataIs.length-1)) {
    //   dSortBy.set(mDataIs.length-1, mSortByAttr);
    // }
    colScales = mColScales !== undefined ? mColScales: colScales;
    dataIs = mDataIs;
    //console.log("New Data",dataIs);
    console.log("Level to Update",levelToUpdate);

    updateScales(levelToUpdate);

    ctxWidth = levelScale.range()[1] + nv.margin + x0;
    d3.select(canvas)
      .attr("width", ctxWidth)
      .attr("height", height)
      .style("width", ctxWidth)
      .style("height", height+"px");
    canvas.style.width = ctxWidth+"px";
    canvas.style.height = height+"px";

    svg
      .attr("width", ctxWidth)
      .attr("height", height);
    nv.update();
    var after = performance.now();
    console.log("Updating data " + (after-before) + "ms");

  };

  function deleteOneLevel() {
    //if (dataLs.length<=1) return;
    if (dataIs.length<=1) return;
    console.log("Delete one level");
    //removeBrushOnLevel(dataLs.length-2);
    removeBrushOnLevel(dataIs.length-2);
    //dataLs[dataLs.length-2].forEach(function (d) { data[d].visible=true; });
    //dataIs[dataIs.length-2].forEach(function (d) { data[d].visible=true; });

    //dataLs = dataLs.slice(0, dataLs.length-1);
    //nv.updateData(dataLs, colScales);
    dataIs = dataIs.slice(0, dataIs.length-1);
    nv.updateData(dataIs, colScales);
    //updateCallback(nv.getVisible());

    filters.pop();
    totalDocs.pop();
    console.log("Filter removed from stack");
  }

  function moveAttrToPos(attr, pos) {
    var i = dimensionsOrder.indexOf(attr);
    if ( i === -1)  { console.err("moveAttrToPos attr not found", attr); return; }
    if ( pos > dimensionsOrder.length || pos < 0) { console.err("moveAttrToPos pos out of bounds", pos, dimensionsOrder.length); return; }
    dimensionsOrder.splice(i, 1);
    dimensionsOrder.splice(pos, 0, attr);
  }



  nv.update = function() {
    var before = performance.now();

    var w = levelScale.range()[1] + nv.margin + x0;
    context.clearRect(0,0,w+1,height+1);
    dataIs.forEach(function (levelData, i) {
      //var itemsPerpixel = Math.floor(levelData.length/height);
      // if (itemsPerpixel>1) { //draw one per pixel
      //   for (var j = 0; j< levelData.length; j+=(itemsPerpixel-1)) {
      //     drawItem(levelData[j], i);
      //   }
      // } else { // draw all
      levelData.representatives.forEach(function (rep) {
        drawItem(dataIs[i][rep.i], i);
        //drawItem(rep, i);
      });
      // }

      drawLevelBorder(i);
      //drawLevelConvections(i);

    });


    drawBrushes();
    drawCloseButton();
    var after = performance.now();
    console.log("Redrawing " + (after-before) + "ms");

  };

  nv.addAttrib = function (attr, scale) {
    if (dimensionsOrder.indexOf(attr)!== -1) return;
    dimensionsOrder.push(attr);
    colScales.set(attr,scale);
    return nv;
  };

  nv.addSequentialAttrib = function (attr, scale ) {
    nv.addAttrib(attr,scale ||
      d3.scaleSequential(defaultColorInterpolator)
        .domain(data!==undefined && data.length>0 ?
          d3.extent(data, function (d) { return d[attr]; }) :
          [0, 1]) //if we don"t have data, set the default domain
    );
    return nv;
  };

  nv.addDivergingAttrib = function (attr, scale ) {
    var domain = data!==undefined && data.length>0 ?
      d3.extent(data, function (d) { return d[attr]; }) :
      [-1,  1];
    nv.addAttrib(attr,scale ||
      d3.scaleDiverging(defaultColorInterpolator)
        .domain([domain[0], 0, domain[1]]) //if we don"t have data, set the default domain
    );
    return nv;
  };

  nv.addCategoricalAttrib = function (attr, scale ) {
    nv.addAttrib(attr,scale ||
      d3.scaleOrdinal(d3.schemeCategory10));
    return nv;
  };

  // nv.addAllAttribs = function (_attribs, scale) {
  //   if (!data || !data.length) throw Error("no data defined yet!");

  //   var attribs = _attribs!==undefined ? _attribs : getAttribs(data[0]);
  //   var guessedScale, domain;
  //   attribs.forEach(function (attr) {
  //     if (typeof(data[attr]) === typeof("")) {
  //       guessedScale = d3.scaleOrdinal(d3.schemeCategory10);
  //     // } else if (typeof(data[attr]) === typeof(new Date())) {
  //     //   guessedScale = d3.scaleSequential(defaultColorInterpolatorDate)
  //     //     .domain(data!==undefined && data.length>0 ?
  //     //       d3.extent(data, function (d) { return d[attr]; }) :
  //     //       [0, 1]); //if we don"t have data, set the default domain
  //     } else {
  //       domain = data!==undefined && data.length>0 ?
  //         d3.extent(data, function (d) { return d[attr]; }) :
  //         [0, 1];

  //       // if (domain[0] < 0) {
  //       //   d3.scaleSequential(defaultColorInterpolatorDiverging)
  //       //     .domain([domain[0], 0, domain[1]]); //if we don"t have data, set the default domain
  //       // } else {
  //         d3.scaleSequential(defaultColorInterpolator)
  //           .domain(domain); //if we don"t have data, set the default domain
  //       // }
  //     }
  //     console.log("attr", attr, guessedScale);

  //     nv.addAttrib(attr,scale ||
  //       guessedScale);
  //   });

  //   nv.updateData(dataIs);
  //   return nv;
  // };


  nv.dataFilterSample = function(_){
    if(arguments.length){
      console.log(arguments);

    }
  }
  nv.data = function(_) {
    /*if (!colScales.has("visible")) {
      nv.addAttrib("visible",
        d3.scaleOrdinal()
          .domain([false,true])
          .range(visibleColorRange)
          //, "#cddca3", "#8c6d31", "#bd9e39"]
      );
      moveAttrToPos("visible", 0);
    }*/
    /*
    if (!colScales.has("__seqId")) {
      nv.addSequentialAttrib(
        "__seqId"
      );
      moveAttrToPos("__seqId", 1);
    }*/


    // nv.addCategoricalAttrib("group");


    if (arguments.length) {
      _.forEach(function (d) {
        d.visible = true;
      });

      data = _;
      //dataIs = data;
      dataIs = [data.map(function (_, i) { return _; })];
      //dataIs = [data.map(function (_, i) { return i; })];
      //TODO Cambiar a despues init
      totalDocs.push(nv.totalElemsTadava);
      nv.initData(
        dataIs,
        colScales
      );
      nv.updateData(
        dataIs,
        colScales
      );
      return nv;
    } else {
      return data[0];
    }
  };

  nv.getVisible = function() {
    return dataIs[dataIs.length-1].filter(function (d) { return data[d].visible; }).map(function (d) { return data[d]; });
  };


  nv.updateCallback = function(_) {
    return arguments.length ? (updateCallback = _, nv) : updateCallback;
  };

  nv.visibleColorRange = function(_) {
    return arguments.length ? (visibleColorRange = _, nv) : visibleColorRange;
  };

  nv.defaultColorInterpolator = function(_) {
    return arguments.length ? (defaultColorInterpolator = _, nv) : defaultColorInterpolator;
  };

  nv.id = function(_) {
    return arguments.length ? (id = _, nv) : id;
  };

  nv.tadavaCB = function(filters, url, index){
    //Do something with filter stack
    // 1. Take filters and run each step as sampling calling URL endpoint
    // 2. Get reponse and construct array of arrays
    // 3. Display


  }

  return nv;
}