
let qs = new URLSearchParams(window.location.search);
let gpg = qs.get('page');
const storage = require('electron-json-storage');
let { ipcRenderer } = require('electron');
const fs = require('fs');

let dataPath = "error";
this.dataPath = dataPath;

const weekEnumArr = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]
this.weekEnumArr = weekEnumArr;

ipcRenderer.send('json_path');
ipcRenderer.on('json_path', (e, args) => {
    console.log('Found path ' + args.path);
    dataPath = args.path;
    this.dataPath = args.path;
});

/**
 * Loads the sidebar for the app.
 */
function loadSidebar() {
    $("#sidebar").load("./sidebar.html");
}
this.loadSidebar = loadSidebar;

/**
 * Loads each page on the app.
 */
function loadPage(pg) {
    switch (pg) {
        case "today":
            $("#content").load('./today.html');
            break;
        case "upcoming":
            $("#content").load('./upcoming.html');
            break;
        case "past":
            $("#content").load('./past.html');
            break;
        case "completed":
            $("#content").load('./completed.html');
            break;
        case "compose":
            $("#content").load('./compose.html');
            break;
        case "settings":
            $("#content").load('./settings.html');
            break;
        default:
            window.location.href = "./index.html?page=today";
    }
    switch (pg) { // Merging the two switches may be possible in the future
        case "today":
        case "upcoming":
        case "past":
        case "completed":
            let dt = new Date();
            let dy = dt.getDay();
            if (!this.weekEnumArr[dy]) {dy = "Error"}; // dy intially represents a number, however if it isn't a day of the week its an error
            dy = this.weekEnumArr[dy]
            let fm = format.day(dy, dt); // Day and dateInstance
            if (pg === "today") {loadPageTitle(fm);}
    
            setTimeout(function() {
                loadPosts(format.date(dt));
            }, 100);
        break;
    }
}
this.loadPage = loadPage;

/**
 * Sets the title for the current page.
 */
function loadPageTitle(pgt) {
    setTimeout(function() {
        document.getElementById('ttl').innerText = pgt;
    }, 1);
}
this.loadPageTitle = loadPageTitle;

/**
 * Loads each post.
 */
