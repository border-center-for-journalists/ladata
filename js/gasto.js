import * as douze from "../libs/douze/douze.js";

let formatod = d3.format("$,");

d3.csv("./resources/data/gastos.csv")
    .then(function(datos) {

        console.log(datos);
        
        let childs = []
        datos.forEach(elem => {
            let municipio = elem["Municipio"];
            let año = elem["Año"];
            let tipo = elem["Tipo"];
            let dependencia = elem["Dependencia"];

            if (!childs.find(ele => ele["name"]==municipio)) {
                childs.push({"name":municipio,"children":[]});
            }
            let munele = childs.find(ele => ele["name"]==municipio)["children"];

            if (!munele.find(ele => ele["name"]==año)) {
                munele.push({"name":año,"children":[]});
            }
            let añoele = munele.find(ele => ele["name"]==año)["children"];

            if (!añoele.find(ele => ele["name"]==tipo)) {
                añoele.push({"name":tipo,"children":[]});
            }
            let tipoele = añoele.find(ele => ele["name"]==tipo)["children"];

            if (!tipoele.find(ele => ele["name"]==dependencia)) {
                tipoele.push({"name":dependencia,"value":0.0})
            }
            let depele = tipoele.find(ele => ele["name"]==dependencia);
            depele["value"] = depele["value"] + parseFloat(elem["Gastos"]);
        });

        let root = {"name":"Gastos","children":childs};
        let hierarchy = d3.hierarchy(root).sum(d => d.value);

        console.log(hierarchy);

        let parte0 = new douze.Lienzo("gastvis",0.56)
                    .set_margin({"top":10,"bottom":10,"left":10,"right":10});

        treemap(parte0,hierarchy);

    })

    function treemap(parte0, hierarchy) {

        d3.select("#botones_gasto")
            .append("div").attr("class","btn-group").attr("role","group")
            .selectAll("button").data(["2018","2019","2020"])
            .enter()
            .append("button").attr("type","button")
            .attr("class","btn btn-outline-primary bot_gas")
            .html(d => d);

        let color = d3.scaleOrdinal()
            .domain(["Apodaca", "Cadereyta", "Guadalupe","Juárez","Monterrey"])
            .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'])

    let colorc = d3.scaleOrdinal()
            .domain(["Capacitación", "Unidad de Atención a la Mujer", "Acciones Alerta de Género","Promoción"])
            .range(['#FEF300','#625F4E','#FF8DB0','#00FFF0'])

    let colorb = d3.scaleOrdinal()
            .domain(["2018", "2019", "2020"])
            .range(['#e41a1c','#377eb8','#4daf4a'])

    d3.treemap()
            .size([parte0.effective_width, parte0.effective_height])
            .paddingTop(parte0.effective_width/140)
            .paddingRight(parte0.effective_width/280)
            //.paddingInner(0)
            //.paddingOuter(0)
            (hierarchy)

  // use this information to add rectangles:
    parte0.gsvg
        .selectAll("rect")
        .attr("class","rec_gast")
        .data(hierarchy.leaves())
        .enter()
        .append("rect")
        .attr("class","rec_gas")
        .attr("data-bs-toggle","tooltip")
        .attr("title",function(d) {
            return "<h5>" + d.parent.data.name + "</h5><p>" + d.data.name + ", " + d.parent.parent.data.name + ": " + formatod(d.value) + "</p>"
        })
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function(d){ return colorc(d.parent.data.name)})
        .each(function(d) {
            let exampleEl = d3.select(this).node()
            let tooltip = new bootstrap.Tooltip(exampleEl, {placement: 'auto', html:true})
        });

        d3.selectAll(".bot_gas")
            .on("click",clicked);

        parte0.gsvg
            .selectAll("titles")
            .data(hierarchy.descendants().filter(function(d){return d.depth==1}))
            .enter()
            .append("text")
              .attr("x", function(d){ return d.x0})
              .attr("y", function(d){ return d.y0+ parte0.effective_width/70})
              .text(function(d){ return d.data.name })
              .attr("font-size", parte0.effective_width/70 +  "px")
              .attr("fill", "white" );

        let activo = null;
        function clicked(e,d) {
            
            if (!activo) {
                d3.selectAll(".bot_gas").classed("active",p => p == d);
                activo = d;
            } else {
                if (activo == d) {
                    d3.selectAll(".bot_gas").classed("active",p => false);
                    activo = null;
                } else {
                    d3.selectAll(".bot_gas").classed("active",p => p == d);
                    activo = d;
                }
            };

            d3.selectAll(".rec_gas").style("opacity", p => {
                if (!activo) {
                    return 1.0
                }
                if (p.parent.parent.data.name == activo) {
                    return 1.0
                } else {
                    return 0.1
                }
                
            });
        }

    }

    function dendogram(parte0, hierarchy) {
        var cluster = d3.cluster()
            .size([parte0.effective_height, parte0.effective_width]);
        cluster(hierarchy);

        parte0.gsvg.selectAll('path')
            .data( hierarchy.descendants().slice(1) )
            .enter()
            .append('path')
            .attr("d", function(d) {
                return "M" + d.y + "," + d.x
                + "C" + (d.parent.y + 50) + "," + d.x
                + " " + (d.parent.y + 150) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                + " " + d.parent.y + "," + d.parent.x;
              })
            .style("fill", 'none')
            .attr("stroke", '#ccc');

        parte0.gsvg.selectAll("g")
            .data(hierarchy.descendants())
            .enter()
            .append("g")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")"
            })
            .append("circle")
              .attr("r", 7)
              .style("fill", "#69b3a2")
              .attr("stroke", "black")
              .style("stroke-width", 2);
    }

    function radial(parte0,hierarchy) {
        let radius = parte0.effective_width / 2
        let circg = parte0.gsvg.append("g")
                    .attr("transform", "translate(" + radius + "," + radius + ")");

        let cluster = d3.cluster()
            .size([360, radius - 60]);
        cluster(hierarchy);

        let linksGenerator = d3.linkRadial()
            .angle(function(d) { return d.x / 180 * Math.PI; })
            .radius(function(d) { return d.y; });


    circg.selectAll('path')
        .data(hierarchy.links())
        .enter()
        .append('path')
        .attr("d", linksGenerator)
        .style("fill", 'none')
        .attr("stroke", '#ccc')

    circg.selectAll("g")
        .data(hierarchy.descendants())
        .enter()
        .append("g")
        .attr("transform", function(d) {
          return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        })
        .append("circle")
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .style("stroke-width", 2)
    }

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })