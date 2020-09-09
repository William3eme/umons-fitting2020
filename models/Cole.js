module.exports = {
    name:"Cole cole",
    type:"model",
    script:"minicole.py",
    key:"Cole",
    params:{
        COLED:{
            label:"D",
            detail:"contribution de la dispersion",
            value:1E-1,
            step:0.1,
            minM:0.1,
            maxM:9E1,
            stepM:0.1,
            factM:1.0,
            fixed:false,
            varience:1
        },
        COLEA:{
            label:"A",
            detail:"amplitude à bas champ",
            value:1E0,
            step:0.1,
            minM:0.1,
            maxM:6E1,
            stepM:0.1,           
            factM:1.0,
            fixed:false,
            varience:1
        },
        COLEFC:{
            label:"fc",
            detail:"fréquence d’inflexion en Hertz",
            unit:"hz",
            value:1E6,
            step:1E6,
            minM:1E3,
            maxM:2E8,
            stepM:1.0,
            factM:1E-7,
            fixed:false,
            varience:1
        },
        COLEB:{
            label:"B'",
            detail:"paramètre beta",
            value:5E-1,
            step:0.1,
            minM:0.1,
            maxM:3.0,
            stepM:1.0,
            factM:1.0,
            fixed:false,
            varience:1 
        }
    },
    run:function(f){
        let Q1 = f*1000000/this.params.COLEFC.value
        let Q2 = Math.cos(3.1416*this.params.COLEB.value/4)
        let R1 = this.params.COLED.value+(this.params.COLEA.value*(1+Math.pow(Q1,(this.params.COLEB.value/2))*Q2))/(1+(2*Math.pow(Q1,(this.params.COLEB.value/2))*Q2)+Math.pow(Q1,this.params.COLEB.value));  // Y de R1
        return {x:f,y:R1}
    },
    update:function(params){
        this.params.value = params
    }
}
