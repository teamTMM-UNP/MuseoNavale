const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const appSetting = require("application-settings");
let stringSimilarity = require('string-similarity');
let view = require("ui/core/view");
let BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
let barcodescanner = new BarcodeScanner();

let items;
let viewModel;
let drawer;
let page;
let myItems = new ObservableArray();
let language;

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    viewModel.set("loading_height", "25");
    viewModel.set("loading", "true");

    drawer = view.getViewById(page,"sideDrawer");

    language = appSetting.getString("language", "it");
    console.log(language);

    let documents = fs.knownFolders.currentApp();

    console.log("exists");
    viewModel.set("loading_height", "0");
    viewModel.set("loading", "false");
    let url_main = documents.getFolder("/assets/zip/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data) {
        let jsonData = JSON.parse(data);
        for (let i = 0; i < jsonData['items'].length; i++) {
            let img_name = jsonData['items'][i]['field_image'];
            let path_img = url_main.path + "/" +img_name;
            let title = jsonData['items'][i]['title'];

            if(img_name != "") {
                items.push({
                    "id": jsonData['items'][i]['nid'],
                    "image": path_img,
                    "title": title,
                    "other_image": jsonData['items'][i]['field_other_image'],
                    "audio": jsonData['items'][i]['field_audio']
                });
            }
            else{
                items.push({
                    "id": jsonData['items'][i]['nid'],
                    "image": documents.getFile("images/no_image.png").path,
                    "title": title,
                    "other_image": "",
                    "audio": jsonData['items'][i]['field_audio']
                });
            }
        }
    });

    if (page.get("search_text") != "")
        page.set("search_text", "");

    page.bindingContext = viewModel;
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

function toggleDrawer(){
    drawer.toggleDrawerState();
}

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

function about() {
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

function rooms(){
    page.frame.navigate("rooms/rooms");
}

exports.toggleDrawer = toggleDrawer;

exports.about = about;
exports.rooms = rooms;
exports.QRCode = QRCode;
exports.onTap = onTap;
exports.onTextViewLoaded = onTextViewLoaded;
exports.onNavigatingTo = onNavigatingTo;