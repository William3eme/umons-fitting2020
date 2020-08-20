const Vue = require("vue")
const http = require("axios")
const Graph =  require("./d3Lib")
let d3xt = require("d3").extent



function parseData(txt){
    let rawdata= txt.split("\r\n")

    let toSend = {offset:{type:"constant",value:0.2826},concentration:1}
    toSend["label"] = rawdata.shift()
    rawdata.length = rawdata.length -1 //check sur d'autre navigateurs
    toSend["data"] = rawdata.map((d)=>{
        let tmp = d.split("\t")
        // return {x:tmp[0],y:tmp[1]}
        return {x:Number(tmp[0]),y:Number(tmp[1])}
    })
    toSend.data.sort(function(a, b) {
        return a.x - b.x;
    })            
    return toSend
}



const getFile = (uid)=>{
    if(vue.File.uid && !confirm("Attention fichier déja chargé, voulez vous en charger en nouveau ?"))
        document.getElementById(vue.File.uid).checked = true;
    else{
        document.cookie = uid
        http.get("/api/files/"+uid)
            .then((res)=>{
                vue.File = res.data
                if(vue.File.model){
                    vue.modelSelected = vue.File.model.key
                    vue.File.model = Object.assign(vue.Models[vue.modelSelected],vue.File.model)
                    console.log(vue.model)
                }
                renderGraph(vue.File)
            })
    }
}
const putFile = (File) =>{
    http.put(`/api/files/${File.uid}`,File)
    .then((res)=>{
        //faire une gestion d'erreur !
        renderGraph(vue.File)
    })
}
const loadFile = (event)=>{
    // alert("coucou")
    let file = new FileReader()
    file.readAsText(event.target.files[0], 'UTF-8');
    file.addEventListener('load', function() {
        //ici mettre les données par défaut
        vue.pFile = {type:"Fit"}
        vue.pFile.rawdata = parseData(file.result)
        vue.addFile2 = true
        // console.log("done:",vue.pFile.rawdata)
        // let n
        // while (n==0) {
        //     n=window.prompt("nom du fichier:",temp.label
        // }
        // for(n="";n.length==0;n=window.prompt("nom du fichier:",temp.label)){
        //     // alert("erreur")
        // }
      
    });
}
const config = (target,key)=>{
    // alert(target)
    vue.pmodel = Object.assign({},target)
    vue.configparams = true
    vue.key = key

}

const validconfig = (key)=>{
    vue.File.model.params[key]=vue.pmodel
    vue.pmodel.maxM=parseFloat(vue.pmodel.maxM)
    vue.pmodel.minM=parseFloat(vue.pmodel.minM)
    vue.pmodel.fixed=vue.pmodel.fixed    
    putFile(vue.File)
    vue.key=""
    vue.configparams=false
    vue.pFile={}
}

const axeLoad = (type)=>{
    if (vue.axetype == "relaxation"){
        vue.File.rawdata.concentration = 1
        vue.File.rawdata.offset.data = 0
        renderGraph(vue.File)
    }
}        
const deleteFile = (uid) =>{
    http.delete(`/api/files/${uid}`)
        .then((res)=>{
            let tmp = vue.fileIndex
            for (let i = tmp.length ; i > 0; i=i-1){
                if (tmp[i-1].uid == res.data.uid){
                    vue.fileIndex.splice(i-1,1);
                    if(vue.File.uid == res.data.uid){
                        vue.File = {}
                        renderGraph()
                    }
                }
            }
            // delete vue.fileIndex[res.data.uid]
            if(vue.File.uid == res.data.uid) vue.File = {}
        }).catch((err)=>{
            console.log(err)
        })
}
let MinimiseSense = "up"

var vue = new Vue({
    el: '#vue',
    data: {
        fileIndex:{},
        modelSelected:"",
        Models:{},
        File:{},
        addFile:false,
        configparams:false,
        addFile2:false,
        getrawdata:false,
        pFile:{},
        pmodel:{},
        key:{},
        axetype:"relaxivity",
    },
    mounted(){
        let graph_cfg = require("./graph.json")
        graph_cfg.height = document.getElementById('GraphArea').clientHeight
        graph_cfg.width = document.getElementById('GraphArea').clientWidth
        document.getElementById('graph').style.height = graph_cfg.height + "px"
        document.getElementById('graph').style.width = graph_cfg.width + "px"
        Graph.init(graph_cfg)
        this.Models = require("../models/ModelsLoader")
        http.get("/api/files")
            .then((res)=>{
                this.fileIndex = res.data
                if(document.cookie){
                    getFile(document.cookie)
                }
            })
    }, 
    methods:{
        getFile:getFile,
        putFile:putFile,
        postFile:(File)=>{
            http.post("/api/files/",File)
            .then((res)=>{
                if(!res.data.uid)alert("Erreur POST")
                vue.File = res.data
                document.cookie = res.data.uid
                renderGraph(vue.File) 
                // vue.postFile = false
            })
        },
        loadFile:loadFile,
        config:config,
        validconfig:validconfig,
        axeLoad:axeLoad,
        deleteFile:deleteFile,
        selectModel:selectModel,
        renderGraph:renderGraph,
        loadModel:loadModel,
        Minimise:(File)=>{
            http.get("/api/mini/"+File.model.script+"/"+File.uid)
            .then((res)=>{
                vue.File = res.data // attention si il y a une erreur dans la minimisation 
                if(vue.File.model){
                    vue.modelSelected = vue.File.model.key

                    vue.File.model = Object.assign(vue.Models[vue.modelSelected],vue.File.model)
                    console.log(vue.model)
                }
                renderGraph(vue.File)
            })
        }
    }
})


