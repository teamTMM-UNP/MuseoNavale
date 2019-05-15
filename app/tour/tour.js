const observableModule = require("tns-core-modules/data/observable");
let fs = require("tns-core-modules/file-system");
let Observable = require("tns-core-modules/data/observable");
let ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const appSetting = require("tns-core-modules/application-settings");
let device = require("tns-core-modules/platform");

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

    let desc;
    if(device.device.language.includes("it")){
        desc = "Benvenuti nel tour " + data.id + ". Per iniziare, recarsi nella Sala 1.";
    }
    else if(device.device.language.includes("fr")){
        desc = "Bienvenue dans la visite " + data.id + ". Allez dans le Hall 1 pour commencer la visite.";
    }
    else if(device.device.language.includes("en")){
        desc = "Welcome to the tour " + data.id + ".Go to the Hall 1 to begin the tour.";
    }
    else{
        desc = "Welcome to the tour " + data.id + ".Go to the Hall 1 to begin the tour.";
    }

    items.push({
        "title": "Intro Tour",
        "image": "~/images/tour_complete.png",
        "other_image": "",
        "audio": "",
        "number_tour" : "",
        "description": desc
    });

    let desc1;
    if(device.device.language.includes("it")){
        desc1 = "Per proseguire il tour, recarsi nella Sala 1."
    }
    else if(device.device.language.includes("en")){
        desc1 = "To continue the tour, go to Hall1."
    }
    else if(device.device.language.includes("fr")){
        desc1 = "Pour continuer la visite, allez à la Hall 1."
    }
    else{
        desc1 = "To continue the tour, go to Hall1."
    }

    items.push({
        "title": "Intro Tour Sala 1",
        "image": "~/images/tour_complete.png",
        "other_image": "",
        "audio": "",
        "number_tour" : "",
        "description": desc1
    });

    let documents = fs.knownFolders.currentApp();
    let url_main = documents.getFolder("/assets/zip/file/MuseoNavale");
    let fileJson = url_main.getFile(appSetting.getString("fileJson"));
    fileJson.readText().then(function (data1) {
        let jsonData = JSON.parse(data1);
        for(let i=0; i<jsonData['tours'].length; i++){
            if(jsonData['tours'][i]['tour'] == data.id){
                for(let j=0; j<jsonData['tours'][i]['items'].length; j++){
                    let img_name = jsonData['tours'][i]['items'][j]['field_image'];
                    let path_img = url_main.path + "/" +img_name;

                    if(img_name != ""){
                        items.push({
                            "id" : jsonData['tours'][i]['items'][j]['nid'],
                            "title": jsonData['tours'][i]['items'][j]['title'],
                            "image": path_img,
                            "other_image": jsonData['tours'][i]['items'][j]['field_other_image'],
                            "audio": jsonData['tours'][i]['items'][j]['field_audio'],
                            "number_tour" : jsonData['tours'][i]['items'][j]['field_number_tour'],
                            "description": jsonData['tours'][i]['items'][j]['field_description']
                        });
                    }
                    else{
                        items.push({
                            "id" : jsonData['tours'][i]['items'][j]['nid'],
                            "title" : jsonData['tours'][i]['items'][j]['title'],
                            "image": documents.getFile("images/no_image.png").path,
                            "other_image": "",
                            "audio": jsonData['tours'][i]['items'][j]['field_audio'],
                            "number_tour" : jsonData['tours'][i]['items'][j]['field_number_tour'],
                            "description": jsonData['tours'][i]['items'][j]['field_description']
                        })
                    }

                    items.sort(function (orderA, orderB) {
                        let dataA = (parseInt(orderA.number_tour));
                        let dataB = (parseInt(orderB.number_tour));

                        return (dataA < dataB) ? -1 : (dataA > dataB) ? 1 : 0;
                    });

                    if(jsonData['tours'][i]['items'][j]['field_room'] != jsonData['tours'][i]['items'][j+1]['field_room']){
                        let desc;
                        if(device.device.language.includes("it")){
                            desc = "Per proseguire il tour, recarsi nella " + jsonData['tours'][i]['items'][j+1]['field_room'] + "."
                        }
                        else if(device.device.language.includes("en")){
                            desc = "To continue the tour, go to " + jsonData['tours'][i]['items'][j+1]['field_room'] + "."
                        }
                        else if(device.device.language.includes("fr")){
                            desc = "Pour continuer la visite, allez à la " + data.id + jsonData['tours'][i]['items'][j+1]['field_room'] + "."
                        }

                        items.push({
                            "title": "Intro Tour " + jsonData['tours'][i]['items'][j+1]['field_room'],
                            "image": "~/images/tour_complete.png",
                            "other_image": "",
                            "audio": "",
                            "number_tour" : "",
                            "description": desc
                        });
                    }
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
                page: "tour"
            }
        };

    page.frame.navigate(nav);
}

exports.onTap = onTap;
exports.onNavigatingTo = onNavigatingTo;
