const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require("fs")
const express = require("express")
const morgan = require("morgan")
let __path = path.join(__dirname,"../files/")

let FileAPI = express.Router()


asyncRead = function(fileName,callback){
    fs.readFile(__path+`${fileName}.json`,callback)
}
asyncWrite = function(fileName,content,callback){
    fs.writeFile(__path+`${fileName}.json`,JSON.stringify(content),callback)
}

FileAPI.use(fileUpload())
FileAPI.route("/")
    .get((req,res)=>{
        asyncRead("index",(err,data)=>{
            if(err)
                return res.json({error:"File not found"})
            res.json(JSON.parse(data))
        })
    })
    .post((req,res)=>{
        const uid = Math.random().toString(36).substr(2, 9);
        asyncRead("index",(err,data)=>{
            try {
                if(err) throw Error(err)
                let content = Object.assign({uid:uid},req.body)
                var index = JSON.parse(data)
                index[uid] = content.name
                asyncWrite(uid,content,(err)=>{
                    if(err) throw Error(err)
                    asyncWrite("index",index,(err=>{
                        if(err) throw Error(err)
                        res.json(index)
                    }))
                })
            } catch (error) {
                console.log(error);
            } 
        })
    })
    // .put((req,res)=>{})
    // .delete((req,res)=>{})
FileAPI.route("/:uid")
    .get((req,res)=>{
        asyncRead(req.params.uid,(err,data)=>{
            if(err)
                return res.json({error:"File not found"})
            res.json(JSON.parse(data))
        })
    })

    .put((req,res)=>{ // attention fichier qui n'existe pas !
        asyncWrite(req.params.uid,req.body,(err)=>{
            if(err)
                return res.json({error:"File not found"})
            res.json(req.body)
        })
    })
    .delete((req,res)=>{
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
    app.use("/api2/files",FileAPI)
}
