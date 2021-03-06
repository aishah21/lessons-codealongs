var db = require('../db/config');
var event = {};

// event queries

event.getAll = function(req, res, next){
  db.manyOrNone("SELECT * FROM events;")
    .then(function(result){
      console.log('fetched all events');
      res.locals.events = result;
      next();
    })
    .catch(function(error){
      console.log(error);
      next();
    })
};

event.find = function(req, res, next){
  db.oneOrNone("SELECT * FROM events WHERE id = $1;", [req.params.id])
    .then(function(result){
      res.locals.event = result;
      next();
    })
    .catch(function(error){
      console.log(error);
      next();
    })
}

// check whether or not the logged in user is registered to event
event.findByUser = function(req, res, next){
  db.manyOrNone("SELECT * FROM user_events WHERE user_id = $1 AND event_id=$2;", [req.session.user.id, req.params.id])
    .then(function(result){
      if (result.length > 0) {
        res.locals.userAttendance = true;
      } else {
        res.locals.userAttendance = false;
      }
      next();
    })
    .catch(function(error){
      console.log(error);
      next();
    })
}

// add the logged in user to the event
event.addUserToEvent = function(req, res, next){
  db.one("INSERT INTO user_events (user_id, event_id) VALUES ($1, $2) RETURNING event_id;" , [req.session.user.id, req.params.id])
    .then(function(result){
      res.locals.event_id = result.event_id;
      next();
    })
    .catch(function(error){
      console.log(error);
      next();
    })
}

// removes the user from the current event
event.removeUserFromEvent = function(req, res, next){
  db.one("DELETE FROM user_events WHERE user_id=$1 AND event_id=$2 RETURNING event_id;", [req.session.user.id, req.params.id])
    .then(function(result){
      res.locals.event_id = result.event_id;
      next();
    })
    .catch(function(error){
      console.log(error);
      next();
    })
}

module.exports = event;