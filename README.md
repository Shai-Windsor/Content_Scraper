# Content_Scraper

Content_Scraper gets the title, price, picture URL, and main URL of 8 different shirts from shirts4mike.com and appends the info to a csv file named with today's date.

When the content scraper can't connect to the website, the crawler module automatically logs the error to the console and retries three times. The error only gets logged to a different file after that.

Note: one of the modules used by the crawler (lodash) is recognized as a vulnerability and I couldn't find a way to fix it, since updating it didn't work.
