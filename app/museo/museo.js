const observableModule = require("tns-core-modules/data/observable");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
let fs = require("tns-core-modules/file-system");
const appSetting = require("tns-core-modules/application-settings");
let platformModule = require("tns-core-modules/platform");
let phone = require( "nativescript-phone" );
let utilityModule = require("tns-core-modules/utils/utils");
let email = require("nativescript-email");
let Directions = require("nativescript-directions").Directions;

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

function openFb() {
    utilityModule.openUrl("https://www.facebook.com/alviani.antonio/");
}

function openEmail(){
    email.compose({
        subject: '',
        body: '',
        to: ['museonavale@uniparthenope.it']
    }).then(
        function() {
            console.log("Email composer closed");
        }, function(err) {
            console.log("Error: " + err);
        });
}

function openMap(){
    let directions = new Directions();

    directions.navigate({
        to: [{
            address: "Via Francesco Petrarca n. 80",
        }],
        type: "driving", // optional, can be: driving, transit, bicycling or walking
        ios: {
            preferGoogleMaps: true, // If the Google Maps app is installed, use that one instead of Apple Maps, because it supports waypoints. Default true.
            allowGoogleMapsWeb: true // If waypoints are passed in and Google Maps is not installed, you can either open Apple Maps and the first waypoint is used as the to-address (the rest is ignored), or you can open Google Maps on web so all waypoints are shown (set this property to true). Default false.
        }
    }).then(() => {
        console.log("Maps app launched.");
    }, error => {
        console.log(error);
    });
}

exports.openFb = openFb;
exports.openMap = openMap;
exports.openEmail = openEmail;
exports.web = web;
exports.openPhone = openPhone;
exports.onNavigatingTo = onNavigatingTo;
