getFrequency = (array) => {
  const map = {};
  array.forEach(item => {
    if (item['wp'] != "Unknown") {
     if(map[item['wp']]){
        map[item['wp']]['freq']=map[item['wp']]['freq']+1;
       map[item['wp']]['dmg']=map[item['wp']]['dmg']+parseInt(item['hp_dmg'])
       map[item['wp']]['vic']=map[item['wp']]['vic']+(+(item['att_side']==item['winner_side']))
       map[item['wp']]['hs']=map[item['wp']]['hs']+(+(item['hitbox']=='Head'))
     }else{
        map[item['wp']] = {freq:1, vic: +(item['att_side']==item['winner_side']), dmg:parseInt(item['hp_dmg']), 
                           hs:+(item['hitbox']=='Head')};
     }
    }
  });
  const freq = [];
  for (const i in map){
    freq.push({wp:i, frequency:map[i]['freq'], dmg:map[i]['dmg'], win:map[i]['vic'], hs:map[i]['hs']});
  }
  return freq;
  };

function filtre_rank(d) {
  if (rank.includes(String(parseInt(d.avg_match_rank)))) {
    console.log("yes")
    return d
  }
}

function filtre_round_type(d)  {
  if (d.round_type == round_type) {
    return d.data}
}

function filtre_side(d) {
  if (d[attr+'_side']==side){
      return d
  }
}

function filtre_side_histo(d) {
  if (d['att_side']==side){
      return d
  }
}

function filtre_map(d) {
  if (d['map']==map){
      return d
  }
}

function filtre_wp(d) {
  if(wp=='Toutes'){
    return d
  }
  if (d['wp']==wp){
      return d
  }
}

density_array = (array) => {
  const density = [];
  array.forEach(item => {
    for(let i=0;i<item['hp_dmg'];i=i+5){
      density.push(item);
  }
  });
  return density;
 }

contours = (data, attr) => {
  var data_filtered = [];
  if(attr=='att'){
    data_filtered = data.filter(filtre_side).filter(filtre_wp);
  }
  else{
    data_filtered = data.filter(filtre_side);
  }
  return d3.contourDensity()
    .x(d => d[attr+"_pos_x"]/2)
    .y(d => d[attr+"_pos_y"]/2)
    .size([width, height])
    .bandwidth(4)
    .thresholds(8)
  (density_array(data_filtered))
}

other_side = (side) => {
  if (side=='Terrorist'){
    return 'CounterTerrorist'}
  else{
    return 'Terrorist'
  }
}

getNbRounds = (array) => {
  var list = {};
  array.forEach(item => {
    if (list[item['file']]) {
      
        list[item['file']]['nb_round'] = Math.max(list[item['file']]['nb_round'],+item.round)
      }else{
        list[item['file']] = {nb_round : 0} ;
      }
    });
  var nb_rounds = 0
  for (const elt in list){
    nb_rounds += list[elt]['nb_round'] ;
  }
  return nb_rounds;
};

data_reduce = (array) => {
  const data = []
  array.sort(function ( a, b ) { return b['seconds'] - a['seconds'] });
  array.forEach(item => {
  if (data[item['file']] ){
    
    var bool = false
    
    for (let elt of data[item['file']]) {
      if ((elt['round'] == item['round'] && elt['side'] == item['att_side']) || item['att_side'] == "None" ) {
        bool = true 
      }
    }
    if (bool == false) {
      data[item['file']].push({round : +item['round'], ct_eq_val : +item['ct_eq_val'], t_eq_val : +item['t_eq_val'],      winner_side : item['winner_side'], side : item['att_side'], round_type : item['round_type'], bomb_site : item['bomb_site']})
    }
  }
  else if (item['att_side'] != 'None') {
    data[item['file']] = [{round : +item['round'], ct_eq_val : +item['ct_eq_val'], t_eq_val : +item['t_eq_val'], winner_side : item['winner_side'], side : item['att_side'], round_type : item['round_type'], bomb_site : item['bomb_site']}]
  }
})
  return data
}