function selectModel(model){
    //faire des tests sur le File et sur model !
    vue.File.model = model
    renderGraph(vue.File)
}
function renderGraph(File){
    var maxY = 0
    if(File.length == 0){ //pas de fichier charger
        Graph.drawPoints([])
        Graph.drawLine([])
    }else{
        let calcRd = File.rawdata.data
        switch (File.rawdata.offset.type) {
            case "constant":
                calcRd = File.rawdata.data.map((d)=>{
                    return{
                        y:(d.y/Number(File.rawdata.concentration))-Number(File.rawdata.offset.data),
                        x:d.x
                    }
                }) 
                if (d3xt(calcRd,((d)=>{return d.y}))[0] < 0){
                    File.rawdata.offset.data += 0.01
                    alert ("nombre négatif")
                }
                let maxRd = Number(d3xt(calcRd,((d)=>{return d.y}))[1])
                if(maxY < maxRd){
                    maxY = maxRd*1.1
                }
                if(File.model){
                    for (let element in vue.File.model.params){
                        vue.File.model.params[element].value = parseFloat(vue.File.model.params[element].value)
                        vue.File.model.params[element].step = parseFloat(vue.File.model.params[element].step)
                    }
                    File.model.data = calcul(File.model)
                    let maxMd = Number(d3xt(File.model.data,((d)=>{return d.y}))[1])
                    // console.log("test",vue.File.model.params.TAUM);
                    if(maxY < maxMd){
                        maxY = maxMd*1.1
                    } 
                    Graph.updateAxeY([0,maxY])
                    Graph.drawPoints(calcRd)
                    Graph.drawLine(File.model.data)
                }
                else
                {
                    Graph.drawLine([])
                    Graph.updateAxeY([0,maxY])
                    Graph.drawPoints(calcRd) //attention faire le calcul des points
                }    
                break;
        
            case "variable":
                let ofit={}
                http.get("/api/files/"+File.rawdata.offset.uid)
                    .then((res)=>{
                        ofit = res.data
                        ofit.model = Object.assign(vue.Models[ofit.model.key],ofit.model)
                        let points = File.rawdata.data.map((d)=>{return d.x})
                        // console.log(ofit,points)
                        File.rawdata.offset.data = points.map((f)=>{
                            return ofit.model.run(f).y
                        })
                        calcRd = File.rawdata.data.map((d,i)=>{
                            return{
                                x:d.x,
                                y:(d.y/Number(File.rawdata.concentration))-Number(File.rawdata.offset.data[i]),
                            }
                        })
                        // console.log(calcRd)
                        let maxRd = Number(d3xt(calcRd,((d)=>{return d.y}))[1])
                        if(maxY < maxRd){
                            maxY = maxRd*1.1
                        }
                        if(File.model){
                            for (let element in vue.File.model.params){
                                vue.File.model.params[element].value = parseFloat(vue.File.model.params[element].value)
                                vue.File.model.params[element].step = parseFloat(vue.File.model.params[element].step)
                            }
                            File.model.data = calcul(File.model)
                            let maxMd = Number(d3xt(File.model.data,((d)=>{return d.y}))[1])
                            // console.log("test",vue.File.model.params.TAUM);
                            if(maxY < maxMd){
                                maxY = maxMd*1.1
                            } 
                            Graph.updateAxeY([0,maxY])
                            Graph.drawPoints(calcRd)
                            Graph.drawLine(File.model.data)
                        }
                        else
                        {
                            Graph.drawLine([])
                            Graph.updateAxeY([0,maxY])
                            Graph.drawPoints(calcRd) //attention faire le calcul des points
                        }
                    })
                break;
            
        }

        // let maxRd = Number(d3xt(calcRd,((d)=>{return d.y}))[1])
        // if(maxY < maxRd){
        //     maxY = maxRd*1.1
        // }
        // if(File.model){
        //     for (let element in vue.File.model.params){
        //         vue.File.model.params[element].value = parseFloat(vue.File.model.params[element].value)
        //         vue.File.model.params[element].step = parseFloat(vue.File.model.params[element].step)
        //     }
        //     File.model.data = calcul(File.model)
        //     let maxMd = Number(d3xt(File.model.data,((d)=>{return d.y}))[1])
        //     // console.log("test",vue.File.model.params.TAUM);
        //     if(maxY < maxMd){
        //         maxY = maxMd*1.1
        //     } 
        //     Graph.updateAxeY([0,maxY])
        //     Graph.drawPoints(calcRd)
        //     Graph.drawLine(File.model.data)
        // }
        // else
        // {
        //     Graph.drawLine([])
        //     Graph.updateAxeY([0,maxY])
        //     Graph.drawPoints(calcRd) //attention faire le calcul des points
        // }
    }
    // Graph.drawPoints(Data.data)  
}

function calcul(model,domaine =[0.01,1000] ,resolution = 100){
  let m = (Math.log10(domaine[1])- Math.log10(domaine[0]))/(resolution-1)
  let p = Math.log10(domaine[0])
  return [...Array(resolution).keys()].map((x)=>{ // y = mx + p 
    let f = Math.pow(10,m*x+p)
    return model.run(f)
  })
}

function loadModel(event){
    Vue.set(vue.File,"model",Object.assign({},vue.Models[vue.modelSelected]))
    http.put(`/api/files/${vue.File.uid}`,vue.File)
    .then((res)=>{
        // if(res.data.error)console.log(res.data.error)
        renderGraph(vue.File)
    })
    // let model = event.srcElement.selectedIndex
    // let index =  event.srcElement.selectedIndex
    // console.log("testi:",vue.Models)
    // if(index > 0){
    // }
    // alert(model)
}
