import * as douze from "../libs/douze/douze.js";

let tscale = d3.scaleBand();
let yscale = d3.scaleBand();
let cscale = d3.scaleLinear();
let columnas = ["feminicidios","feminicidios_tentativa","homicidios","violencia_familiar"];
let labels = ["Carpetas iniciadas por feminicidio",
              "Carpetas iniciadas por tentativa de feminicidio",
              "Carpetas iniciadas por homicidios de mujeres",
              "Carpetas iniciadas por violencia familiar"];

let eventos = d3.csv("./resources/data/timeline.csv")
        .then(function(datos) {

            console.log(datos);

            return datos;

        });

let series = d3.csv("./resources/data/series_line.csv")
        .then(function(datos) {
            console.log(datos);

            let fechas = datos.map(ele => ele["fecha"]);
            let axtick = fechas.filter(ele => ele.slice(5,7) == "01");
            let axlabe = fechas.filter(ele => (ele.slice(5,7) == "01") && ((ele.slice(3,4) == "0") || (ele.slice(3,4) == "5")));

            let series = new douze.Lienzo("contexto",0.8);
                    
            series.set_margin({"top":series.effective_height*0.1,"bottom":series.effective_height*0.1,"left":20,"right":20});

            tscale.range([0,series.effective_width]).domain(fechas);
            yscale.range([0,series.effective_height]).domain(columnas)
                .paddingInner(0.3);

            series.gsvg.selectAll(".serie")
                .data(columnas)
                .enter()
                .append("g")
                .attr("class",d => "g_" + d)
                .each(function(d,i) {

                    let filtrados = datos.filter(p => p[d] != "");
                    let maximo = d3.max(filtrados, p => parseFloat(p[d]));
                    cscale.range(["#1E191B","#FEF300"]).domain([0,1]);

                    d3.select(this)
                        .selectAll("rect")
                        .data(filtrados)
                        .enter()
                        .append("rect")
                        .attr("x",p => tscale(p["fecha"]))
                        .attr("y",yscale(d))
                        .attr("width",tscale.bandwidth())
                        .attr("height",yscale.bandwidth())
                        .style("fill",p => cscale(parseFloat(p[d])/maximo));

                    d3.select(this)
                        .append("text")
                        .attr("x",series.effective_width)
                        .attr("y",yscale(d))
                        .attr("dy",-5 + "px")
                        .text(labels[i])
                        .style("text-anchor","end")
                        .style("fill","white")
                        .style("font-size",12 + "px")
                        .style("font-weight","bold");

                });

            series.gsvg.selectAll(".axti")
                .data(axtick)
                .enter()
                .append("line")
                .attr("class","axti")
                .attr("x1",d => tscale(d))
                .attr("x2",d => tscale(d))
                .attr("y1",series.effective_height*1.05)
                .attr("y2",series.effective_height*1.06)
                .style("stroke","white")
                .style("stroke-width",1)
                .style("fill","none");

            series.gsvg.selectAll(".axlab")
                .data(axlabe)
                .enter()
                .append("text")
                .attr("class","axlab")
                .attr("x",d => tscale(d))
                .attr("y",series.effective_height*1.09)
                .text(d => d.slice(0,4))
                .style("fill","white")
                .style("text-anchor","middle")
                .style("font-size","10px");

            return series;

        });

        Promise.all([eventos,series])
            .then(function(datos) {
                let eventos = datos[0];
                let series = datos[1];

                let añosl = [];
                eventos.forEach(d => {
                    let año = parseInt(d["year"]);
                    if (añosl.indexOf(año) == -1) {
                        añosl.push(año)
                    }
                });
    
                añosl.sort();
                let activo = 0;
                pintar(activo);
    
                d3.select(".anterior")
                .property("disabled",true).on("click",atras);
                d3.select(".siguiente").on("click",adelante);
    
                function checks(activo) {
                    if (activo != añosl.length - 1) {
                        d3.select(".siguiente")
                            .property("disabled",false);
                    } else {
                        d3.select(".siguiente")
                            .property("disabled",true);
                    }
    
                    if (activo != 0) {
                        d3.select(".anterior")
                            .property("disabled",false);
                    } else {
                        d3.select(".anterior")
                            .property("disabled",true);
                    }
                }
    
                function atras(e,d) {
                    if (activo != 0) {
                        activo = activo - 1;
                    }
    
                    checks(activo);
                    pintar(activo);
                    
                }
    
                function adelante(e,d) {
                    if (activo != añosl.length - 1) {
                        activo = activo + 1
                    }
    
                    
                    checks(activo);
                    pintar(activo);
                }
    
                function pintar(activo) {

                    d3.selectAll(".axlabact").remove();
                    d3.selectAll(".marca").remove();
                    d3.select(".axlab").style("fill","white");
                    d3.selectAll(".activax").style("fill","white");

                    let elems = eventos.filter(d => parseInt(d["year"]) == añosl[activo]);
    
                    d3.selectAll(".helem").remove();
                    d3.selectAll(".pelem").remove();
    
                    d3.select("#linecont")
                    .append("div")
                    .attr("class","helem text-center") 
                    .append("h2")
                    .html(añosl[activo]);
    
                    d3.select("#linecont")
                    .append("ul")
                    .selectAll(".pelem")
                    .data(elems)
                    .enter()
                    .append("li")
                    .attr("class","pelem")
                    .style("font-size","0.9rem")
                    .each(function(d,i) {
    
                        if (d["enlace"] == "") {
                            d3.select(this).html(d["texto"])
                        } else {
                            d3.select(this).append("a")
                                .attr("href",d["enlace"])
                                .html(d["texto"])
                        }
    
                    });

                    let lcolor = "#FF0000";

                    if (añosl[activo] >= 2000) {

                        if ([2000,2005,2010,2015,2020].indexOf(añosl[activo]) == -1) {
                            series.gsvg
                                .append("text")
                                .attr("class","axlabact")
                                .attr("x",tscale(añosl[activo] + "-01-01"))
                                .attr("y",series.effective_height*1.09)
                                .text(añosl[activo])
                                .style("fill",lcolor)
                                .style("text-anchor","middle")
                                .style("font-size","10px");
                        } else {
                            d3.selectAll(".axlab").classed("activax",p =>  p == añosl[activo]+"-01-01");

                            d3.selectAll(".activax").style("fill",lcolor);
                        }

                        let limit;

                        if (añosl[activo] == 2021) {
                            limit = tscale(añosl[activo] + "-05-01");
                        } else {
                            limit = tscale(añosl[activo] + "-12-01");
                        }

                        series.gsvg
                            .append("rect")
                            .attr("class","marca")
                            .attr("x",tscale(añosl[activo] + "-01-01"))
                            .attr("y",yscale(columnas[3]))
                            .attr("height",yscale.bandwidth())
                            .attr("width", limit - tscale(añosl[activo] + "-01-01") + tscale.bandwidth())
                            .style("fill","none")
                            .style("stroke",lcolor)
                            .style("stroke-width",2)
                            .style("stroke-dasharray","4 1");

                        series.gsvg
                            .append("rect")
                            .attr("class","marca")
                            .attr("x",tscale(añosl[activo] + "-01-01"))
                            .attr("y",yscale(columnas[2]))
                            .attr("height",yscale.bandwidth())
                            .attr("width", limit - tscale(añosl[activo] + "-01-01") + tscale.bandwidth())
                            .style("fill","none")
                            .style("stroke",lcolor)
                            .style("stroke-width",2)
                            .style("stroke-dasharray","4 1");

                        if (añosl[activo] >= 2019 ) {
                            series.gsvg
                                .append("rect")
                                .attr("class","marca")
                                .attr("x",tscale(añosl[activo] + "-01-01"))
                                .attr("y",yscale(columnas[1]))
                                .attr("height",yscale.bandwidth())
                                .attr("width", limit - tscale(añosl[activo] + "-01-01") + tscale.bandwidth())
                                .style("fill","none")
                                .style("stroke",lcolor)
                                .style("stroke-width",2)
                                .style("stroke-dasharray","4 1");
                        }

                        if (añosl[activo] >= 2013 ) {
                            series.gsvg
                                .append("rect")
                                .attr("class","marca")
                                .attr("x",tscale(añosl[activo] + "-01-01"))
                                .attr("y",yscale(columnas[0]))
                                .attr("height",yscale.bandwidth())
                                .attr("width", limit - tscale(añosl[activo] + "-01-01") + tscale.bandwidth())
                                .style("fill","none")
                                .style("stroke",lcolor)
                                .style("stroke-width",2)
                                .style("stroke-dasharray","4 1");
                        }
                    };
                }

                let hb = parseInt(d3.select("#bots").style("height"));
                let hsvg = parseInt(d3.select("#contexto").style("height"));
                d3.select("#linecont").style("height",hsvg - hb + "px");

            })