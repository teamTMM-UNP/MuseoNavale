const observableModule = require("tns-core-modules/data/observable");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const audio = require('nativescript-audio-player');
var TextToSpeech = require('nativescript-texttospeech');
var application = require("tns-core-modules/application");
let fs = require("tns-core-modules/file-system");

let viewModel;
let data = new ObservableArray();
let TTS;
let player;

function onNavigatingTo(args) {
    const page = args.object;

    viewModel = observableModule.fromObject({});

    TTS = new TextToSpeech.TNSTextToSpeech();
    player = new audio.TNSPlayer();

    data = page.navigationContext.data;
    viewModel.set("titolo", data.title);
    viewModel.set("image", data.image);
    console.log(data.audio);

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
    if(data.audio != "") {
        let folder = fs.knownFolders.currentApp();
        let file = fs.path.join(folder.path, "/assets/zip/MuseoNavale/") + "/" + data.audio;
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
    else {
        let text = "La caracca (o nao, o \"nave\") era un grande veliero con tre o quattro alberi verticali e un albero di bompresso inclinato che venne sviluppato nel Mediterraneo durante il XV secolo. Molto probabilmente la caracca è stata ideata e progettata nei suoi tratti essenziali dai genovesi, che avevano sempre preferito usare, per i loro commerci, delle grosse navi a vela d'alto mare, a differenza dei veneziani che prediligevano le galee. Nei documenti genovesi la caracca è indicata col termine \"nave\" (\"navis\" in latino), mai col termine caracca.";

        let speakOptions = {
            text: text,
            speakRate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            finishedCallback: function () {
                console.log("Finito!!");
            }
        };

        TTS.speak(speakOptions).then(
            () => {
                console.log("OK");
            },
            err => {
                console.log(err);
            }
        );
    }
}

function pause() {
    console.log("pause");
    if (data.audio != "")
        player.pause();
    else{
        TTS.pause();
    }
}

function resume() {
    console.log("resume");
    if (data.audio != "")
        player.resume();
    else{
        TTS.resume();
    }
}

application.android.on(application.AndroidApplication.activityBackPressedEvent, (args) => {
    if (data.audio != "")
        player.dispose();
    else{
        TTS.destroy();
    }
});

exports.play = play;
exports.pause = pause;
exports.resume = resume;
exports.onNavigatingTo = onNavigatingTo;
