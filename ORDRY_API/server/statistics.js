const Order = require("./models/order"); // get the model
const OrderFood = require("./models/order-food");
const OrderMenu = require("./models/order-menu");
const OrderBeverages = require("./models/order-beverages");
const Food = require("./models/food");
const Menu = require("./models/menu"); // get the model
const Beverage = require("./models/beverage"); // get the model

const pdfWriter = require("./pdf-generator");
const sessionManager = require("./session");
const MailService = require("./mail-service");

module.exports = {
  generateStatistics: async (
    forDay,
    actualTurnover = 0,
    message = "Diese Sitzung wurde abgebrochen. Das Kassapersonal hat keine Angaben bezüglich dem tatsächlichen Kassastand gemacht. Der Ordry-Dienst konnte nicht richtig beendet werden.",
    sessionId
  ) => {
    const currentDay = new Date(forDay.getFullYear(), forDay.getMonth(), forDay.getDate());

    const dayAfterCurrentDay = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate() + 1
    );

    console.log(currentDay, dayAfterCurrentDay);

    try {
      const orderCount = await getOrderCount(currentDay, dayAfterCurrentDay);
      const orderedFood = await getOrderedFoods(currentDay, dayAfterCurrentDay);
      const orderedBeverages = await getOrderedBeverages(currentDay, dayAfterCurrentDay);
      const orderedMenus = await getOrderedMenus(currentDay, dayAfterCurrentDay);

      var turnover = 0; // food IST-Stand
      var foodSales = [];
      var beverageSales = [];
      var menuSales = [];

      await Promise.all(
        orderedFood.map(async of => {
          const currentFood = await getFoodWithId(of.foodId.toString());
          turnover += currentFood.price * of.amount;
          let groupedFood = foodSales.find(f => {
            return f.id.equals(currentFood._id);
          });

          if (groupedFood) {
            // is the current food already in the array?
            groupedFood.amount += of.amount;
          } else {
            foodSales.push({
              id: currentFood._id,
              name: currentFood.name,
              amount: of.amount
            });
          }
        })
      );

      await Promise.all(
        orderedBeverages.map(async ob => {
          const currentBeverage = await getBeverageWithId(ob.beverageId);
          let currentSize = currentBeverage.sizes.find(s => {
            return s._id.equals(ob.sizeId);
          });

          if (currentSize) {
            turnover += ob.amount * currentSize.price;

            let groupedBeverages = beverageSales.find(b => {
              return b.bid.equals(currentBeverage._id) && b.sid.equals(currentSize._id);
            });

            if (groupedBeverages) {
              groupedBeverages.amount += ob.amount;
            } else {
              beverageSales.push({
                bid: currentBeverage._id,
                sid: currentSize._id,
                amount: ob.amount,
                name: currentBeverage.name + " " + currentSize.name
              });
            }
          } else {
            await Promise.reject("Current Size not found!");
          }
        })
      );

      await Promise.all(
        orderedMenus.map(async om => {
          const currentMenu = await getMenuWithId(om.menuId);

          // STEP 1: calculate the turnover
          currentMenu.food.forEach(f => {
            let orderedMenuItem = om.items.find(oi => {
              return oi.itemId.equals(f._id);
            });
            turnover += orderedMenuItem ? f.price : 0;
          });

          // STEP 2: get the ordered items amount per menu

          let groupedMenu = menuSales.find(m => {
            return m.menuId.equals(currentMenu._id);
          });

          if (groupedMenu) {
            om.items.forEach(async oi => {
              let groupedItem = groupedMenu.items.find(i => {
                return i.itemId.equals(oi.itemId);
              });

              if (groupedItem) {
                groupedItem.amount++;
              } else await Promise.reject("Grouped Menu item not found!");
            });
          } else {
            menuSales.push({
              menuId: currentMenu._id,
              menuName: currentMenu.name,
              items: currentMenu.food.map(f => {
                let orderedMenuItem = om.items.find(oi => {
                  return oi.itemId.equals(f._id);
                });
                return { name: f.name, itemId: f._id, amount: orderedMenuItem ? 1 : 0 };
              })
            });
          }
        })
      );
      // console.log("Food sells:", foodSales);
      console.log("Beverage sells:", beverageSales);
      // console.log("Menu sales:", menuSales);
      console.log("Turnover:", turnover);
      console.log("Order Count", orderCount);

      let session = await sessionManager.getSessionWithId(sessionId);

      await pdfWriter.createPDFDocument(
        {
          turnover: turnover,
          actualTurnover: actualTurnover,
          foodSales: foodSales,
          beverageSales: beverageSales,
          menuSales: menuSales,
          orderCount: orderCount,
          message: message,
          date: new Date(session.date)
        },
        sessionId
      );
      console.log("Mail will be sent!");
      await MailService.sendMail(sessionId);
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  },
  generateSoleTurnover: async forDay => {
    const currentDay = new Date(forDay.getFullYear(), forDay.getMonth(), forDay.getDate());

    const dayAfterCurrentDay = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate() + 1
    );

    console.log(currentDay, dayAfterCurrentDay);

    try {
      const orderCount = await getOrderCount(currentDay, dayAfterCurrentDay);
      const orderedFood = await getOrderedFoods(currentDay, dayAfterCurrentDay);
      const orderedBeverages = await getOrderedBeverages(currentDay, dayAfterCurrentDay);
      const orderedMenus = await getOrderedMenus(currentDay, dayAfterCurrentDay);

      var turnover = 0; // food IST-Stand

      await Promise.all(
        orderedFood.map(async of => {
          const currentFood = await getFoodWithId(of.foodId.toString());
          turnover += currentFood.price * of.amount;
        })
      );

      await Promise.all(
        orderedBeverages.map(async ob => {
          const currentBeverage = await getBeverageWithId(ob.beverageId);
          let currentSize = currentBeverage.sizes.find(s => {
            return s._id.equals(ob.sizeId);
          });

          if (currentSize) {
            turnover += ob.amount * currentSize.price;
          } else {
            await Promise.reject("Current Size not found!");
          }
        })
      );

      await Promise.all(
        orderedMenus.map(async om => {
          const currentMenu = await getMenuWithId(om.menuId);

          // calculate the turnover
          currentMenu.food.forEach(f => {
            let orderedMenuItem = om.items.find(oi => {
              return oi.itemId.equals(f._id);
            });
            turnover += orderedMenuItem ? f.price : 0;
          });
        })
      );

      return Promise.resolve(turnover);
    } catch (error) {
      console.error(error);
      return Promise.reject();
    }
  }
};