dmg_distance = (array, wp) => {
  const map = {};
  var total = 0;
  array.forEach(item => {
    if((wp==item['wp'] || wp=='Toutes') && item['att_side']==side){
      const distance_x = Math.pow(item['att_pos_x']-item['vic_pos_x'], 2);
      const distance_y = Math.pow(item['att_pos_y']-item['vic_pos_y'], 2);
      const distance_tot = Math.pow(distance_x+distance_y, 0.5)*230/1024;
     const distance = 5*parseInt(distance_tot/5)
     if(map[distance]){
        map[distance]=map[distance]+parseInt(item['hp_dmg']);
     }else{
       map[distance] = parseInt(item['hp_dmg']);
     }
     total=total+parseInt(item['hp_dmg']);
  }});
 const freq = []
 for (const i in map){
   freq.push({distance:i, dmg:map[i]/total});
 }
  return freq;
};

weapon_list = (array) => {
  const wp = ['Toutes'];
  array.forEach(item => {
      if(!wp.includes(item['wp'])){
          wp.push(item['wp']);
      }
  });
  return wp;
};

function legend(container) {

  document.getElementById(container.substr(1)).innerHTML = '';
  const width = 1000
  const height = 90
  const svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);


svg.append("linearGradient")
.attr("id", "line-gradient")
.attr("gradientUnits", "userSpaceOnUse")
.attr("x1", 0)
.attr("x2", 100)
.attr("y1", 10)
.attr("y2", 10)
.selectAll("stop")
  .data([
    {offset: "0%", color: "#D37F21"},
    {offset: "100%", color: "#2B53DE"}
  ])
  .enter().append("stop")
  .attr("offset", d => d.offset)
  .attr("stop-color", d => d.color);


  svg.append('line')
  .style("stroke", "url(#line-gradient)")
  .style("stroke-width", 2.1)
  .attr("x1", 0)
  .attr("y1", 10)
  .attr("x2", 100)
  .attr("y2", 10); 

 svg.append('rect')
  .attr("x", 0)
  .attr("y", 30)
  .attr("height", 10)
  .attr("width", 10)
.attr("fill", "#D37F21"); 

svg.append('rect')
  .attr("x", 0)
  .attr("y", 60)
  .attr("height", 10)
  .attr("width", 10)
.attr("fill", "#2B53DE");

svg.append('text')
  .attr("fill", "white")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("x", 150)
  .attr("y", 71)
  .text("Counter Terrorist");

  svg.append('text')
  .attr("fill", "white")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("x", 85)
  .attr("y", 41)
  .text("Terrorist");

  svg.append('text')
  .attr("fill", "white")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("x", 580)
  .attr("y", 15)
  .text("Ligne de tir entre Terrorist (Orange) et Counter Terrorist (Bleu)");


return svg.node();
}

