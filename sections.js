let dataset, svg
let salarySizeScale, salaryXScale, categoryColorScale
let simulation, nodes
let categoryLegend, salaryLegend,gradeLegend,categoryLegend1,categoryLegend2

//cluster categories
const categories = [1,2,3]
//gender categories for text box positioning
const cgender = ['F','M']
//gender grade categories for text box positioning
const gendergrade = ['F','M - g60','M - l60']

//Cluster,gender,gender grade coordinates and high level summary
//x-cord,y-cord,total-students,%student,%female,%passrate,%young,%engaged,%avg.clicks,avg-group-female,avg-group-pass,avg-group-engaged,avg-group-clicks,avg-young-students,score,avg-score
const categoriesXY = {1: [0,300  ,9540,38,95,67,67,69,933 ,47,55,63,1374,69,71,65],
                      2: [500,300,6860,27,27,15,71,30,702 ,47,55,63,1374,69,45,65],
                      3: [250,690,8981,35,10,75,71,81,2355,47,55,63,1374,69,77,65]}

const genderXY = { 'F': [250,450,570,76],
                   'M': [750,450,570,60]}


const gendergradepurityXY = { 'F': [250,570,76],
                   'M - g60': [650,600,85],
                   'M - l60': [870,540,93] }

const gendergradeXY = { 'F - g60': [270,450],
                   'F - l60': [270,450],
                   'M - g60': [670,510],
                   'M - l60': [890,420] }

const margin = {left: 170, top: 50, bottom: 50, right: 20}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

//Read Data, convert numerical categories into floats
//Create the initial visualisation
d3.csv('processeddata/stu_visualise_data.csv', function(d){
    return {
        Major: d.group_id,
        Total: +d.total_students,
        Gender: d.gender,
        Median: +d.total_students,
        Category: d.cluster,
        GenderAge: d.gender_age_band,
        XPosition: d.xposition,
        YPosition: d.yposition,
        GenderGrade:d.gender_grade,
        StudyOutcome:d.study_outcome,
        HighestEducation:d.highest_education,
        AvgClicks:+d.avg_clicks_per_student,
        PercentWeeksActive:+d.percent_weeks_active,
        AvgScore:+d.avg_score,
        ScoreBucket:d.score_bucket
    };
}).then(data => {
    dataset = data
    //console.log(dataset)
    createScales()
    setTimeout(drawInitial(), 100)
})

//Define colors to be used in different charts
const colors = ['#ffcc00', '#0c7b93', '#cc0066']
const gradecolors = ['#c2e699', '#78c679', '#41ab5d','#005a32']
//Cluster colors for per cluster scroll
const colorscluster1 = ['#ffcc00', '#BDBCB9', '#BDBCB9']
const colorscluster2 = ['#BDBCB9', '#0c7b93', '#BDBCB9']
const colorscluster3 = ['#BDBCB9', '#BDBCB9', '#cc0066']

//Create all the scales and save to global variables
function createScales(){
    salarySizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Median), [5, 35])
    categoryColorScale = d3.scaleOrdinal(categories, colors)
    categoryColorScaleClus1 = d3.scaleOrdinal(categories, colorscluster1)
    categoryColorScaleClus2 = d3.scaleOrdinal(categories, colorscluster2)
    categoryColorScaleClus3 = d3.scaleOrdinal(categories, colorscluster3)
    XPositionScale = d3.scaleLinear([10, 26], [margin.left, margin.left + width])
    YPositionScale = d3.scaleLinear([0, 10], [margin.top + height, margin.top])
    enrollmentSizeScale = d3.scaleLinear(d3.extent(dataset, d=> d.Total), [10,60])
    XEngagementScale = d3.scaleLinear(d3.extent(dataset, d=> d.AvgClicks), [margin.left, margin.left + width])
    YScoreScale = d3.scaleLinear([100,0], [margin.left, margin.left + width])
    
}

