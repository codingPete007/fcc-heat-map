const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const margin = {
  top: 200,
  left: 100,
  bottom: 130,
  right: 50
},
      w = 1200 - margin.left - margin.right,
      h = 800 - margin.top - margin.bottom;

const x = d3.scaleBand().range([0, w]),
      y = d3.scaleBand().rangeRound([0, h]);

colors = [
  'rgb(69, 117, 180)', 
  'rgb(116, 173, 209)',
  'rgb(171, 217, 233)',
  'rgb(224, 243, 248)',
  'rgb(255, 255, 191)',
  'rgb(254, 224, 144)',
  'rgb(253, 174, 97)',
  'rgb(244, 109, 67)',
  'rgb(215, 48, 39)'
]

const svg = d3
  .select('.heatmap-container')
  .append('svg')
  .attr('class', 'heatmap')
  .attr('width', w + margin.left + margin.right)
  .attr('height', h + margin.top + margin.bottom);

const tooltip = d3
  .select('.heatmap-container')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .attr('width', 60)
  .attr('height', 30)
  .style('opacity', 0);

const heading = svg.append('g').style('text-align', 'center');

d3.json(url)
  .then(data => callback(data))
  .catch(e => console.error(e));

const callback = (data) => {
  console.log('data: ', data);

  const years = data.monthlyVariance.map(item => item.year);
  const baseTemp = data.baseTemperature

  heading.append('text')
  .attr('x', w / 2 - 198)
  .attr('y', 50)
  .attr('id', 'title')
  .style('font', '32px Arial')
  .text('Monthly Global Land-Surface Temperature');

  heading.append('text')
    .attr('x', w / 2 - 70)
    .attr('y', 100)
    .attr('id', 'description')
    .style('font', '22px Arial')
    .text(`${d3.min(years)}-${d3.max(years)}: base temperature ${baseTemp}℃`);

  data.monthlyVariance.forEach((item) => {
    item.month -= 1;
  })

  x.domain(years);
  y.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  const xAxis = d3
          .axisBottom(x)
          .tickValues(
            x.domain().filter(year => year % 10 === 0)
          )
          .tickFormat(d3.format('d'))
          .tickSize(10, 1),
        yAxis = d3
          .axisLeft(y)
          .tickFormat(month => {
            const date = new Date(0);
            date.setUTCMonth(month);
            const format = d3.utcFormat('%B');
            return format(date);
          })
          .tickSize(10, 1);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${margin.left}, ${h + margin.top})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis);

  const cellWidth = w / years.length + 4,
        cellHeight = h / 12;

  svg
    .selectAll('.cell')
    .data(data.monthlyVariance)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-month', d => d.month)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => baseTemp + d.variance)
    .attr('x', d => x(d.year) + margin.left + 1)
    .attr('y', d => y(d.month) + margin.top)
    .attr('width', cellWidth)
    .attr('height', cellHeight)
    .style('fill', d => {
      const monthlyTemperature = baseTemp + d.variance;

      switch (true) {
        case (monthlyTemperature < 3.9):
          return colors[0];

        case (monthlyTemperature < 5.0):
          return colors[1];

        case (monthlyTemperature < 6.1):
          return colors[2];

        case (monthlyTemperature < 7.2):
          return colors[3];

        case (monthlyTemperature < 8.3):
          return colors[4];

        case (monthlyTemperature < 9.5):
          return colors[5];

        case (monthlyTemperature < 10.6):
          return colors[6];
  
        case (monthlyTemperature < 11.7):
          return colors[7];
  
        default:
          return colors[8];
      }
    })
    .on('mouseover', (event, d) => {
      const date = new Date(d.year, d.month);
      const format = d3.utcFormat('%Y - %B');

      tooltip
        .style('opacity', 0.8)
        .style('left', event.pageX - 70 + 'px')
        .style('top', event.pageY - 110 + 'px')
        .html(`
          <span>${format(date)}</span>
          <span>${(baseTemp + d.variance).toFixed(1)}℃</span>
          <span>${d.variance.toFixed(1)}℃</span>
        `)
        .attr('data-year', d.year);

      event.target.style.stroke = '#000';
    })
    .on('mouseout', (event, d) => {
      tooltip.style('opacity', 0);
      event.target.style.stroke = '';
    })

  const legendValues = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];

  const legendScale = d3.scaleBand()
    .domain(legendValues)
    .range([0, w / 3]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .tickValues(legendValues)
    .tickSize(10, 1);

  const legendContainer = svg.append('g').attr('id', 'legend');

  const legend = legendContainer
    .append('g')
    .attr('transform', `translate(${margin.left}, ${h + margin.top + margin.bottom - 40})`)
    .call(legendAxis);

  legend.selectAll('rect')
    .data(legendValues)
    .enter()
    .append('rect')
    .attr('x', d => legendScale(d) + 17.5)
    .attr('y', -34.5)
    .attr('width', w / 3 / legendValues.length)
    .attr('height', w / 3 / legendValues.length)
    .style('fill', (d, i) => colors[i])
    .style('stroke', (d, i) => i < legendValues.length - 1 ? '#000' : '');
};