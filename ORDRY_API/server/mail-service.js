const nodemailer = require("nodemailer");
const path = require("path");
const SessionManager = require("./session");
const Email = require("./models/email"); // get the model

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "ordry.service@gmail.com",
    pass: "ordry-sy-F5p"
  }
});

module.exports = {
  verifyConnection: () => {
    transporter.verify(function(error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
  },
  sendMail: async sessionId => {
    try {
      const session = await SessionManager.getSessionWithId(sessionId);
      let filePath = path.join(__dirname, "..", "stats-pdfs", session.reportId);

      const emailList = await getMailList();

      await transporter.sendMail({
        from: "ordry.service@gmail.com",
        to: emailList,
        subject: "Tagesbericht Ordry Service - Skihütte Tosters",
        text:
          "Hallo. Im Anhang befindet sich der Tagesbericht des Ordry-Services. Bitte antworten Sie nicht auf diese E-Mail.",
        attachments: [
          {
            filename: "Tagesbericht.pdf",
            path: filePath,
            contentType: "application/pdf"
          }
        ]
      });
      console.log("Email has been sent successfully");
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  }
};

function getMailList() {
  return Email.find({})
    .then(docs => {
      console.log(docs);

      let resultList = docs.map(d => {
        return d.email;
      });

      return Promise.resolve(resultList.join(","));
    })
    .catch(error => {
      console.log("Error: ", error);
      return Promise.reject(500);
    });
}
