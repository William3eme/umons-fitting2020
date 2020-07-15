module.exports = {
    name:"Translation + RotationSS",
    type:"model",
    key:"TransrotSS",
    params:
    {
       CONC:{
           value:0.001,
           label:"Conc",
           detail:"concentration",
           unite:"mM",
           step:1E-4,
           minM:1E-4,
           maxM:1E-2,
           stepM:1E-4,
           factM:1.0,
           fixed:"true",
           varience:1
        },
       SOLV:{
           value:1,
           label:"q",
           detail:"nombre de molécules d’eau dans la première sphère d’hydratation",
           step:1.0,
           minM:0.5,
           maxM:8.0,
           stepM:0.1,
           factM:1.0,
           fixed:"true",
           varience:1
        },
       PROPR:{
           value:1,
           label:"Prop rot",
           detail:"Proportion of rotational contribution",
           step:1E-1,
           minM:0.1,
           maxM:1.0E2,
           stepM:0.1,
           factM:1.0,
           fixed:"true",
           varience:1
        },
       SPIN:{
            value:3.5E0,
           label:"Spin",
           detail:"Spin",
           step:0.5,
           minM:0.5,
           maxM:4.5,
           stepM:0.5,
           factM:1.0,
           fixed:"true",
           varience:1
        },
       B:{
           value:3.6E-8,
           label:"Dist tr",
           detail:"Closest Approach Distance",
           unite:"cm",
           step:1E-9,
           minM:1.5E-8,
           maxM:4.5E-8,
           stepM:0.1E-8,
           factM:1E8,
           fixed:"false",
           varience:1
        },
       DIF:{
           value:3.5E-5, 
           label:"Dif",
           detail:"Diffusion Constant",
           unite:"cm²/s",
           step:1E-6,
           minM:4.0E-6,
           maxM:5.0E-5,
           stepM:0.1E-6,
           factM:1E6,
           fixed:"false",
           varience:1
        },
       TAUS0:{
           value:1E-10,
           label:"Tau S0",
           detail:"Low field electronic relaxation time",
           unite:"s",
           step:1E-11,
           minM:1E-11,
           maxM:1E-8,
           stepM:1E-12,
           factM:1E12,
           fixed:"false",
           varience:1
        },
       TAUV:{
           value:1E-11,
           label:"Tau V",
           detail:"Correlation time for modulation of ZFS",
           unite:"s",
           min:0,
           step:1E-12,
           minM:1E12,
           maxM:1E-8,
           stepM:1E-13,
           factM:1E12,
           fixed:"true",
           varience:1
        },
       PROPT:{
           value:1,
           label:"Prop tr",
           detail:"Proportion of translational contribution",
           step:0.1,
           minM:0.1,
           maxM:1E2,
           stepM:0.1,
           factM:1.0,
           fixed:"true",
           varience:1
        },
       gl:{
           value:2,
           label:"g Landé",
           detail:"Landé factor",
           step:1E-1,
           minM:0.01,
           maxM:3,
           stepM:0.01,
           fixed:"true",
           varience:1
        },
       TAUM:{
           value:1e-7,
           label:"Tau M",
           detail:"Water residence time",
           unite:"s",
           step:1E-8,
           minM:1E-10,
           maxM:1E-6,
           stepM:1E-11,
           factM:1E12,
           fixed:"false",
           varience:1
        },
       TAUR:{
           value:5e-11,
           label:"Tau R",
           detail:"Rotational correlation time",
           unite:"s",
           step:1E-12,
           minM:1E-11,
           maxM:1E-8,
           stepM:1E-12,
           factM:1E12,
           fixed:"false",
           varience:1
        },
       dw:{
           value:0,
           label:"Delta w",
           detail:"Chemical shift of coordinated nucleus",
           unite:"",
           min:0,
           step:1E-11,
           varience:1
        },
       COUPL:{
           value:0,
           label:"A/h",
           detail:"Hyperfine coupling constant",
           unite:"rad/s",
           min:0,
           step:10,
           minM:1E6,
           maxM:1E8,
           stepM:1E6,
           factM:1E-4,
           fixed:"true",
           varience:1
        },
       distrot:{
           value:3.6e-8,
           label:"Dist rot",
           detail:"Distance electron-nucleus",
           unite:"cm",
           step:1E-9,
           minM:1.5E-8,
           maxM:4.5E-8,
           stepM:0.1E-8,
           factM:1E-8,
           fixed:"false",
           varience:1
        }
    },
    run: function(f){
        let rot = require("../models/RotationSS").run
        let trans = require("../models/Translation").run
        return {x:f,y:rot(f,this.params).y+trans(f,this.params).y}
    }
}