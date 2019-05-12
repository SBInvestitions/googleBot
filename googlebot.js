"use strict";

import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import chromedriver from 'chromedriver';
import Promise from 'promise';
import settings from './settings.json';

const by = webdriver.By;
const By = webdriver.By;

let customersLinks = [];
let index = 0;
let customersIndex = 0;

const xpathSearchInput = '//*[@id="tsf"]/div[2]/div/div[1]/div/div[1]/input';
const xpathSearchButton = '//*[@id="tsf"]/div[2]/div/div[3]/center/input[1]';
const xpathResultsBlock = '//*[@id="rso"]/div[2]/div';

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

const browser = new webdriver
    .Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

browser.manage().window().setSize(1024, 700);

getPage();

async function getPage() {
  //логинимся
  browser.get('https://www.google.com/');
  browser.sleep(settings.sleep_delay);
  browser.findElement(by.xpath(xpathSearchInput)).sendKeys(settings.requests[0]);
  const searchButton = await browser.findElement(by.xpath(xpathSearchButton)).click();
  const elementsBlock = await browser.findElement(by.id('rso'));
  const aLinks = await elementsBlock.findElements(By.css('.r a'));
  // перебираем все сылки на сайты
  for (let i = 0; i < aLinks.length; i++) {
    await manageLink(aLinks[i]);
  }
  // когда пебербали все ссылки, начинаем искать email адреса
  console.log('customersLinks', customersLinks);
  for (let i = 0; i < customersLinks.length; i++) {
    await manageLinks(i);
  }
}

// собираем в массив те ссылки, которые содержат адреса кастомеров
async function manageLink(elem) {
  try {
    const elemLink = await elem.getAttribute("href");
    index++;
    if (elemLink.indexOf('google') === -1) {
      customersLinks.push(elemLink);
    }
  }
  catch (err) {
    //console.log('manageLink error', err);
  }
}

async function manageLinks(ind) {
  try {
    const elemLink = customersLinks[ind];
    console.log('elemLink', elemLink);
    browser.get(elemLink);
    browser.sleep(settings.sleep_delay);
    const allLinks = await browser.findElements(By.css('a'));
    console.log('allLinks', allLinks.length);
    allLinks.forEach((lnk) => {
      findEmail(lnk);
    })
  } catch (e) {
    console.log('manageLinks error', e);
  }
}

async function findEmail(link) {
  try {
    const href = await link.getAttribute("href");
    if (href.indexOf('mailto:') !== -1) {
      console.log('href', href);
    }
  }
  catch (err) {
    // console.log('findEmail error');
  }
}