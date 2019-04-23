const observableModule = require("tns-core-modules/data/observable");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const audio = require('nativescript-audio-player');
const player = new audio.TNSPlayer();
var application = require("tns-core-modules/application");
let fs = require("tns-core-modules/file-system");

let viewModel;
let data = new ObservableArray();

function onNavigatingTo(args) {
    const page = args.object;

    viewModel = observableModule.fromObject({});

    data = page.navigationContext.data;
    viewModel.set("titolo", data.title);
    viewModel.set("image", data.image);
    console.log(data.image);

    var images = new ObservableArray();
    images.push({
        "image": data.image
    });
    if(data.other_image != "")
    {
        let other_image = data.other_image.split(",");
        for(let i=0; i<other_image.length; i++)
        {
            images.push({
                "image" : fs.knownFolders.currentApp().getFolder("/assets/zip/MuseoNavale").path + "/" + other_image[i]
            });
        }
    }
    viewModel.set('images', images);

    page.bindingContext = viewModel;
}

exports.myChangeEvent = function(args) {
    let changeEventText = 'Page changed to index: ' + args.index;
    console.log(changeEventText);
};

exports.myScrollingEvent = function(args) {
    console.log('Scrolling: ' + args.state.offset);
};

function play(){
    let folder = fs.knownFolders.currentApp();
    let file = fs.path.join(folder.path, "/assets/zip/MuseoNavale/audio/filename.mp3");
    console.log(file);

    const playerOptions = {
        audioFile: file,
        loop: false,
        completeCallback: function() {
            console.log('finished playing');
        },
        errorCallback: function(errorObject) {
            console.log(JSON.stringify(errorObject));
        },
        infoCallback: function(args) {
            console.log(JSON.stringify(args));
        }
    };

    player.playFromFile(playerOptions)
        .then(function(res) {
            console.log("In riproduzione");
            player.getAudioTrackDuration(playerOptions.audioFile).then(function (data) {
                console.log(data + " millisecondi");
            });
        })
        .catch(function(err) {
            console.log('something went wrong...', err);
        });
}

function pause() {
    console.log("pause");
    player.pause();
}

function resume() {
    console.log("resume");
    player.resume();
}

application.android.on(application.AndroidApplication.activityBackPressedEvent, (args) => {
    player.dispose();
});

exports.play = play;
exports.pause = pause;
exports.resume = resume;
exports.onNavigatingTo = onNavigatingTo;
