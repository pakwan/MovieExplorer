// parameters
var data = 0;
var scatterPlot;

window.onload = function () { // do when page is loaded
    initialization();
};

function initialization() {
    console.log("Initializing...");
    d3.selectAll('.spinning-animation').classed("hidden", false); //start loading animation
    var anchor = d3.selectAll("div");
    console.log('all:',anchor._groups[0]);

    // insert svg
    scatterPlot = d3.select("#scatterplot").append("svg").attr("width",'100%').attr("height",'100%');
    scatterPlot.style("background","rgba(255, 255, 255, 0.09)");

    d3.selectAll('.spinning-animation').classed("hidden", true); //remove loading animation
    console.log("Initialization finished!");
}

