// Import modules
var request = require('request');
var fs = require('fs');
var token = require('./secrets.js');

// Command line arguments for repository to stream from
var repoOwner = process.argv[2];
var repoName = process.argv[3];

console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
    var options = {
        url: 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors',
        headers: {
            'User-Agent': 'request',
            'Authorization': token.GITHUB_TOKEN,
        }
    };
    // Check for errors and status code during request
    request(options, function(err, res, body) {
        if (err) {
            throw err;
        };
        if (res.statusCode !== 200) {
            console.log('Status: ' + res.statusCode + '. Connection problem! Please check your inputs!');
        }
        // Parse through text stream and store in data object
        var data = JSON.parse(body);
        cb(err, data);
        });
}

function downloadImageByURL(url, filePath) {
        
    request.get(url)
        .on('error', function (err) {
            throw err;
        })
        .on('response', function (response) {
            console.log('Downloading image');
            console.log('Response Code: ', response.statusCode, response.headers['content-type']);
        })
        // Write images to avatar folder
        .pipe(fs.createWriteStream('./avatar/' + filePath + '.jpg'))
        .on('finish', function () {
            console.log('Download complete.');
        });
}

// Require both command line arguments to start function
if (repoOwner !== undefined && repoName !== undefined) {
    getRepoContributors(repoOwner, repoName, function (err, result) {
        console.log("Errors:", err);
        
        // Iterating parsed data and image download function; saving all avatar_url and login names
        for (var i = 0; i < result.length; i++) {
            var url = result[i].avatar_url;
            var name = result[i].login;
            downloadImageByURL(url, name);
        };
    });
} else {
    console.log("Process terminated. Please provide both a valid repository owner and name.");
    return;
};