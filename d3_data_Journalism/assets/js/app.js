var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Paramaters
var chosenXAxis = "poverty";


function xScale(healthData, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width])
    
    return xLinearScale;
}


function yScale(healthData, chosenYAxis){
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
    d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0])
    
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .domain(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .domain(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating xAxis circle transition to new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis){
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
        return circlesGroup;
}

// function used for updating yAxis circle transition to new circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis){
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenYAxis]));
    
        return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup){
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
        ylabel = "Smokes:";
    }
    else {
        ylabel = "Lacks Healthcare:";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8,0])
        .html(function(d){
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}${percent}<br>${ylabel} ${d[chosenYAxis]}${percent}`)
        });

    circlesGroup.call(toolTip);
    // mouseover show data 
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // mouseout event hide data
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
    
      return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
var file = "assets/data/data.csv"

d3.csv(file).then(function(healthData, err){
    if (err) throw err;

    console.log(data);

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

//xLinearScale
var yLinearScale = yScale(healthData, chosenYAxis)

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

// append y axis
 chartGroup.append("g")
    .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
    .data(hairData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("class", "stateCircle");

// create group for x axis lables

// create group for y axis labels

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);



});