//Create Legends
function createLegend(x, y){
    
    let svg = d3.select('#legend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
                            .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
                            .shapePadding(10)
                            .scale(categoryColorScale)
    
    d3.select('.categoryLegend')
        .call(categoryLegend)
}

function createLegend_cluster(){
   
    let svg = d3.select('#legend4')

    svg.append('g')
        .attr('class', 'categoryLegend1')
        .attr('transform', `translate(50,100)`)

    categoryLegend1 = d3.legendColor()
                            .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
                            .shapePadding(10)
                            .scale(categoryColorScale)
    
    d3.select('.categoryLegend1')
        .call(categoryLegend1)
}
function createLegend_cluster1(){
   
    let svg = d3.select('#legend5')

    svg.append('g')
        .attr('class', 'categoryLegend2')
        .attr('transform', `translate(50,100)`)

    categoryLegend2 = d3.legendColor()
                            .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
                            .shapePadding(10)
                            .scale(categoryColorScale)
    
    d3.select('.categoryLegend2')
        .call(categoryLegend2)
}

function createSizeLegend(){
    let svg = d3.select('#legend2')
    svg.append('g')
        .attr('class', 'sizeLegend')
        .attr('transform', `translate(100,50)`)

    sizeLegend = d3.legendSize()
        .scale(salarySizeScale)
        .shape('circle')
        .shapePadding(15)
        .title('Student Scale')
        .labelFormat(d3.format(",.2r"))
        .cells(7)

    d3.select('.sizeLegend')
        .call(sizeLegend)
}

function createSizeLegend2(){
    let svg = d3.select('#legend3')
    svg.append('g')
        .attr('class', 'sizeLegend2')
        .attr('transform', `translate(50,100)`)

    sizeLegend2 = d3.legendSize()
        .scale(enrollmentSizeScale)
        .shape('circle')
        .shapePadding(55)
        .orient('horizontal')
        .title('Enrolment Scale')
        .labels(['1000', '200000', '400000'])
        .labelOffset(30)
        .cells(3)

    d3.select('.sizeLegend2')
        .call(sizeLegend2)
}

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawInitial(){
    createSizeLegend()
    createSizeLegend2()
    createLegend_cluster1()
    createLegend_cluster()
    
  

    let svg = d3.select("#vis")
                    .append('svg')
                    .attr('width', 5000)
                    .attr('height', 2000)
                    .attr('opacity', 1)


    // Instantiates the force simulation
    // Has no forces. Actual forces are added and removed as required

    simulation = d3.forceSimulation(dataset)

     // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    // Stop the simulation until later
   // simulation.stop()

    // Selection of all the circles 
    nodes = svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
            .attr('fill', d => categoryColorScale(d.Category))
            .attr('r',d => salarySizeScale(d.Median) * 1.6)
            .attr('opacity', 0.8)
     
    
    var center = {x: 2000 / 2, y: 1300 / 2};
    var forceStrength = 0.03;
    
    svg
        .selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r',d => salarySizeScale(d.Median) * 1.6)
        .attr('fill', d => categoryColorScale(d.Category))
      

        
        
      simulation
            .force('forceX', d3.forceX(500))
            .force('forceY', d3.forceY(500))
            .force('collide', d3.forceCollide(d => salarySizeScale(d.Median)  * 1.6))
            .alphaDecay([0.05])
    
      //Reheat simulation and restart
      simulation.alpha(0.6).restart()
    
    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    function mouseOver(d, i){
        d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')
            
        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10)+ 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Cluster:</strong> ${d.Category} 
                <br> <strong>Total Students:</strong> ${(d.Median)} 
                <br> <strong>Gender:</strong> ${d.Gender}
                <br> <strong>Grade:</strong> ${d.StudyOutcome}
                <br> <strong>Average Clicks:</strong> ${d.AvgClicks}
                <br> <strong>Active Weeks Score:</strong> ${d3.format(",.2r")(d.PercentWeeksActive)}%
                <br> <strong>Highest Education:</strong> ${d.HighestEducation}`)
    }
    
    function mouseOut(d, i){
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0)
    }

      
    //All the required components for the small multiples charts
    //Initialises the text and rectangles, and sets opacity to 0 
    svg.selectAll('.cat-rect')
        .data(categories).enter()
        .append('rect')
            .attr('class', 'cat-rect')
            .attr('x', d => categoriesXY[d][0] + 120 + 1000)
            .attr('y', d => categoriesXY[d][1] + 30)
            .attr('width', 160)
            .attr('height', 30)
            .attr('opacity', 0)
            .attr('fill', 'grey')


    svg.selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .attr('opacity', 0)
        .raise()

    
    svg.selectAll('.lab-text')
        .text(d => `Total Students: ${(categoriesXY[d][2])}`)
        .attr('x', d => categoriesXY[d][0] + 200 + 1000)
        .attr('y', d => categoriesXY[d][1] - 500)
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')       

    svg.selectAll('.lab-text')
            .on('mouseover', function(d, i){
                d3.select(this)
                    .text(d)
            })
            .on('mouseout', function(d, i){
                d3.select(this)
                    .text(d => `Pass Rate: ${d3.format(",.2r")(categoriesXY[d][2])}`)
            })

    // Text for all the classification - grade, gender etc.
    
    svg
        .append('text')
        .attr('class', 'lab-text0')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
    
    
    svg
        .append('text')
        .attr('class', 'lab-text1')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
    
    svg
        .append('text')
        .attr('class', 'lab-text2')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
    
    svg
        .append('text')
        .attr('class', 'lab-text3')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
    

    svg
        .append('text')
        .attr('class', 'lab-text4')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
    

    
    svg
        .append('text')
        .attr('class', 'lab-text5')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
    
    // Purity boxes - Gender split
    svg.selectAll('.cat-rect6')
        .data(cgender).enter()
        .append('rect')
            .attr('class', 'cat-rect6')
            .attr('x', d => genderXY[d][0] )
            .attr('y', d => genderXY[d][2] )
            .attr('width', 160)
            .attr('height', 30)
            .attr('opacity', 0)
            .attr('fill', 'grey')
    
    
    svg.selectAll('.lab-text6')
        .data(cgender).enter()
        .append('text')
        .attr('class', 'lab-text6')
        .attr('opacity', 0)
        .raise()
    
     svg.selectAll('.lab-text6')
        .text(d => `Cluster Purity: ${d3.format(",.2r")(genderXY[d][3])}%`)
        .attr('x', d => genderXY[d][0] + 200 + 1000)
        .attr('y', d => genderXY[d][2] - 500)
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle') 
    
    

    
    
    // Purity boxes for gender grade split
        svg.selectAll('.cat-rect7')
        .data(gendergrade).enter()
        .append('rect')
            .attr('class', 'cat-rect7')
            .attr('x', d => gendergradepurityXY[d][0] )
            .attr('y', d => gendergradepurityXY[d][1] )
            .attr('width', 160)
            .attr('height', 30)
            .attr('opacity', 0)
            .attr('fill', 'grey')
    
    
    svg.selectAll('.lab-text7')
        .data(gendergrade).enter()
        .append('text')
        .attr('class', 'lab-text7')
        .attr('opacity', 0)
        .raise()
    
     svg.selectAll('.lab-text7')
        .text(d => `Cluster Purity: ${d3.format(",.2r")(gendergradepurityXY[d][2])}%`)
        .attr('x', d => gendergradepurityXY[d][0] + 200 + 1000)
        .attr('y', d => gendergradepurityXY[d][1] - 500)
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle') 
    
    
    // Create lines for showing the split between genders
   var lineData1 = [ { "x": 280,   "y": 430},  { "x": 500,  "y": 300}];
   var lineData2 = [ { "x": 500,   "y": 300},  { "x": 720,  "y": 430}];
   
   const lineFunction = d3.line()
                           .x(function(d) { return d.x; })
                           .y(function(d) { return d.y; });
    
   svg.append('path')
          .transition('line-gender-split1').duration(430)
          .attr('class', 'line-gender-split1')
          .attr("d", lineFunction(lineData1))
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .attr('stroke-width', 3)

   svg.append('path')
          .transition('line-gender-split2').duration(430)
          .attr('class', 'line-gender-split2')
          .attr("d", lineFunction(lineData2))
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .attr('stroke-width', 3)

        
  // Create lines for showing the split between genders and grade as a form of tree
   var lineData3 = [ { "x": 280,   "y": 430},  { "x": 500,  "y": 300}];
   var lineData4 = [ { "x": 500,   "y": 300},  { "x": 700,  "y": 400}];
   var lineData5 = [ { "x": 700,   "y": 400},  { "x": 690,  "y": 490}];
   var lineData6 = [ { "x": 700,   "y": 400},  { "x": 870,  "y": 410}];
   

   svg.append('path')
          .transition('line-gender-grade-split1').duration(430)
          .attr('class', 'line-gender-grade-split1')
          .attr("d", lineFunction(lineData3))
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .attr('stroke-width', 3)

   svg.append('path')
          .transition('line-gender-grade-split2').duration(430)
          .attr('class', 'line-gender-grade-split2')
          .attr("d", lineFunction(lineData4))
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .attr('stroke-width', 3)  
    
    
    svg.append('path')
          .transition('line-gender-grade-split3').duration(430)
          .attr('class', 'line-gender-grade-split3')
          .attr("d", lineFunction(lineData5))
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .attr('stroke-width', 3)  
    
    svg.append('path')
          .transition('line-gender-grade-split4').duration(430)
          .attr('class', 'line-gender-grade-split4')
          .attr("d", lineFunction(lineData6))
          .attr('stroke', 'black')
          .attr('opacity', 0)
          .attr('stroke-width', 3) 
    
   // Create a circle where the tree splits (gender)
    svg.append('ellipse')
        .transition('ellipse-1').duration(430)
        .attr('class', 'ellipse-1')
        .attr('fill', 'black') 
        .attr('cx',500)
        .attr('cy',300)
        .attr('rx',5)
        .attr('ry',5)
        .attr('opacity', 0)
    
    // Create a circle where the tree splits (grade)
    svg.append('ellipse')
        .transition('ellipse-2').duration(430)
        .attr('class', 'ellipse-2')
        .attr('fill', 'black') 
        .attr('cx',700)
        .attr('cy',400)
        .attr('rx',5)
        .attr('ry',5)
        .attr('opacity', 0)
    
    // Create a circle where the tree splits (grade)
    svg.append('ellipse')
        .transition('ellipse-3').duration(430)
        .attr('class', 'ellipse-3')
        .attr('fill', 'black') 
        .attr('cx',500)
        .attr('cy',300)
        .attr('rx',5)
        .attr('ry',5)
        .attr('opacity', 0)
    
    
   // Axis for 2 dimensional chart for showing all clusters
   let scatterxAxis = d3.axisBottom(XPositionScale)
   let scatteryAxis = d3.axisLeft(YPositionScale).tickSize([width])

    svg.append('g')
        .call(scatterxAxis)
        .attr('class', 'scatter-x')
        .attr('opacity', 0)
        .attr('transform', `translate(0, ${height + margin.top})`)
        .call(g => g.select('.domain')
            .remove())
    
    svg.append('g')
        .call(scatteryAxis)
        .attr('class', 'scatter-y')
        .attr('opacity', 0)
        .attr('transform', `translate(${margin.left - 20 + width}, 0)`)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)
    
    //Axis for avg score and engagement score
    let scatterxAxis1 = d3.axisBottom(XEngagementScale)
    let scatteryAxis1 = d3.axisLeft(YScoreScale).tickSize([width])

    svg.append('g')
        .call(scatterxAxis1)
        .attr('class', 'scatter-x1')
        .attr('opacity', 0)
        .attr('transform', `translate(0, ${height + margin.top+100})`)
        .call(g => g.select('.domain')
            .remove())
    
    svg.append('g')
        .call(scatteryAxis1)
        .attr('class', 'scatter-y1')
        .attr('opacity', 0)
        .attr('transform', `translate(${margin.left - 20 + width}, 0)`)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)
        
    
    // Create a placeholder box for information about each cluster
    svg.append('rect')
            .attr('class', 'cat-rect8')
            .attr('x', 150)
            .attr('y', 110)
            .attr('width', 350)
            .attr('height', 55)
            .attr('opacity', 0)
            .attr('fill', 'grey')
   
     svg.append('rect')
            .attr('class', 'cat-rect9')
            .attr('x', 150)
            .attr('y', 310)
            .attr('width', 350)
            .attr('height', 55)
            .attr('opacity', 0)
            .attr('fill', 'grey')
    
     svg.append('rect')
            .attr('class', 'cat-rect10')
            .attr('x', 150)
            .attr('y', 510)
            .attr('width', 350)
            .attr('height', 55)
            .attr('opacity', 0)
            .attr('fill', 'grey')
    
     svg.append('rect')
            .attr('class', 'cat-rect11')
            .attr('x', 150)
            .attr('y', 710)
            .attr('width', 350)
            .attr('height', 55)
            .attr('opacity', 0)
            .attr('fill', 'grey')
    
    //texts for each of the cluster summary - cluster 1
      svg
        .append('text')
        .attr('class', 'lab-text8')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
        .text(`Total Students #:     ${categoriesXY[1][2]}`)
        .attr('x', 300)   
        .attr('y', 130)
        .append('tspan')
        .text(`Total Students in the Cluster:     ${categoriesXY[1][3]}%` )
        .attr('x',300)
        .attr('y',150)
        .append('tspan')
        .text(`Females:     ${categoriesXY[1][4]}%   vs. all   ${categoriesXY[1][9]}%` )
        .attr('x',300)
        .attr('y',330)
        .append('tspan')
        .text(`Young Students:     ${categoriesXY[1][6]}%   vs. all   ${categoriesXY[1][13]}%` )
        .attr('x',300)
        .attr('y',350)
        .append('tspan')
        .text(`Pass Rate:     ${categoriesXY[1][5]}%   vs. all   ${categoriesXY[1][10]}%` )
        .attr('x',300)
        .attr('y',530)
        .append('tspan')
        .text(`Avg. Score:     ${categoriesXY[1][14]}%   vs. all   ${categoriesXY[1][15]}%` )
        .attr('x',300)
        .attr('y',550)
        .append('tspan')
        .text(`High Engaged:     ${categoriesXY[1][7]}%   vs. all   ${categoriesXY[1][11]}%` )
        .attr('x',300)
        .attr('y',730)
        .append('tspan')
        .text(`Clicks/Student:     ${categoriesXY[1][8]}   vs. all   ${categoriesXY[1][12]}` )
        .attr('x',300)
        .attr('y',750)
    
    
      svg
        .append('text')
        .attr('class', 'lab-text9')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
        .append('tspan')
        .text(`Total Students #:     ${categoriesXY[2][2]}`)
        .attr('x', 300)   
        .attr('y', 130)
        .append('tspan')
        .text(`Total Students in the Cluster:     ${categoriesXY[2][3]}%` )
        .attr('x',300)
        .attr('y',150)
        .append('tspan')
        .text(`Females:     ${categoriesXY[2][4]}%   vs. all   ${categoriesXY[1][9]}%` )
        .attr('x',300)
        .attr('y',330)
        .append('tspan')
        .text(`Young Students:     ${categoriesXY[2][6]}%   vs. all   ${categoriesXY[1][13]}%` )
        .attr('x',300)
        .attr('y',350)
        .append('tspan')
        .text(`Pass Rate:     ${categoriesXY[2][5]}%   vs. all   ${categoriesXY[1][10]}%` )
        .attr('x',300)
        .attr('y',530)
        .append('tspan')
        .text(`Avg. Score:     ${categoriesXY[1][14]}%   vs. all   ${categoriesXY[1][15]}%` )
        .attr('x',300)
        .attr('y',550)
        .append('tspan')
        .text(`High Engaged:     ${categoriesXY[2][7]}%   vs. all   ${categoriesXY[1][11]}%` )
        .attr('x',300)
        .attr('y',730)
        .append('tspan')
        .text(`Clicks/Student:     ${categoriesXY[2][8]}   vs. all   ${categoriesXY[1][12]}` )
        .attr('x',300)
        .attr('y',750)
    
    
      svg
        .append('text')
        .attr('class', 'lab-text10')
        .attr('font-family', 'Domine')
        .attr('font-size', '12px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')  
        .attr('opacity', 0)
        .append('tspan')
        .text(`Total Students #:     ${categoriesXY[3][2]}`)
        .attr('x', 300)   
        .attr('y', 130)
        .append('tspan')
        .text(`Total Students in the Cluster:     ${categoriesXY[3][3]}%` )
        .attr('x',300)
        .attr('y',150)
        .append('tspan')
        .text(`Females:     ${categoriesXY[3][4]}%   vs. all   ${categoriesXY[1][9]}%` )
        .attr('x',300)
        .attr('y',330)
        .append('tspan')
        .text(`Young Students:     ${categoriesXY[3][6]}%   vs. all   ${categoriesXY[1][13]}%` )
        .attr('x',300)
        .attr('y',350)
        .append('tspan')
        .text(`Pass Rate:     ${categoriesXY[3][5]}%   vs. all   ${categoriesXY[1][10]}%` )
        .attr('x',300)
        .attr('y',530)
        .append('tspan')
        .text(`Avg. Score:     ${categoriesXY[1][14]}%   vs. all   ${categoriesXY[1][15]}%` )
        .attr('x',300)
        .attr('y',550)
        .append('tspan')
        .text(`High Engaged:     ${categoriesXY[3][7]}%   vs. all   ${categoriesXY[1][11]}%` )
        .attr('x',300)
        .attr('y',730)
        .append('tspan')
        .text(`Clicks/Student:     ${categoriesXY[3][8]}   vs. all   ${categoriesXY[1][12]}` )
        .attr('x',300)
        .attr('y',750)
    
    // text for displaying general,demo headings
        svg
        .append('text')
        .attr('class', 'lab-text90')
        .attr('font-family', 'Domine')
        .text(`Demographics`)
        .attr('x', 250)   
        .attr('y', 300)
        .attr('opacity', 0)
        .attr('font-size', '20px')
        .attr('font-weight', 'bolder')
        svg
        .append('text')
        .attr('class', 'lab-text91')
        .attr('font-family', 'Domine')
        .text(`Academic Performance`)
        .attr('x', 210)   
        .attr('y', 500)
        .attr('opacity', 0)
        .attr('font-size', '20px')
        .attr('font-weight', 'bolder')
        svg
        .append('text')
        .attr('class', 'lab-text92')
        .attr('font-family', 'Domine')
        .text(`Subject Engagement`)
        .attr('x', 210)   
        .attr('y', 700)
        .attr('opacity', 0)
        .attr('font-size', '20px')
        .attr('font-weight', 'bolder')
        svg
        .append('text')
        .attr('class', 'lab-text93')
        .attr('font-family', 'Domine')
        .text(`General`)
        .attr('x', 270)   
        .attr('y', 100)
        .attr('opacity', 0)
        .attr('font-size', '20px')
        .attr('font-weight', 'bolder')

}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType){
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        //svg.select('.line1').transition().duration(200).attr('opacity', 0)
        svg.select('.lab-text90').transition().attr('opacity', 0)
        svg.select('.lab-text91').transition().attr('opacity', 0)
        svg.select('.lab-text92').transition().attr('opacity', 0)
        svg.select('.lab-text93').transition().attr('opacity', 0)
        svg.select('.scatter-x1').transition().attr('opacity', 0)
        svg.select('.scatter-y1').transition().attr('opacity', 0)
 
    }
    if (chartType !== "isMultiples"){
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text0').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text1').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text2').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text3').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text4').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text5').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text6').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text7').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
        svg.selectAll('.cat-rect6').transition().attr('opacity', 0)
        svg.selectAll('.cat-rect7').transition().attr('opacity', 0)
        svg.selectAll('.cat-rect8').transition().attr('opacity', 0)
        svg.selectAll('.cat-rect9').transition().attr('opacity', 0)
        svg.selectAll('.cat-rect10').transition().attr('opacity', 0)
        svg.selectAll('.cat-rect11').transition().attr('opacity', 0)
        svg.selectAll('.lab-text8').attr('opacity', 0)
        svg.selectAll('.lab-text9').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text10').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.lab-text11').transition().attr('opacity', 0)
            .attr('x', 1800)

    }
    if (chartType !== "isFirst"){
        svg.select('.first-axis').transition().attr('opacity', 0)
        svg.selectAll('.small-text').transition().attr('opacity', 0)
            .attr('x', -200)
        svg.selectAll('.lab-text8').attr('opacity', 0)
    }
    if (chartType !== "isBubble"){
        svg.select('.enrolment-axis').transition().attr('opacity', 0)

    }
    if (chartType !== "isGenderSplit") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.line-gender-split1').transition().duration(200).attr('opacity', 0)
        svg.select('.line-gender-split2').transition().duration(200).attr('opacity', 0)
        svg.select('.ellipse-3').transition().duration(200).attr('opacity', 0)
        svg.selectAll('.lab-text8').attr('opacity', 0)
    }
    if (chartType !== "isGenderGradeSplit") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.line-gender-grade-split1').transition().duration(200).attr('opacity', 0)
        svg.select('.line-gender-grade-split2').transition().duration(200).attr('opacity', 0)
        svg.select('.line-gender-grade-split3').transition().duration(200).attr('opacity', 0)
        svg.select('.line-gender-grade-split4').transition().duration(200).attr('opacity', 0)
        svg.select('.ellipse-2').transition().duration(200).attr('opacity', 0)
        svg.select('.ellipse-1').transition().duration(200).attr('opacity', 0)
        svg.selectAll('.lab-text8').attr('opacity', 0)
    }
    
}

