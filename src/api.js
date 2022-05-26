const axios = require("axios").default;

const map = new Map();

class Api {
  getCocktailsByFirstLetter = async (letter) => {
    if (!letter)
      return [];

    const url = `http://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`;
    if (map[url]) return map[url];

    const r = await axios.get(url);

    map[url] = r.data.drinks;

    return r.data.drinks;
  };

  getRandomCocktail = async () => {
    const url = `http://www.thecocktaildb.com/api/json/v1/1/random.php`;
    const r = await axios({
      url,
      method: "GET"
    });

    return r.data.drinks[0];
  };
}

const api = new Api();

module.exports = api;
