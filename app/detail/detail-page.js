const observableModule = require("tns-core-modules/data/observable");
let Observable = require("data/observable");
let ObservableArray = require("data/observable-array").ObservableArray;
const audio = require('nativescript-audio-player');
let TextToSpeech = require('nativescript-texttospeech');
let application = require("tns-core-modules/application");
let fs = require("tns-core-modules/file-system");
let device = require("tns-core-modules/platform");
let timer = require("tns-core-modules/timer");

let viewModel;
let data = new ObservableArray();
let TTS;
let player;
let page;
let playerOptions;
let speakOptions;
let duration;
let time;
let testo = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Accumsan sit amet nulla facilisi morbi tempus. Interdum consectetur libero id faucibus nisl tincidunt eget. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. Tortor at auctor urna nunc. Felis donec et odio pellentesque diam volutpat commodo. Sapien nec sagittis aliquam malesuada bibendum. Tempus iaculis urna id volutpat lacus laoreet non. Luctus accumsan tortor posuere ac ut. Elementum curabitur vitae nunc sed. Vestibulum morbi blandit cursus risus at ultrices mi tempus imperdiet. Pulvinar sapien et ligula ullamcorper malesuada proin libero nunc consequat.\n" +
    "\n" +
    "Arcu bibendum at varius vel pharetra vel turpis nunc eget. Nullam vehicula ipsum a arcu cursus vitae. Cras pulvinar mattis nunc sed blandit libero volutpat. Commodo ullamcorper a lacus vestibulum sed arcu non odio. Laoreet id donec ultrices tincidunt arcu non sodales neque sodales. Mollis nunc sed id semper risus in. Convallis tellus id interdum velit laoreet id donec ultrices tincidunt. Ac ut consequat semper viverra nam libero. Hendrerit gravida rutrum quisque non tellus orci. Sit amet nulla facilisi morbi. Pharetra pharetra massa massa ultricies mi quis hendrerit. Ac feugiat sed lectus vestibulum mattis ullamcorper. Id volutpat lacus laoreet non curabitur gravida arcu ac. Fermentum iaculis eu non diam phasellus vestibulum lorem. Arcu felis bibendum ut tristique. Aenean vel elit scelerisque mauris pellentesque pulvinar.\n" +
    "\n" +
    "Sit amet porttitor eget dolor morbi. Nisl vel pretium lectus quam id leo in. Eu ultrices vitae auctor eu augue ut. Quam id leo in vitae turpis massa sed elementum. Auctor elit sed vulputate mi sit amet mauris. Fermentum dui faucibus in ornare quam viverra orci sagittis eu. Enim nulla aliquet porttitor lacus luctus. Commodo ullamcorper a lacus vestibulum sed arcu non odio euismod. Eu facilisis sed odio morbi quis commodo. Imperdiet massa tincidunt nunc pulvinar sapien. Ut ornare lectus sit amet est placerat in egestas.\n" +
    "\n" +
    "Egestas maecenas pharetra convallis posuere morbi leo urna molestie. Risus quis varius quam quisque id diam. Sollicitudin nibh sit amet commodo nulla. Accumsan lacus vel facilisis volutpat est. Nam aliquam sem et tortor. Volutpat consequat mauris nunc congue nisi vitae suscipit tellus mauris. Etiam sit amet nisl purus in mollis. At volutpat diam ut venenatis tellus in metus vulputate eu. Bibendum neque egestas congue quisque egestas diam in arcu cursus. Dignissim convallis aenean et tortor at risus viverra. Enim nulla aliquet porttitor lacus luctus accumsan tortor. Turpis massa sed elementum tempus egestas sed sed risus. Urna nec tincidunt praesent semper feugiat nibh. Dui accumsan sit amet nulla facilisi morbi tempus iaculis. Maecenas volutpat blandit aliquam etiam erat velit scelerisque in. Eget nunc lobortis mattis aliquam faucibus purus in massa tempor. Pharetra magna ac placerat vestibulum.";
let index;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    TTS = new TextToSpeech.TNSTextToSpeech();
    player = new audio.TNSPlayer();

    if(page.navigationContext.page == "tour" || page.navigationContext.page == "room"){
        viewModel.set("tour_visibility", "visible");
        viewModel.set("no_tour_visibility", "collapsed");

        data = page.navigationContext.all_items.getItem(page.navigationContext.index);
        index = page.navigationContext.index;
    }
    else{
        viewModel.set("tour_visibility", "collapsed");
        viewModel.set("no_tour_visibility", "visible");

        data = page.navigationContext.data;
    }

    set_items(data);

    page.bindingContext = viewModel;
}

