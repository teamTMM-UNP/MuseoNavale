const observableModule = require("tns-core-modules/data/observable");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const audio = require('nativescript-audio-player');
var TextToSpeech = require('nativescript-texttospeech');
var application = require("tns-core-modules/application");
let fs = require("tns-core-modules/file-system");
let device = require("tns-core-modules/platform");
let timer = require("tns-core-modules/timer");

let viewModel;
let data = new ObservableArray();
let TTS;
let player;
let page;

let testo = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Accumsan sit amet nulla facilisi morbi tempus. Interdum consectetur libero id faucibus nisl tincidunt eget. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. Tortor at auctor urna nunc. Felis donec et odio pellentesque diam volutpat commodo. Sapien nec sagittis aliquam malesuada bibendum. Tempus iaculis urna id volutpat lacus laoreet non. Luctus accumsan tortor posuere ac ut. Elementum curabitur vitae nunc sed. Vestibulum morbi blandit cursus risus at ultrices mi tempus imperdiet. Pulvinar sapien et ligula ullamcorper malesuada proin libero nunc consequat.\n" +
    "\n" +
    "Arcu bibendum at varius vel pharetra vel turpis nunc eget. Nullam vehicula ipsum a arcu cursus vitae. Cras pulvinar mattis nunc sed blandit libero volutpat. Commodo ullamcorper a lacus vestibulum sed arcu non odio. Laoreet id donec ultrices tincidunt arcu non sodales neque sodales. Mollis nunc sed id semper risus in. Convallis tellus id interdum velit laoreet id donec ultrices tincidunt. Ac ut consequat semper viverra nam libero. Hendrerit gravida rutrum quisque non tellus orci. Sit amet nulla facilisi morbi. Pharetra pharetra massa massa ultricies mi quis hendrerit. Ac feugiat sed lectus vestibulum mattis ullamcorper. Id volutpat lacus laoreet non curabitur gravida arcu ac. Fermentum iaculis eu non diam phasellus vestibulum lorem. Arcu felis bibendum ut tristique. Aenean vel elit scelerisque mauris pellentesque pulvinar.\n" +
    "\n" +
    "Sit amet porttitor eget dolor morbi. Nisl vel pretium lectus quam id leo in. Eu ultrices vitae auctor eu augue ut. Quam id leo in vitae turpis massa sed elementum. Auctor elit sed vulputate mi sit amet mauris. Fermentum dui faucibus in ornare quam viverra orci sagittis eu. Enim nulla aliquet porttitor lacus luctus. Commodo ullamcorper a lacus vestibulum sed arcu non odio euismod. Eu facilisis sed odio morbi quis commodo. Imperdiet massa tincidunt nunc pulvinar sapien. Ut ornare lectus sit amet est placerat in egestas.\n" +
    "\n" +
    "Egestas maecenas pharetra convallis posuere morbi leo urna molestie. Risus quis varius quam quisque id diam. Sollicitudin nibh sit amet commodo nulla. Accumsan lacus vel facilisis volutpat est. Nam aliquam sem et tortor. Volutpat consequat mauris nunc congue nisi vitae suscipit tellus mauris. Etiam sit amet nisl purus in mollis. At volutpat diam ut venenatis tellus in metus vulputate eu. Bibendum neque egestas congue quisque egestas diam in arcu cursus. Dignissim convallis aenean et tortor at risus viverra. Enim nulla aliquet porttitor lacus luctus accumsan tortor. Turpis massa sed elementum tempus egestas sed sed risus. Urna nec tincidunt praesent semper feugiat nibh. Dui accumsan sit amet nulla facilisi morbi tempus iaculis. Maecenas volutpat blandit aliquam etiam erat velit scelerisque in. Eget nunc lobortis mattis aliquam faucibus purus in massa tempor. Pharetra magna ac placerat vestibulum.";

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    TTS = new TextToSpeech.TNSTextToSpeech();
    player = new audio.TNSPlayer();

    data = page.navigationContext.data;
    viewModel.set("titolo", data.title);
    viewModel.set("image", data.image);
    console.log(data.audio);

    viewModel.set("text", testo);
    viewModel.set("text_time", "--:--");

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

let time;
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
                viewModel.set("text_time", "00:00");
                timer.clearInterval(time);
            },
            errorCallback: function(errorObject) {
                console.log(JSON.stringify(errorObject));
            },
            infoCallback: function(args) {
                console.log(JSON.stringify(args));
            }
        };

        player.playFromFile(playerOptions)
            .then(function() {
                console.log("In riproduzione");
            })
            .catch(function(err) {
                console.log('something went wrong...', err);
            });

        let duration;
        player.getAudioTrackDuration(playerOptions.audioFile).then(function (data) {
            console.log("Durata: " + data);
            duration = data;
            console.log(duration);
        });

        time = timer.setInterval(() => {
            if(player.isAudioPlaying()){
                let remaining = duration - player.currentTime;
                viewModel.set("text_time", msToTime(remaining));
            }
        }, 1000);
    }
    else {
        let speakOptions = {
            text: viewModel.get("text"),
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

function msToTime(msDurata) {
    let secondi = parseInt((msDurata/1000)%60);
    let minuti = parseInt((msDurata/(1000*60))%60);

    minuti = (minuti < 10) ? "0" + minuti : minuti;
    secondi = (secondi < 10) ? "0" + secondi : secondi;

    return minuti + ":" + secondi;
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

if(device.isAndroid){
    application.android.on(application.AndroidApplication.activityBackPressedEvent, (args) => {
        if (data.audio != "") {
            player.dispose();
            timer.clearInterval(time);
        }
        else{
            TTS.destroy();
        }
    });
}

function backHome(){
    page.frame.navigate("home/home-page");
    if (data.audio != "") {
        player.dispose();
        timer.clearInterval(time);
    }
    else{
        TTS.destroy();
    }
};

exports.backHome = backHome;
exports.play = play;
exports.pause = pause;
exports.resume = resume;
exports.onNavigatingTo = onNavigatingTo;
