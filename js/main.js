// parameters
var data = 0;
var scatterPlot;
var pathToDataSet = 'data/movie_metadata.csv';
var scatterPlotWidth;
var scatterPlotHeight;
var scatterPlotDomainX = [60,260]; // range of values to display on the x axis
var scatterPlotDomainY = [10,0]; // range of values to display on the y axis (counted from top left --> beginning with 10)
var scatterPlotMarginX = [40,40];
var scatterPlotMarginY = [40,40];
var scatterPlotX; // scaling function in x direction
var scatterPlotY; // scaling function in y direction
var numberOfGenres;
var scatterPlotColors; // scaling function to map genre to color
var transition;
var filterLimits;

window.onload = function () { // do when page is loaded
    initialization();
};

function initialization() {
    console.log('Initializing...');
    d3.selectAll('.spinning-animation').classed('hidden', false); //start loading animation

    // insert svg
    scatterPlot = d3.select('#scatterPlot').append('svg').attr('width','100%').attr('height','100%');
    // scatterPlot.style('background','rgba(255, 255, 255, 0.09)');
    // scatterPlot.style('background','yellow');

    // specify transition settings
    transition = d3.transition().duration(700).delay(100);

    filterLimits = {
        age:{
            min: 0,
            max: 18
        },
        duration:{
            min: scatterPlotDomainX[0],
            max: scatterPlotDomainX[1]
        }
    };

    // load data set
    d3.csv(pathToDataSet, preProcess, function(loadedData){
        data = loadedData;
        console.log(loadedData);
        finishedLoadingDataset();
    });


}

function update(){
    // add items to scatter plot
    var rectsExistingYet = scatterPlot.selectAll('rect')
        .data(data.filter(function(d) {
                return filterLimits.duration.min <= d.duration && d.duration <= filterLimits.duration.max
                    && filterLimits.age.min <= d.minAge && d.minAge <= filterLimits.age.max;
            }),
            keyFunction);
    rectsExistingYet.exit().remove();
    var newlyAddedRects = rectsExistingYet.enter().append('rect');
    newlyAddedRects
        .attr('x', function(d) {
            return scatterPlotX(d['duration']);
        })
        .attr('y', function(d) {
            return scatterPlotY(d['imdb_score']);
        })
        .attr('rx', function(d) { // roundness of corners
            if(d['language'].toLowerCase()==='english'){
                return d['famousness']/2;
            }else{
                return 0;
            }
        })
        .attr('width', function(){
            // return d.famousness;
            return 0; // transition is handling this (see below)
        })
        .attr('height', function(){
            // return d['famousness'];
            return 0; // transition is handling this (see below)
        })
        .attr('stroke-width', function(d){
            return Math.min(Math.max(1.0,d['famousness']/10),2.0);
            // return 1;
        })
        .attr('fill', function(){
            return 'transparent';
        })
        .attr('stroke', function(d){ // color
            return scatterPlotColors(d['genreColor']);
        })
        .on("mouseover", function(){
            d3.select(this).transition().duration(300)
                .attr('width', function(d){return 2*d.famousness;})
                .attr('height', function(d){return 2*d.famousness;})
                .attr('x', function(d) {return scatterPlotX(d['duration'])-d.famousness/2;})
                .attr('y', function(d) {return scatterPlotY(d['imdb_score'])-d.famousness/2;})
                .attr('rx', function(d) { // roundness of corners
                    if(d['language'].toLowerCase()==='english'){return 2*d['famousness']/2;
                    }else{return 0;}
                });
        })
        .on("mouseout", function(){
            d3.select(this).transition().duration(300)
                .attr('width', function(d){return d.famousness;})
                .attr('height', function(d){return d.famousness;})
                .attr('x', function(d) {return scatterPlotX(d['duration']);})
                .attr('y', function(d) {return scatterPlotY(d['imdb_score']);})
                .attr('rx', function(d) { // roundness of corners
                    if(d['language'].toLowerCase()==='english'){return d['famousness']/2;
                    }else{return 0;}
                });
        })
        .transition(transition)
        .attr('width', function(d){
            return d.famousness;
        })
        .attr('height', function(d){
            return d.famousness;
        })

}

