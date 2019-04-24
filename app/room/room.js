const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const appSetting = require("application-settings");

let viewModel;
let page;
let items;
let data = new ObservableArray();

function onNavigatingTo(args) {
    page = args.object;

    items = new ObservableArray();

    viewModel = observableModule.fromObject({
        items:items
    });

    data = page.navigationContext.data;
    viewModel.set("room", data.id);

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data1) {
        let jsonData = JSON.parse(data1);
        console.log(jsonData['rooms'][data.id]);
        for(let i=0; i<jsonData['rooms'][data.id]['items'].length; i++)
        {
            let img_name = jsonData['rooms'][data.id]['items'][i]['field_image'];
            let path_img = url_main.path + "/" +img_name;

            if(img_name != ""){
                items.push({
                    "title": jsonData['rooms'][data.id]['items'][i]['title'],
                    "image": path_img,
                    "other_image": jsonData['rooms'][data.id]['items'][i]['field_other_image'],
                    "audio": jsonData['rooms'][data.id]['items'][i]['field_audio']
                });
            }
            else{
                items.push({
                    "title" : jsonData['rooms'][data.id]['items'][i]['title'],
                    "image": documents.getFile("images/no_image.png").path,
                    "other_image": "",
                    "audio": jsonData['rooms'][data.id]['items'][i]['field_audio']
                })
            }
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
            moduleName: "detail/detail-page",
            context: {
                data: temp.getItem(0)
            }
        };

    page.frame.navigate(nav);
}

exports.onTap = onTap;
exports.onNavigatingTo = onNavigatingTo;