linechart = (container, dataset) => {
  const margin = ({top: 20, right: 30, bottom: 40, left: 70})
  const height = 400
  
    document.getElementById(container.substr(1)).innerHTML = '';
    const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
  
    const x = d3.scaleBand()
      .domain(d3.range(5, 300, 5))
      .range([margin.left, width - margin.right])
    
    const y = d3.scaleLinear()
      .domain([d3.max(dataset, d => +d.dmg), 0])
      .range([margin.top, height - margin.bottom])
    
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", d => x(+d.distance) )
      .attr("y", d => y(+d.dmg))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(+d.dmg) - margin.bottom)
      .attr("fill", couleur[side])
      .attr("stroke", "#000000")
  
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height-1)
      .attr("style","fill:white;")
      .text("Distance (en mètres)");
  
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 5)
      .attr("x", 0)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .attr("style","fill:white;")
      .text("Fréquence");
  
  let xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom( d3.scaleBand()
      .domain(d3.range(5, 300, 20))
      .range([margin.left, width - margin.right])))
  
  let yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
  
  // xAxis(svg.append("g"))
    svg.append("g")
        .call(xAxis);
  
    svg.append("g")
        .call(yAxis);
  
    return svg.node()
  }

  densityplot = (container, dataset, side, attr) => {
    document.getElementById(container.substr(1)).innerHTML = '';
    const svg = d3.select(container).append("svg").attr("width", 512).attr("height", 512);
      
      var node = svg.selectAll("g.node")
        .data(dataset)
        
      var nodeEnter = node.enter()
        .append("svg:g")
        .attr("class", "node")
      
    var defs = nodeEnter.append("defs");
    defs.append('pattern')
      .attr("id", "map"  )
      .attr("width", 1)
      .attr("height", 1)
      .append("svg:image")
      .attr("xlink:href", "images/maps/"+map+".png")
      .attr("width", 512)
      .attr("height", 512);
    
      nodeEnter.append("svg:rect")
          .attr("x", d => 0)
          .attr("y", d => 0)  
          .attr("fill","url(#map)")
          .attr("width", 512)
          .attr("height", 512);
    
      svg.append("g")
          .attr("fill", "none")
          .attr("stroke", couleur[side])
          .attr("stroke-linejoin", "round")
        .selectAll("path")
        .data(contours(data, attr))
        .join("path")
          .attr("stroke-width", d => d.value*4/d3.max(contours(data, attr), d => d.value))
          .attr("fill", d => couleur[side]) //color(d.value)
          .attr("fill-opacity", d => d.value/d3.max(contours(data, attr), d => d.value))
          .attr("d", d3.geoPath());
      
      return svg.node();
    }

