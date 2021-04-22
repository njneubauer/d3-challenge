var svgWidth = 980;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
//   .attr("width", svgWidth)
//   .attr("height", svgHeight)
  .attr("viewBox", `0, 0, ${svgWidth}, ${svgHeight}`);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Paramaters
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

function xScale(healthData, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis])*0.95,
    d3.max(healthData, d => d[chosenXAxis])*1.1
    ])
    .range([0, width])
    
    return xLinearScale;
}

function yScale(healthData, chosenYAxis){
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis])*0.8,
    d3.max(healthData, d => d[chosenYAxis])*1.08
    ])
    .range([height, 0])
    
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating xAxis circle transition to new circles
function renderXCircles(circlesGroup, textGroup, newXScale, chosenXAxis){
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    textGroup.transition()
     .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));
    
    return circlesGroup;
}

// function used for updating yAxis circle transition to new circles
function renderYCircles(circlesGroup, textGroup, newYScale, chosenYAxis){
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    textGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis])+5.5);

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup){
    var xlabel;

    var percent = "%";

    if (chosenXAxis === "poverty"){
        xlabel = "Poverty:";
    }
    else if (chosenXAxis === "age"){
        xlabel = "Age(median):";
        percent = "";
    }
    else {
        xlabel = "Household Income(median):";
        percent = "";
    }

    var ylabel;
    
    if (chosenYAxis === "obesity"){
        ylabel = "Obesity:";
    }
    else if (chosenYAxis === "smokes"){
        ylabel = "Smoker:";
    }
    else {
        ylabel = "Lacks Healthcare:";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-5,50])
        .html(function(d){
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}${percent}<br>${ylabel} ${d[chosenYAxis]}${percent}`)
        });

    circlesGroup.call(toolTip);

    // mouseover show data 
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this)
        var circle = d3.select(this).style("stroke", "black");
      })
        // mouseout event hide data
        .on("mouseout", function(data) {
          toolTip.hide(data, this);
          d3.select(this).style("stroke", "#e3e3e3");
        });

      return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
var file = "assets/data/data.csv"

d3.csv(file).then(function(healthData, err){
    if (err) throw err;

    console.log(healthData);

    // Parse Data
    healthData.forEach(function(d){
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity
        d.smokes = +d.smokes;
        d.healthcare = +d.healthcare;
    });

    //xLinearScale
    var xLinearScale = xScale(healthData, chosenXAxis);

    //yLinearScale
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circleG = chartGroup.append("g")
        .classed("chart-area", true);
 
    // append initial circles
    var circlesGroup = circleG.selectAll("g", "chart-area")
        .data(healthData)
        .enter()
        .insert("circle")
            .classed("stateCircle", true)
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 14);
     
    var textGroup = circleG.selectAll("g", "chart-area")
        .data(healthData) 
        .enter()
        .insert("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis])+5.5)
            .classed("stateText", true)
            .text(d=>d.abbr);

    // Create group for x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // create xAxis group labels
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value for event listener
        .classed("active", true)
        .text("Poverty(%)");
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value for event listener
        .classed("inactive", true)
        .text("Age(median)");
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value for event listener
        .classed("inactive", true)
        .text("Household Income(median)");

    // Create group for Y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
       
    // create y axis label groups
    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 10 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")//value for event listener
        .classed("active", true)
        .text("Obesity(%)");
    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 30 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")//value for event listener
        .classed("inactive", true)
        .text("Smoker(%)");
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 50 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")//value for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare(%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function(){
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                //update chosenXAxis value
                chosenXAxis = value;
        
                // updates x scale with new data
                xLinearScale = xScale(healthData, chosenXAxis);
                
                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);
            
                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, textGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else if (chosenXAxis === "income"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }

            }
        });

    // x axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function(){
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                //update chosenXAxis value
                chosenYAxis = value;
                
                // updates x scale with new data
                yLinearScale = yScale(healthData, chosenYAxis);
                
                // updates x axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderYCircles(circlesGroup, textGroup, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // changes classes to change bold text
                if (chosenYAxis === "smokes"){
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else if (chosenYAxis === "healthcare"){
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
                else {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }

            }
        });
}).catch(function(error) {
    console.log(error);
  });