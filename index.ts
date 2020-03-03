import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import * as puppeteer from 'puppeteer';

const INIT_URL = `http://www.jacksdonuts.com/donuts-coffee`;
let browser;

const runJacksDonuts = async () => {
    let dom = await getPage(INIT_URL);
    let types = [];
    dom.window.document.querySelectorAll('.element').forEach(node => {
        let titleNode = node.querySelector('.slide-title');
        if (!titleNode) return;
        let listNode = titleNode.nextSibling;
        if (!listNode) return;
        const type = {
            name: titleNode.innerHTML,
            id:
                listNode.getAttribute('id') ||
                titleNode.innerHTML.toLowerCase(),
            items: [],
        };
        listNode.querySelectorAll('ul > li').forEach(n => {
            let item: any = {};
            item.name = n.querySelector('p').innerHTML;
            item.alt = n.querySelector('img').getAttribute('alt');
            item.img = n.querySelector('img').getAttribute('src');
            type.items.push(item);
        });

        console.log(type);
        types.push(type);
    });
};

const runKrispyKreme = async () => {
    // let page = await getPage2(`https://www.krispykreme.com/menu/doughnuts/`);
    // let donuts = await page.evaluate(selector => {
    //     return Array.from(document.querySelectorAll(selector)).map(row => {
    //         let donut: any = {};
    //         donut.title = row.querySelector('.title').innerHTML;
    //         let url = row.querySelector(`a[href]`).getAttribute('href');
    //         donut.url = `https://www.krispykreme.com${url}`;
    //         donut.img = row.querySelector('img').getAttribute('src');
    //         donut.id = url.split('/').pop();
    //         donut.types = row.getAttribute('data-filter-names').split('|');
    //         return donut;
    //     });
    // }, 'section.menu-list .container-fluid .menu-items-container .kk-filter-items li');
    // let donutsDetails = [];
    // // for (let i = 0; i < 5; i++) {
    // for (let i = 0; i < donuts.length; i++) {
    //     let donut = donuts[i];
    //     console.log('Getting Details for ', donut.title);
    //     await page.goto(donut.url);
    //     let donutDetails = await page.evaluate(() => {
    //         let dd: any = {};
    //         let node: any = document.querySelector('.menu-detail');
    //         dd.bannerUrl = node
    //             .querySelector('.hero > img')
    //             .getAttribute('src');
    //         dd.name = node.querySelector('h1').innerText;
    //         dd.nutritionalFacts = node
    //             .querySelector('[data-track="item-detail-nutrition"]')
    //             .getAttribute('href');
    //         dd.description = node.querySelector('p').innerText;
    //         dd.id = window.location.href.split('/').pop();
    //         return dd;
    //     });
    //     console.log(donutDetails);
    //     donutsDetails.push(donutDetails);
    // }
    // console.log(donuts);

    // let donutNodes = dom.window.document.querySelectorAll(
    //     // '.menu-list .container-fluid .row:nth-child(2) .menu-items-container ul.kk-filter-list li',
    //     'section',
    // );
    // console.log(donutNodes.length);
    // donutNodes.forEach(node => {
    //     console.log('node');
    //     let donut: any = {};
    //     donut.title = node.querySelector('.title').innerHTML;
    //     let url = node.querySelector(`a[href]`).getAttribute('href');
    //     donut.url = `https://www.krispykreme.com${url}`;
    //     donut.img = node.querySelector('img').getAttribute('src');
    //     donuts.push(donut);
    // });
    // console.log(donuts);
    const page = await getPage2(`https://www.krispykreme.com/menu/doughnuts/`);
    const content = await page.content();
    const dom = new JSDOM(content);
    const donuts = Array.from(
        dom.window.document.querySelectorAll(
            'section.menu-list .container-fluid .menu-items-container .kk-filter-items li',
        ),
    ).map((node: any) => {
        let donut: any = {};
        donut.title = node.querySelector('.title').innerHTML;
        let url = node.querySelector(`a[href]`).getAttribute('href');
        donut.url = `https://www.krispykreme.com${url}`;
        donut.img = node.querySelector('img').getAttribute('src');
        donut.id = url.split('/').pop();
        donut.types = node.getAttribute('data-filter-names').split('|');
        return donut;
    });
    const types = Array.from(
        donuts.reduce((acc, donut) => {
            donut.types.forEach(t => acc.add(t));
            acc.delete('');
            return acc;
        }, new Set()),
    );
    for (let i = 0; i < donuts.length; i++) {
        let donut = donuts[i];
        // }
        // await donuts.map(async donut => {
        console.log('Visiting', donut.url);
        await page.goto(donut.url);
        const content = await page.content();
        const dom = new JSDOM(content);
        let node: any = dom.window.document.querySelector('.menu-detail');
        donut.bannerUrl = node.querySelector('.hero > img').getAttribute('src');
        donut.nutritionalFacts = node
            .querySelector('[data-track="item-detail-nutrition"]')
            .getAttribute('href');
        donut.description = node.querySelector('p').innerText;
    }
    // });

    console.log(donuts, types);
};

(async () => {
    browser = await puppeteer.launch();
    await runKrispyKreme();
    browser.close();
})();

async function getPage(url) {
    return await fetch(url)
        .then(res => res.text())
        .then(html => new JSDOM(html));
}

async function getPage2(url) {
    let page = await browser.newPage();
    await page.goto(url);
    return page;
}
