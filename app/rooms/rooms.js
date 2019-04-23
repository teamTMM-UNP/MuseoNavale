const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const appSetting = require("application-settings");

let viewModel;
let page;
let items;

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data) {
        let jsonData = JSON.parse(data);
        if(jsonData['rooms']['Stanza1']['id'] != ""){
            items.push({
                "id": jsonData['rooms']['Stanza1']['id'],
                "image": "~/images/rooms.png"
            });
        }
        if(jsonData['rooms']['Stanza2']['id'] != ""){
            items.push({
                "id": jsonData['rooms']['Stanza1']['id'],
                "image": "~/images/rooms.png"
            });
        }
        if(jsonData['rooms']['Stanza3']['id'] != ""){
            items.push({
                "id": jsonData['rooms']['Stanza1']['id'],
                "image": "~/images/rooms.png"
            });
        }
        if(jsonData['rooms']['Stanza4']['id'] != ""){
            items.push({
                "id": jsonData['rooms']['Stanza1']['id'],
                "image": "~/images/rooms.png"
            });
        }
    });

    page.bindingContext = viewModel;
}
function onTap(args) {
    const index = args.index;

    let temp = new ObservableArray();

    console.log(items.getItem(index));
    temp.push(items.getItem(index));

    const nav =
        {
            moduleName: "room/room",
            context: {
                data: temp.getItem(0)
            }
        };

    page.frame.navigate(nav);
}

exports.onTap = onTap;
exports.onNavigatingTo = onNavigatingTo;