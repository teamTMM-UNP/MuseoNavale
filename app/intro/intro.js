const observableModule = require("tns-core-modules/data/observable");
const appSetting = require("application-settings");
let fs = require("tns-core-modules/file-system");

let viewModel;
let page;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    page.bindingContext = viewModel;
}

function onTapIt(){
    appSetting.setString("language", "it");

    if(!fs.Folder.exists("/data/data/it.uniparthenope.museonavale/files/app/assets/zip")) {
        page.frame.navigate("load/load");
    }
    else{
        page.frame.navigate("home/home-page");
    }
}

function onTapEn(){
    appSetting.setString("language", "en");

    if(!fs.Folder.exists("/data/data/it.uniparthenope.museonavale/files/app/assets/zip")) {
        page.frame.navigate("load/load");
    }
    else{
        page.frame.navigate("home/home-page");
    }
}

function onTapFr(){
    appSetting.setString("language", "fr");

    if(!fs.Folder.exists("/data/data/it.uniparthenope.museonavale/files/app/assets/zip")) {
        page.frame.navigate("load/load");
    }
    else{
        page.frame.navigate("home/home-page");
    }
}

exports.onTapIt = onTapIt;
exports.onTapEn = onTapEn;
exports.onTapFr = onTapFr;
exports.onNavigatingTo = onNavigatingTo;