const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
const appSetting = require("application-settings");

let viewModel;
let page;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data) {
        let jsonData = JSON.parse(data);
        for(let i=0; i<jsonData['orari'].length; i++){
            console.log(jsonData['orari'][i]);
        }
    });

    page.bindingContext = viewModel;
}

exports.onNavigatingTo = onNavigatingTo;