function getOrderCount(dayStart, dayEnd) {
  return Order.countDocuments({
    timestamp: {
      $gte: dayStart,
      $lt: dayEnd
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

function getOrderedFoods(dayStart, dayEnd) {
  // get the SOLL-Stand
  return OrderFood.find({
    timestamp: {
      $gte: dayStart,
      $lt: dayEnd
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

function getOrderedBeverages(dayStart, dayEnd) {
  return OrderBeverages.find({
    timestamp: {
      $gte: dayStart,
      $lt: dayEnd
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

function getOrderedMenus(dayStart, dayEnd) {
  return OrderMenu.find({
    timestamp: {
      $gte: dayStart,
      $lt: dayEnd
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

function getFoodWithId(id) {
  return Food.findOne({ _id: id })
    .then(doc => {
      if (doc) {
        return Promise.resolve(doc);
      } else {
        return Promise.reject(404);
      }
    })
    .catch(error => {
      console.log("Error: ", error);
      return Promise.reject(500);
    });
}

function getMenuWithId(id) {
  return Menu.findOne({ _id: id })
    .then(doc => {
      if (doc) {
        return Promise.resolve(doc);
      } else {
        return Promise.reject(404);
      }
    })
    .catch(error => {
      console.log("Error: ", error);
      return Promise.reject(500);
    });
}

function getBeverageWithId(id) {
  return Beverage.findOne({ _id: id })
    .then(doc => {
      if (doc) {
        return Promise.resolve(doc);
      } else {
        return Promise.reject(404);
      }
    })
    .catch(error => {
      console.log("Error: ", error);
      return Promise.reject(500);
    });
}