function finishedLoadingDataset(){
    createSliders();

    // calculate scale
    scatterPlotWidth = d3.select('#scatterPlot').node().getBoundingClientRect().width;
    scatterPlotHeight = d3.select('#scatterPlot').node().getBoundingClientRect().height;
    scatterPlotX = d3.scaleLinear().domain(scatterPlotDomainX).range([scatterPlotMarginX[0],scatterPlotWidth-scatterPlotMarginX[1]]); // scale function
    scatterPlotY = d3.scaleLinear().domain(scatterPlotDomainY).range([scatterPlotMarginY[0],scatterPlotHeight-scatterPlotMarginY[1]]); // scale function
    scatterPlotColors = d3.scaleOrdinal(d3.schemeCategory20);

    // axis
    var xAxis = d3.axisBottom(scatterPlotX);
    var yAxis = d3.axisLeft(scatterPlotY);
    var originX = scatterPlotX(scatterPlotDomainX[0]);
    var originY = scatterPlotY(scatterPlotDomainY[1]); // as y is the other way round (from imdB score 10 to 0)
    scatterPlot.append('g').attr('transform','translate('+0+','+originY+')').call(xAxis);
    scatterPlot.append('g').attr('transform','translate('+originX+','+0+')').call(yAxis);
    // axis labels
    scatterPlot.append("text") //https://stackoverflow.com/questions/11189284/d3-axis-labeling
        // .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", scatterPlotWidth/2)
        .attr("y", scatterPlotHeight - scatterPlotMarginY[1]+30)
        .text("Duration");
    scatterPlot.append("text")
        // .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -scatterPlotHeight/2) // x and y are swapped due to rotation
        .attr("y", scatterPlotMarginX[0]-20)
        // .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Score");

    update();

    d3.selectAll('.spinning-animation').classed('hidden', true); //remove loading animation
    console.log('Initialization finished!');
}

// tells d3 if two objects are the same. Comparable to Java equals function but only returns a key
function keyFunction(d){
    return d['movie_title'];
}

function createSliders(){


    var ageSlider = document.getElementById('minimumAgeSlider');
    noUiSlider.create(ageSlider, {
        start: [ 0, 18 ],
        range: {
            'min': [  0 ],
            'max': [ 18 ]
        },
        pips: {
            mode: 'range',
            density: 18
        },
        tooltips: [numberFormatter(0), numberFormatter(0)] // transform numbers to correct format

    });
    var i=0;
    var timeOfLastUpdate = 0;
    ageSlider.noUiSlider.on('update',function (values, handle) {
        i++;
        var thisValue = i;
        console.log('Update requested:',filterLimits.age.min,filterLimits.age.max,handle,i);
        filterLimits.age.min = values[0];
        filterLimits.age.max = values[1];
        setTimeout(function(){
            // only update if: last event (slider is not moved anymore) || every 300ms
            if(i==thisValue || (new Date()).getTime()-timeOfLastUpdate>300){
                timeOfLastUpdate = (new Date()).getTime();
                console.log('Updated:',filterLimits.age.min,filterLimits.age.max,handle);
                update();
            }
        },100);
    });

    // create color-coding of slider bar
    var whiteToBlack = d3.scaleLinear().domain([0,1]).range(["white", "black"]);
    var groupedMinAges = d3.nest()
        .key(function(d){return d.minAge}) // group by minAge
        .rollup(function(values){return d3.sum(values,function(){return 1;})}) // calculate number of movies per group (minAge)
        .entries(data); // do all that with the data object
    groupedMinAges.sort(function(x, y){return d3.ascending(+x.key, +y.key);});
    var maxMovieCountPerMinAge = d3.max(groupedMinAges, function(d) { return +d.value;} );
    // plot this to the slider
    var minAgeSliderBackground = d3.select('#minimumAgeSlider').append('svg').attr('width','100%').attr('height','100%');
    var width = d3.select('#minimumAgeSlider').node().getBoundingClientRect().width;
    var height = d3.select('#minimumAgeSlider').node().getBoundingClientRect().height;
    var x = d3.scaleLinear().domain([0,19]).range([0,width]); // scale function
    minAgeSliderBackground.selectAll('rect').data(groupedMinAges).enter().append('rect')
        // .attr('width', function(d){return x(19-d.key);})
        .attr('width', function(){return x(1);})
        .attr('height', function(){return height;})
        .attr('x', function(d) {return x(+d.key)})
        .attr('y', function() {return 0;})
        .attr('age', function(d){return d.key;})
        .attr('fill', function(d){return whiteToBlack((+d.value)/maxMovieCountPerMinAge);});//d3.interpolateGreys(+d.value)});
}

function numberFormatter(digits){
    return {
        to: function(value){return value.toFixed(digits);},
        from: function(value){return +value;}
    }
}