shotplot = (container, dataset, side, attr) => {
  // document.getElementById(container.substr(1)).innerHTML = '';
  // const svg = d3.select(container).append("svg").attr("width", 512).attr("height", 512);
    
  //   var node = svg.selectAll("g.node")
  //     .data(dataset)
      
  //   var nodeEnter = node.enter()
  //     .append("svg:g")
  //     .attr("class", "node")
    
  // var defs = nodeEnter.append("defs");
  // defs.append('pattern')
  //   .attr("id", "map"  )
  //   .attr("width", 1)
  //   .attr("height", 1)
  //   .append("svg:image")
  //   .attr("xlink:href", "images/maps/"+map+".png")
  //   .attr("width", 512)
  //   .attr("height", 512);
  
  //   nodeEnter.append("svg:rect")
  //       .attr("x", d => 0)
  //       .attr("y", d => 0)  
  //       .attr("fill","url(#map)")
  //       .attr("width", 512)
  //       .attr("height", 512);
  
  //   const g = svg.append("g");
  
  // // // Set the gradient
  // // if(attr=="att"){
  // //   var os = other_side(side);
  // //   var s = side;
  // //   }
  // //   else {
  // //     var s = other_side(side);
  // //     var os = side;
  // //   }
  // //   dataset.filter(filtre_side).filter(filtre_wp).forEach(item => {
  // //     svg.append("linearGradient")
  // //       .attr("id", "line-gradient"+item['id'])
  // //       .attr("gradientUnits", "userSpaceOnUse")
  // //       .attr("x1", item['vic_pos_x']/2)
  // //       .attr("y1", item['vic_pos_y']/2)
  // //       .attr("x2", item['att_pos_x']/2)
  // //       .attr("y2", item['att_pos_y']/2)
  // //       .selectAll("stop")
  // //       .data([
  // //         {offset: "0%", color: couleur[os]},
  // //         {offset: "100%", color: couleur[s]}
  // //       ])
  // //       .enter().append("stop")
  // //       .attr("offset", function(d) { return d.offset; })
  // //       .attr("stop-color", function(d) { return d.color; });
  // //   });

  //   // Set the gradient
  // if(attr=="att"){
  //   var os = other_side(side);
  //   var s = side;
  //   }
  //   else {
  //     var s = other_side(side);
  //     var os = side;
  //   }
  //   dataset.filter(filtre_side).filter(filtre_wp).forEach(item => {
  //     svg.append("linearGradient")
  //       .attr("id", "line-gradient"+item['id'])
  //       .attr("gradientUnits", "userSpaceOnUse")
  //       .attr("x1", item['vic_pos_x']/2)
  //       .attr("y1", item['vic_pos_y']/2)
  //       .attr("x2", item['att_pos_x']/2)
  //       .attr("y2", item['att_pos_y']/2)
  //       .selectAll("stop")
  //       .data([
  //         {offset: "0%", color: couleur[os]},
  //         {offset: "100%", color: couleur[s]}
  //       ])
  //       .enter().append("stop")
  //       .attr("offset", function(d) { console.log(d.offset)
  //         return d.offset; })
  //       .attr("stop-color", function(d) { console.log(d.color)
  //         return d.color; });
  //   });
  
  //   g.selectAll('line')
  //     .data(dataset.filter(filtre_side).filter(filtre_wp))
  //     .enter()
  //     .append('line')
  //     .attr("stroke", d=> "url(#line-gradient"+d['id']+")" )
  //     .style("stroke-width", 1)
  //     .attr("x1", d => d['vic_pos_x']/2)
  //     .attr("y1", d => d['vic_pos_y']/2)
  //     .attr("x2", d => d['att_pos_x']/2)
  //     .attr("y2", d => d['att_pos_y']/2); 
    
  //   return svg.node();


    document.getElementById(container.substr(1)).innerHTML = '';
    const svg = d3.select(container).append("svg").attr("width", 512).attr("height", 512);
      
      var node = svg.selectAll("g.node")
        .data(dataset)
        
      var nodeEnter = node.enter()
        .append("svg:g")
        .attr("class", "node")
      
    var defs = nodeEnter.append("defs");
    defs.append('pattern')
      .attr("id", "map"  )
      .attr("width", 1)
      .attr("height", 1)
      .append("svg:image")
      .attr("xlink:href", "images/maps/"+map+".png")
      .attr("width", 512)
      .attr("height", 512);
    
      nodeEnter.append("svg:rect")
          .attr("x", d => 0)
          .attr("y", d => 0)  
          .attr("fill","url(#map)")
          .attr("width", 512)
          .attr("height", 512);
    
      const g = svg.append("g");
    
    // Set the gradient
    if(attr=="att"){
      var os = other_side(side);
      var s = side;
      }
      else {
        var s = other_side(side);
        var os = side;
      }
      console.log(dataset.filter(filtre_side).filter(filtre_wp))
      dataset.filter(filtre_side).filter(filtre_wp).forEach(item => {
        svg.append("linearGradient")
          .attr("id", "line-gradient"+item['id'])
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", item['vic_pos_x']/2)
          .attr("y1", item['vic_pos_y']/2)
          .attr("x2", item['att_pos_x']/2)
          .attr("y2", item['att_pos_y']/2)
          .selectAll("stop")
          .data([
            {offset: "0%", color: couleur[os]},
            {offset: "100%", color: couleur[s]}
          ])
          .enter().append("stop")
          .attr("offset", function(d) { return d.offset; })
          .attr("stop-color", function(d) { return d.color; });
      });
    
      g.selectAll('line')
        .data(dataset.filter(filtre_side).filter(filtre_wp))
        .enter()
        .append('line')
        .attr("stroke", d=> "url(#line-gradient"+d['id']+")" )
        .style("stroke-width", 1)
        .attr("x1", d => d['vic_pos_x']/2)
        .attr("y1", d => d['vic_pos_y']/2)
        .attr("x2", d => d['att_pos_x']/2)
        .attr("y2", d => d['att_pos_y']/2); 
      
      return svg.node();  

}


map_vierge = (container) => {
  var div = document.getElementById(container.substr(1));
  div.innerHTML = '';
  var option = document.createElement("img");
  option.src = "images/maps/"+map+".png";
  option.width = 512;
  option.height = 512;
  div.appendChild(option);
  }



// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/pie_chart
function PieChart(container, data, {
  name = ([x]) => x,  // given d in data, returns the (ordinal) label
  value = ([, y]) => y, // given d in data, returns the (quantitative) value
  title, // given d in data, returns the title text
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixe
  innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
  outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
  labelRadius = (innerRadius * 0.2 + outerRadius * 0.8), // center radius of labels
  format = ",", // a format specifier for values (in the label)
  stroke = innerRadius > 0 ? "none" : "white", // stroke separating widths
  strokeWidth = 1, // width of stroke separating wedges
  strokeLinejoin = "round", // line join of stroke separating wedges
  padAngle = stroke === "none" ? 1 / outerRadius : 0, // angular separation between wedges
} = {}) {
  // Compute values.
  const N = d3.map(data, name);
  const V = d3.map(data, value);
  const I = d3.range(N.length).filter(i => !isNaN(V[i]));

  // Chose a default color scheme based on cardinality.
  const colors = {'A' : '#ff0000','B':'#00ff00','Pas Plantée': '#0000ff'}

  // Compute titles.
  if (title === undefined) {
    const formatValue = d3.format(format);
    title = i => `${N[i]}\n${formatValue(V[i])}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => T(O[i], i, data);
  }

  // Construct arcs.
  const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
  
  document.getElementById(container.substr(1)).innerHTML = '';
  const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linejoin", strokeLinejoin)
    .selectAll("path")
    .data(arcs)
    .join("path")
      .attr("fill", d => colors[N[d.index]])
      .attr("opacity", 0.6)
      .attr("d", arc)
    .append("title")
      .text(d => title(d.data));

  svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
      .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    .selectAll("tspan")
    .data(d => {
      const lines = `${title(d.data)}`.split(/\n/);
      return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
    })
    .join("tspan")
      .attr("x", 0)
      .attr("y", (_, i) => `${i * 1.1}em`)
      .attr("font-weight", "bold")
      .style("font-size" , "20px")
      .text( (d) => { if (d[0] == 0 || d[0] == 1) {
                      return (100*d).toFixed(0) +'%'}
                     else {
                      return d
                     }
        
      });
  return Object.assign(svg.node());
}
            

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/bar-chart
function BarChartEco(container, data, {
  x = d => d, // given d in data, returns the (ordinal) x-value
  y = d => d, // given d in data, returns the (quantitative) y-value
  title, // given d in data, returns the title text
  marginTop = 20, // the top margin, in pixels
  marginRight = 20, // the right margin, in pixels
  marginBottom = 30, // the bottom margin, in pixels
  marginLeft = 30, // the left margin, in pixels
  width = 640, // the outer width of the chart, in pixels
  height = 400, // the outer height of the chart, in pixels
  xDomain, // an array of (ordinal) x-values
  xRange = [marginLeft, width - marginRight], // [left, right]
  yType = d3.scaleLinear, // y-scale type
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  xPadding = 0.1, // amount of x-range to reserve to separate bars
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  color = "currentColor" // bar fill color
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);

  // Compute default domains, and unique the x-domain.
  if (xDomain === undefined) xDomain = [-30000,30000];
  if (yDomain === undefined) yDomain = [d3.min(Y),d3.max(Y)];
  const yDomain1 = [0,1];

  const bandwidth = (height - marginLeft - marginRight)/(d3.max(xDomain) - d3.min(xDomain) +1 )*1000

  // Omit any data not present in the x-domain.
  data = data.filter(d => d[0] >= xDomain[0] && d[0] <= xDomain[1]);

  // Construct scales, axes, and formats.
  const xScale =  d3.scaleLinear(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const yScale1 = yType(yDomain1, yRange);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 20, yFormat);
  const yAxis1 = d3.axisLeft(yScale1).ticks(height / 20, yFormat);

  document.getElementById(container.substr(1)).innerHTML = '';
  const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis1)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  const bar = svg.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", d => xScale(d[0]))
      .attr("y", (d) => { 
            let y_pos = yScale(d[1])
            if (d[1] < 0) {
              y_pos = (height - marginBottom + marginTop)/2
            }
           
            return y_pos})
      .attr("height", (d) => {
            let hg = (height - marginBottom + marginTop)/2 - yScale(d[1]) 
            if (d[1] <0) {
              hg = yScale(d[1]) - (height - marginBottom + marginTop)/2
            }
          
            return hg 
            }
        )
      .attr("width", bandwidth*1.8)
      .attr("fill", (d) => {
            let col = "#2B53DE" 
            if (d[1] < 0) {
              col =  "#D37F21"
            }
            return col
      })
      .attr("fill-opacity","0.9");

  if (title) bar.append("title")
      .text(title);

  svg.append("g")
      .attr("transform", `translate(0,${(height - marginBottom + marginTop)/2})`)
      .call(xAxis);

  return svg.node();
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/bar-chart
function BarChart(container, data, {
  x = (d, i) => i, // given d in data, returns the (ordinal) x-value
  y = d => d, // given d in data, returns the (quantitative) y-value
  title, // given d in data, returns the title text
  marginTop = 20, // the top margin, in pixels
  marginRight = 0, // the right margin, in pixels
  marginBottom = 30, // the bottom margin, in pixels
  marginLeft = 40, // the left margin, in pixels
  width = 640, // the outer width of the chart, in pixels
  height = 400, // the outer height of the chart, in pixels
  xDomain, // an array of (ordinal) x-values
  xRange = [marginLeft, width - marginRight], // [left, right]
  yType = d3.scaleLinear, // y-scale type
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  xPadding = 0.1, // amount of x-range to reserve to separate bars
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  color = "currentColor" // bar fill color
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);

  // Compute default domains, and unique the x-domain.
  if (xDomain === undefined) xDomain = X;
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];
  xDomain = new d3.InternSet(xDomain);

  // Omit any data not present in the x-domain.
  const I = d3.range(X.length).filter(i => xDomain.has(X[i]));

  // Construct scales, axes, and formats.
  const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

  // Compute titles.
  if (title === undefined) {
    const formatValue = yScale.tickFormat(100, yFormat);
    title = i => `${X[i]}\n${formatValue(Y[i])}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => T(O[i], i, data);
  }

  document.getElementById(container.substr(1)).innerHTML = '';
  const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  const bar = svg.append("g")
      .attr("fill", color)
    .selectAll("rect")
    .data(I)
    .join("rect")
      .attr("x", i => xScale(X[i]))
      .attr("y", i => yScale(Y[i]))
      .attr("height", i => yScale(0) - yScale(Y[i]))
      .attr("width", xScale.bandwidth())
      .attr("stroke", "#000000");

  if (title) bar.append("title")
      .text(title);

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-90) translate(30,-12)");

  return svg.node();
}



