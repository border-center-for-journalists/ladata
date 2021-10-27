import * as douze from "../libs/douze/douze.js";

let formatod = d3.format("$,");

d3.csv("./resources/data/presupuestos.csv")
    .then(function(datos) {

        console.log(datos);
        
        let childs = []
        datos.forEach(elem => {
            let municipio = elem["Municipio"];
            let año = elem["Año"];
            let dependencia = elem["Dependencia"];

            if (!childs.find(ele => ele["name"]==municipio)) {
                childs.push({"name":municipio,"children":[]});
            }
            let munele = childs.find(ele => ele["name"]==municipio)["children"];

            if (!munele.find(ele => ele["name"]==año)) {
                munele.push({"name":año,"children":[]});
            }
            let añoele = munele.find(ele => ele["name"]==año)["children"];

            if (!añoele.find(ele => ele["name"]==dependencia)) {
                añoele.push({"name":dependencia,"value":0.0});
            }
            let depele = añoele.find(ele => ele["name"]==dependencia);
            depele["value"] = depele["value"] + parseFloat(elem["Presupuesto"]);
        });

        let root = {"name":"Presupuestos","children":childs};
        let hierarchy = d3.hierarchy(root).sum(d => d.value);

        console.log(hierarchy);

        let parte0 = new douze.Lienzo("presvis",0.56)
                    .set_margin({"top":10,"bottom":10,"left":10,"right":10});

        treemap(parte0,hierarchy);

        let sel3 = "#vis3"
        let w3 = parseInt(d3.select(sel3).style("width"))
        let h3 = parseInt(d3.select(sel3).style("height"))
        console.log("vis3",w3,h3,h3/w3)

    })

    function treemap(parte0, hierarchy) {

        d3.select("#botones_presupuesto")
            .append("div").attr("class","btn-group").attr("role","group")
            .selectAll("button").data(["2016","2017","2018","2019","2020","2021"])
            .enter()
            .append("button").attr("type","button")
            .attr("class","btn btn-outline-primary bot_pres")
            .html(d => d);

        let color = d3.scaleOrdinal()
            .domain(["Apodaca", "Cadereyta", "Guadalupe","Juárez","Monterrey"])
            .range(['#e41a1c','#377eb8','#984ea3','#ff7f00']);

    let institutos = ['Instituto de las Mujeres Regias', 'Alerta a Monterrey',
            'Instituto Municipal de la Mujer de Guadalupe',
            'Alerta a Guadalupe',
            'Instituto Municipal de la Mujer de Cadereyta',
            'Alerta a Cadereyta',
            'Alerta a Juárez',
            'Alerta a Apodaca'];

    let colinst = ['#FEF300','#FFD945','#FFB799','#F98E72','#00FFF0','#00DBB8','#FF8DB0','#FFC372'];

    let colorc = d3.scaleOrdinal()
            .domain(institutos)
            .range(colinst);

    // d3.select("#presvisbar")
    //     .selectAll("p")
    //     .data(institutos)
    //     .enter()
    //     .append("p")
    //     .style("color", (d,i) => colinst[i])
    //     .style("font-size","1.2vw")
    //     .html(d => d)


    d3.treemap()
            .size([parte0.effective_width, parte0.effective_height])
            .paddingTop(parte0.effective_width/100)
            .paddingRight(parte0.effective_width/300)
            .paddingInner(parte0.effective_width/300)
            //.paddingOuter(0)
            (hierarchy)

    parte0.gsvg
        .selectAll("rect")
        .data(hierarchy.leaves())
        .enter()
        .append("rect")
        .attr("class","rec_pres")
        .attr("data-bs-toggle","tooltip")
        .attr("title",function(d) {
            return "<h5>" + d.data.name + "</h5><p>" + d.parent.data.name + ": " + formatod(d.value) + "</p>"
        })
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function(d){ 
            return colorc(d.data.name)})
        .each(function(d) {
            let exampleEl = d3.select(this).node()
            let tooltip = new bootstrap.Tooltip(exampleEl, {placement: 'auto', html:true})
        });

        parte0.gsvg
            .selectAll("titles")
            .data(hierarchy.descendants().filter(function(d){return d.depth==1}))
            .enter()
            .append("text")
              .attr("x", function(d){ return d.x0})
              .attr("y", function(d){ return d.y0 + parte0.effective_width/70})
              .text(function(d){ return d.data.name })
              .attr("font-size", parte0.effective_width/70 +  "px")
              .attr("fill", "white" );

        d3.selectAll(".bot_pres")
            .on("click",clicked);

        let activo = null;
        function clicked(e,d) {
            
            if (!activo) {
                d3.selectAll(".bot_pres").classed("active",p => p == d);
                activo = d;
            } else {
                if (activo == d) {
                    d3.selectAll(".bot_pres").classed("active",p => false);
                    activo = null;
                } else {
                    d3.selectAll(".bot_pres").classed("active",p => p == d);
                    activo = d;
                }
            };

            d3.selectAll(".rec_pres").style("opacity", p => {
                if (!activo) {
                    return 1.0
                }
                if (p.parent.data.name == activo) {
                    return 1.0
                } else {
                    return 0.1
                }
                
            });
        }
    }

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})