// Process data items from the csv
function preProcess(item){
    // extract age from codes
    if(item['content_rating'] === 'PG-13'){item.minAge=13;}
    else if(item['content_rating'] === 'G'){item.minAge=0;}
    else if(item['content_rating'] === 'PG'){item.minAge=6;} // not clearly defined :(
    else if(item['content_rating'] === 'R'){item.minAge=17;} // not clearly defined :(
    else if(item['content_rating'] === 'NC-17'){item.minAge=18;}
    else if(item['content_rating'] === 'Not Rated'){item.minAge=18;} // ?
    else if(item['content_rating'] === 'Not Rated'){item.minAge=18;} // ?
    else if(item['content_rating'] === 'Unrated'){item.minAge=18;} // ?
    else if(item['content_rating'] === 'Approved'){item.minAge=18;} // ?
    else if(item['content_rating'] === 'GP'){item.minAge=6;} // PG?
    else if(item['content_rating'] === 'TV-Y'){item.minAge=0;}
    else if(item['content_rating'] === 'TV-Y7'){item.minAge=7;}
    else if(item['content_rating'] === 'TV-G'){item.minAge=0;}
    else if(item['content_rating'] === 'TV-PG'){item.minAge=12;} //?
    else if(item['content_rating'] === 'TV-14'){item.minAge=14;}
    else if(item['content_rating'] === 'TV-MA'){item.minAge=17;}
    else if(item['content_rating'] === 'M'){item.minAge=15;}
    else if(item['content_rating'] === 'X'){item.minAge=18;} // ?
    else if(item['content_rating'] === 'Passed'){item.minAge=15;}
    else if(item['content_rating'] === ''){item.minAge=18;} // Missing
    else{console.warn('Don\'t forget the following age rating:',item['content_rating']);}

    // map duration from string to integer (the + is doing that!)
    item.duration = +item['duration'];

    // map duration from string to integer (the + is doing that!)
    item.imdb_score = +item['imdb_score'];

    // calculate famousness
    var numCritics = +item['num_critic_for_reviews'];
    var numReviews = +item['num_user_for_reviews'];
    var numVotes = +item['num_voted_users'];
    item.famousness = Math.pow(numCritics*100+numReviews+numVotes, 1/3)/7;

    // get main genre / genre category
    if(item['genres'].includes('Sci')){item.genre='Fantasy/Sci-Fi';item.genreColor=1;}
    else if(item['genres'].includes('Animation')){item.genre='Family';item.genreColor=0;}
    else if(item['genres'].includes('Fantasy')){item.genre='Fantasy/Sci-Fi';item.genreColor=1;}
    else if(item['genres'].includes('Family')){item.genre='Family';item.genreColor=0;}
    else if(item['genres'].includes('Thriller')){item.genre='Action';item.genreColor=1;}
    else if(item['genres'].includes('Adventure')){item.genre='Action';item.genreColor=1;}
    else if(item['genres'].includes('Romance')){item.genre='Romance/Musical';item.genreColor=0;}
    else if(item['genres'].includes('Musical')){item.genre='Romance/Musical';item.genreColor=0;}
    else if(item['genres'].includes('Music')){item.genre='Romance/Musical';item.genreColor=0;}
    else if(item['genres'].includes('Western')){item.genre='Action';item.genreColor=1;}
    else if(item['genres'].includes('Biography')){item.genre='Drama';item.genreColor=2;}
    else if(item['genres'].includes('History')){item.genre='History';item.genreColor=2;}
    else if(item['genres'].includes('Comedy')){item.genre='Comedy';item.genreColor=4;}
    else if(item['genres'].includes('Documentary')){item.genre='Documentary';item.genreColor=2;}
    else if(item['genres'].includes('Drama')){item.genre='Drama';item.genreColor=2;}
    else if(item['genres'].includes('Horror')){item.genre='Horror';item.genreColor=3;}
    else if(item['genres'].includes('Crime')){item.genre='Action';item.genreColor=1;}
    else if(item['genres'].includes('Action')){item.genre='Action';item.genreColor=1;}
    else {console.warn('Don\'t forget to consider the genre: ',item['genres']);}
    numberOfGenres = 5;

    // delete unnecessary fields
    delete item['actor_1_facebook_likes'];
    delete item['movie_facebook_likes'];
    delete item['facenumber_in_poster'];
    delete item['director_facebook_likes'];
    delete item['cast_total_facebook_likes'];
    delete item['aspect_ratio'];
    delete item['actor_3_facebook_likes'];
    delete item['actor_2_facebook_likes'];
    delete item['num_voted_users'];
    delete item['num_user_for_reviews'];
    delete item['num_critic_for_reviews'];

    return item;
}
/* Example for data item:
 actor_1_facebook_likes
 :
 '1000'
 actor_1_name
 :
 'CCH Pounder'
 actor_2_facebook_likes
 :
 '936'
 actor_2_name
 :
 'Joel David Moore'
 actor_3_facebook_likes
 :
 '855'
 actor_3_name
 :
 'Wes Studi'
 aspect_ratio
 :
 '1.78'
 budget
 :
 '237000000'
 cast_total_facebook_likes
 :
 '4834'
 color
 :
 'Color'
 content_rating
 :
 'PG-13'
 country
 :
 'USA'
 director_facebook_likes
 :
 '0'
 director_name
 :
 'James Cameron'
 duration
 :
 '178'
 facenumber_in_poster
 :
 '0'
 genres
 :
 'Action|Adventure|Fantasy|Sci-Fi'
 gross
 :
 '760505847'
 imdb_score
 :
 '7.9'
 language
 :
 'English'
 movie_facebook_likes
 :
 '33000'
 movie_imdb_link
 :
 'http://www.imdb.com/title/tt0499549/?ref_=fn_tt_tt_1'
 movie_title
 :
 'Avatar '
 num_critic_for_reviews
 :
 '723'
 num_user_for_reviews
 :
 '3054'
 num_voted_users
 :
 '886204'
 plot_keywords
 :
 'avatar|future|marine|native|paraplegic'
 title_year
 :
 '2009'
 __proto__
 :
 Object

 */