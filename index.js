const { Cluster } = require('puppeteer-cluster')

const urls = [
  "https://statusinvest.com.br/fundos-imobiliarios/vslh11",
  "https://statusinvest.com.br/fundos-imobiliarios/irdm11"
];

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    monitor: true,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      useDataDir: "./tmp"
    }
  })

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`)
  })

  await cluster.task(async ({ page, data: url}) => {
    await page.goto(url)

    await page.waitForSelector('#main-2')

    const fiiHandles = await page.$$('#main-2')

    for (const fiiHandle of fiiHandles ) {
      let code = ""

      try {
        code = await page.evaluate((el) => el.querySelector('#main-header > div.container.pl-2.pr-1.pl-xs-3.pr-xs-3 > div > div:nth-child(1) > h1').textContent, fiiHandle)
      } catch (error) {}
    }
  })

  for (const url of urls) {
    await cluster.queue(url)
  }

  await cluster.idle()
  await cluster.close()
})()

