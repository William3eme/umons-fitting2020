let d3xt = require("d3").extent
const path = require('path');
let fs = require("fs")
let Models = require("../models/ModelsLoader")
const _path = path.join(__dirname,"../files/")

asyncWrite = function(fileName,content,callback){
    fs.writeFile(_path+`${fileName}.json`,JSON.stringify(content),callback)
}
asyncRead = function(fileName,callback){
    fs.readFile(_path+`${fileName}.json`,callback)
}

class RawData{
    constructor(values){
        switch(typeof(values)){
            case "string":
                let rawdata= txt.split("\r\n")
                this.label = rawdata.shift()
                this.offset = {data:0.2826,type:"constant"}
                this.concentration = 1
                rawdata.length = rawdata.length -1 
                this.data = rawdata.map((d)=>{
                    let tmp = d.split("\t")
                    // return {x:tmp[0],y:tmp[1]}
                    return {x:Number(tmp[0]),y:Number(tmp[1])}
                })
                this.data.sort(function(a, b) {
                    return a.x - b.x;
                })            
                break
            case "object":
                if(!values.label){
                    throw new InternalError ("Rawdata: J'ai pas de label !","core.js", 34)
                }
                if(!values.data)
                {
                    throw new InternalError ("Rawdata: J'ai pas de data !", "core.js", 38)
                }    
                if(!values.offset) this.offset = {data:0.2826,type:"constant"}
                else this.offset = values.offset            
                if(!values.concentration) this.concentration = 1            
                else this.concentration = values.concentration            
                this.label = values.label
                this.data = values.data
                break
            default:

                break
        }
    }
    extract(){
        return JSON.parse(JSON.stringify(this))
    }
    extentY() {
        return d3xt(this.data,(d)=>{
            return d.y
        })
    }
    extentX() {
        return d3xt(this.data,(d)=>{
            return d.x
        })
    }
    calcul(concentration = this.concentration, offset = this.offset){
        let obj = this
        
        return this.data.map((d)=>{
            
            let r = {x:d.x,y:(d.y-obj.offset.data)/obj.concentration}
            if(r.y < 0) throw  new RangeError("y < 0 dans le calcul de rawdata", "core.js", 71)
            return r
        })
    }
}

class Model{
    constructor(object){
        let obj = Object.assign(object)
        if(!obj.key)
            throw new InternalError ("le modèle doit avoir une key", "core.js",81)
        if(!obj.name)
            throw new InternalError ("le modèle doit avoir un name", "core.js",81)
        if(!obj.params)
            throw new InternalError ("le modèle doit avoir des paramètres", "core.js",83)
        if(!Models[obj.key]) 
            throw new InternalError ("le modèle doit éxister", "core.js",85)
        this.key = obj.key
        this.name = obj.name
        this.params = obj.params
        this.script = obj.script
        this.run = Models[obj.key].run
        obj.domaine ? this.domaine = obj.domaine : this.domaine = [1e-2,1e3]
        obj.resolution ? this.resolution = obj.resolution : this.resolution = 99
        this.resolution = 99
        this.data = this.calcul()
    }
    calcul(domaine = this.domaine,resolution = this.resolution){
        if(domaine) {
            this.domaine = domaine
            if(this.domaine.length != 2 || (this.domaine[0] == 0 && this.domaine[1] == 0) || this.domaine[0] > this.domaine[1])
                throw new RangeError("le domaine n'est pas valide","core.js",96)
        }
        if(resolution) {
            this.resolution = resolution
            if (isNaN(parseFloat(resolution)) || !isFinite(resolution)){
                throw new InternalError("la résolution n'est pas valide","core.js",99)
            }
        }
        let m = (Math.log10(domaine[1])- Math.log10(domaine[0]))/resolution
        let p = Math.log10(domaine[0])
        return [...Array(resolution +1 ).keys()].map((x)=>{ // y = mx + p 
            let f = Math.pow(10,m*x+p)
            return this.run(f)
        })
    }
    extract(){
        return JSON.parse(JSON.stringify(this))
    }
    extentY() {
        return d3xt(this.data,(d)=>{
            return d.y
        })
    }
    extentX() {
        return d3xt(this.data,(d)=>{
            return d.x
        })
    }
}

class Fit{
    constructor(v1=undefined,v2=undefined){
        this.uid = Math.random().toString(36).substr(2, 9)
        this.name = this.uid
        v1 instanceof RawData ? this.rawdata = v1  : this.rawdata = v2 
        v1 instanceof Model ? this.model= v1  : this.model = v2 
    }
    load(obj){  
        
        if(!typeof(obj)=="object")throw Error("parametre objet méthode load n'est pas un objet")
        if(!obj.type)
            throw Error("l'objet doit avoir une propriété 'type' ")
        else {
            switch(obj.type){
                case "Fit":
                        
                    // if (!this.uid || !this.name)
                    //     return new InternalError ("l'objet doit avoir une propriété 'name' et 'uid' ", "core.js",132)       
                    if(obj.uid) this.uid = obj.uid
                    if(obj.name) this.name = obj.name
                    if(obj.model){
                        this.model = new Model(obj.model)
                    }
                    if(obj.rawdata != undefined){
                        this.rawdata = new RawData(obj.rawdata)
                    }
                    // if (!this.model && !this.rawdata){
                    //     console.log("ni model ni rawdata !");
                    //     throw Error("l'objet doit avoir une propriété 'model' ou 'rawdata' ")
                    // }
                    break
                case "Model":
                    this.model = new Model(obj)
                    break
                case "Rawdata":
                    this.rawdata = new RawData(obj)
                    this.name = this.rawdata.label
                    break
            }
        }

       
    }
    extract(){
        let toSend = {type:"Fit",uid:this.uid,name:this.name}
        if(this.model) toSend.model = this.model.extract()
        if(this.rawdata) toSend.rawdata = this.rawdata.extract()
        return toSend
    }
    save(callback){
        let content = this.extract()
        asyncWrite(this.uid,content,callback)
    }
    delete(callback){
        fs.unlink(_path+`${this.uid}.json`,(err,data)=>{
            callback(err,data)
        })
    }
    loadFile(fileName,callback){
        asyncRead(fileName,(err,data)=>{
            if(err){
                console.log(err);
                callback(err,data)
            }
            else {
                let content = JSON.parse(data.toString())
                console.log("Chargement du fichier:",content);
                this.load(content)
                callback(err,data)
            }
        })
    }
}

module.exports.Fit = Fit