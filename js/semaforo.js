
let colores = ["#00BB7A","#FFC372","#FEF300","#FD4A02"];
let opciones = ["Cumplida",
                "En Proceso de Cumplimiento",
                "Parcialmente Cumplida",
                "No Cumplida"];

let cscala = d3.scaleOrdinal().domain(opciones).range(colores);

let titulos = {"1":"Medidas de seguridad",
               "2":"Medidas de prevención",
               "3":"Medidas de justicia",
               "4":"Visibilizar la violencia de género y mensaje de cero tolerancia"};

d3.csv("./resources/data/dictamenes.csv")
    .then(function(data) {

        console.log(data);

        let sem_data = proceso_semaforo(data);
        console.log(sem_data);

        Object.entries(titulos).forEach(([key, value]) => {

            d3.select("#semaforo")
            .append("h3")
            //.attr("class","text-center")
            .style("color","white")
            .style("margin-top","4rem")
            .html(value);

            let tabla = d3.select("#semaforo")
                .append("table")
                .attr("class","table table-dark table-striped t" + key);

            let filtdat = sem_data.filter(ele => ele["cve"] == key);

            tabla.append("thead")
                .append("tr")
                .selectAll("th")
                .data(["","2017","2018","2019","2020"])
                .enter()
                .append("th")
                .html(function(d) {return d});

            tabla.append("tbody")
                .selectAll("tr")
                .data(filtdat)
                .enter()
                .append("tr")
                .each(function(d) {
                    d3.select(this).append("th")
                        .html(d["id"]);

                    d3.select(this).append("th")
                        .append("span")
                        .style("background-color",cscala(d["2017"]))
                        .style("border","2px solid white")
                        .attr("class","dot")
                        //.html(d["2017"])
                    
                    d3.select(this).append("th")
                        .append("span")
                        .style("background-color",cscala(d["2018"]))
                        .style("border","2px solid white")
                        .attr("class","dot")
                        //.html(d["2018"])
    
                    d3.select(this).append("th")
                        .append("span")
                        .style("background-color",cscala(d["2019"]))
                        .style("border","2px solid white")
                        .attr("class","dot")
                        //.html(d["2019"])

                    d3.select(this).append("th")
                        .append("span")
                        .style("background-color",cscala(d["2020"]))
                        .style("border","2px solid white")
                        .attr("class","dot")
                        //.html(d["2019"])
                });


        })

        let sel1 = "#vis1"
        let w1 = parseInt(d3.select(sel1).style("width"))
        let h1 = parseInt(d3.select(sel1).style("height"))
        console.log("vis1",w1,h1,h1/w1)

    });

function proceso_semaforo(data) {
    let sem_data = {};
        data.forEach(element => {
            //let id = element["medida"].toString();
            let id = element["descripcion"];
            let tipo = element["tipo"];
            let cve = element["medida"].toString();
            let año = element["year"];
            let status = element["status"];
            if (!sem_data.hasOwnProperty(id)) {
                sem_data[id] = {"id":id,"tipo":tipo,"cve":cve.substr(0,1)}
            }
            sem_data[id][año] = status;
        });

    return Object.values(sem_data)
}

