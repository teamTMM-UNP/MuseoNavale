const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const appSetting = require("tns-core-modules/application-settings");

let viewModel;
let page;
let items;

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    for(let i=1; i<=9; i++){
        let room = "room" + i;
        viewModel.set(room, i);
    }
    viewModel.set("roomD", "D");

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data) {
        let jsonData = JSON.parse(data);
        for(let i=0; i<jsonData['rooms'].length; i++){
            items.push({
                "id" :  jsonData['rooms'][i]['hall']
            });
        }
    });

    page.bindingContext = viewModel;
}

function room(args){
    let R = args.view._observers.textChange[0].thisArg.options.sourceProperty;

    let temp = new ObservableArray();
    let room = R.substring(4,5);
    console.log(room);
    temp.push(items.getItem(parseInt(room)-1));

    if(room <= items.length){
        const nav =
            {
                moduleName: "room/room",
                context: {
                    data: temp.getItem(0),
                    index: room - 1
                }
            };

        page.frame.navigate(nav);
    }
    else
        return;
}

exports.room = room;
exports.onNavigatingTo = onNavigatingTo;
