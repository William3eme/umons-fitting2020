const d3 = require("d3")
module.exports = {
    container:undefined,
    scaleX:d3.scaleLog(),
    // scaleX: d3.scaleLinear(),
    scaleY: d3.scaleLinear(),
    scaleLine:d3.line(),

    init:function (config) {
        let box_height = config.height
        let box_width = config.width
    
        let margin = config.margin
        let graph_height = box_height - margin.top - margin.bottom
        let graph_width = box_width - margin.left - margin.right
        
        if(config.scaleX.type=="Linear"){
            this.scaleX = d3.scaleLinear()
        }
        this.container = d3.select("svg")
            .append("g")
            .attr("height",graph_height)
            .attr("width",graph_width)
            .attr("transform","translate("+margin.left+","+margin.top+")")
            // .append("text")
            // .attr("transform", "rotate(-90)")
            // .attr("y", -margin.left+20)
            // .attr("x", -margin.top)
            // .text("Y axis title")
            // .append("text")
            // .attr("text-anchor", "end")
            // .attr("x", width)
            // .attr("y", height + margin.top + 20)
            // .text("X axis title")
            

        this.container
            .append("g")
            .attr("class","gPoints")

        this.scaleX //echelle X
            .domain(config.scaleX.domain)
            .range([0,graph_width]);
        this.scaleY //echelle Y
            .domain(config.scaleY.domain)
            .range([graph_height,0]);
            
        this.container //création axe X basé sur l'echelle X
            .append("g")
            .call(d3.axisBottom(this.scaleX))
            .attr("transform","translate(0,"+graph_height+")")
            .attr("class","gX")
            
        this.container //création axe Y basé sur l'echelle Y
            .append("g")
            .call(d3.axisLeft(this.scaleY))
            .attr("class","gY")
  
        this.container.append("path").attr("class", "gLine")
    },
    
    drawPoints:function(data){
        // this.updateAxeY([0,d3.max(data,(d)=>{return d.y*1.1})])        
        let scaleX = this.scaleX
        let scaleY = this.scaleY
        let g = d3.select(".gPoints")
            .selectAll("circle")
            .data(data)
            
        g.attr("cx", function(d) {return scaleX(d.x)})
            .attr("cy", function(d) {return scaleY(d.y)})
            .attr("r", 2);
        g.exit().remove()

        g.enter()
            .append("circle")
            .attr("cx", function(d) {return scaleX(d.x)})
            .attr("cy", function(d) {return scaleY(d.y)}) 
            .attr("r", 2)
    },
    drawLine(data){
        // this.updateAxeY([0,d3.max(data,(d)=>{return d.y*1.1})])        
        // this.updateAxeY([0,3500])        
        let scaleX = this.scaleX
        let scaleY = this.scaleY
        this.scaleLine
            .x(function(d){return scaleX(d.x)})
            .y(function(d){return scaleY(d.y)}),
        d3.select(".gLine")
            .attr("d",this.scaleLine(data))
            .style("stroke","red").style("fill","none")
    },
    updateAxeY:function(domain){
        d3.select(".gY").call(d3.axisLeft(this.scaleY.domain(domain)))
    },
    updateAxeX:function(domain){
        d3.select(".gX").call(d3.axisBottom(this.scaleX.domain(domain)))
    }
} 