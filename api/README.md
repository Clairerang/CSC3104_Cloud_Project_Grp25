run this > npm install

1. populate database first, this adds users, relationship and task
    node populate.js
2. run the server
    npm start or node app.js

3. routes besides login/register are protected, need to put the JWT from login into the authorization header.


CHANGELOG 11/11
updates to existing routes
auth
1. /register
    validation added
2. /login
    uses email now
senior
1. /checkin 
    added mood and session

*Added routes
senior
1. /total-points
    calculates total points of the account
2. /remove-relation
    senior can remove relation
3. /relations/:userId
    get all the relations for a senior
admin
1. /admin/users
    lists all users
2. /admin/stats/today
    lists total seniors, active seniors, check-ins, and % change from last week
3. /admin/stats/weekly-engagement
    returns the active users and checkins per day for the past 7 days
4. /admin/stats/usercount
    returns total user count for each role


!
might need to drop engagements collection and or checkin might not work properly