async function main(map_var, rank_var, side_var, attr_var, wp_var, round_type_var) {

  map = map_var; // str
  rank = rank_var; // array of str
  side = side_var; // str
  attr = attr_var; // str
  wp = wp_var // str
  round_type = round_type_var; // str

  var csv = d3.csv("/data/data3.csv");

  data = [];

  csv = await csv.then((a)=>data.push(a));
  data = data[0];
  
  var csv_map = d3.csv("/data/data4.csv");

  data_map = [];

  csv_map = await csv_map.then((a)=>data_map.push(a));
  data_map = data_map[0];

  // FILTER DATA AND DATA MAP 

  data = data.filter(filtre_map).filter(filtre_rank);
  
  data_map = data_map.filter(filtre_map).filter(filtre_rank);

  // END FILTER 

  weapons = getFrequency(data.filter(filtre_side_histo));

  height = 512;
  width = 640;

  couleur = ({Terrorist: "#D37F21", CounterTerrorist: "#2B53DE"});

  nbRounds = getNbRounds(data);

  weapons_mod = weapons.map(d => { var obj = {}; obj.wp = d.wp; obj.frequency = d.frequency; obj.total_dmg = d.dmg; obj.avg_dmg =  Math.round(10*d.dmg/d.frequency)/10; return obj;});


  wp_list = weapon_list(data);

  data_red = data_reduce(data);

  data_red_cont = [].concat.apply([],  Object.values(data_red));

  bomb_data = d3.rollups(data_red_cont, grp => d3.count(grp,  d => d.round), d => d.round_type, d => d.bomb_site, d=> d.winner_side)

  bomb_data_map = bomb_data.map( (d) => {
    let data_val = []
    let sum = 0
    d[1].forEach (item => {
    sum += d3.sum(item[1], d => +d[1])
    })
    d[1].forEach (item => {
      let sum_side = d3.sum(item[1], d => +d[1])
      let obj = {}
      if (item[0] == '') {
      obj['place'] = "Pas Plantée"
      }
      else {
      obj['place'] = item[0]
      }
      var terro_win = 0
      item[1].forEach( sub_item => {
        if (sub_item[0] == "Terrorist") {
          terro_win = sub_item[1]
        }
      })
      obj['val'] = (Math.round(sum_side/sum * 100) / 100).toFixed(4)
      obj['win_rate'] = (Math.round(terro_win/sum_side* 100)/100).toFixed(4)
      data_val.push(obj)
    })
    return {round_type : d[0], data : data_val}})

  eco_data = data_red_cont.map( d => 
    { let winner = 0
      let eco_df = d['ct_eq_val'] - d['t_eq_val']
     if (d['winner_side'] == "CounterTerrorist") {
       winner = 1
     } // else CounterTerrorist 0, default value 
      return {eco_dif : eco_df, winner_code : winner, winner_side : d['winner_side'], 
              bin : Math.floor(eco_df/1000)*1000}})

  eco_data_rollup = d3.rollups(eco_data, grp => d3.sum(grp, d => d.winner_code)/(grp.length)-0.5 , d=> d.bin)
  .sort((a,b) => d3.ascending(a[0], b[0]));

dmg_dist = dmg_distance(data, wp);


BarChartEco("#chart_eco", eco_data_rollup, {
  x : d => d[0],
  y : d => d[1],
  yLabel: "Pourcentage de victoires en fonction de la différence d'économie",
  width,
  height: 500,
  color: couleur[side]
});

BarChart("#chart_histo2", weapons_mod, {
  x: d => d.wp,
  y: d => d.frequency/d3.sum(weapons_mod, d => d.frequency),
  xDomain: d3.groupSort(weapons_mod, ([d]) => -d.frequency, d => d.wp), // sort by descending frequency
  yLabel: "Fréquence d'utilisation (par tirs touchés)",
  width,
  height: 500,
  color: couleur[side]
})

linechart("#chart_dist", dmg_dist);

map_vierge("#chart_map");

PieChart("#plant_site", bomb_data_map.filter(filtre_round_type)[0].data, {
  name: d => d.place,
  value: d => d.val,
  width,
  height: 500
})

PieChart("#site_win_rate", bomb_data_map.filter(filtre_round_type)[0].data, {
  name: d => d.place,
  value: d => d.win_rate,
  width,
  height: 500
})

BarChart("#chart_histo1", weapons_mod, {
  x: d => d.wp,
  y: d => d.avg_dmg,
  xDomain: d3.groupSort(weapons_mod, ([d]) => -d.avg_dmg, d => d.wp), // sort by descending frequency
  yLabel: "Dégâts moyen par tir touché",
  width,
  height: 500,
  color: couleur[side]
})

legend("#legende");

}

map = "de_dust2";
rank = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18"];
side = "Terrorist";
attr = "att";
wp = "Toutes";
round_type = "ECO"

main(map_var = map, rank_var = rank, side_var = side, attr_var = attr, wp_var = wp, round_type_var = round_type);
