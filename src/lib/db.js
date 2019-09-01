//setting up the database(s)
'use strict';
module.exports = function utility(requires) {
  const bot = requires.bot;
  const info = requires.info;
  const config = info.config;

  const Datastore = require('nedb');
  const db = {};
  /**
   * DB setup for roles
   */
  db.roles = new Datastore('./src/lib/databases/roles.db');
  db.roles.loadDatabase();
  //set autocompaction to compact every 10 minutes
  db.roles.persistence.setAutocompactionInterval(600000);
  /**
   * DB functions for roles
   */
  bot.on('guildRoleDelete', (roleData) => {
    db.removeRoleByID(roleData.role_id);
  });
  //Removes the role, searches by roleID
  db.removeRoleByID = (roleID) => {
    return new Promise((resolve, reject) => {
      db.roles.remove({_id: roleID}, {}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
        resolve(numRemoved);
      }); 
    });
  };
  //Removes the role, searches by name in DB. Name referring to the autoRole name, not role name.
  db.removeRoleByName = (name) => {
    return new Promise((resolve, reject) => {
      db.roles.remove({name: name}, {}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
        resolve(numRemoved);
      }); 
    });
  };
  db.addRole = (roleID, nameTag) => {
    return new Promise((resolve, reject) => {
      db.roles.insert({_id: roleID, name: nameTag}, (err, doc) => {
        if(err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  }
  db.searchRoleByID = (roleID) => {
    return new Promise((resolve, reject) => {
      db.roles.findOne({_id: roleID}, (err, role) => {
        if(err) {
          reject(err);
        }
        resolve(role); 
      });
    });
  }
  db.listRoles = () => {
    return new Promise((resolve, reject) => {
      db.roles.find({}, (err, docs) => {
        if(err) {
          reject(err);
        }
        resolve(docs.map(roleEntry => roleEntry.name));
      });
    });
  }
  /**
   * DB setup for permissions
   */
  db.permissions = new Datastore('./src/lib/databases/permissions.db');
  db.permissions.loadDatabase();
  // autocompaction every 10 minutes
  db.permissions.persistence.setAutocompactionInterval(600000);
  /**
   * DB functions for permissions
   */
  // Type is the type of ID, either role or user ID, permLevel is either 
  db.addPerm = (permLevel) => {
    return new Promise((resolve, reject) => {
      db.permissions.insert({_id: permLevel, users: [], roles: []}, (err, doc) => {
        if(err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  }
  db.removePerm = (permLevel) => {
    return new Promise((resolve, reject) => {
      db.permissions.remove({_id: permLevel}, {}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
        resolve(numRemoved);
      });
    });
  }
  db.addPermUser = (permLevel, userID) => {
    return new Promise((resolve, reject) => {
      db.permissions.update({_id: permLevel}, {$push: {users: userID}}, {}, (err, numChanged) => {
        if (err) {
          reject(err);
        }
        resolve(numChanged);
      });
    });
  }
  db.removePermUser = (permLevel, userID) => {
    return new Promise((resolve, reject) => {
      db.permissions.update({_id: permLevel}, {$pull: {users: userID}}, {}, (err, numChanged) => {
        if (err) {
          reject(err);
        }
        resolve(numChanged);
      });
    });
  }
  db.addPermRole = (permLevel, roleID) => {
    return new Promise((resolve, reject) => {
      db.permissions.update({_id: permLevel}, {$push: {roles: roleID}}, {}, (err, numChanged) => {
        if (err) {
          reject(err);
        }
        resolve(numChanged);
      });
    });
  }
  db.removePermRole = (permLevel, roleID) => {
    return new Promise((resolve, reject) => {
      db.permissions.update({_id: permLevel}, {$pull: {roles: roleID}}, {}, (err, numChanged) => {
        if (err) {
          reject(err);
        }
        resolve(numChanged);
      });
    });
  }
  db.findPerm = (userID, roleIDs) => {
    return new Promise((resolve, reject) => {
      db.permissions.findOne({$or: [{roles: {$in: roleIDs}}, {users: userID}]}, (err, docs) => {
        if (err) {
          reject(err);
        }
        resolve(docs);
      })
    })
  }
  /**
   * DB setup for tags
   */
  db.tags = new Datastore('./src/lib/databases/tags.db');
  db.tags.loadDatabase();
  //autocompaction every 10 minutes
  db.tags.persistence.setAutocompactionInterval(600000);
  /**
   * DB functions for roles
   */
  db.addTag = (tagName, content) => {
    return new Promise((resolve, reject) => {
      db.tags.insert({_id: tagName, content: content}, (err, doc) => {
        if(err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  }
  db.removeTag = (tagName) => {
    return new Promise((resolve, reject) => {
      db.tags.remove({_id: tagName}, {}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
        resolve(numRemoved);
      });
    });
  }
  db.searchTag = (tagName) => {
    return new Promise((resolve, reject) => {
      db.tags.findOne({_id: tagName}, (err, doc) => {
        if(err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  }
  db.listTags = () => {
    return new Promise((resolve, reject) => {
      db.tags.find({}, (err, docs) => {
        if(err) {
          reject(err);
        }
        resolve(docs.map(tagEntry => tagEntry._id));
      });
    });
  }
  /**
   * DB setup for timers
   */
  db.timers = new Datastore('./src/lib/databases/timers.db');
  db.timers.loadDatabase();
  //autocompaction every 10 minutes
  db.timers.persistence.setAutocompactionInterval(600000);
  db.addTimer = (userID, type, timeEnd) => {
    return new Promise((resolve, reject) => {
      db.timers.insert({userID, type, timeEnd}, (err, doc) => {
        if(err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  }
  db.removeTimer = (id) => {
    return new Promise((resolve, reject) => {
      db.timers.remove({_id: id}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
        resolve(numRemoved);
      });
    });
  }
  db.removePassed = (date) => {
    return new Promise((resolve, reject) => {
      db.timers.remove({timeEnd: {$lt: date}}, {multi: true}, (err, docsChanged) => {
        if(err) {
          reject(err);
        }
        resolve(docsChanged);
      })
    })
  }
  db.findPassed = (date) => {
    return new Promise((resolve, reject) => {
      db.timers.find({timeEnd: {$lt: date}}, (err, docs) => {
        if(err) {
          reject(err);
        }
        resolve(docs);
      });
    });
  }
  db.getUserTimer = (userID) => {
    return new Promise((resolve, reject) => {
      db.timers.find({ userID }, (err, docs) => {
        if(err) {
          reject(err);
        }
        resolve(docs);
      })
    })
  }
  /**
   * DB setup for infractions
   */
  db.infractions = new Datastore('./src/lib/databases/infractions.db');
  db.infractions.loadDatabase();
  //autocompaction every 10 minutes
  db.infractions.persistence.setAutocompactionInterval(600000);
  db.addInfraction = (userID, type, time, reason = '') => {
    return new Promise((resolve, reject) => {
      db.getInfractions(userID).then(doc => {
        if(doc === null) {
          db.infractions.insert({_id: userID, infractions: [{type, time, reason}]}, (err, doc) => {
            if(err) {
              reject(err);
            }
            resolve(doc);
          });
        } else {
          db.infractions.update({_id: userID}, {$push: {infractions: {type, time, reason}}}, {}, (err, numUpdated) => {
            if(err) {
              reject(err);
            }
            resolve(numUpdated);
          });
        }
      });
    });
  }
  db.getInfractions = (userID) => {
    return new Promise((resolve, reject) => {
      db.infractions.findOne({_id: userID}, (err, doc) => {
        if(err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  }
  /**
   * DB setup for infractions
   */
  db.settings = new Datastore('./src/lib/databases/settings.db');
  db.settings.loadDatabase();
  //autocompaction every 10 minutes: _id is the setting key
  db.settings.persistence.setAutocompactionInterval(600000);
  db.addSetting = (setting, value) => {
    return new Promise((resolve, reject) => {
      db.settings.insert({_id: setting, value}, (err, doc) => {
        if(err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  }
  db.removeSetting = (setting) => {
    return new Promise((resolve, reject) => {
      db.settings.remove({_id: setting}, {}, (err, numRemoved) => {
        if(err) {
          reject(err);
        }
        resolve(numRemoved);
      });
    });
  }
  db.getSettings = () => {
    return new Promise((resolve, reject) => {
      db.settings.find({}, (err, docs) => {
        if(err) {
          reject(err);
        }
        resolve(docs);
      })
    })
  }
  return db;
};
