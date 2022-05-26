require("dotenv").config();
const { Telegraf } = require("telegraf");
const {
  MenuTemplate,
  MenuMiddleware,
  createBackMainMenuButtons,
} = require("telegraf-inline-menu");

const api = require("./api");
const Fav = require("./fav");

const menu = new MenuTemplate(
  () => "🍹 Привет! Это основное меню нашего заведения! 🍹"
);

let mainMenuToggle = false;

// Раздел случайных коктейлей по алфавиту A-F
// --------------------------
const drinksAlphabet = {
  A: {},
  B: {},
  C: {},
  D: {},
  E: {},
  F: {},
  G: {},
  H: {},
  I: {},
  J: {},
  K: {},
  L: {},
  M: {},
  N: {},
  O: {},
  P: {},
  Q: {},
  R: {},
  S: {},
  T: {},
  U: {},
  V: {},
  W: {},
  X: {},
  W: {},
  Y: {},
  Z: {},
};

const drinkByLetterMenu = new MenuTemplate(async (ctx) => {
  const raw = ctx.match[0].split("/");
  const letter = raw[raw.length - 2];

  const drinks = await api.getCocktailsByFirstLetter(letter);

  let result = "Список напитков: \n\n";
  for (let i of drinks) {
    result += `*- ${i.strDrink}*\n`;
  }

  return {
    text: result,
    parse_mode: "Markdown",
  };
});

drinkByLetterMenu.manualRow(
  createBackMainMenuButtons("🔼 Предыдущее меню", "⏫ Основное меню")
);

const drinkMenuSelectSubmenu = new MenuTemplate("🍸 Выберите из списка 🍸");

drinkMenuSelectSubmenu.chooseIntoSubmenu(
  `alphabeticLetter`,
  Object.keys(drinksAlphabet),
  drinkByLetterMenu
);

drinkMenuSelectSubmenu.manualRow(
  createBackMainMenuButtons("🔼 Предыдущее меню", "⏫ Основное меню")
);

const drinkMenu = new MenuTemplate("🍸 Продолжайте выбор 🍸");
let idx = 0;
for (let key in drinksAlphabet) {
  drinkMenu.submenu(`${key} ▶`, `${key}`, drinkByLetterMenu, {
    joinLastRow: idx % 5 === 0 ? false : true,
  });
  idx++;
}
drinkMenu.manualRow(
  createBackMainMenuButtons("🔼 Предыдущее меню", "⏫ Основное меню")
);
menu.submenu("Меню коктейлей по алфавиту ▶", "drink-A-Z", drinkMenu, {
  hide: () => mainMenuToggle,
});
// --------------------------
// Раздел случайных коктейлей по алфавиту A-F

// Раздел случайных коктейлей
// --------------------------
let userRandomDrink = null;
const prepareRandomDrink = async () => {
  const drink = await api.getRandomCocktail();
  userRandomDrink = drink;

  let strIngredients = "";

  for (let key in drink) {
    if (/strIngredient/.test(key) && !!drink[key])
      strIngredients += `*- ${drink[key]}*\n`;
  }

  return {
    type: "photo",
    media: drink.strDrinkThumb,
    text: `🥂 Ваш случайный коктейль готов! 🥂\n\nНазвание: *"${drink.strDrink}"*\n\nСостав:\n${strIngredients}`,
    parse_mode: "Markdown",
  };
};

const drinkRandom = new MenuTemplate(prepareRandomDrink);

drinkRandom.interact("⭐ В избранное! ⭐", "fav", {
  do: async (ctx) => {
    const fav = new Fav(ctx.from.id);
    const result = fav.addFav(userRandomDrink);

    await ctx.answerCbQuery(
      result
        ? "⭐ Коктейль добавлен в избранное! ⭐"
        : "⭐ Добавить в избранное не удалось, еще раз сначала! ⭐"
    );
    return false;
  },
});

drinkRandom.manualRow(
  createBackMainMenuButtons("🔼 Предыдущее меню", "⏫ Основное меню")
);

menu.submenu("Случайный коктейль 🥂", "randomDrinkButton", drinkRandom, {
  hide: () => mainMenuToggle,
});
// --------------------------
// Раздел случайных коктейлей

// Раздел чтения из избранного
// --------------------------
const prepareFavDrink = async (ctx) => {
  const fav = new Fav(ctx.from.id);
  const json = fav.readFav();

  let list = "*Список избранного:*\n\n";
  for (let key in json) {
    list += `*- ${json[key].strDrink}*\n`;
  }

  return {
    text: list,
    parse_mode: "Markdown",
  };
};

const drinkFavView = new MenuTemplate(prepareFavDrink);

drinkFavView.manualRow(
  createBackMainMenuButtons("🔼 Предыдущее меню", "⏫ Основное меню")
);

menu.submenu("Просмотр избранного! ⭐", "randomViewButton", drinkFavView, {
  hide: () => mainMenuToggle,
});
// --------------------------
// Раздел чтения из избранного

const menuMiddleware = new MenuMiddleware("/", menu);
console.log(menuMiddleware.tree());

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", async (ctx) => menuMiddleware.replyToContext(ctx));

bot.on("text", (ctx) => {
  ctx.reply(`Привет! Используй команду /start чтобы увидеть меню!`);
});

bot.use(menuMiddleware.middleware());

bot.catch((error) => {
  console.log("bot error", error);
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