function loadPosts(tc) {
    const contentsDiv = document.getElementById("page-jsei");
    try {
        console.log("loadTodayNotes started")
        const notesfile = fs.readFileSync(dataPath+"/posts.fpf");
        console.log(notesfile);
        const notesParsed = JSON.parse(notesfile);
        let notes = notesParsed.table;
        console.log(notes);
        console.log(contentsDiv);
        let notesLength = Object.keys(notes).length;
        console.log(notesLength);
        let postsLoaded = 0;

        notes
            .forEach((thisNote, i) => {
                let thisNoteKeys = Object.keys(thisNote);
                console.log("ThisNoteKeys is "+thisNoteKeys)
                let thisNoteValues = Object.values(thisNote);
                console.log("ThisNoteValues is "+thisNoteValues)
        
                console.log("for loop iteration " + i)
                console.log("date: " + thisNoteValues[0] + " needs to be equal to TC:" + tc + " or endless")

                let upcomingBoolean = false;
                if (gpg === "upcoming") {
                    if (tc === "endless") {
                        upcomingBoolean = true;
                    }
                    else {
                            let mba = new Date(tc);
                            console.log("mba/today ("+mba.getFullYear()+"-"+("0" + (mba.getMonth() + 1)).slice(-2)+"-"+("0" + mba.getDate()).slice(-2)+") must be before or equal to post's date ("+thisNoteValues[0]+") - RESULT: "+(mba <= new Date(thisNoteValues[0])));
                            upcomingBoolean = mba <= new Date(thisNoteValues[0]);
                        }
                    }
                    if (gpg === "upcoming") {
                        if (tc === "endless") {
                            upcomingBoolean = true;
                        }
                        else {
                            let mba = new Date(tc);
                            console.log("mba/today (" + mba.getFullYear() + "-" + ("0" + (mba.getMonth() + 1)).slice(-2) + "-" + ("0" + mba.getDate()).slice(-2) + ") must be before or equal to post's date (" + thisNoteValues[0] + ") - RESULT: " + (mba <= new Date(thisNoteValues[0])));
                            upcomingBoolean = mba <= new Date(thisNoteValues[0]);
                        }
                    }
                    if (gpg === "past" && thisNoteValues[0] !== "endless") {
                        let mba = new Date(tc);
                        console.log("mba/today (" + mba.getFullYear() + "-" + ("0" + (mba.getMonth() + 1)).slice(-2) + "-" + ("0" + mba.getDate()).slice(-2) + ") must be before or equal to post's date (" + thisNoteValues[0] + ") - RESULT: " + (mba <= new Date(thisNoteValues[0])));
                        upcomingBoolean = mba > new Date(thisNoteValues[0]);
                    }
        
                    if ((gpg === "today" && thisNoteValues[4] === "visible") || (gpg === "completed" && thisNoteValues[4] === "completed") || (gpg === "upcoming" && thisNoteValues[4] === "visible") || (gpg === "past" && thisNoteValues[4] === "visible")) {
                        if ((gpg === "completed" || thisNoteValues[0] === tc || thisNoteValues[0] === "endless" || upcomingBoolean) && gpg !== "past" || gpg === "past" && upcomingBoolean) {
                            console.log("found post for today")
                            let unCompleteIcon = "fa-check";
                            let unComplete = "Complete";
                            if (gpg === "completed") { unComplete = "Uncomplete"; unCompleteIcon = "fa-angle-left"; }
            
                            switch (thisNoteValues[1]) {
                                case "todo":
                                    let contentPart = "";
                                    for (let it = 0; it < thisNoteValues[3].length; it++) {
                                        console.log(Object.values(thisNoteValues[3])[it].val);
                                        if (Object.values(thisNoteValues[3])[it].val === true) {
                                            contentPart +=
                                                `<label class="rcontainer" id="todo-${i}-${it}-checkwrap"><fmtc>${Object.values(thisNoteValues[3])[it].label}</fmtc>
                                            <input type="checkbox" id="todo-${i}-${it}-checkbox" onclick="updateCheck(${i},${it})" checked="checked">
                                            <span class="rcheckmark"></span>
                                        </label>`;
                                        } else {
                                            contentPart +=
                                                `<label class="rcontainer" id="todo-${i}-${it}-checkwrap"><fmtc>${Object.values(thisNoteValues[3])[it].label}</fmtc>
                                            <input type="checkbox" id="todo-${i}-${it}-checkbox" onclick="updateCheck(${i},${it})">
                                            <span class="rcheckmark"></span>
                                        </label>`;
                                        }
                                    }
                                    contentsDiv.innerHTML += `
                                <div class="post post-${thisNoteValues[1]}" name="pid-${i}">
                                    <div class="post-ins">
                                        <p class="post-info post-${thisNoteValues[1]}-info">${thisNoteValues[0].replace("endless", "Endless")} | ${thisNoteValues[1].replace('todo', "Todo")}</p>
                                        <p class="post-title post-${thisNoteValues[1]}-title">${thisNoteValues[2]}</p>
                                        <p class="post-content post-${thisNoteValues[1]}-content">${contentPart}</p>
                                    </div>
                                    <div class="post-options">
                                        <button id="post-options-complete" class="post-option fa-solid ${unCompleteIcon}" onclick="option${unComplete}(${i})"></button>
                                        <br><button id="post-options-edit" class="post-option fa-solid fa-pencil" onclick="optionEdit(${i})"></button>
                                        <br><button id="post-options-delete" class="post-option fa-solid fa-trash-can" onclick="optionDelete(${i})"></button>
                                    </div>
                                </div>`;            
                            case "note":
                                contentsDiv.innerHTML += `
                            <div class="post post-${thisNoteValues[1]}" name="pid-${i}">
                                <div class="post-ins">
                                    <p class="post-info post-${thisNoteValues[1]}-info">${thisNoteValues[0].replace("endless", "Endless")} | ${thisNoteValues[1].replace("note", "Note")}</p>
                                    <p class="post-title post-${thisNoteValues[1]}-title">${thisNoteValues[2]}</p>
                                    <p class="post-content post-${thisNoteValues[1]}-content">${thisNoteValues[3]}</p>
                                </div>
                                <div class="post-options">
                                    <button id="post-options-complete" class="post-option fa-solid ${unCompleteIcon}" onclick="option${unComplete}(${i})"></button>
                                    <br><button id="post-options-edit" class="post-option fa-solid fa-pencil" onclick="optionEdit(${i})"></button>
                                    <br><button id="post-options-delete" class="post-option fa-solid fa-trash-can" onclick="optionDelete(${i})"></button>
                                </div>
                            </div>`;
                            
                    }
                    postsLoaded++;
                }
            }

        })
        console.log(postsLoaded);
        if (postsLoaded === 0) { // Might be possible to omit and swap to just check if the array is empty rather than wasting clocks and lines counting then checking
            contentsDiv.innerHTML += `<p class="noposts">Couldn't find any posts</p>`;
        }
    }
    catch (err) {
        contentsDiv.innerHTML += `<p class="noposts">There seems to be an error with your posts file<br><button onclick="location.reload()">Reload</button> <button onclick="fixPostsFile()">Fix (will delete posts)</button></p>`;
        console.log(err);
    }
}
this.loadPosts = loadPosts;

function fixPostsFile(wx) {
    if (!fs.existsSync(dataPath)){
        fs.mkdirSync(dataPath);
    }
    let data2Write = {table: [{"date": "endless","type": "note","title": "Welcome to quickmind...","content": "Thank you for using quickmind!<br>Your princess is in the wrong castle, expect this to get even more confusing.<br>Why are you still reading?","state": "visible"}]};
    if (wx === true) {
        fs.writeFile(dataPath + "/posts.fpf", JSON.stringify(data2Write, null, 2), {flags: 'wx'}, function (err) {
            if (err) throw err;
            console.log("It's saved!");
        });
    } else {
        fs.writeFile(dataPath + "/posts.fpf", JSON.stringify(data2Write, null, 2), function (err) {
            if (err) throw err;
            console.log("It's saved!");
        });
    }
}
this.fixPostsFile = fixPostsFile;

/**
 * Loads the entire app itself.
 */
 function loadApp() { // Originally loadComplete, renamed given its in a way pretty much the app itself.. While yes Electron referred to as a app its more so a desktop layer than even a wrapper. 
    console.log(fs);
    if (!fs.existsSync(dataPath+"/posts.fpf")) {fixPostsFile(true);}
    console.log(dataPath);
    console.log(storage.getDataPath());
    console.log("loadApp got path "+dataPath);
    loadSidebar();
    loadPage(gpg);
    loadTheme();
    setTimeout(loadSettings,1);
}
this.loadApp = loadApp;

/**
 * Self explanitory, but it loads the url onto whatever the user's default brower is.
 */
function openURLInBrowser(url) {
    require('electron').shell.openExternal(url);
}
this.openURLInBrowser = openURLInBrowser;