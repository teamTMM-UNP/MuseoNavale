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
    viewModel.set("titolo", data.id);

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data1) {
        let jsonData = JSON.parse(data1);
        for(let i=0; i<jsonData['rooms'].length; i++){
            if(jsonData['rooms'][i]['hall'] == data.id){
                for(let j=0; j<jsonData['rooms'][i]['items'].length; j++){
                    let img_name = jsonData['rooms'][i]['items'][j]['field_image'];
                    let path_img = url_main.path + "/" +img_name;

                    if(img_name != ""){
                        items.push({
                            "id" : jsonData['rooms'][i]['items'][j]['nid'],
                            "title": jsonData['rooms'][i]['items'][j]['title'],
                            "image": path_img,
                            "other_image": jsonData['rooms'][i]['items'][j]['field_other_image'],
                            "audio": jsonData['rooms'][i]['items'][j]['field_audio'],
                            "number_tour" : jsonData['tours'][i]['items'][j]['field_number_tour']
                        });
                    }
                    else{
                        items.push({
                            "id" : jsonData['rooms'][i]['items'][j]['nid'],
                            "title" : jsonData['rooms'][i]['items'][j]['title'],
                            "image": documents.getFile("images/no_image.png").path,
                            "other_image": "",
                            "audio": jsonData['rooms'][i]['items'][j]['field_audio'],
                            "number_tour" : jsonData['tours'][i]['items'][j]['field_number_tour']
                        })
                    }

                    items.sort(function (orderA, orderB) {
                        let dataA = (parseInt(orderA.number_tour));
                        let dataB = (parseInt(orderB.number_tour));

                        return (dataA < dataB) ? -1 : (dataA > dataB) ? 1 : 0;
                    });
                }
                break;
            }
        }
    });

    page.bindingContext = viewModel;
}

function onTap(args) {
    const index = args.index;

    let all_items = new ObservableArray();
    for(let i=0; i<items.length; i++)
        all_items.push(items.getItem(i));

    const nav =
        {
            moduleName: "detail/detail-page",
            context: {
                all_items: all_items,
                index: index,
                page: "room"
            }
        };

    page.frame.navigate(nav);
}

exports.onTap = onTap;
exports.onNavigatingTo = onNavigatingTo;