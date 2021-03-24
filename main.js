const axios = require('axios');
const puppeteer = require('puppeteer');

main = async () => {
  const DISCORD_HOOK = 'https://discord.com/api/webhooks/823581275982004275/h3lV7oUeUSPyfD27oJcbYK2cEeg_tX1Uk0eyqRuZ49DSyyEZGL5J9PHS6OPwdeC6bVlJ';
  const TIME_TO_HERD_URL = 'https://timetoherd.com'
  const COUNTRIES = ['Canada', 'France'];
  const remainingDaysPerCountry = {};



  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(TIME_TO_HERD_URL);
  await page.screenshot({path: './screen.png'});

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
    message += "Remaining "+days+"days before herd immunity in "+country+"\n";
  }


  const payload = {
    "content": message,
    "attachments": [{ 
      "fallback": "Oupsie !", 
      "image_url": "https://timetoherd.com/covid-19.jpg"
    }]
  }

  console.log(payload)
  axios.post(DISCORD_HOOK, payload);
}


main()