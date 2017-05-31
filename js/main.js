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

    // load data set
    d3.csv(pathToDataSet, preProcess, function(loadedData){
        data = loadedData;
        console.log(loadedData);
        finishedLoadingDataset();
    });


}

function finishedLoadingDataset(){
    // calculate scale
    scatterPlotWidth = d3.select('#scatterPlot').node().getBoundingClientRect().width;
    scatterPlotHeight = d3.select('#scatterPlot').node().getBoundingClientRect().height;
    scatterPlotX = d3.scaleLinear().domain(scatterPlotDomainX).range([scatterPlotMarginX[0],scatterPlotWidth-scatterPlotMarginX[1]]); // scale function
    scatterPlotY = d3.scaleLinear().domain(scatterPlotDomainY).range([scatterPlotMarginY[0],scatterPlotHeight-scatterPlotMarginY[1]]); // scale function
    // axis
    var xAxis = d3.axisBottom(scatterPlotX);
    var yAxis = d3.axisLeft(scatterPlotY);
    var originX = scatterPlotX(scatterPlotDomainX[0]);
    var originY = scatterPlotY(scatterPlotDomainY[1]); // as y is the other way round (from imdB score 10 to 0)
    // scatterPlot.append('g').attr('transform','translate('+originX+','+originY+')').call(xAxis);
    // scatterPlot.append('g').attr('transform','translate('+originX+','+originY+')').call(yAxis);
    scatterPlot.append('g').attr('transform','translate('+0+','+originY+')').call(xAxis);
    scatterPlot.append('g').attr('transform','translate('+originX+','+0+')').call(yAxis);
    // var xAxis = d3.svg.axis()
    //     .scale(x)
    //     .orient('bottom')
    //     .tickSize(-height);
    //
    // var yAxis = d3.svg.axis()
    //     .scale(y)
    //     .orient('left')
    //     .tickSize(-width);
    // svg.append('g')
    //     .classed('x axis', true)
    //     .attr('transform', 'translate(0,' + height + ')')
    //     .call(xAxis)
    //     .append('text')
    //     .classed('label', true)
    //     .attr('x', width)
    //     .attr('y', margin.bottom - 10)
    //     .style('text-anchor', 'end')
    //     .text(xCat);
    //
    // svg.append('g')
    //     .classed('y axis', true)
    //     .call(yAxis)
    //     .append('text')
    //     .classed('label', true)
    //     .attr('transform', 'rotate(-90)')
    //     .attr('y', -margin.left)
    //     .attr('dy', '.71em')
    //     .style('text-anchor', 'end')
    //     .text(yCat);
    
    // add items to scatter plot
    var circlesExistingYet = scatterPlot.selectAll('circle').data(data,keyFunction);
    var newlyAddedCircles = circlesExistingYet.enter().append('circle');
    newlyAddedCircles.attr('r', 1)
        .attr('cx', function(d) {
            return scatterPlotX(d['duration']);
        })
        .attr('cy', function(d) {
            return scatterPlotY(d['imdb_score']);
        });

    d3.selectAll('.spinning-animation').classed('hidden', true); //remove loading animation
    console.log('Initialization finished!');
}

// tells d3 if two objects are the same. Comparable to Java equals function but only returns a key
function keyFunction(d){
    return d['movie_title'];
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
    else{console.warn('Dont forget the following age rating:',item['content_rating']);}

    // map duration from string to integer (the + is doing that!)
    item['duration'] = +item['duration'];

    // map duration from string to integer (the + is doing that!)
    item['imdb_score'] = +item['imdb_score'];

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