const observableModule = require("tns-core-modules/data/observable");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
let fs = require("tns-core-modules/file-system");
const appSetting = require("application-settings");
let platformModule = require("tns-core-modules/platform");

let viewModel;
let page;
let items;

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    let data = new Date();

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data1) {
        let jsonData = JSON.parse(data1);
        viewModel.set("altezza", jsonData['orari'].length * 20);

        if(jsonData['orari'][data.getDay()-1]["orari"][0]["apertura"] != "N/A")
        {
            if(data.getHours() < jsonData['orari'][data.getDay()-1]["orari"][0]["apertura"] || data.getHours() > jsonData['orari'][data.getDay()-1]["orari"][0]["chiusura"]){
                viewModel.set("apertura", "- Chiuso -");
            }
            else{
                viewModel.set("apertura", "- Aperto -");
            }
        }
        else{
            viewModel.set("apertura", "- Chiuso -");
        }

        for(let i=0; i<jsonData['orari'].length; i++){

            if(jsonData['orari'][i]["orari"][0]["apertura"] != "N/A"){
                items.push({
                    "giorno": jsonData["orari"][i]["giorno"],
                    "min" : jsonData["orari"][i]["orari"][0]["apertura"] + ":00 - ",
                    "max" : jsonData["orari"][i]["orari"][0]["chiusura"] + ":00"
                });
            }
            else{
                items.push({
                    "giorno": jsonData["orari"][i]["giorno"],
                    "min" : "Chiuso",
                    "max": ""
                });
            }
        }
    });

    page.bindingContext = viewModel;
}

exports.onNavigatingTo = onNavigatingTo;