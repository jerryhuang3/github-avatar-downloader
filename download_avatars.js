// Import modules
const env = require('dotenv').config();
var request = require('request');
var fs = require('fs');

// Command line arguments for repository to stream from
var cmdInput = process.argv.slice(2);
var repoOwner = cmdInput[0];
var repoName = cmdInput[1];


// dotenv error handling
if (env.error || process.env.GITHUB_TOKEN === undefined) {
    console.log("Error! Check to see if your .env file exists.");
    console.log("If so, check your token credentials.\n" );
    throw env.error;
};

// Require two command line arguments to start function
if (cmdInput.length === 2 && repoOwner !== undefined && repoName !== undefined) {
} else {
    console.log("Process terminated. A valid repo owner and name are required")
    console.log("Any additional inputs are not valid.");
    return;
};

//////////////* START GITHUB AVATAR DOWNLOADING *//////////////

console.log('Welcome to the GitHub Avatar Downloader! \n');

function getRepoContributors(repoOwner, repoName, cb) {
    var options = {
        url: 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors',
        headers: {
            'User-Agent': 'request',
            'Authorization': 'token ' + process.env.GITHUB_TOKEN,
        }
    };
    // Check for errors and status code during request
    request(options, function(err, res, body) {
        if (err) {
            throw err;
        };
        if (res.statusCode !== 200) {
            console.log('Status: ' + res.statusCode + '. Connection problem! Please check your token or repos!');
        }
        // Parse through text stream and store in data object
        var data = JSON.parse(body);
        cb(err, data);
        });
}

function downloadImageByURL(url, filePath) {
        
    request.get(url)
        .on('error', function (err) {
            console.log("Error! Invalid URL!");
            throw err;
        })
        .on('response', function (response) {
            console.log('Downloading image');
            console.log('Response Code: ', response.statusCode, response.headers['content-type']);
        })
        // Write images to avatar folder
        .pipe(fs.createWriteStream('./avatar/' + filePath + '.jpg'))
        .on('finish', function (){
            console.log('Download complete.');
        });
}

getRepoContributors(repoOwner, repoName, function (err, result) {
    // Create a directory called avatar if one does not exist.
    var directory = './avatar';
    if (!fs.existsSync(directory)){
        console.log("Avatar directory not found... Creating directory...")
        fs.mkdirSync(directory);
    }
    // Iterating parsed data and image download function; saving all avatar_url and login names
    for (var i = 0; i < result.length; i++) {
        var url = result[i].avatar_url;
        var name = result[i].login;
        downloadImageByURL(url, name);
    };
});
