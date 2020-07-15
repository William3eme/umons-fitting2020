
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require("fs")
const express = require("express")
const morgan = require("morgan")
// let __path = path.join(__dirname,"../files/")
const bodyParser = require("body-parser")

const Fit = require("./core").Fit



let FileAPI = express.Router()
let MiniAPI = express.Router()
    
FileAPI.use(bodyParser.json())


// asyncRead = function(fileName,callback){
//     fs.readFile(__path+`${fileName}.json`,callback)
// }
// asyncWrite = function(fileName,content,callback){
//     fs.writeFile(__path+`${fileName}.json`,JSON.stringify(content),callback)
// }

// FileAPI.use(fileUpload())
FileAPI.route("/")
    
    .get((req,res)=>{  // récupère et affiche la liste des file du serv sur le client.
        res.json(fs.readdirSync(path.join(__dirname,"../files")).map(fileuid => {
            let d = JSON.parse(fs.readFileSync(path.join(__dirname,`../files/${fileuid}`)))
            return {uid:d.uid,name:d.name}
        }))
    })
    .post((req,res)=>{  // permet de rajouter un fichier a la liste des file sur le serv.
        console.log("body:",req.body == undefined,Object.keys(req.body).length == 0)
        if(Object.keys(req.body).length == 0){
            return res.json({error:"body is undifined", status:'error'})
        }
        try{
            let fit = new Fit()
            
            fit.load(req.body)
            fit.save((err)=>{
                if(err){
                    return res.json({error:err, status:'error'})
                }
                else
                {
                    res.json(fit.extract())
                }
            })            
        }
        catch(err){
            console.log(err)
            res.send ({error:String(err), status:'error'})
        }
                
    })
    // .put((req,res)=>{})
    // .delete((req,res)=>{})
    
FileAPI.route("/:uid")  //sélectionne un fichier de la iste des filles et renvoie les data associé.
    .get((req,res)=>{
        try{
            let fit = new Fit()
            fit.loadFile(req.params.uid,(err)=>{
                if(err){
                    res.send ({error:String(err), status:'error'})
                }
                else res.json(fit.extract())
            })
        }    
        catch(err){
            res.send ({error:err, status:'error'})
        }
        
        // let fit = new Fit()
    })

    .put((req,res)=>{ // attention fichier qui n'existe pas !  put(uid,rawdata)
        if(!req.body || !req.body.type){
            return res.json({error:"File not found"})
        }
        try{
            let fit = new Fit()
            fit.loadFile(req.params.uid,(err)=>{
                if(err){
                    return res.json({error:err, status:'error'})
                }
                else {
                    fit.load(req.body)
                    fit.save((err)=>{
                        if(err) throw Error(err)
                        res.json(fit.extract())
                    })
                        
                }
                // else fit.load(res.body)
                    // fit.uid = req.params.uid                
            })            
        }
        catch(err){
            res.send ({error:err, status:'error'})
        }
    })
    .delete((req,res)=>{  //suprime un fichier de la liste des files
        try {
            let fit = new Fit()
            fit.loadFile(req.params.uid,(err)=>{
                if(err){
                    res.send ({error:err, status:'error'})
                }
                else {
                    let temp = fit.extract() 
                    fit.delete((err)=>{
                        if(err)throw Error(err)
                        res.json(temp)
                    })
                }
            })            
        }
        catch(err){
            res.send ({error:err, status:'error'})
        }

    })
MiniAPI.route("/:minimisation/:uid")
    .get((req,res)=>{
        const {spawn} = require('child_process');
        let dataToSend
        // console.log("./src_server/"+req.params.minimisation)
        let python = spawn("python",["./src_server/"+req.params.minimisation,req.params.uid])
        python.stdout.on('data', function (data) {
            // console.log('Pipe data from python script ...');
            dataToSend = data.toString();
        });
        
        python.on('exit', (code) => {
            // console.log(`child process close all stdio with code ${code}`);
            console.log(dataToSend)
            if(dataToSend == "OK\r\n"){
                let fit = new Fit()
                fit.loadFile(req.params.uid,(err)=>{
                    if(err){
                        res.send ({error:String(err), status:'error'})
                    }
                    else res.json(fit.extract())
                })
            } else res.send ("Erreur de mini")
            // res.send("resultat:"+dataToSend)

        });

        // python.on('exit', (code) => {
        //     console.log(`child process close all stdio with code ${code}`);
        //     console.log(dataToSend)
        //     res.send("resultat:"+dataToSend)
        // });
    })

module.exports= (app)=>{
    app
        .use("/api/files",FileAPI)
        .use("/api/mini",MiniAPI)
        .use("/api/files",morgan("dev"))
        
        // .use(fileUpload())
}
// console.log('bonjour')