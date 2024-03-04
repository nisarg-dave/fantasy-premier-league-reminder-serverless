### Fantasy Premier League Reminder Serverless Function

A serverless AWS Lambda function built using Node.js, Puppeteer-Core (this is a library that does not download Chrome when installed), sparticuz/chromium(a Chromium binary for serverless platforms) and the Serverless Framework to remind my friends to make changes to their Fantasy Premier League teams prior to each matchweek's deadline. Puppeteer is used to scrape the date and time of the first game of the matchweek on the Premier League website and then sign into Facebook and remind my friends about the deadline (which is 90 minutes prior to the start time of the first game) by writing a message to a group chat we are all in. This serverless function should run everyday at 3pm AWST and will only send a reminder if the first game of the matchweek is within 24 hours of when this function is run.

![alt text](/public/reminder-message-new.jpg)
