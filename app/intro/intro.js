const observableModule = require("tns-core-modules/data/observable");
const appSetting = require("application-settings");
let fs = require("tns-core-modules/file-system");
let device = require("tns-core-modules/platform");

let viewModel;
let page;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    if(device.device.language == "it")
        viewModel.set("class_button", "coverImageButtonIt");
    else if(device.device.language == "en")
        viewModel.set("class_button", "coverImageButtonEn");
    else if(device.device.language == "fr")
        viewModel.set("class_button", "coverImageButtonFr");
    else
        viewModel.set("class_button", "coverImageButtonEn");

    page.bindingContext = viewModel;
}

function benvenuto(){
    if(!fs.Folder.exists("/data/data/it.uniparthenope.museonavale/files/app/assets/zip")) {
        page.frame.navigate("load/load");
    }
    else{
        page.frame.navigate("home/home-page");
    }
}

exports.benvenuto = benvenuto;
exports.onNavigatingTo = onNavigatingTo;