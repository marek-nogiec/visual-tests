var http = require('http');
var fs = require('fs');
var request = require('request');

var bs = require('./helpers/browserstack');
var defaultBrowsers = require('./config-screenshots.json');
var articleUrls = require('./article-urls');

var SCREENSHOT_DIR = 'screenshots';
var activeJobs = [];

var BASE_SCREEN_PREFIX = 'base_';


setInterval(checkForScreenshots, 15000);

articleUrls.map(createWorkerForUrl);

bs.takeScreenshots(addJobToActiveQueue);

function createWorkerForUrl(url) {
  bs.createWorker(url, defaultBrowsers);
}

function addJobToActiveQueue(jobId) {
  console.log('Adding job ' + jobId + ' to queue.');
  if (!~activeJobs.indexOf(jobId)) {
    activeJobs.push(jobId);
  }
}

function checkForScreenshots () {
  if (activeJobs.length) {
    processQueue();
  } else {
    endOnEmptyQueue();
  }
}

function processQueue() {
  console.log('Checking screenshots for: ' + activeJobs.join(','));
  activeJobs.forEach(function (jobId) {
    bs.checkJobStatus(jobId, processCompletedJob)
  })
}

function endOnEmptyQueue() {
  console.log('No active jobs. Exiting...');
  process.exit();
}

function processCompletedJob (jobData) {
  removeJobFromQueue(jobData.id);
  downloadScreenshots(jobData, compareScreenshots)
}

function removeJobFromQueue(jobId){
  activeJobs = activeJobs.filter(function (item) {
    return item !== jobId;
  });
}

function downloadScreenshots (jobData, callback) {
  jobData.screenshots.forEach(function (item) {
    downloadFile(
      item.image_url,
      getScreenshotFileName(item),
      callback
    )
  })
}

function getScreenshotFileName (screenshot) {
  var base =  encodeURIComponent(screenshot.url)
    + '_' + screenshot.image_url.split('/').pop();
  if (fs.existsSync(SCREENSHOT_DIR + '/' + BASE_SCREEN_PREFIX + base)) {
    return SCREENSHOT_DIR + '/' + base;
  }
  return SCREENSHOT_DIR + '/' + BASE_SCREEN_PREFIX + base;
}

function downloadFile (uri, filename, callback){
  var req = request(uri)
    .pipe(fs.createWriteStream(filename));
  req.on('close', callback.bind(this, filename))
}

function compareScreenshots(filename) {
  if(!~filename.indexOf(BASE_SCREEN_PREFIX)){
    console.log('will compare: ' + filename);
  } else {
    console.log('Won\'t compare: ' + filename);
  }
}