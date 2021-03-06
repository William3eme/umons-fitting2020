module.exports = {
    name:"SuperPara",
    type:"model",
    script:"minisuperpara.py",
    key:"SuperPara",
    params:{
        MSAT:{
            value:30.0, 
            label:"msat",
            detail:"specific magnetisation",
            unite:"Am^2/KG",
            step:1,
            minM:1.5E1,
            maxM:1E2,
            stepM:1.0,
            factM:1.0,
            fixed:false,
            display:true,
            varience:1
        },
        Radius:{
            value:5E-7, 
            label:"Radius",
            detail:"particule radius",
            unite:"cm",
            step:1E-8,
            minM:1E-7,
            maxM:3E-6,
            stepM:1E-7,
            factM:1E7,
            fixed:false,
            display:true,
            varience:1
        },
        Dif:{
            value:3.5E-5, 
            label:"Dif",
            detail:"coef of difusion of solvent",
            unite:"cm^2/s",
            step:1E-6,
            minM:3E-5,
            maxM:1E-4,
            stepM:1E-6,
            factM:1E-5,
            fixed:true,
            display:true,
            varience:1
        },
        TauNeel:{
            value:1.5E-9, 
            label:"TauNeel",
            detail:"Neel relaxation time",
            unite:"s",
            step:1E-11,
            minM:5E-10,
            maxM:1.5E-6,
            stepM:1E-11,
            factM:1E9,
            fixed:false,
            display:true,
            varience:1 
        },
        P:{
            value:1E-1, 
            label:"P",
            detail:"Factor of magnetization performing pression",
            // unite:"",
            step:1E-2,
            minM:0.0,
            maxM:1.0,
            stepM:0.0,
            factM:1.0,
            fixed:false,
            display:true,
            varience:1
        },
        Temp:{
            value:310, 
            label:"Temp",
            detail:"temperatue",
            unite:"K",
            step:1E1,
            minM:3E2,
            maxM:4E2,
            stepM:1E1,
            factM:1E-2,
            fixed:true,
            display:true,
            varience:1
        },
        // VMHFL:{
        //     value:, 
        //     label:"",
        //     detail:"",
        //     unite:"",
        //     step:,
        //     minM:,
        //     maxM:,
        //     stepM:,
        //     factM:,
        //     fixed:,
        //     display:true,
        //     varience:1
        // }
    },
    
    run:function(f,params = this.params){
        let freq1 = f * 2E6 * Math.PI 
        let freq2 = freq1 * 656 //tester 658
        let PROPT = 1
        let MASPAR = 4*Math.atan(1)*4*Math.pow(params.Radius.value,3)*5.18/3
        let MSATU = params.MSAT.value*MASPAR
        let MSATU2 = MSATU*1E-3
        let CONCPAR = 232.*1E-3/(3.*MASPAR)
        let CMT = 177650.*CONCPAR*Math.pow(1,2)*PROPT*Math.pow(MSATU,2)/(params.Radius.value*params.Dif.value)
        let TCD = Math.pow(params.Radius.value,2)/params.Dif.value
        let TauS1 = params.TauNeel.value

        // // *** 1e R1TRANF *** 
        // let TETA = Math.atan(62831.8530717959*TauS1)
        // let RHO = TCD*Math.sqrt(Math.pow(62831.8530717959,2)+1./Math.pow(TauS1,2))
        // let CO1 = Math.cos(TETA/2)
        // let CO2 = Math.cos(TETA)
        // let CO3 = Math.cos(TETA*3/2)
        // let SI1 = Math.sin(TETA/2)
        // let SI2 = Math.sin(TETA)
        // let SI3 = Math.sin(TETA*3/2)
        // let NUM = 1+RHO/4+Math.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))*CO3/9+Math.pow(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        // let DEN1 = 1+Math.sqrt(RHO)*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))/9*CO3
        // let DEN2 = Math.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*Math.pow(RHO,(3/2))
        // let DESPE1 = NUM/(Math.pow(DEN1,2)+Math.pow(DEN2,2))

        // let FirstR1TRANF = CMT*3*DESPE1

        // // *** 1e R1TRANB *** //
        // let zed = Math.sqrt(2*TCD*62831.8530717959)
        // let JSUP = 1+((5*zed)/8)+(Math.pow(zed,2)/8)
        // let JINF = 1+zed+(Math.pow(zed,2)/2)+(Math.pow(zed,3)/6)+(4*Math.pow(zed,4)/81)+(Math.pow(zed,5)/81)+(Math.pow(zed,6)/648)
        // let JTOT = JSUP/JINF

        // let FirstR1TRANB = CMT*(3*JTOT)

        // *** FREED *** ///
        let TETA = Math.atan(freq1*TauS1)
        let RHO = TCD*Math.sqrt(Math.pow(freq1,2)+1./Math.pow(TauS1,2))
        let CO1 = Math.cos(TETA/2)
        let CO2 = Math.cos(TETA)
        let CO3 = Math.cos(TETA*3/2)
        let SI1 = Math.sin(TETA/2)
        let SI2 = Math.sin(TETA)
        let SI3 = Math.sin(TETA*3/2)
        let NUM = 1.+RHO/4.+Math.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2
                +Math.pow(RHO,(3/2))*CO3/9
                +Math.pow(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        let DEN1 = 1.+Math.sqrt(RHO)*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))/9*CO3
        let DEN2 = Math.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*Math.pow(RHO,(3/2))
        let DESPE1 = NUM/(Math.pow(DEN1,2)+Math.pow(DEN2,2))

        TETA = Math.atan(freq2*TauS1)
        RHO = TCD*Math.sqrt(Math.pow(freq2,2)+1./Math.pow(TauS1,2))
        CO1 = Math.cos(TETA/2)
        CO2 = Math.cos(TETA)
        CO3 = Math.cos(TETA*3/2)
        SI1 = Math.sin(TETA/2)
        SI2 = Math.sin(TETA)
        SI3 = Math.sin(TETA*3/2)
        NUM = 1+RHO/4+Math.sqrt(RHO)*5/4*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))*CO3/9+Math.pow(RHO,(3/2))*CO1/9+CO2/36*RHO*RHO
        DEN1 = 1+Math.sqrt(RHO)*CO1+4/9*RHO*CO2+Math.pow(RHO,(3/2))/9*CO3
        DEN2 = Math.sqrt(RHO)*SI1+4/9*RHO*SI2+SI3/9*Math.pow(RHO,(3/2))
        let DESPE2 = NUM/(Math.pow(DEN1,2)+Math.pow(DEN2,2))

        let R1TRANF = CMT*3.*DESPE1
        let R2TRANF = CMT*3.*DESPE2

        // *** AYANT *** //
        let zed = Math.sqrt(2*TCD*freq1)
        let JSUP = 1+((5*zed)/8)+(Math.pow(zed,2)/8)
        // let JINF = 1+zed+(Math.pow(zed,2)/2)+(Math.pow(zed,3)/6)+(4*Math.pow(zed,4)/81)
        let JINF = 1+zed+(Math.pow(zed,2)/2)+(Math.pow(zed,3)/6)+(4*Math.pow(zed,4)/81)+(Math.pow(zed,5)/81)+(Math.pow(zed,6)/648)
        let JTOT = JSUP/JINF

        let R1TRANB = CMT*(3*JTOT)

        // *** LANGEVIN *** //
        let HTESLA = f*4.7/200.
        let EXPLA = (HTESLA*MSATU2)/(1.380662E-23*params.Temp.value)
        let LANG = 1/EXPLA
        if(EXPLA<=80){
            if(EXPLA<0.003){
                LANG = 0
            }
            else
            {
                let EXPP = Math.exp(EXPLA)
                let EXPM = Math.exp(-EXPLA)
                let LANA = (EXPP+EXPM)/(EXPP-EXPM)
                LANG = (LANA-1/EXPLA)/EXPLA
            }
        }
        let LANG2  = Math.pow(LANG,2)*Math.pow(EXPLA,2)

            // *** Langevin *** //
        // Langevin=LANG*EXPLA

        if(EXPLA<0.03) {
            LANG = 1/3
        }
        if(EXPLA>90) {
            LANG = 0
        } 

        // *** R1 *** //
        R1 = 7*params.P.value*LANG*R2TRANF+ (7*(1-params.P.value)*LANG+3*(1-LANG2-2*LANG))*R1TRANF+ 3*LANG2*R1TRANB

        // *** R2 *** //
        // R2 = 6.5*params.P.value*LANG*R2TRANF+ (1-params.P.value)*LANG*(3.5*R1TRANF+3.*FirstR1TRANF)+ (1-LANG2-2*LANG)*(1.5*R1TRANF+2*FirstR1TRANF)+ LANG2*(1.5*R1TRANB+2*FirstR1TRANB)

        // *** Freed *** //
        // Freed = R1TRANF;

        // // *** Ayant *** //
        // Ayant = R1TRANB;

        return {x:f,y:R1}
    }  
}