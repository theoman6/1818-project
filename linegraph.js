/**
 * Created by hen on 2/20/14.
 */
    var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;

    margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

    width = 960 - margin.left - margin.right;

    height = 700 - margin.bottom - margin.top;

    bbVis = {
        x: 0 + 100,
        y: 10,
        w: width - 100,
        h: 500
    };

    dataSet = {};

    svg = d3.select("#vis").append("svg").attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
    }).append("g").attr({
            transform: "translate(" + margin.left + "," + margin.top + ")"
        });


    d3.csv("golfData.csv", function(data) {

        data.forEach(function(row){
            dataSet[row.golfer] = dataSet[row.golfer] || {"tournaments": []};
    
            if (row["day4"] != "-")
                dataSet[row.golfer]["tournaments"].push(row); 

            if (!dataSet[row.golfer]["birthyear"] && row.age != "-"){
                dataSet[row.golfer]["birthyear"] = row.year - row.age;
            }
        })

        for (golfer in dataSet){
            if (!dataSet[golfer]["birthyear"] || dataSet[golfer]["tournaments"].length < 2)
                delete dataSet[golfer];
        }


        // convert your csv data and add it to dataSet

        return createVis("score_change");
    });

    currently_showing = "";

    $("#mode").change(function(){
        destroyVis();
        createVis(this.value);
    })

    destroyVis = function(){
        d3.selectAll(".visualization").remove();
    }

    createVis = function(feature) {
        var xAxis, xScale, yAxis,  yScale;

          xScale = d3.scale.linear().domain([2005,2014]).range([0, bbVis.w]);  // define the right domain generically

          yMax = 0;
          yMin = 1000; 
          nodes = [];

          for (golfer in dataSet){
            for (var i = 0; i < dataSet[golfer]["tournaments"].length; i++){
                if (yMax < parseInt(dataSet[golfer]["tournaments"][i][feature]))
                    yMax = dataSet[golfer]["tournaments"][i][feature];
                if (yMin > parseInt(dataSet[golfer]["tournaments"][i][feature]))
                    yMin = dataSet[golfer]["tournaments"][i][feature];
            }
            nodes = nodes.concat(dataSet[golfer]["tournaments"]);
          }

          if (feature == "score_change")
            yMin = -yMax;

          yScale = d3.scale.linear().domain([yMax, yMin]).range([0,bbVis.h]);
		  // example that translates to the bottom left of our vis space:
		  var visFrame = svg.append("g").attr({
		      "transform": "translate(" + bbVis.x + "," + bbVis.y + ")",
              "class": "visualization"
		  	  //....
			  
		  })
          svg.attr("class", "dataArea");
		  
          var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

          var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

          svg.append("g")
            .attr("class", "x axis visualization")
            .attr("transform", "translate(" + bbVis.x + "," + bbVis.h + ")")
            .call(xAxis);

          svg.append("g")
            .attr("class", "y axis visualization")
            .attr("transform", "translate(" + bbVis.x + ",0)")
            .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(feature);


            tournaments = ["Masters", "US Open", "British Open", "PGA Championship"];

            golfers = Object.keys(dataSet); 

            var points = visFrame.selectAll(".points")
                .data(nodes)
                .enter().append("svg:circle")
                .attr("class", function(d){
                    return "points " + "golfer" + golfers.indexOf(d.golfer);
                })
                .attr("fill", function(d, i){
                    return "black";
                })
                .attr("cx", function(d, i){
                    return xScale(parseInt(d.year) + (tournaments.indexOf(d.tournament) / 4));
                })
                .attr("cy", function(d, i){
                    return yScale(d[feature]) - bbVis.y;
                })
                .attr("r", 3)
                .on("mouseover", function(d){
                    d3.selectAll(".golfer" + golfers.indexOf(d.golfer)).attr("r", "6").attr("fill", "red");
                    d3.select("#details").html("<h4>" + d.golfer + "<h4><h5>" + d.year + ": " + d.tournament + "</h5><h5>" + feature + ": " + d[feature] + "</h5>");
                })
                .on("mouseout", function(d){
                    if (currently_showing != d.golfer)
                        d3.selectAll(".golfer" + golfers.indexOf(d.golfer)).attr("r", "3").attr("fill", "black");
                    else 
                        d3.selectAll(".golfer" + golfers.indexOf(currently_showing)).attr("r", "6").attr("fill", "blue");

                    d3.select("#details").html("");
                })

            golfer_input = $("#golfer_input").autocomplete({
                source: golfers,
            });


            $("#show_golfer").click(function(){
                golfer = $("#golfer_input").val();

                d3.selectAll(".golfer" + golfers.indexOf(currently_showing)).attr("r", "3").attr("fill", "black");

                if (golfer != currently_showing){
                    d3.selectAll(".golfer" + golfers.indexOf(golfer)).attr("r", "6").attr("fill", "blue");
                    currently_showing = golfer; 
                }
                else 
                    currently_showing = "";
            })

            






		  //....
		  
//        yScale = .. // define the right y domain and range -- use bbVis

//        xAxis = ..
//        yAxis = ..
//        // add y axis to svg !


    };
