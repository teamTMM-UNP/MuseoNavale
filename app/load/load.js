const observableModule = require("tns-core-modules/data/observable");
let native_zip = require("nativescript-zip").Zip;
let fs = require("tns-core-modules/file-system");
const httpModule = require("http");
let appSetting = require("tns-core-modules/application-settings");

let view;
let viewModel;
let page;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    view = page.getViewById("toRotate");
    view.animate({
        rotate : 360,
        duration : 2000,
        iterations : Number.POSITIVE_INFINITY
    });

    if(!fs.Folder.exists("/data/data/it.uniparthenope.museonavale/files/app/assets/zip")) {
        console.log('Download Started');
        viewModel.set("loading", "Downloading.....");
        let folder = fs.knownFolders.currentApp();
        let file = fs.path.join(folder.path, "/assets/zip/prova.zip");
        let dest = fs.path.join(fs.knownFolders.currentApp().path, "/assets/zip");
        let url = "http://museonavale.uniparthenope.it:5000/boundle";
        httpModule.getFile(url, file).then(function (r) {
            console.log(r.path);

            fs.knownFolders.currentApp().getFolder("/assets").getEntities().then(function (data) {
                console.log(data);
            });

            native_zip.unzipWithProgress(file, dest, onZipProgress, true)
                .then(() => {
                    console.log('unzip succesfully completed');
                    let url_main = folder.getFolder("/assets/zip/MuseoNavale");
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
                });
            },function (e) {
                console.log(e);
                page.frame.navigate("intro/intro");
        });

    }
    else{
        const navigationEntry = {
            moduleName: "intro/intro",
            clearHistory: true
        };
        page.frame.navigate(navigationEntry);
    }

    page.bindingContext = viewModel;
}

function onZipProgress(args) {
    console.log('unzipping:' + args + "%");
    viewModel.set("loading", "Unzipping: " + args + " %");
}

exports.onNavigatingTo = onNavigatingTo;