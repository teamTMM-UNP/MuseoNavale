const observableModule = require("tns-core-modules/data/observable");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
let fs = require("tns-core-modules/file-system");
const appSetting = require("tns-core-modules/application-settings");
let platformModule = require("tns-core-modules/platform");
var phone = require( "nativescript-phone" );
var utilityModule = require("tns-core-modules/utils/utils");

let viewModel;
let page;
let items;
let giorni_it = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
let giorni_en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let giorni_fr = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    viewModel.set("telephon_number", "0815475417");

    let data = new Date();

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data1) {
        let jsonData = JSON.parse(data1);
        viewModel.set("altezza", jsonData['orari'].length * 20);
        console.log(jsonData['orari']);
        console.log(data.getDay());

        if(jsonData['orari'][data.getDay()]["orari"][0]["apertura"] != "N/A")
        {
            if(data.getHours() < jsonData['orari'][data.getDay()]["orari"][0]["apertura"] || data.getHours() > jsonData['orari'][data.getDay()]["orari"][0]["chiusura"]){
                if((platformModule.device.language).includes("it"))
                    viewModel.set("apertura", "- Chiuso -");
                else if((platformModule.device.language).includes("en"))
                    viewModel.set("apertura", "- Closed -");
                else if((platformModule.device.language).includes("fr"))
                    viewModel.set("apertura", "- Fermé -");
            }
            else{
                if((platformModule.device.language).includes("it"))
                    viewModel.set("apertura", "- Aperto -");
                else if((platformModule.device.language).includes("en"))
                    viewModel.set("apertura", "- Open -");
                else if((platformModule.device.language).includes("fr"))
                    viewModel.set("apertura", "- Ouvert -");
            }
        }
        else{
            if((platformModule.device.language).includes("it"))
                viewModel.set("apertura", "- Chiuso -");
            else if((platformModule.device.language).includes("en"))
                viewModel.set("apertura", "- Closed -");
            else if((platformModule.device.language).includes("fr"))
                viewModel.set("apertura", "- Fermé -");
        }

        for(let i=0; i<jsonData['orari'].length; i++){
            if((platformModule.device.language).includes("it")) {
                if (jsonData['orari'][i]["orari"][0]["apertura"] != "N/A") {
                    items.push({
                        "giorno": giorni_it[i],
                        "min": jsonData["orari"][i]["orari"][0]["apertura"] + ":00 - ",
                        "max": jsonData["orari"][i]["orari"][0]["chiusura"] + ":00"
                    });
                } else {
                    items.push({
                        "giorno": giorni_it[i],
                        "min": "Chiuso",
                        "max": ""
                    });
                }
            }
            else if((platformModule.device.language).includes("en")) {
                if (jsonData['orari'][i]["orari"][0]["apertura"] != "N/A") {
                    items.push({
                        "giorno": giorni_en[i],
                        "min": jsonData["orari"][i]["orari"][0]["apertura"] + ":00 - ",
                        "max": jsonData["orari"][i]["orari"][0]["chiusura"] + ":00"
                    });
                } else {
                    items.push({
                        "giorno": giorni_en[i],
                        "min": "Closed",
                        "max": ""
                    });
                }
            }
            else if((platformModule.device.language).includes("fr")) {
                if (jsonData['orari'][i]["orari"][0]["apertura"] != "N/A") {
                    items.push({
                        "giorno": giorni_fr[i],
                        "min": jsonData["orari"][i]["orari"][0]["apertura"] + ":00 - ",
                        "max": jsonData["orari"][i]["orari"][0]["chiusura"] + ":00"
                    });
                } else {
                    items.push({
                        "giorno": giorni_fr[i],
                        "min": "Fermé",
                        "max": ""
                    });
                }
            }
            else{
                if (jsonData['orari'][i]["orari"][0]["apertura"] != "N/A") {
                    items.push({
                        "giorno": giorni_en[i],
                        "min": jsonData["orari"][i]["orari"][0]["apertura"] + ":00 - ",
                        "max": jsonData["orari"][i]["orari"][0]["chiusura"] + ":00"
                    });
                } else {
                    items.push({
                        "giorno": giorni_en[i],
                        "min": "Closed",
                        "max": ""
                    });
                }
            }
        }
    });

    page.bindingContext = viewModel;
}

function openPhone(){
    let number = viewModel.get("telephon_number");
    phone.dial(number, true);
}

function web() {
    utilityModule.openUrl("https://museonavale.uniparthenope.it");
}

exports.web = web;
exports.openPhone = openPhone;
exports.onNavigatingTo = onNavigatingTo;