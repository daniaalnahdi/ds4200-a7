// Base code: https://www.d3-graph-gallery.com/graph/wordcloud_size.html

// set the dimensions and margins of the graph
var wordsMargin = { top: 0, right: 10, bottom: 10, left: 10 },
  wordsWidth = 1000 - wordsMargin.left - wordsMargin.right,
  wordsHeight = 450 - wordsMargin.top - wordsMargin.bottom;
// append the svg object to the body of the page
var svg2 = d3
  .select('#wordcloud')
  .append('svg')
  .attr('width', wordsWidth + wordsMargin.left + wordsMargin.right)
  .attr('height', wordsHeight + wordsMargin.top + wordsMargin.bottom)
  .append('g')
  .attr(
    'transform',
    'translate(' + wordsMargin.left + ',' + wordsMargin.top + ')'
  );

// Appends the graph title
var wordsTitle = d3
  .select('#words-title')
  .append('svg')
  .attr('width', wordsWidth)
  .attr('height', 100);

wordsTitle
  .append('text')
  .attr('x', wordsWidth / 2)
  .attr('y', 0 - wordsMargin.top + 50)
  .attr('text-anchor', 'middle')
  .style('font-size', '16px')
  .style('font-weight', '600')
  .text('Words Used by MPF Alumni in Survey Responses');

  // Function to render the word cloud
const createWordCloud = () => {
  d3.csv('words_filtered_no_negative.csv', function (data) {
    svg2
      .append('g')
      .attr(
        'transform',
        'translate(' + wordsMargin.left + ',' + wordsMargin.top + ')'
      );

    // Option 1: give 2 color names

    // Add X axis
    var myColor = d3.scaleLinear().domain([0, 4]).range(['White', 'Blue']);

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout
      .cloud()
      .size([wordsWidth, wordsHeight])
      .words(
        data.map(function (d) {
          return {
            text: d['Term'],
            size: d['Count'] * 6,
            count: d['Count'],
            score: d['Sentiment Score'],
            color: Math.floor(d['Sentiment Score'] * 7),
          };
        })
      )
      .padding(5) //space between words
      .rotate(function () {
        return ~~(Math.random() * 2) * 90;
      })
      .fontSize(function (d) {
        return d.size;
      }) // font size of words
      .on('end', draw);
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
      svg2
        .append('g')
        .attr(
          'transform',
          'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')'
        )
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .attr('class', 'word')
        .style('font-size', function (d) {
          return d.size;
        })
        .style('fill', function (d) {
          return myColor(Number(d.color));
        })
        .attr('text-anchor', 'middle')
        .style('font-family', 'inherit')
        .style('font-weight', '600')
        .attr('transform', function (d) {
          return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
        })
        .text(function (d) {
          return d.text;
        })
        .on('click', function (d) {
          // Add words to selected words list
          if (!selectedWords.includes(d.text)) {
            //add word to array of selected words
            selectedWords.push(d.text);
            //add styling for selection
            d3.select(this).classed('stroke', true);
          } else {
            //remove from selected words
            selectedWords = selectedWords.filter((word) => word !== d.text);
            // reset styling
            d3.select(this).classed('stroke', false);
          }
          updateClassesToDisplay();
        })
        .on('mouseover', function (d) {
          div.transition().duration(200).style('opacity', 0.8);
          div
            .html(
              '<h1><strong>' +
                d.text +
                '</strong></h1>' +
                '<span><strong>Count</strong>: ' +
                d.count +
                '</span><br>' +
                '<span><strong>Sentiment Score</strong>: ' +
                d.score +
                '</span>'
            )
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY - 28 + 'px');
        })
        .on('mouseout', function (d) {
          div.transition().duration(500).style('opacity', 0);
        });
    }
  });
};

// Initalizes first word cloud
createWordCloud();

// Updates the  word cloud
const updateWordsToHighlight = () => {
  //Marks words to be highlighted
  d3.csv('df_alum1.csv', function (data) {
    // Resets word color in word cloud
    svg2.selectAll('text').classed('highlighted', false);
    wordsTitle.select('#words-subtitle').remove();

    // //reset current words
    wordsToHighlight = '';

    data.forEach((d) => {
      selectedClasses.forEach((c) => {
        if (d.class.includes(c)) {
          wordsToHighlight = wordsToHighlight + d.words;
        }
      });
    });

    //Highlight intended words in word cloud
    svg2.selectAll('text').classed('highlighted', function (d) {
      return wordsToHighlight.includes(d.text);
    });

    //update word cloud subtitle
    wordsTitle
      .append('text')
      .attr('x', wordsWidth / 2)
      .attr('id', 'words-subtitle')
      .attr('y', 0 - wordsMargin.top + 80)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Highlighting Words for Classes: ' + selectedClasses);
  });
};

wordsTitle
  .append('text')
  .attr('x', wordsWidth / 2)
  .attr('id', 'words-subtitle')
  .attr('y', 0 - wordsMargin.top + 80)
  .attr('text-anchor', 'middle')
  .style('font-size', '16px')
  .style('font-weight', '600')
  .text('Highlighting Words for Classes: ' + selectedClasses);

// LEGEND: https://www.d3-graph-gallery.com/graph/custom_legend.html

var wordsLegend = d3
  .select('#words-legend')
  .append('svg')
  .attr('width', wordsWidth)
  .attr('height', 50);

wordsLegend
  .append('circle')
  .attr('cx', '20%')
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#3333FF');
wordsLegend
  .append('text')
  .attr('x', '22%')
  .attr('y', 30)
  .text('Strongly Positive')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');
wordsLegend
  .append('circle')
  .attr('cx', '50%')
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#6666CC');
wordsLegend
  .append('text')
  .attr('x', '52%')
  .attr('y', 30)
  .text('Positive')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');
wordsLegend
  .append('circle')
  .attr('cx', '70%')
  .attr('cy', 30)
  .attr('r', 6)
  .style('fill', '#BFBFFF');
wordsLegend
  .append('text')
  .attr('x', '72%')
  .attr('y', 30)
  .text('Mildly Positive')
  .style('font-size', '15px')
  .attr('alignment-baseline', 'middle');

// clearing selection functionality for button
const clearSelectedWordsBtn = document.getElementById(
  'clear-selected-words-btn'
);

clearSelectedWordsBtn.addEventListener('click', (event) => {
  //reset words list
  selectedWords = [];
  //reset graph
  updateClassesToDisplay();
  //reset styling for words
  svg2.selectAll('.stroke').classed('stroke', false);
});
