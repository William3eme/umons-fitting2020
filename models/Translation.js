module.exports = {
    name:"Translation",
    type:"model",
    key:"Translation",
    script:"minitranslation.py",
    params:{
       CONC:{
           value:1E-3,
           label:"Conc",
           detail:"concentration",
           unite:"mM",
           step:1E-4,
           min:1E-4,
           max:1E-2,
           stepM:1E-4,
           factM:1.0,
           fixed:true,
           varience:1
        },
       SPIN:{
           value:3.5E0,
           label:"Spin",
           detail:"Spin",
           step:0.5,
           min:0.5,
           max:4.5,
           stepM:0.5,
           factM:1.0,
           fixed:true,
           varience:1
        },
       B:{
           value:3.6E-8,
           label:"Dist tr",
           detail:"Closest Approach Distance",
           unite:"cm",
           step:1E-9,
           min:1.5E-8,
           max:4.5E-8,
           stepM:0.1E-8,
           factM:1E8,
           fixed:false,
           varience:1
        },
       DIF:{
           value:3.5E-5, 
           label:"Dif",
           detail:"Diffusion Constant",
           unite:"cm²/s",
           step:1E-6,
           min:4.0E-6,
           max:5.0E-5,
           stepM:0.1E-6,
           factM:1E6,
           fixed:false,
           varience:1
        },
       TAUS0:{
           value:1E-10,
           label:"Tau S0",
           detail:"Low field electronic relaxation time",
           unite:"s",
           step:1E-11,
           min:1E-11,
           max:1E-8,
           stepM:1E-12,
           factM:1E12,
           fixed:false,
           varience:1
        },
       TAUV:{
           value:1E-11,
           label:"Tau V",
           detail:"Correlation time for modulation of ZFS",
           unite:"s",
           min:0,
           step:1E-12,
           min:1E-12,
           max:1E-8,
           stepM:1E-13,
           factM:1E12,
           fixed:true,
           varience:1
        },
       PROPT:{
           value:1,
           label:"Prop tr",
           detail:"Proportion of translational contribution",
           step:0.1,
           min:0.1,
           max:1E2,
           stepM:0.1,
           factM:1.0,
           fixed:true,
           varience:1
        },
       gl:{
           value:2,
           label:"g Landé",
           detail:"Landé factor",
           step:1E-1,
           min:0.01,
           max:3,
           stepM:0.01,
           fixed:true,
           varience:1
        },
    //    VMHFL:{
    //        value:1
    //     }
    },
    run:function(f,params = this.params){
        let VMHFL = 1
        let freq1 = f * 2E6 * Math.PI 
        let freq2 = freq1 * 656 //tester 658
        let CMT = Math.pow(params.gl.value,2)*0.91783E-11*Math.pow(VMHFL,2)*params.PROPT.value*params.CONC.value*params.SPIN.value*(params.SPIN.value+1)/(params.B.value*params.DIF.value)
        let TCD = Math.pow(params.B.value,2)/params.DIF.value
        let TAUS1 = 5*params.TAUS0.value/((4/(1+4*Math.pow(freq2*params.TAUV.value,2)))+(1/(1+Math.pow(freq2*params.TAUV.value,2))))      //Tau s1
        let TAUS2 = 10*params.TAUS0.value/(3+(5/(1+Math.pow(freq2*params.TAUV.value,2)))+(2/(1+4*Math.pow(freq2*params.TAUV.value,2))))   //Tau s2

        //let TETA = Math.atan(freq1*params.TAUS1)  // J0
        //let RHO  = TCD*Math.sqrt(Math.pow(freq1,2)+1/Math.pow(params.TAUS1,2))
        //let CO1  = Math.cos(TETA/2) // J0
        //let CO2  = Math.cos(TETA)  //J0
        //let CO3  = Math.cos(TETA*3/2)  //J0
        //let SI1  = Math.sin(TETA/2)  //J0
        //let SI2  = Math.sin(TETA)
        //let SI3  = Math.sin(TETA*3/2)
        //let NUM  = 1+RHO/4+Math.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))*CO3/9+Math.pow(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        //let DEN1 = 1+Math.sqrt(RHO)*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))/9*CO3
        //let DEN2 = Math.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*Math.pow(RHO,(3/2))
        //let DESPE1 = NUM/(Math.pow(DEN1,2)+Math.pow(DEN2,2))   // calcul de j(0) uniquement au R2

        let TETA = Math.atan(freq1*TAUS1)
        let RHO  = TCD*Math.sqrt(Math.pow(freq1,2)+1/Math.pow(TAUS1,2))
        let CO1  = Math.cos(TETA/2)
        let CO2  = Math.cos(TETA)
        let CO3  = Math.cos(TETA*3/2)
        let SI1  = Math.sin(TETA/2)
        let SI2  = Math.sin(TETA)
        let SI3  = Math.sin(TETA*3/2)
        let NUM  = 1+RHO/4+Math.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))*CO3/9+Math.pow(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        let DEN1 = 1+Math.sqrt(RHO)*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))/9*CO3
        let DEN2 = Math.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*Math.pow(RHO,(3/2))
        let DESPE1 = NUM/(Math.pow(DEN1,2)+Math.pow(DEN2,2))  //J(wi)
    
        TETA = Math.atan(freq2*TAUS1)
        RHO  = TCD*Math.sqrt(Math.pow(freq2,2)+1/Math.pow(TAUS1,2))
        CO1  = Math.cos(TETA/2)
        CO2  = Math.cos(TETA)
        CO3  = Math.cos(TETA*3/2)
        SI1  = Math.sin(TETA/2)
        SI2  = Math.sin(TETA)
        SI3  = Math.sin(TETA*3/2)
        NUM  = 1+RHO/4+Math.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))*CO3/9+Math.pow(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        DEN1 = 1+Math.sqrt(RHO)*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))/9*CO3
        DEN2 = Math.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*Math.pow(RHO,(3/2))
        let DESPE2 = NUM/(Math.pow(DEN1,2)+Math.pow(DEN2,2))  //J(ws)


        let R1 = CMT*(3*DESPE1+7*DESPE2)                // Y de R1
        //let R2 = CMT*(6.5*DESPE2+1.5*DESPE1+2.*JJ0)     // Y de R2
        // console.log('DESPE1:',DESPE1,'DESPE2:',DESPE2,'R1:',R1,'CMT:',CMT)
        return {x:f,y:R1}
    }
}