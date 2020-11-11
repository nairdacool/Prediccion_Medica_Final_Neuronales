const enfermedadController = {};
const { request, response } = require("express");
const db = require("../../db/firebase.conn");
const brain = require("brain.js");
const net = new brain.recurrent.LSTM();
const mimir = require("mimir");
//const { dict } = require("mimir");
let mensaje;
let nombre = "";
let documento = "";
let eps = "";
enfermedadController.getData = async(req = request, res = response) => {
    let datos = [];
    //let enfermedad = [];
    //let datosSintomas = [];
    //let conjuntoDatos = [];
    const sintomas = await db.collection("EnfermedadesComunes").get();
    sintomas.forEach((doc) => {
        if (!(doc.data().Sintoma in datos)) {
            datos[doc.data().Sintoma] = true;
            datos.push({ Sintoma: doc.data().Sintoma });
            //datosSintomas.push(doc.data().Sintoma);
        }
    });

    res.render("index", {
        data: datos,
        msg: mensaje,
        nombre,
        documento,
        eps
    });
};

enfermedadController.postData = async(req = request, res = response) => {
    console.log(req.body);
    nombre = req.body.nombre;
    documento = req.body.documento;
    eps = req.body.eps
    let datos = [];
    let enfermedad = [];
    let datosSintomas = [];
    let conjuntoDatos = {};
    const sintomas = await db.collection("EnfermedadesComunes").get();
    sintomas.forEach((doc) => {
        if (!(doc.data().Sintoma in datos)) {
            datos[doc.data().Sintoma] = true;
            datos.push({ Sintoma: doc.data().Sintoma });
            datosSintomas.push(doc.data().Sintoma);
        }
        if (!(doc.data().Enfermedad in enfermedad)) {
            enfermedad[doc.data().Enfermedad] = true;
            enfermedad.push(doc.data().Enfermedad);
        }
        conjuntoDatos[doc.data().Sintoma] = doc.data().Enfermedad;
    });
    //console.log(enfermedad);
    //console.log(datosSintomas);
    //console.log(conjuntoDatos);

    let ANN_Classes = {};
    for (let index = 0; index < enfermedad.length; index++) {
        ANN_Classes[enfermedad[index]] = index;
    }
    //console.log(ANN_Classes);

    classes_array = Object.keys(ANN_Classes);

    let dict = mimir.dict(datosSintomas);
    let traindata = [];

    for (keyConjunto in conjuntoDatos) {
        for (keyANN in ANN_Classes) {
            if (keyANN == conjuntoDatos[keyConjunto]) {
                //console.log(keyConjunto+"**-*-*-*-*-*-"+ANN_Classes[keyANN])
                traindata.push([mimir.bow(keyConjunto, dict), ANN_Classes[keyANN]]);
                break;
            }
        }
    }

    const conjunto = [];
    const data = JSON.parse(JSON.stringify(req.body));
    conjunto.push(data);
    let testEnfermedadPredicted = "";

    for (key in data) {
        testEnfermedadPredicted = testEnfermedadPredicted + data[key] + ", ";
    }
    console.log(testEnfermedadPredicted);

    //testEnfermedad = "Presión en la parte inferior del abdomen, Orina con sangre, Dolor al Orinar, Orina turbia, Opresión en los riñones, Fiebre";
    //testEnfermedaddos= "Dolor en los ojos, Sarpullido, Vomito, Dolor en los huesos, Diarrea,Dolor en las articulaciones,Nauseas,Dolor Muscular "
    //testEnfermedadtres = "Tos, Fiebre, Congestión Nasal, Estornudos, Dolor de Garganta"
    testBowEnfermedadPredicted = mimir.bow(testEnfermedadPredicted, dict);
    //testBowEnfermedaddos = mimir.bow(testEnfermedaddos, dict)
    //testEnfermedadtresbow = mimir.bow(testEnfermedadtres,dict)

    var net = new brain.NeuralNetwork();
    ann_train = traindata.map(function(pair) {
        return {
            input: pair[0],
            output: vec_result(pair[1], datosSintomas.length),
        };
    });
    //console.log(ann_train)
    function vec_result(res, num_classes) {
        var i = 0,
            vec = [];
        for (i; i < num_classes; i += 1) {
            vec.push(0);
        }
        vec[res] = 1;
        return vec;
    }

    function maxarg(array) {
        return array.indexOf(Math.max.apply(Math, array));
    }

    net.train(ann_train);
    var predict = net.run(testBowEnfermedadPredicted);
    var maxPredicted = (Math.max.apply(Math, predict) * 100).toFixed(2);
    var nameEnfermedad = classes_array[maxarg(predict)];
    //console.log(predict);
    console.log("Tiene un: " + maxPredicted + " de padecer: " + nameEnfermedad);
    mensaje = "Tiene un: " + maxPredicted + " de padecer: " + nameEnfermedad;
    //console.log(classes_array[maxarg(predict)]); // prints HISTORY
    //console.log(classes_array[maxarg(net.run(testBowEnfermedaddos))]);
    //console.log(classes_array[maxarg(net.run(testEnfermedadtresbow))]);

    res.redirect("/");
};

const prediccion = (sintomas) => {
    //console.log('desde la funsion predeir', sintomas);
    // net.train([
    //     { input: "Gripa", output: 'Resfriado común' }
    // ])
    // const output = net.run(`${sintoma}`);
    // console.log('prediccion', output);
};

//prediccion();

module.exports = enfermedadController;