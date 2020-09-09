module.exports = {
    name:"Rotation",
    type:"model", //peut etre a sup
    script:"minirotation.py",
    key:"Rotation",
    params:{
        CONC:{
            value:1E-3, 
            label:"Conc",
            detail:"concentration",
            unite:"mM",
            step:1E-4,
            minM:1E-4,
            maxM:1E-2,
            stepM:1E-4,
            factM:1.0,
            fixed:true,
            display:true,
            varience:1
        },
        SOLV:{
            value:1,
            label:"q",
            detail:"nombre de molécules d’eau dans la première sphère d’hydratation",
            step:1.0,
            minM:1.0,
            maxM:8.0,
            stepM:0.1,
            factM:1.0,
            fixed:true,
            display:true,
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
            fixed:true,
            display:true,
            varience:1
        },
        gl:{
            value:2,
            label:"g Lande",
            detail:"Landé factor",
            step:1E-1,
            minM:0.1,
            maxM:3.0,
            stepM:0.01,
            fixed:true,
            display:true,
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
            fixed:true,
            display:true,
            varience:1
        },
        TAUV:{
            value:1e-11,
            label:"Tau V",
            detail:"Correlation time for modulation of ZFS",
            unite:"s",
            // minM:0,
            step:1E-12,
            minM:1E-12,
            maxM:1e-8,
            stepM:1E-13,
            factM:1E12,
            fixed:false,
            display:true,
            varience:1
        },
       TAUS0:{
           value:1e-10,
           label:"Tau S0",
           detail:"Low field electronic relaxation time",
           unite:"s",
           step:1E-11,
           minM:1E-11,
           maxM:1E-8,
           stepM:1E-12,
           factM:1E12,
           fixed:false,
           display:true,
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
           stepM:1E-8,
           factM:1E12,
           fixed:false,
           display:true,
           varience:1
        },
       TAUR:{
           value:5e-11,
           label:"Tau R",
           detail:"Rotational correlation time",
           unite:"s",
           step:1E-12,
           minM:1E-12,
           maxM:1E-8,
           stepM:1E-12,
           factM:1E12,
           fixed:false,
           display:true,
           varience:1
        },
       dw:{
           value:0,
           label:"Delta w",
           detail:"Chemical shift of coordinated nucleus",
           unite:"",
           minM:0,
           maxM:100,
           step:1E-11,
           display:true,
           fixed:true,
           varience:1
        },
       COUPL:{
           value:0,
           label:"A/h",
           detail:"Hyperfine coupling constant",
           unite:"rad/s",
           step:10,
           minM:1E6,
           maxM:1E8,
           stepM:1E6,
           factM:1E-4,
           fixed:true,
           display:true,
           varience:1
        },
       distrot:{
           value:3.1e-8,
           label:"Dist rot",
           detail:"Distance electron-nucleus",
           unite:"cm",
           step:1E-9,
           minM:1.5E-8,
           maxM:4.5E-8,
           stepM:0.1E-8,
           factM:1E-8,
           fixed:false,
           display:true,
           varience:1
        }
    },
    run:function(f,params = this.params){
        // let MU =1
        let CMR = Math.pow(params.gl.value,2)*0.82286E-32*1*params.SPIN.value*(params.SPIN.value+1)*(Math.pow(params.distrot.value,-6))
        let CMS = (2.*(6.2832*params.COUPL.value)*(6.2832*params.COUPL.value)*params.SPIN.value*(params.SPIN.value+1.))/3
        let freq1 = f * 2E6 * Math.PI 
        let freq2 = freq1 * 656 //tester 658
        let TT = Math.pow(freq2*params.TAUV.value,2)
        let TAUS1 = 5*params.TAUS0.value/((4/(1+4*TT)) + (1/(1+TT)))  //Tau s1
        let TAUS2 = 10*params.TAUS0.value/(3+(5/(1+TT))+(2/(1+4*TT))) //TAU s2
        let TCS1  = 1/((1/params.TAUM.value)+(1/TAUS1)) //TAU prime c1
        let TCS2  = 1/((1/params.TAUM.value)+(1/TAUS2)) // TAU prime c2
        let TCR1  = 1/((1/TCS1)+(1/params.TAUR.value)) // TAU c1
        let TCR2  = 1/((1/TCS2)+(1/params.TAUR.value)) // Tau c2
        let JTOT1 = TCR1/(1+Math.pow((freq1*TCR1),2))
        let JTOT2 = TCR2/(1+Math.pow((freq2*TCR2),2))
        let RR1   = CMR*((3*JTOT1)+(7*JTOT2))+(CMS*TCS2)/(1+Math.pow(freq2*TCS2,2))
        let RR2   = CMR*((1.5*JTOT1)+(6.5*JTOT2)+(2*TCR1))+(CMS/2)*((TCS2/(1+Math.pow(freq2*TCS2,2)))+TCS1)
        let T1M = 1/RR1 // T1m
        let T2M = 1/RR2 // T2m
        let R1 = params.PROPR.value*(((params.CONC.value/55.55)*params.SOLV.value)/(T1M+params.TAUM.value));  //PROPR    // Y de R1
        // let R2 = PROPR*((params.CONC.value*params.SOLV.value/55.55)*(1./(params.T2M+params.TAUM.value)))*MU; // Y de R2
        return {x:f,y:R1}
    },
}