function set_items(data){
    viewModel.set("image", data.image);
    viewModel.set("play_image", "~/images/play.png");
    viewModel.set("text", testo);
    viewModel.set("text_time", "--:--");
    viewModel.set("value", "0");
    viewModel.set("min", "0");
    viewModel.set("codice", data.id);

    let folder = fs.knownFolders.currentApp();
    let file = fs.path.join(folder.path, "/assets/zip/file/MuseoNavale/") + "/" + data.audio;
    //console.log(file);

    if(data.audio != "") {
        playerOptions = {
            audioFile: file,
            loop: false,
            completeCallback: function () {
                console.log('finished playing');
                viewModel.set("text_time", "00:00");
                viewModel.set("text_button", "Play");
                viewModel.set("value", "0");
                timer.clearInterval(time);
                if(page.navigationContext.page == "tour" || page.navigationContext.page == "room") {
                    next();
                }
            },
            errorCallback: function (errorObject) {
                console.log(JSON.stringify(errorObject));
            },
            infoCallback: function (args) {
                console.log(JSON.stringify(args));
            }
        };

        player.initFromFile(playerOptions)
            .then(function() {
                console.log("In riproduzione");
            })
            .catch(function(err) {
                console.log('something went wrong...', err);
            });

        player.getAudioTrackDuration(playerOptions.audioFile).then(function (data) {
            console.log("Durata: " + data);
            duration = data;
            viewModel.set("max", duration);
            viewModel.set("duration", msToTime(duration));
            console.log(duration);
        });
    }
    else {
        viewModel.set("duration", "--:--");

        speakOptions = {
            text: viewModel.get("text"),
            speakRate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            finishedCallback: function () {
                console.log("Finito!!");
                if(page.navigationContext.page == "tour" || page.navigationContext.page == "room") {
                    next();
                }
            }
        };
    }

    var images = new ObservableArray();
    images.push({
        "image": data.image,
        "title": data.title
    });
    if(data.other_image != ""){
        let other_image = data.other_image.split(",");
        for(let i=0; i<other_image.length; i++)
        {
            images.push({
                "image" : fs.knownFolders.currentApp().getFolder("/assets/zip/file/MuseoNavale").path + "/" + other_image[i],
                "title": data.title
            });
        }
    }
    viewModel.set('images', images);
}
/*
exports.myChangeEvent = function(args) {
    let changeEventText = 'Page changed to index: ' + args.index;
    console.log(changeEventText);
};

exports.myScrollingEvent = function(args) {
    console.log('Scrolling: ' + args.state.offset);
};*/

function play_audio() {
    if(viewModel.get("play_image") === "~/images/play.png"){
        play();
        viewModel.set("play_image", "~/images/pause.png");
    }
    else if(viewModel.get("play_image") === "~/images/pause.png"){
        pause();
        viewModel.set("play_image", "~/images/resume.png");
    }
    else if(viewModel.get("play_image") === "~/images/resume.png"){
        resume();
        viewModel.set("play_image", "~/images/pause.png");
    }
}

function play(){
    if(data.audio != "") {
        player.play();

        viewModel.set("text_time", msToTime(player.currentTime));

        time = timer.setInterval(() => {
            if(player.isAudioPlaying()){
                //let remaining = duration - player.currentTime;
                viewModel.set("text_time", msToTime(player.currentTime));
                viewModel.set("value", player.currentTime);
            }
        }, 1000);
    }
    else {
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

exports.onSliderLoaded = function (args) {
    const slider = args.object;

    slider.on("valueChange", (args) => {
        if(!player.isAudioPlaying()) {
            console.log(args.value);
            player.seekTo(args.value);
        }
    });
};

function next(){
    if(index == page.navigationContext.all_items.length - 1){
        return;
    }
    else {
        index = index + 1;
        data = page.navigationContext.all_items.getItem(index);
        if (data.audio != "") {
            player.pause();
            timer.clearInterval(time);
        }
        else{
            TTS.pause();
        }
        set_items(data);
    }
}

function back(){
    if(index == 0){
        return;
    }
    else {
        index = index - 1;
        data = page.navigationContext.all_items.getItem(index);
        if (data.audio != "") {
            player.pause();
            timer.clearInterval(time);
        }
        else{
            TTS.pause();
        }
        set_items(data);
    }
}

exports.back = back;
exports.next = next;
exports.play_audio = play_audio;
exports.backHome = backHome;
exports.play = play;
exports.pause = pause;
exports.resume = resume;
exports.onNavigatingTo = onNavigatingTo;