const Vue = require("vue")
const http = require("axios")
const Graph =  require("./d3Lib")
const getMax = require("d3").max
const getFile = (uid)=>{
    if(vue.File.uid && !confirm("Attention fichier déja chargé, voulez vous en charger en nouveau ?"))
        btn = document.getElementById(vue.File.uid).checked = true;
    else{
        http.get("/api2/files/"+uid)
            .then((res)=>{
                vue.File = res.data
                vue.File["type"] = "rawdata" 
                renderGraph(vue.File)
                // vue.File.data.map((d)=>{})
                // Graph.drawPoints(vue.filePoints)
            })
    }
}
const putFile = (File) =>{
    http.put(`/api2/files/${File.uid}`,File)
    .then((res)=>{
        console.log(res.data);
        
        renderGraph(vue.File)
    })
}
const postFile = (event)=>{
    let file = new FileReader()
    file.readAsText(event.target.files[0], 'UTF-8');
    file.addEventListener('load', function() {
        let content = parseData(file.result)
        content["name"] = event.target.files[0].name
        http.post("/api2/files/",content)
            .then((res)=>{
                let keys = Object.keys(res.data)
                vue.fileIndex = res.data
                let uid = keys[keys.length-1]
                content["uid"]=uid               
                vue.File = content
                Graph.drawPoints(vue.File.data)
            })
    });
}
const deleteFile = (uid) =>{
    http.delete(`/api2/files/${uid}`)
    .then((res)=>{
        Vue.delete(vue.fileIndex,uid);
        // delete vue.fileIndex[res.data.uid]
        if(vue.File.uid == res.data.uid) vue.File = {}
    }).catch((err)=>{
        console.log(err)
    })
}



var vue = new Vue({
    el: '#vue',
    data: {
        fileIndex:{},
        Models:{},
        Model:{},
        modelKey:{},
        File:{},
        filePoints:[],
        modelPoints:[],
    },
    mounted(){
        Graph.init(require("./graph.json"))
        http.get("/api2/files")
            .then((res)=>{this.fileIndex = res.data})
        this.Models = require("../models/ModelsLoader")
            // let t = {}
        // for(let element in Models){
        //     this.modelIndex[element] = Models[element].name
        // }
        // this.modelIndex = t
    }, 
    methods:{
        getFile:getFile,
        putFile:putFile,
        postFile:postFile,
        deleteFile:deleteFile,
        renderGraph:renderGraph,
        // loadModel:loadModel
    }
})


function parseData(file){
    let rawdata= Buffer
    .from(file)
    .toString("UTF8")
    .split("\r\n")

    let toSend = {}
    toSend["label"] = rawdata.shift()
    toSend["concentration"] = 1
    toSend["type"] = "rawdata"
    toSend["offset"] = {"type":"constant","data":0.2826}
    rawdata.length = rawdata.length -1 
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

function renderGraph(Data){
    console.log(Data);
    
    switch(Data.type){
        case "rawdata":
            switch(Data.offset.type){
                case "constant":
                    let once = true
                    vue.filePoints =  vue.File.data.map((d)=>{
                        let r = {x:d.x,y:(d.y-vue.File.offset.data)/vue.File.concentration}
                        if(once && r.y < 0){
                            once = false
                        }
                        return r
                    })
                    if (!once){
                        alert("Valeur(s) négative !")
                        File.offset.data = 0
                        renderGraph(File)
                    }
                    break
                case "variable":
                    break
            }
            break
        case "model":
            for (let element in vue.Model.params){
                vue.Model.params[element].value = Number(vue.Model.params[element].value)
                vue.Model.params[element].step = Number(vue.Model.params[element].step)
            }
            vue.Model = Data
            vue.modelPoints = [...Array(300).keys()].map((d)=>{
                let f = Math.pow(10,(d*5/300)-2)
                return Data.run(f)
            })
            break
    }
    let maxfilePoints = getMax(vue.filePoints,(d)=>{return d.y})
    let maxmodelPoints = getMax(vue.modelPoints,(d)=>{return d.y})
    if(!maxfilePoints)maxfilePoints = 0
    if(!maxmodelPoints)maxmodelPoints = 0
    if(maxfilePoints>maxmodelPoints)
        Graph.updateAxeY([0,maxfilePoints*1.1])
    else
        Graph.updateAxeY([0,maxmodelPoints*1.1])
    Graph.drawPoints(vue.filePoints)
    Graph.drawLine(vue.modelPoints)



  
}
