const axios = require('axios');
const puppeteer = require('puppeteer');

main = async () => {
  const DISCORD_HOOK = 'DISCORD_HOOK';
  const TIME_TO_HERD_URL = 'https://timetoherd.com'
  const COUNTRIES = ['Canada', 'France'];
  const remainingDaysPerCountry = {};


  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(TIME_TO_HERD_URL);

  const rows = await page.$$('tr.ant-table-row.ant-table-row-level-0');
  for(let i = 0; i<rows.length; i++) {
    try {
      const currentCountryName = await rows[i].$eval('td', el => el.innerText);
      if(COUNTRIES.includes(currentCountryName)){
        const currentCountryDays = await rows[i].$eval('td:nth-child(2)', el => el.innerText);
        remainingDaysPerCountry[currentCountryName] = currentCountryDays;
      }
    } catch (err) {
      console.error(err);
    }
  }
  await browser.close();

  let message = '';
  for(const [country, days] of Object.entries(remainingDaysPerCountry)){
    message += "Remaining "+days+" days before herd immunity is reached in "+country+"\n";
  }


  const payload = {
    "content": message,
    "attachments": [{ 
      "fallback": "Oupsie !", 
      "image_url": "https://timetoherd.com/covid-19.jpg"
    }]
  }

  axios.post(DISCORD_HOOK, payload);
}


main()