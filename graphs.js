// state to manage first time render, Initalized to false
let hasRendered = false;

// Init classes to display, originally empty
let classesToDisplay = [];

//List of selected classes
let selectedClasses = [];

//Initalize array of selected text (empty for now)
let selectedWords = [];

// Initalizes string of words to be highlighted (brushing and linking)
let wordsToHighlight = '';

// Base Code: https://www.d3-graph-gallery.com/graph/barplot_stacked_percent.html

// set the dimensions and margins of the graph
var margin = { top: 100, right: 30, bottom: 40, left: 50 },
  width = 1000 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Tooltip Code: https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73
// Adds a tooltip to body of HTML
var div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

// append the svg object to the body of the page
var svg = d3
  .select('#graphs')
  .append('div')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//Add X axis label
svg
  .append('text')
  .attr('x', width / 2)
  .attr('y', height + margin.bottom)
  .style('text-anchor', 'middle')
  .text('Class');

//Add Y axis label
svg
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', margin.left - 85)
  .attr('x', 0 - height / 2)
  .style('text-anchor', 'middle')
  .text('Alumni (%)');

// Function for creating stacked bar chart
const createStackedBarPlot = (csvFileName, graphTitle) => {
  d3.csv('/data/' + csvFileName + '.csv', function (data) {
    // Add title to the graph
    svg
      .append('text')
      .attr('id', 'graph-title')
      .attr('x', width / 2)
      .attr('y', 0 - margin.top + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('MPF Experience: ' + graphTitle);

    //Add graph subtitle
    svg
      .append('text')
      .attr('id', 'graph-title')
      .attr('x', width / 2)
      .attr('y', 0 - margin.top + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Showing Classes with Feedback: ' + selectedWords);

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = data.columns.slice(1);

    // List of groups = value of the first column called group -> I show them on the X axis
    var groups = d3
      .map(data, function (d) {
        return d['Class'];
      })
      .keys();

    // Add X axis
    var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('visibility', () => {
        return !hasRendered ? 'visible' : 'hidden';
      })
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    svg
      .append('g')
      .attr('visibility', () => {
        return !hasRendered ? 'visible' : 'hidden';
      })
      .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(['#92B25A', '#008CB6', '#EFC420', '#FF5C00', '#CB1A0D']);

    // Normalize the data -> sum of each group must be 100!
    dataNormalized = [];
    data.forEach(function (d) {
      // Compute the total
      tot = 0;
      for (i in subgroups) {
        name = subgroups[i];
        tot += +d[name];
      }
      // Now normalize
      for (i in subgroups) {
        name = subgroups[i];
        if (tot == 0) {
          d[name] = 0;
        } else {
          d[name] = (d[name] / tot) * 100;
        }
      }
    });

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack().keys(subgroups)(data);

    // Show the bars
    svg
      .append('g')
      .selectAll('g')
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', function (d) {
        return color(d.key);
      })
      .selectAll('rect')
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function (d) {
        return d;
      })
      .enter()
      .append('rect')
      // Add CSS class for the term + add stroke if currently selected
      .attr('class', function (d) {
        if (selectedClasses.includes(d.data['Class'])) {
          return 'class-' + d.data['Class'] + ' stroke';
        } else {
          return 'class-' + d.data['Class'];
        }
      })
      .on('mousedown', function (d) {
        // Deselect Bar
        if (selectedClasses.includes(d.data['Class'])) {
          selectedClasses = selectedClasses.filter(
            (c) => c !== d.data['Class']
          );
          d3.selectAll(`.class-${d.data['Class']}`).classed('stroke', false);
          // Select Bar
        } else {
          selectedClasses.push(d.data['Class']);
          d3.selectAll(`.class-${d.data['Class']}`).classed('stroke', true);
        }
        updateWordsToHighlight();
      })
      .on('mouseout', function (d) {
        div.transition().duration(500).style('opacity', 0);
      })
      .attr('x', function (d) {
        return x(d.data['Class']);
      })
      .attr('y', function (d) {
        return y(d[1]);
      })
      .attr('height', function (d) {
        // Display bar according to word cloud selection
        if (
          classesToDisplay.length == 0 ||
          classesToDisplay.includes(d.data['Class'])
        ) {
          return y(+d[0]) - y(+d[1]);
        }
      })
      .attr('width', x.bandwidth());

    hasRendered = true;
  });
};

//Reference to dropdown menu
const dropdown = document.getElementById('dropdown');

//Reference to menu options, initalized to first option
let csvFileName = dropdown[0].value;
let graphTitle = dropdown[0].dataset.title;

// Initalize graph with first option (with index 0) in dropdown
createStackedBarPlot(csvFileName, graphTitle);

// Render a new graph when a new dropdown option is selected
dropdown.addEventListener('change', (event) => {
  // Get info from selected option
  csvFileName = event.target.value;
  graphTitle = event.target[event.target.selectedIndex].getAttribute(
    'data-title'
  );

  //Wipe previous graph
  svg.selectAll('rect').remove();
  svg.selectAll('#graph-title').remove();

  //Render new graph
  createStackedBarPlot(csvFileName, graphTitle);
});

// Function to update the graph based on the words selected from the word cloud
const updateClassesToDisplay = () => {
  //clear current classes
  classesToDisplay = [];

  d3.csv('/data/df_alum1.csv', function (data) {
    data.forEach((d) => {
      selectedWords.forEach((word) => {
        if (d.words.includes(word)) {
          classesToDisplay.push(d.class);
        }
      });
    });
  });

  //Wipe previous graph
  svg.selectAll('rect').remove();
  svg.selectAll('#graph-title').remove();

  //Create new plot
  createStackedBarPlot(csvFileName, graphTitle);
};

// LEGEND: https://www.d3-graph-gallery.com/graph/custom_legend.html

var wordsLegend = d3
  .select('#graphs-legend')
  .append('svg')
  .attr('width', width)
  .attr('height', 50);

wordsLegend
  .append('circle')
  .attr('cx', 200)
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#92b25a');
wordsLegend
  .append('text')
  .attr('x', 210)
  .attr('y', 30)
  .text('Strongly Agree')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');
wordsLegend
  .append('circle')
  .attr('cx', 350)
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#008CB6');
wordsLegend
  .append('text')
  .attr('x', 360)
  .attr('y', 30)
  .text('Agree')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');
wordsLegend
  .append('circle')
  .attr('cx', 450)
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#EFC420');
wordsLegend
  .append('text')
  .attr('x', 460)
  .attr('y', 30)
  .text('Neutral')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');
wordsLegend
  .append('circle')
  .attr('cx', 550)
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#FF5C00');
wordsLegend
  .append('text')
  .attr('x', 560)
  .attr('y', 30)
  .text('Disagree')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');
wordsLegend
  .append('circle')
  .attr('cx', 650)
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#CB1A0D');
wordsLegend
  .append('text')
  .attr('x', 660)
  .attr('y', 30)
  .text('Strongly Disagree')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');

// clearing selection functionality for button
const clearSelectedBarsBtn = document.getElementById('clear-selected-bars-btn');

clearSelectedBarsBtn.addEventListener('click', (event) => {
  //reset classes list
  selectedClasses = [];
  //reset word cloud
  updateWordsToHighlight();
  //reset styling for bars
  svg.selectAll('.stroke').classed('stroke', false);
});
