const Session = require("./models/session");

const tomorrow = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate() + 1
);

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

let currentSession;

module.exports = {
  getCurrentSession: () => {
    return currentSession;
  },
  getSessionWithId: async sessionId => {
    try {
      const session = await getSessionWithId(sessionId);
      return Promise.resolve(session);
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  },
  getAllSessions: async () => {
    try {
      const sessions = await getAllSessions();
      return Promise.resolve(sessions);
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  },
  setupEmptySession: async () => {
    try {
      const session = await getSessionOfToday();

      if (!session) {
        console.log("Session is created!");
        await createNewSession();
        currentSession = await getSessionOfToday();
      } else currentSession = session;
    } catch (error) {
      console.error(error);
    }
  },
  isServiceActive: () => {
    try {
      if (currentSession && currentSession.active === true) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    } catch (error) {
      console.error(error);
      return Promise.resolve(false);
    }
  },
  setReportName: async (sessionId, reportName) => {
    try {
      await updateSessionReport(sessionId, reportName);

      if (currentSession && sessionId == currentSession._id) {
        currentSession.reportId = reportName;
      }
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  },
  setActiveStatus: async (sessionId, status) => {
    try {
      await updateSessionActiveStatus(sessionId, status);
      if (currentSession && sessionId == currentSession._id) {
        currentSession.active = status;
      }
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  },
  getAbortedSessions: async () => {
    try {
      const sessions = await getAbortedSessions();
      return Promise.resolve(sessions);
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  },
  deleteSessionWithId: async id => {
    try {
      await deleteSessionWithId(id);
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  }
};

function createNewSession() {
  const newSession = Session({ reportId: null });
  return newSession
    .save()
    .then(() => {
      console.log("Successfully created new session!");
      return Promise.resolve();
    })
    .catch(error => {
      console.error("Error creating new session:", error);
      return Promise.reject();
    });
}

function updateSessionActiveStatus(sessionId, activeStatus) {
  return Session.updateOne({ _id: sessionId }, { active: activeStatus })
    .then(result => {
      console.log(result);
      if (result.n > 0) return Promise.resolve(200);
      else return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

function updateSessionReport(sessionId, reportName) {
  return Session.updateOne({ _id: sessionId }, { reportId: reportName })
    .then(result => {
      console.log(result);
      if (result.n > 0) return Promise.resolve(200);
      else return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

function getSessionOfToday() {
  return Session.findOne({
    date: {
      $gte: today,
      $lt: tomorrow
    }
  })
    .then(response => {
      return Promise.resolve(response);
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(error);
    });
}

function getSessionWithId(sessionId) {
  return Session.findById(sessionId)
    .then(response => {
      return Promise.resolve(response);
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(error);
    });
}

function getAllSessions() {
  return Session.find({})
    .sort({ date: -1 })
    .then(result => {
      return Promise.resolve(result);
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(error);
    });
}

function getAbortedSessions() {
  return Session.find({
    $or: [{ active: true }, { reportId: null }],
    date: {
      $lt: today
    }
  })
    .then(result => {
      return Promise.resolve(result);
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(error);
    });
}

function deleteSessionWithId(id) {
  return Session.deleteOne({ _id: id })
    .then(result => {
      if (result.n > 0) return Promise.resolve();
      else return Promise.reject("Couldn't find any session to delete!");
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}
