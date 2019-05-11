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

// getPage();

async function getPage() {
  //логинимся
  browser.get('https://www.google.com/');
  browser.sleep(settings.sleep_delay);
  browser.findElement(by.xpath(xpathSearchInput)).sendKeys(settings.requests[0]);
  const searchButton = await browser.findElement(by.xpath(xpathSearchButton)).click();
  const elementsBlock = await browser.findElement(by.xpath(xpathResultsBlock));
  // console.log('elementsBlock', elementsBlock);
  const aLinks = await elementsBlock.findElements(By.css('.r a'));
  // console.log('aLinks', aLinks);
  aLinks.map((elem) => {
    manageLink(elem, aLinks.length);
  });
}

async function manageLink(elem, count) {
  try {
    const elemLink = await elem.getAttribute("href");
    index++;
    if (elemLink.indexOf('google') === -1) {
      console.log('elemLink', elemLink);
      customersLinks.push(elemLink);
    }
    console.log('index', index, 'count', count);
    if (index === count - 1){
      console.log('customersLinks', customersLinks);
      manageLinks(customersLinks[0]);
    }
  }
  catch (err) {
    //console.log('manageLink error', err);
  }
}

async function manageLinks(ind) {
  const elemLink = customersLinks[ind];
  browser.get(elemLink);
  browser.sleep(settings.sleep_delay);
  const allLinks = await browser.findElements(By.css('a'));
  allLinks.map((lnk) => {
    findEmail(lnk);
  })
}

async function findEmail(link) {
  try {
    const href = await link.getAttribute("href");
    if (href.indexOf('mailto:') !== -1) {
      console.log('href', href);
    }
  }
  catch (err) {
    // console.log('findEmail error', err);
  }
}

const closureFunc = (function() {
  let counter = 0;
  return function() {
    counter += 1;
    console.log('counter', counter);
    return counter;
  }
})();
