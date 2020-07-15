const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require("fs")
const express = require("express")
const morgan = require("morgan")
let __path = path.join(__dirname,"../files/")
const bodyParser = require("body-parser")

const Fit = require("./core").Fit



let FileAPI = express.Router()
FileAPI.use(bodyParser.json())



asyncRead = function(fileName,callback){
    fs.readFile(__path+`${fileName}.json`,callback)
}
asyncWrite = function(fileName,content,callback){
    fs.writeFile(__path+`${fileName}.json`,JSON.stringify(content),callback)
}

// FileAPI.use(fileUpload())
FileAPI.route("/")
    
    .get((req,res)=>{  // récupère et affiche la liste des file du serv sur le client.
        asyncRead("index",(err,data)=>{
            if(err)
                return res.json({error:"File not found"})
            res.json(JSON.parse(data))
        })
    })
    .post((req,res)=>{  // permet de rajouter un fichier a la liste des file sur le serv.
        
        if(!req.body || !req.body.type){
            return res.json({error:"File not found"})
        }
        let content =  req.body
        let uid = Math.random().toString(36).substr(2, 9)


        asyncRead("index",(err,data)=>{
            try {
                if(err) throw Error(err)
                let index = JSON.parse(data)
                switch (content.type) {
                    case "rawdata":
                        index[uid] = content.name
                        let fit = {uid:uid,rawdata:content,model:undefined}                    
                        asyncWrite(uid,fit,(err)=>{
                            if(err) throw Error(err)
                            asyncWrite("index",index,(err=>{
                                if(err) throw Error(err)
                                res.json(index)
                            }))
                        })
                        break
                    case "fit":
        
                        break
                    // default:
                    //     break;
                }

            } catch (error) {
                console.log(error);
            } 
        })


       
    
    })
    // .put((req,res)=>{})
    // .delete((req,res)=>{})
    
FileAPI.route("/:uid")  //sélectionne un fichier de la iste des filles et renvoie les data associé.
    .get((req,res)=>{
        asyncRead(req.params.uid,(err,data)=>{
            if(err)
                return res.json({error:"File not found"})
            res.json(JSON.parse(data))
        })
    })

    .put((req,res)=>{ // attention fichier qui n'existe pas !

    if(!req.body || !req.body.type){
        return res.json({error:"File not found"})
    }
    let content =  req.body
    // rajouter test sur type (content.type)
    //(switch)
        asyncWrite(req.params.uid,req.body,(err)=>{
            try {
                if(err)
                    throw Error (err)               
                // let index = JSON.parse(params.uid,content)
                // console.log(index)
                // avant de remplacer le fichier vérifier que celui est en vie ! 
                asyncWrite(uid,fit,(err)=>{ //nom de fichier,donnée du fichier, callback
                    if(err) throw Error(err)                    
                    // asyncWrite("index",index,(err=>{
                    //     if(err) throw Error(err)
                    //     res.json(index)
                    // }))
                })
                res.json(req.body) 
            } catch (error) {
                console.log(error)
                res.json({msg:"File not found",error:error})
            } 
            // finally {

            // }

        })
    })
    .delete((req,res)=>{  //suprime un fichier de la liste des files
        asyncRead("index",(err,data)=>{
            try {     
                if(err) throw Error(err)
                let index = JSON.parse(data)
                console.log();
                
                fs.unlink(__path+`${req.params.uid}.json`,(err,data)=>{
                    if(err) throw Error(err)
                    delete index[req.params.uid]
                    asyncWrite("index",index,(err,data)=>{
                    if(err) throw Error(err)
                        res.json({uid:req.params.uid})
                    })
                })
            } catch (error) {
                console.log(error)
            }
            
        })
    })


    
module.exports= (app)=>{
    app
        .use("/api/files",FileAPI)
        .use("/api/files",morgan("dev"))
        
        // .use(fileUpload())
}
// console.log('bonjour')