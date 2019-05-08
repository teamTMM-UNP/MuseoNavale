const observableModule = require("tns-core-modules/data/observable");
let native_zip = require("nativescript-zip").Zip;
let fs = require("tns-core-modules/file-system");
const httpModule = require("tns-core-modules/http");
let appSetting = require("tns-core-modules/application-settings");
let DownloaderManager = require("nativescript-downloadmanager").DownloadManager;
let options = require("nativescript-downloadmanager");
let device = require("tns-core-modules/platform")

let view;
let viewModel;
let page;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    view = page.getViewById("toRotate");
    /*view.animate({
        rotate : 360,
        duration : 2000,
        iterations : Number.POSITIVE_INFINITY
    });*/

    if(appSetting.getString("update", "NO") == "YES"){
        appSetting.setString("update", "NO");
        fs.knownFolders.currentApp().getFolder("/assets/zip").remove();
        if(device.isAndroid)
            download_and_zip_android();
        else
            download_and_zip_ios();    }

    else{
        if(!fs.Folder.exists(fs.knownFolders.currentApp().path + "/assets/zip")) {
            if(device.isAndroid)
                download_and_zip_android();
            else
                download_and_zip_ios();
        }
        else{
            const navigationEntry = {
                moduleName: "intro/intro",
                clearHistory: true
            };
            page.frame.navigate(navigationEntry);
        }
    }

    page.bindingContext = viewModel;
}

async function download_and_zip_android() {
    console.log('Download Started');
    viewModel.set("loading", "Downloading.....");
    let folder = fs.knownFolders.currentApp();
    let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/zip");
    let url = "http://museonavale.uniparthenope.it:5000/boundle";
    let dm = new DownloaderManager();
    dm.downloadFile(url, function(res,uri) {
        console.log(res);
        if(res){
            let path_file = uri.substring(8,uri.length);
            console.log(path_file);

            dm.unregisterBroadcast();

            native_zip.unzip(path_file,dest);

            native_zip.unzipWithProgress(path_file, dest, onZipProgress, true)
                .then(() => {
                    console.log('unzip succesfully completed');

                    let url_main = folder.getFolder("/assets/zip/file/MuseoNavale");
                    url_main.getEntities().then(function (data) {
                        for (let i = 1; i < data.length; i++) {
                            let name = data[i]["_name"];

                            if (url_main.getFile(name).extension == ".json") {
                                appSetting.setString("fileJson", name);
                                let file = fs.File.fromPath(path_file);
                                file.remove();
                                page.frame.navigate("home/home-page");
                            }
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    fs.knownFolders.currentApp().getFolder("/assets/zip").remove();
                    let file = fs.File.fromPath(path_file);
                    file.remove();

                    const navigationEntry = {
                        moduleName: "intro/intro",
                        clearHistory: true
                    };
                    page.frame.navigate(navigationEntry);
                });
        }
        else {
            console.log("error");

            const navigationEntry = {
                moduleName: "intro/intro",
                clearHistory: true
            };
            page.frame.navigate(navigationEntry);
        }
    });
}

function download_and_zip_ios() {
    console.log('Download Started');
    viewModel.set("loading", "Downloading.....");
    let folder = fs.knownFolders.currentApp();
    let file = fs.path.join(folder.path, "/assets/zip/prova.zip");
    let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/zip");
    let url = "http://museonavale.uniparthenope.it:5000/boundle";
    httpModule.getFile(url, file).then(function (r) {

            //native_zip.unzip(path_file,dest);

            native_zip.unzipWithProgress(file, dest, onZipProgress, true)
                .then(() => {
                    console.log('unzip succesfully completed');

                    let url_main = folder.getFolder("/assets/zip/file/MuseoNavale");
                    url_main.getEntities().then(function (data) {
                        for (let i = 1; i < data.length; i++) {
                            let name = data[i]["_name"];

                            if (url_main.getFile(name).extension == ".json") {
                                appSetting.setString("fileJson", name);
                                fs.knownFolders.currentApp().getFile("/assets/zip/prova.zip").remove();
                                page.frame.navigate("home/home-page");
                            }
                        }
                    });
                })
                .catch(err => {
                    console.log('unzip error: ' + err);
                    fs.knownFolders.currentApp().getFolder("/assets/zip").remove();
                    page.frame.navigate("intro/intro");

                    const navigationEntry = {
                        moduleName: "intro/intro",
                        clearHistory: true
                    };
                    page.frame.navigate(navigationEntry);
                });

    },function (e) {
        console.log(e);
        const navigationEntry = {
            moduleName: "intro/intro",
            clearHistory: true
        };
        page.frame.navigate(navigationEntry);    });
}


function onZipProgress(args) {
    console.log('unzipping:' + args + "%");
    viewModel.set("loading", "Unzipping: " + args + " %");
}

exports.onNavigatingTo = onNavigatingTo;