//First function - showing all clusters
function draw1(){
    //Stop simulation
    //simulation.stop()
    
    let svg = d3.select("#vis")
                    .select('svg')
                    .attr('width', 1000)
                    .attr('height', 950)
    
    clean('isFirst')

    //d3.select('.categoryLegend').transition().remove()
    //d3.select('.gradeLegend').transition().remove()
    
    var center = {x: 1000 / 2, y: 950 / 2};
    var forceStrength = 0.03;
    
    svg
        .selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r',d => salarySizeScale(d.Median) * 1.6)
        .attr('fill', d => categoryColorScale(d.Category))
      

        
      simulation
            .force('forceX', d3.forceX(500))
            .force('forceY', d3.forceY(500))
            .force('collide', d3.forceCollide(d => salarySizeScale(d.Median)  * 1.6 ))
            .alphaDecay([0.05])
    
      //Reheat simulation and restart
      simulation.alpha(0.6).restart()

}
//Seperating into clusters
function draw2(){
    let svg = d3.select("#vis").select('svg')
    
    clean('none')

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r', d => salarySizeScale(d.Median)*1.6)
        .attr('fill', d => categoryColorScale(d.Category))
    
    
    svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
        .attr('x', d => categoriesXY[d][0] + 120)
        .attr('y', d => categoriesXY[d][1] + 180)
        
    svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Total Students: ${(categoriesXY[d][2])}`)
        .attr('x', d => categoriesXY[d][0] + 200)   
        .attr('y', d => categoriesXY[d][1] + 200)
        .attr('opacity', 1)

    svg.selectAll('.lab-text')
        .on('mouseover', function(d, i){
            d3.select(this)
                .text(d)
        })
        .on('mouseout', function(d, i){
            d3.select(this)
                .text(d => `Total Students: ${d3.format(",.2r")(categoriesXY[d][2])}`)
        })
    

    simulation  
        .force('charge', d3.forceManyBody().strength([1]))
        .force('forceX', d3.forceX(d => categoriesXY[d.Category][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.Category][1] - 50))
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) *1.6))
        .alphaDecay([0.02])

    //Reheat simulation and restart
    simulation.alpha(0.9).restart()
    
    createLegend(20, 50)
}
//Showing in 2 dimensional space
function draw3(){
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isScatter')

    svg.selectAll('.scatter-x').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatter-y').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)

    svg.selectAll('circle')
        .transition().duration(1000).ease(d3.easeBack)
        .attr('cx', d => XPositionScale(d.XPosition))
        .attr('cy', d => YPositionScale(d.YPosition)) 
    
    svg.selectAll('circle').transition(1000)
        .attr('fill', d => categoryColorScale(d.Category))
        .attr('r', d => salarySizeScale(d.Median))
           

}
//Showing the initial clusters
function draw4_initial(){
    clean('none')

    let svg = d3.select('#vis').select('svg')
    svg.selectAll('circle')
        .transition()
        .attr('r',5)
        .attr('fill', d => categoryColorScale(d.Category))

    simulation 
        .force('forceX', d3.forceX(500))
        .force('forceY', d3.forceY(300))
        .force('collide', d3.forceCollide(d => 5))
        .alpha(0.6).alphaDecay(0.05).restart()
        
}
//Showing split by gender
function draw4(){
    
    simulation.stop()
    
    
    let svg = d3.select('#vis').select('svg')
    clean('isBubble')
    
    svg.selectAll('circle')
        .transition().duration(100).delay((d, i) => i * 2)
            .attr('fill',  d =>categoryColorScale(d.Category))
            .attr('r', d =>5)

    svg.select('.line-gender-split1').transition().duration(1000)
        .attr('opacity', 0.2)
    
    svg.select('.line-gender-split2').transition().duration(1000)
        .attr('opacity', 0.2)
    
    svg.select('.ellipse-3').transition().duration(1000)
        .attr('opacity', 1)
    

    
    svg.selectAll('.lab-text1').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Gender`)
        .attr('x', 500)   
        .attr('y', 275)
        .attr('opacity', 1)
    
    svg.selectAll('.lab-text2').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Male`)
        .attr('x',  600)   
        .attr('y',  350)
        .attr('opacity', 1)
    
    svg.selectAll('.lab-text3').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Female`)
        .attr('x',  400)   
        .attr('y',  350)
        .attr('opacity', 1)
    
    svg.selectAll('.cat-rect6').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
        .attr('x', d => genderXY[d][0]-70)
        .attr('y', d => genderXY[d][2]-20)
    
    svg.selectAll('.lab-text6').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Cluster Purity: ${d3.format(",.2r")(genderXY[d][3])}%`)
        .attr('x', d => genderXY[d][0])   
        .attr('y', d => genderXY[d][2])
        .attr('opacity', 1) 
        
    
    
    simulation
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(d => genderXY[d.Gender][0] ))
        .force('forceY', d3.forceY(d => genderXY[d.Gender][1] ))
        .force('collide', d3.forceCollide(d => 5))
        .alphaDecay([0.02])
    
    simulation.alpha(0.9).restart()
    
    
    

}
function draw5_1(){
   
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isScatter')

    svg.selectAll('.scatter-x1').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    svg.selectAll('.scatter-y1').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)

    svg.selectAll('circle')
        .transition().duration(800).ease(d3.easeBack)
        .attr('cx', d => XEngagementScale(d.AvgClicks))
        .attr('cy', d => YScoreScale(d.AvgScore)) 
    
    svg.selectAll('circle').transition(300)
        .attr('fill', d => categoryColorScale(d.Category))
        .attr('r', d => salarySizeScale(d.Median))
           

}
//Showing split by grade
function draw5(){
    simulation.stop()
    
    
    let svg = d3.select('#vis').select('svg')
    clean('isBubble')
    
    svg.selectAll('circle')
        .transition().duration(400).delay((d, i) => i * 4)
            .attr('fill',  d =>categoryColorScale(d.Category))
            .attr('r', d =>5)

    svg.select('.line-gender-grade-split1').transition().duration(200)
        .attr('opacity', 0.2)
    
    svg.select('.line-gender-grade-split2').transition().duration(200)
        .attr('opacity', 0.2)
    
    svg.select('.line-gender-grade-split3').transition().duration(200)
        .attr('opacity', 0.2)
    
    svg.select('.line-gender-grade-split4').transition().duration(200)
        .attr('opacity', 0.2)
    
    svg.select('.ellipse-2').transition().duration(200)
        .attr('opacity', 1)
    svg.select('.ellipse-1').transition().duration(200)
        .attr('opacity', 1)
    
     svg.selectAll('.lab-text0').transition().duration(0).delay((d, i) => i * 30)
        .text(d => `Gender`)
        .attr('x', d => 500)   
        .attr('y', d => 275)
        .attr('opacity', 1)
    
     svg.selectAll('.lab-text1').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Academic Score`)
        .attr('x', d => 690)   
        .attr('y', d => 390)
        .attr('opacity', 1)
    
    svg.selectAll('.lab-text2').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Male`)
        .attr('x', d => 600)   
        .attr('y', d => 350)
        .attr('opacity', 1)
    
    svg.selectAll('.lab-text3').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Female`)
        .attr('x', d => 400)   
        .attr('y', d => 350)
        .attr('opacity', 1)
    
    svg.selectAll('.lab-text4').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `> 60`)
        .attr('x', d => 670)   
        .attr('y', d => 430)
        .attr('opacity', 1)
    
    svg.selectAll('.lab-text5').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `< 60`)
        .attr('x', d => 780)   
        .attr('y', d => 380)
        .attr('opacity', 1)
    
    svg.selectAll('.cat-rect7').transition().duration(1).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
        .attr('x', d => gendergradepurityXY[d][0]-70)
        .attr('y', d => gendergradepurityXY[d][1]-20)
    
    svg.selectAll('.lab-text7').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Cluster Purity: ${d3.format(",.2r")(gendergradepurityXY[d][2])}%`)
        .attr('x', d => gendergradepurityXY[d][0])   
        .attr('y', d => gendergradepurityXY[d][1])
        .attr('opacity', 1) 
    

    simulation
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(d => gendergradeXY[d.GenderGrade][0]))
        .force('forceY', d3.forceY(d => gendergradeXY[d.GenderGrade][1]))
        .force('collide', d3.forceCollide(d => 5))
        .alphaDecay([0.02])
    
    simulation.alpha(0.9).restart()
    
     
    

}
//Showing cluster1 only
function draw6_1(){
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isBubble')

    svg.selectAll('circle')
         .transition().duration(400).delay((d, i) => i * 4)
         .attr('fill',  d =>categoryColorScaleClus1(d.Category))
         .attr('r', d =>salarySizeScale(d.Median))
    
    svg.selectAll('.cat-rect8').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
      
    
    svg.selectAll('.cat-rect9').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
       
    
    svg.selectAll('.cat-rect10').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
     
    
     svg.selectAll('.cat-rect11').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
   
    
     svg.selectAll('.lab-text90').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
     svg.selectAll('.lab-text91').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
     svg.selectAll('.lab-text92').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    svg.selectAll('.lab-text93').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    svg.selectAll('.lab-text8').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    simulation
        .force('forceX', d3.forceX(750))
        .force('forceY', d3.forceY(350))
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median)))
        .alpha(0.6).alphaDecay(0.05).restart()
    
    
   
    
}
//Showing cluster2 only
function draw6_2(){
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isBubble')

    svg.selectAll('circle')
         .transition().duration(400).delay((d, i) => i * 4)
         .attr('fill',  d =>categoryColorScaleClus2(d.Category))
         .attr('r', d =>salarySizeScale(d.Median))
    
    svg.selectAll('.cat-rect8').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
      
    
    svg.selectAll('.cat-rect9').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
       
    
    svg.selectAll('.cat-rect10').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
     
    
     svg.selectAll('.cat-rect11').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
   
    
     svg.selectAll('.lab-text90').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
     svg.selectAll('.lab-text91').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
     svg.selectAll('.lab-text92').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    svg.selectAll('.lab-text93').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)


    svg.selectAll('.lab-text9').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    simulation
        .force('forceX', d3.forceX(750))
        .force('forceY', d3.forceY(350))
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median)))
        .alpha(0.6).alphaDecay(0.05).restart()
   
}
//Showing cluster3 only
function draw6_3(){
    simulation.stop()
    
    let svg = d3.select("#vis").select("svg")
    clean('isBubble')

    svg.selectAll('circle')
         .transition().duration(400).delay((d, i) => i * 4)
         .attr('fill',  d =>categoryColorScaleClus3(d.Category))
         .attr('r', d =>salarySizeScale(d.Median))
    
    svg.selectAll('.cat-rect8').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
      
    
    svg.selectAll('.cat-rect9').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
       
    
    svg.selectAll('.cat-rect10').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
     
    
     svg.selectAll('.cat-rect11').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
   
    
     svg.selectAll('.lab-text90').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
     svg.selectAll('.lab-text91').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
     svg.selectAll('.lab-text92').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    svg.selectAll('.lab-text93').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    svg.selectAll('.lab-text10').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 1)

    
    simulation
        .force('forceX', d3.forceX(750))
        .force('forceY', d3.forceY(350))
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median)))
        .alpha(0.6).alphaDecay(0.05).restart()
   
}
//Last graph - all clusters
function draw7(){
    clean('none')

    let svg = d3.select('#vis').select('svg')
    svg.selectAll('circle')
        .transition()
        .attr('r', d => salarySizeScale(d.Median) * 1.6)
        .attr('fill', d => categoryColorScale(d.Category))

    simulation 
        .force('forceX', d3.forceX(500))
        .force('forceY', d3.forceY(500))
        .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) * 1.6 ))
        .alpha(0.6).alphaDecay(0.05).restart()
        
}


//Array of all the graph functions
//Will be called from the scroller functionality

let activationFunctions = [
    //All clusters together
    draw1,
    //Seperate clusters view
    draw2,
    //Clusters in 2 dimension space
    draw3,
    //intial load
    draw4_initial,
    //Split by gender
    draw4, 
    //Show the correlation between engagement and grade
    draw5_1,
    //Split by grade and gender
    draw5,
    //Segmentwise Information - Cluster 1
    draw6_1,
    //Segmentwise Information - Cluster 2
    draw6_2,
    //Segmentwise Information - Cluster 3
    draw6_3,
    // Conclusion
    draw7
]

//All the scrolling function
//Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index){
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {return i === index ? 1 : 0.1;});
    
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;
    draw7;
})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})