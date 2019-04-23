const observableModule = require("tns-core-modules/data/observable");
let native_zip = require("nativescript-zip").Zip;
let fs = require("tns-core-modules/file-system");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const appSetting = require("application-settings");
const httpModule = require("http");
let stringSimilarity = require('string-similarity');
let view = require("ui/core/view");
const Button = require("tns-core-modules/ui/button").Button;
const Page = require("tns-core-modules/ui/page").Page;
let BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
let barcodescanner = new BarcodeScanner();
var utilityModule = require("utils/utils");

let items;
let viewModel;
let drawer;
let page;

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    viewModel.set("loading_height", "25");
    viewModel.set("loading", "true");

    drawer = view.getViewById(page,"sideDrawer");

    /*
    let folder = fs.knownFolders.currentApp();


    if(!fs.Folder.exists("/data/data/it.uniparthenope.museonavale/files/app/assets/zip")) {
        console.log('Download Started');
        let file = fs.path.join(folder.path, "/assets/zip/prova.zip");
        let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/zip");
        let url = "http://www.mobilemind.com.br/makeyourself/coollife/images-2.1.zip";
        httpModule.getFile(url, file).then(function (r) {
            console.log(r.path);

            viewModel.set("loading_height", "0");
            viewModel.set("loading", "false");

            fs.knownFolders.currentApp().getFolder("/assets").getEntities().then(function (data) {
                console.log(data);
            });

            native_zip.unzipWithProgress(file, dest, onZipProgress, true)
                .then(() => {
                    console.log('unzip succesfully completed');
                    let url_main = folder.getFolder("/assets/zip");
                    url_main.getEntities().then(function (data) {
                        //console.log(data);
                        set_items(data);
                    });
                }).catch(err => {
                console.log('unzip error: ' + err);
            });

        }, function (e) {
            //// Argument (e) is Error!
        });
    }
    else {
        console.log("exists");
        viewModel.set("loading_height", "0");
        viewModel.set("loading", "false");
        let url_main = fs.knownFolders.currentApp().getFolder("/assets/zip");
        url_main.getEntities().then(function (data) {
            //console.log(data);
            set_items(data);
        });
    }
    */

    var documents = fs.knownFolders.currentApp();

    if(!fs.Folder.exists("/data/data/it.uniparthenope.museonavale/files/app/assets/zip")) {
        let zipFile = fs.path.join(fs.knownFolders.currentApp().path, "boundle.zip");
        let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/zip");

        native_zip.unzipWithProgress(zipFile, dest, onZipProgress, true)
            .then(() => {
                console.log('unzip succesfully completed');
                viewModel.set("loading_height", "0");
                viewModel.set("loading", "false");
                let url_main = documents.getFolder("/assets/zip/MuseoNavale");
                url_main.getEntities().then(function (data) {
                    //console.log(data);
                    for (let i = 1; i < data.length; i++) {
                        let name = data[i]["_name"];

                        if (url_main.getFile(name).extension == ".json") {
                            appSetting.setString("fileJson", name);
                            let fileJson = url_main.getFile(name);
                            fileJson.readText().then(function (data) {
                                let jsonData = JSON.parse(data);
                                //console.log(jsonData);
                                for (let i = 0; i < data.length; i++) {
                                    let img_name = jsonData['items'][i]['field_image'];
                                    let path_img = url_main.path + "/" +img_name;
                                    console.log(path_img);
                                    let title = (jsonData['items'][i]['title']).split('>')[1].split('<')[0];

                                    if(img_name != "") {
                                        items.push({
                                            "id": jsonData['items'][i]['nid'],
                                            "image": path_img,
                                            "title": title
                                        });
                                    }
                                    else{
                                        items.push({
                                            "id": jsonData['items'][i]['nid'],
                                            "image": documents.getFile("images/info.png").path,
                                            "title": title
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            })
            .catch(err => {
                console.log('unzip error: ' + err);
            });
    }
    else {
        console.log("exists");
        viewModel.set("loading_height", "0");
        viewModel.set("loading", "false");
        let url_main = documents.getFolder("/assets/zip/MuseoNavale");
        let fileJson = url_main.getFile(appSetting.getString("fileJson"));
        fileJson.readText().then(function (data) {
            let jsonData = JSON.parse(data);
            //console.log(jsonData);
            for (let i = 0; i < data.length; i++) {
                let img_name = jsonData['items'][i]['field_image'];
                let path_img = url_main.path + "/" +img_name;
                //console.log(path_img);
                let title = (jsonData['items'][i]['title']).split('>')[1].split('<')[0];

                if(img_name != "") {
                    items.push({
                        "id": jsonData['items'][i]['nid'],
                        "image": path_img,
                        "title": title
                    });
                }
                else{
                    items.push({
                        "id": jsonData['items'][i]['nid'],
                        "image": documents.getFile("images/info.png").path,
                        "title": title
                    });
                }
            }
        });
    }

    if (page.get("search_text") != "")
        page.set("search_text", "");

    page.bindingContext = viewModel;
}

function set_items(data) {
    for (let i = 1; i < data.length; i++) {
        let img_path = data[i]['_path'];

        items.push({
            "id": i,
            "title": "Item " + i,
            "image": img_path
        });
    }
}

function onZipProgress(args) {
    console.log('unzipping:' + args + "%");
}

function onTap(args) {
    const index = args.index;

    let temp = new ObservableArray();

    if(myItems.length !=0)
        temp.push(myItems.getItem(index));
    else
        temp.push(items.getItem(index));

    const nav =
        {
            moduleName: "detail/detail-page",
            context: {
                data: temp.getItem(0)
            }
        };

    page.frame.navigate(nav);
}
exports.onTap = onTap;

let myItems = new ObservableArray();
function onTextViewLoaded(args) {
    const textView = args.object;

    textView.on("textChange", (args) => {
        console.dir(args.value);
        myItems.splice(0);

        if(args.value != "") {
            for(let i = 0; i < items.length; i++) {
                let similarity = stringSimilarity.compareTwoStrings(args.value, items.getItem(i).title);
                if (similarity > 0.2) {
                    myItems.push(items.getItem(i));
                }
            }
            viewModel.set("items", myItems);
        }
        else {
            viewModel.set("items", items);
        }
    });
}

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};

function QRCode(){
    barcodescanner.hasCameraPermission().then(permitted => {
        if(permitted)
            scan();
        else{
            barcodescanner.requestCameraPermission().then(
                function () {
                    console.log("Camera permission requested");

                    scan();
                });
        }
    }, (err) => {
        alert(err);
    });
}

function info() {
    page.frame.navigate("info/info");
}

function scan(){
    barcodescanner.scan({
        formats: "QR_CODE",
        cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
        //message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
        preferFrontCamera: false,     // Android only, default false
        showFlipCameraButton: false,   // default false
        showTorchButton: false,       // iOS only, default false
        torchOn: false,               // launch with the flashlight on (default false)
        resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
        beepOnScan: true,             // Play or Suppress beep on scan (default true)
        orientation: "portrait",
        openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
        closeCallback: () => {
            console.log("Scanner closed @ " + new Date().getTime());
        }
    }).then(
        function (result) {
            console.log("--- scanned: " + result.text);
            // Note that this Promise is never invoked when a 'continuousScanCallback' function is provided
            setTimeout(function () {
                if(result.text === "https://museonavale.uniparthenope.it/en"){
                    utilityModule.openUrl(result.text);
                }
                else{
                    console.log(result.text);
                    let found = false;
                    let temp = new ObservableArray();
                    for(let i=0; i<items.length; i++) {
                       if(items.getItem(i).id == result.text){
                           found = true;
                           temp.push(items.getItem(i));
                           break;
                       }
                    }
                    if(found){
                        const nav =
                            {
                                moduleName: "detail/detail-page",
                                context: {
                                    data: temp.getItem(0)
                                }
                            };

                        page.frame.navigate(nav);
                    }
                    else{
                        alert({
                            title: "Errore",
                            message: "Nessun elemento trovato corrispondente a questo QR-CODE",
                            okButtonText: "OK"
                        });
                    }
                }
            }, 500);

        },
        function (errorMessage) {
            console.log("No scan. " + errorMessage);
        }
    );
}

exports.info = info;
exports.QRCode = QRCode;
exports.onTextViewLoaded = onTextViewLoaded;
exports.onNavigatingTo = onNavigatingTo;
