// https://stackoverflow.com/questions/45196528/how-to-create-a-pdf-on-node-js-using-pdfmake-and-vfs-fonts
//
const fs = require("fs");
const path = require("path");
const util = require("util");
const sessionManager = require("./session");

module.exports.createPDFDocument = async (data, sessionId) => {
  var fonts = {
    Roboto: {
      normal: "./server/fonts/Roboto-Regular.ttf",
      bold: "./server/fonts/Roboto-Bold.ttf",
      italics: "./server/fonts/Roboto-Italic.ttf",
      bolditalics: "./server/fonts/Roboto-MediumItalic.ttf"
    }
  };

  var PDFPrinter = require("pdfmake");
  var printer = new PDFPrinter(fonts);
  var dateFormat = require("date-format");
  const uuid = require("uuid/v1");
  const interItemSpacing = 30;

  var defaultTableLayouts = {
    defaultLayout: {
      //set custom borders size and color
      hLineWidth: function(i, node) {
        return i === 0 || i === node.table.body.length ? 1 : 1;
      },
      vLineWidth: function(i, node) {
        return i === 0 || i === node.table.widths.length ? 1 : 1;
      },
      hLineColor: function(i, node) {
        return i === 0 || i === node.table.body.length ? "black" : "black";
      },
      vLineColor: function(i, node) {
        return i === 0 || i === node.table.widths.length ? "black" : "black";
      }
    }
  };

  var docDefinition = {
    pageMargins: [40, 60, 40, 40],
    content: [
      {
        columns: [
          {
            text: "Tagesbericht",
            style: "header",
            width: "50%"
          },
          {
            text: dateFormat("dd.MM.yyyy", data.date),
            style: ["rightaligned", "header"],
            width: "50%",
            italics: true
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        table: {
          layout: "defaultLayout",
          headerRows: 0,
          widths: ["75%", "*"],
          body: [
            [
              { text: "Anzahl der Bestellungen", bold: true },
              { text: data.orderCount, style: "rightaligned" }
            ],
            [
              { text: "Kassa IST-Stand", bold: true },
              {
                text: "€ " + formatMoney(data.actualTurnover, 2, ",", "."),
                style: "rightaligned"
              } // € 1.403,10
            ],
            [
              { text: "Kassa SOLL-Stand", bold: true },
              {
                text: "€ " + formatMoney(data.turnover, 2, ",", "."),
                style: "rightaligned"
              }
            ]
          ]
        },
        margin: [0, 0, 0, interItemSpacing]
      },
      {
        table: {
          layout: "defaultLayout",
          headerRows: 1,
          widths: ["100%"],

          body: [
            [{ text: "Nachricht", bold: true }],
            [
              {
                text: data.message,
                style: "leftaligned"
              }
            ]
          ]
        }
      }
    ],
    header: [
      { image: "./server/ordry-logo.png", width: 100, margin: [40, 20, 40, 0] } // margin: [left, top, right, bottom]
    ],
    footer: function(currentPage, pageCount) {
      return {
        columns: [
          {
            text: "Tagesbericht",
            width: "33.3333333%"
          },
          {
            text: "SV Tosters",
            style: ["centeraligned"],
            width: "33.3333333%"
          },
          {
            text: "Seite " + currentPage.toString() + " von " + pageCount.toString(),
            style: ["rightaligned"],
            width: "33.3333333%"
          }
        ],
        margin: [40, 0, 40, 0]
      };
    },
    styles: {
      header: {
        fontSize: 18
      },
      rightaligned: {
        alignment: "right"
      },
      leftaligned: {
        alignment: "left"
      },
      centeraligned: {
        alignment: "center"
      }
    }
  };

  data.menuSales.forEach(ms => {
    let template = {
      table: {
        layout: "defaultLayout",
        headerRows: 1,
        widths: ["75%", "*"],
        body: [[{ text: ms.menuName, bold: true, colSpan: 2 }, {}]]
      },
      margin: [0, interItemSpacing, 0, 0]
    };
    ms.items.forEach(i => {
      template.table.body.push([{ text: i.name }, { text: i.amount, style: "rightaligned" }]);
    });
    docDefinition.content.push(template);
  });

  let foodTemplate = {
    table: {
      layout: "defaultLayout",
      headerRows: 1,
      widths: ["75%", "*"],
      body: [[{ text: "Essen", bold: true, colSpan: 2 }, {}]]
    },
    margin: [0, interItemSpacing, 0, 0]
  };

  data.foodSales.forEach(fs => {
    foodTemplate.table.body.push([{ text: fs.name }, { text: fs.amount, style: "rightaligned" }]);
  });

  docDefinition.content.push(foodTemplate);

  let beverageTemplate = {
    table: {
      layout: "defaultLayout",
      headerRows: 1,
      widths: ["75%", "*"],
      body: [[{ text: "Getränke", bold: true, colSpan: 2 }, {}]]
    },
    margin: [0, interItemSpacing, 0, 0]
  };

  data.beverageSales.forEach(bs => {
    beverageTemplate.table.body.push([
      { text: bs.name },
      { text: bs.amount, style: "rightaligned" }
    ]);
  });

  docDefinition.content.push(beverageTemplate);

  try {
    let pdfName;

    let session = await sessionManager.getSessionWithId(sessionId);

    if (!session.reportId) {
      pdfName = uuid() + ".pdf";
    } else {
      pdfName = session.reportId;
    }

    console.log("PDF Name is:", pdfName);

    var pdfDoc = printer.createPdfKitDocument(docDefinition, { tableLayouts: defaultTableLayouts });
    await pdfDoc.pipe(fs.createWriteStream("./stats-pdfs/" + pdfName));
    console.log("PDF Document has been created");
    //success, write to the database
    await sessionManager.setReportName(sessionId, pdfName);
    console.log("PDF Document name has been set in the reportId field of current session.");
    // delete older reports
    await deleteUselessReports();
    console.log("Useless reports have been deleted!");
    pdfDoc.end();
    return Promise.resolve();
  } catch (error) {
    console.error(error);
    return Promise.reject();
  }
};

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : "")
    );
  } catch (e) {
    console.log(e);
  }
}

async function deleteUselessReports() {
  const dir = path.join(__dirname, "..", "stats-pdfs");
  const readdir = util.promisify(fs.readdir);
  const unlink = util.promisify(fs.unlink);

  const sessionAmountLimit = 30;

  try {
    const sessions = await sessionManager.getAllSessions();
    let sessionsCount = sessions.length;

    const files = await readdir(dir);
    let fileLength = files.length;

    if (fileLength > sessionAmountLimit) {
      const filesSorted = files
        .map(f => {
          return {
            name: f,
            time: fs.statSync(path.join(dir, "/", f)).mtime.getTime()
          };
        })
        .sort(function(a, b) {
          return b.time - a.time;
        });

      while (fileLength > sessionAmountLimit) {
        await unlink(path.join(dir, "/", filesSorted.pop().name));
        fileLength--;
      }
    }

    if (sessionsCount > sessionAmountLimit) {
      while (sessionsCount > sessionAmountLimit) {
        await sessionManager.deleteSessionWithId(sessions.pop()._id);
        sessionsCount--;
      }
    }
    return Promise.resolve();
  } catch (error) {
    console.error(error);
    return Promise.reject("Could not delete files!");
  }
}
