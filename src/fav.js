const fs = require("fs-extra");
const path = require("path");

class Fav {
  constructor(userId) {
    this.cwd = process.cwd();
    this.userId = userId;
  }

  addFav = (drink) => {
    if (!drink) return false;

    const dataPath = path.resolve(`${this.cwd}/data/${this.userId}.json`);
    fs.ensureFileSync(dataPath);

    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    if (json[drink.idDrink]) return;

    json[drink.idDrink] = drink;

    fs.writeJSONSync(dataPath, json);

    return true;
  };

  readFav = () => {
    const dataPath = path.resolve(`${this.cwd}/data/${this.userId}.json`);
    fs.ensureFileSync(dataPath);

    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    return json;
  };
}

module.exports = Fav;
