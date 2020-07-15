module.exports = {
    name:"Line",
    type:"model",
    key:"line",
    params:
    {
        m:{
           value:1,
           label:"m",
           detail:"concentration",
           unite:"mM",
           step:0.00001,
           min:0.1,
           max:2400,
        },
        p:{
           value:1,
           label:"p",
           detail:"nombre de molécules d’eau dans la première sphère d’hydratation",
           step:0.00001,
           min:0,
           max:2400,
        }
    },
    run: function(f){
      return {x:f,y:this.params.m.value*f+this.params.p.value}
    }
}

// module.exports = {
//   name:"Line",
//   type:"model",
//   key:"line",
//   params:
//   {
//       a:{
//          value:0.01,
//          label:"a",
//          detail:"concentration",
//          unite:"mM",
//          step:0.001,
//          min:0.0000001,
//          max:10,
//       },
//       b:{
//          value:1,
//          label:"b",
//          detail:"nombre de molécules d’eau dans la première sphère d’hydratation",
//          step:1,
//          min:0.000001,
//          max:1000,
//       },
//       c:{
//         value:0,
//         label:"c",
//         detail:"nombre de molécules d’eau dans la première sphère d’hydratation",
//         step:10,
//         min:0.00000001,
//         max:10000,
//      }
//   },
//   run: function(f){
//     return {x:f,y:this.params.a.value*Math.pow(f,2)+this.params.b.value*f+this.params.c.value}
//   }
// }


// let nb = 1 - Math.random()
// let variance = 0.1
// let scale = 0.01
// let min = scale
// let max = variance
// let delta = min - max

// function entierAleatoire(min,max)
// {
//   let i = parseInt((variance/step) * nb)
//   let j = i * scale
//   if (nb*1000%2 <= 0){
//       return j
//   }
//     else {
//       return -j
//     }
// }


// let scale = 0.001
// let variance = 0.1

// let init = 1

// let countP  = 0
// let countS  = 0
// let countN  = 0
// let countZ  = 0

// let resultat
// for(let i = 0;i<100;i++){
//     let random = 1.0 - Math.random()
//     let signe = Math.random()*1000%2 >= 1
//     resultat = parseInt(random(variance/scale))*scale
//     if(signe == true){
//         resultat = -resultat
//     }

//     if(resultat1000%2>=1)countP++
//     if(resultat>0)countS++
//     if(resultat<0)countN++
//     if(resultat==0)countZ++
//     // console.log(resultat)
//     if(!(resultat>= -variance && resultat<= variance))throw("Erreur !")
//     console.log(resultat,resultat>= -variance && resultat<= variance,resultat/scale)
// }
// console.log(countP,countS,countN)

// let line = {
//   name:"Line",
//   type:"model",
//   params:
//   {
//       m:{
//          value:0.1,
//          step:0.1,
//          min:0.1,
//       },
//       p:{
//          value:0.33,
//          step:0.1,
//          min:-5.0,
//          max:5.0
//       }
//   },
//   run: function(f){
//     return {x:f,y:Math.log(f/this.params.m.value)+this.params.p.value}
//   }
// }


// let Genetic = require("genetic-js")



// function calcul(model = line,domaine =[1,100] ,resolution = 10){
//   let m = (Math.log10(domaine[1])- Math.log10(domaine[0]))/(resolution-1)
//   let p = Math.log10(domaine[0])
//   return [...Array(resolution).keys()].map((x)=>{ // y = mx + p 
//     let f = Math.pow(10,m*x+p)
//     return model.run(f)
//   })
// }

// var atrouver =  calcul()

// // console.log(atrouver)

// var genetic = Genetic.create();

// genetic.optimize = Genetic.Optimize.Minimize;
// genetic.select1 = Genetic.Select1.Tournament2;
// genetic.select2 = Genetic.Select2.FittestRandom;


// genetic.seed = function() {
	
// 	var a = [];
// 	// create coefficients for polynomial with values between (-0.5, 0.5)
	
// 	var i;
// 	for (i=0;i<2;++i) {
// 		a.push(Math.random()-0.01); // -0.01 et 0.99
// 	}
	
// 	return a;
// };

// genetic.mutate = function(entity) {
	
// 	// allow chromosomal drift with this range (-0.05, 0.05)
// 	var drift = ((Math.random()-0.5)*2)*0.05;
	
// 	var i = Math.floor(Math.random()*entity.length);
// 	entity[i] += drift;
	
// 	return entity;
// };

// genetic.crossover = function(mother, father) {

// 	// crossover via interpolation
// 	function lerp(a, b, p) {
// 		return a + (b-a)*p;
// 	}
	
// 	var len = mother.length;
// 	var i = Math.floor(Math.random()*len);
// 	var r = Math.random();
// 	var son = [].concat(father);
// 	var daughter = [].concat(mother);
	
// 	son[i] = lerp(father[i], mother[i], r);
// 	daughter[i] = lerp(mother[i], father[i], r);
	
// 	return [son, daughter];
// };


// genetic.fitness =  function(entity){
//   // console.log(entity)
//   let genitor = {
//     params:
//     {
//         m:{
//            value:entity[0],
//         },
//         p:{
//            value:entity[1],
//         }
//     },
//     run: function(f){
//       return {x:f,y:Math.log(f/this.params.m.value)+this.params.p.value}
//     },
//     calcul: function (domaine =[1,100] ,resolution = 10){
//       let m = (Math.log10(domaine[1])- Math.log10(domaine[0]))/(resolution-1)
//       let p = Math.log10(domaine[0])
//       return [...Array(resolution).keys()].map((x)=>{ // y = mx + p 
//         let f = Math.pow(10,m*x+p)
//         return this.run(f)
//       })
//     }
//   }
//   let r = 0

//   genitor.calcul().forEach((d,i) => {
//     r += Math.pow(this.userData[i].y - d.y,2)
//   });
//   return Math.sqrt(r)
// }
// genetic.notification = function(pop){
//   console.log(pop[0].entity,pop[pop.length-1].entity)

//   return pop
// }
// var config = {
//   "iterations": 5000
//   , "size": 250
//   , "crossover": 0.9
//   , "mutation": 0.5
//   , "skip": 10
// };

// let test = genetic.evolve(config, atrouver);
// console.log(test)
// // console.log