/*
  Content_Scraper gets the title, price, picture url, and
  main url of 8 different shirts from shirts4mike.com and
  appends the info to a csv file named with today's date
*/

const fs = require('fs');
const Crawler = require("crawler");

// Only part of the csv module in needed for this
const stringify = require('csv-stringify');

const date = new Date();
const time = getTime();
const url = 'http://shirts4mike.com/shirts.php';
let shirts = [];

// Gets the current time
function getTime() {
  const timeList = [date.getHours(), date.getMinutes(), date.getSeconds()];

  for (let i = 0; i < timeList.length; i++) {

    // Puts a 0 in front of a single digit number
    if (parseInt(timeList[i]) < 10) {
      timeList[i] = `0${timeList[i]}`;
    }
  }
  const time = timeList.join(':');
  return time;
}

// Logs the error to scraper-error.log and creates the file if necessary
function logError(error) {
  const errorMessage = `${date.toString()} : ${error}\n\n`;

  fs.appendFile('./scraper-error.log', errorMessage, error => {
    if (error) {

      // Logs an error to the console if it couldn't be logged to the file
      console.log('\nFailed to log error.');
    }
  });
}

// Organizes the list of shirts by the shirt id
function organize(randomList) {
  organizedList = [];
  randomList.forEach(item => {

    // Gets the last digit of the shirt's url (it's id), turns
    // it into a number, subtracts 1 (so it starts at 0), then
    // puts the item in that location in the organized list
    organizedList[parseInt(item[item.length - 2].slice(-1)) - 1] = item;
  });
  return organizedList;
}

// Goes through shirts4mike.com to get the 8 shirt links
const crawl = new Crawler({
  maxConnections: 10,
  callback: function (error, res, done) {
    if (error) {
      logError('404 - failed to connect to http://shirts4mike.com.');
    } else {
      // Finds the shirt links and uses the finder
      // (the other crawler below) on them
      const links = res.$(".products a");
      links.each((i, element) => {
        const shirtUrl = url.replace('shirts.php', element.attribs.href);
        finder.queue(shirtUrl);
      });
    }
    done();
  }
});

// Finds the necessary information on the
// websites and creates the csv with them
const finder = new Crawler({
  maxConnections: 10,
  callback: function (error, res, done) {
    if (error) {
      logError('404 - failed to connect to http://shirts4mike.com.');
    } else {
      const imgUrl = res.$('.shirt-picture img').attr('src');
      const titles = ['Title', 'Price', 'Image Url', 'Url', 'Time'];

      // Creates a list of the shirt website's info,
      // and puts it in the "shirts" list
      const shirtInfo = [
        res.$('title').text(),
        res.$('.price').text(),
        url.replace('shirts.php', imgUrl),
        res.options.uri,
        time
      ];
      shirts.push(shirtInfo);

      if (shirts.length === 8) {

        // The list needs to be organized first, since
        // node's asynchronous nature randomizes it
        createCsv(organize(shirts), titles);
      }
    }
    done();
  }
});

// Creates the "data" folder and the csv file
function createCsv(shirts, titles) {

  // The options put titles above everything else
  stringify(shirts, {columns: titles, header: true}, (error, output) => {
    if (error) {

      // Most of the error messages are the same, since
      // I don't know what the exact problem would be
      logError(`There was an error (${error.code}). Please try again later.`);
    } else {
      fs.readdir('./data', (error, files) => {

        // Creates the "data" folder if it doesn't exist
        if (error) {
          fs.mkdir('./data', () => {});
        }

        // Gets the date in year - month - day format
        const ymd = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        // Creates the csv file if it doesn't exist
        if (files === undefined || files.length === 0) {
          fs.appendFile(`./data/${ymd}.csv`, output, error => {
            if (error) {
              logError(`There was an error (${error.code}). Please try again later.`);
            }
          });

        // Replaces the file contents, then renames the file to the current date
        } else {
          fs.writeFile(`./data/${files[0]}`, output,  error => {
            if (error) {
              logError(`There was an error (${error.code}). Please try again later.`);
            }
          });
          fs.rename(`./data/${files[0]}`, `./data/${ymd}.csv`, error => {
            if (error) {
              logError(`There was an error (${error.code}). Please try again later.`);
            }
          });
        }
      });
    }
  });
}

// Starts the search through the main url
crawl.queue(url);
