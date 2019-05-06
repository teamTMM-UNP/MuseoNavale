const observableModule = require("tns-core-modules/data/observable");
const appSetting = require("tns-core-modules/application-settings");
let fs = require("tns-core-modules/file-system");
let device = require("tns-core-modules/platform");
const connectivityModule = require("tns-core-modules/connectivity");
var dialogs = require("tns-core-modules/ui/dialogs");

let viewModel;
let page;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    if((device.device.language).includes("it"))
        viewModel.set("class_button", "coverImageButtonIt");
    else if((device.device.language).includes("en"))
        viewModel.set("class_button", "coverImageButtonEn");
    else if((device.device.language).includes("fr"))
        viewModel.set("class_button", "coverImageButtonFr");
    else
        viewModel.set("class_button", "coverImageButtonEn");

    page.bindingContext = viewModel;
}

function benvenuto(){
    let doc = fs.knownFolders.currentApp().path;
    if(!fs.Folder.exists(doc + "/assets/zip/file/MuseoNavale")) {
        page.frame.navigate("load/load");
    }
    else{
        const myConnectionType = connectivityModule.getConnectionType();
        console.log(myConnectionType);
        if(myConnectionType == "1" || myConnectionType == "2"){
            fetch("http://museonavale.uniparthenope.it:5000/version").then((response) => response.json()).then((data) =>{
                let documents = fs.knownFolders.currentApp();
                let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
                let fileJson = url_main.getFile(appSetting.getString("fileJson"));
                fileJson.readText().then(function (data1) {
                    let jsonData = JSON.parse(data1);
                    let version = jsonData["version"];
                    let version_web = data.version;
                    console.log("Version Web: " + version_web);
                    console.log("My Version : " + version);
                    if(version != version_web){
                        dialogs.confirm({
                            title: "Aggiornamento!!",
                            message: "E' disponibile un nuovo aggiornamento. Scaricarlo?",
                            okButtonText: "Si",
                            cancelButtonText: "No"
                        }).then(function (result) {
                            console.log("Dialog result: " + result);
                            if(result){
                                appSetting.setString("update", "YES");
                                page.frame.navigate("load/load");
                            }
                            else
                                page.frame.navigate("home/home-page");
                        });
                    }
                    else{
                        page.frame.navigate("home/home-page");
                    }
                });
            }).catch(error => {
                page.frame.navigate("home/home-page");
            });
        }
        else {
            page.frame.navigate("home/home-page");
        }
    }
}

exports.benvenuto = benvenuto;
exports.onNavigatingTo = onNavigatingTo;
