"use strict";

import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import chromedriver from 'chromedriver';
import Promise from 'promise';
import fs from 'fs';
import settings from './settings.json';

const by = webdriver.By;
const By = webdriver.By;
let allLinks = [];
let customersLinks = [];
let index = 0;
let customersIndex = 0;
let customersEmails = [];

const xpathSearchInput = '//*[@id="tsf"]/div[2]/div/div[1]/div/div[1]/input';
const xpathSearchButton = '//*[@id="tsf"]/div[2]/div/div[3]/center/input[1]';
const xpathResultsBlock = '//*[@id="rso"]/div[2]/div';
const xPath2Page = '//*[@id="nav"]/tbody/tr/td[3]/a';
const xPath3Page = '//*[@id="nav"]/tbody/tr/td[4]/a';
const xPath4Page = '//*[@id="nav"]/tbody/tr/td[5]/a';
const xPath5Page = '//*[@id="nav"]/tbody/tr/td[6]/a';
const xPath6Page = '//*[@id="nav"]/tbody/tr/td[7]/a';
const xPath7Page = '//*[@id="nav"]/tbody/tr/td[8]/a';
const xPath8Page = '//*[@id="nav"]/tbody/tr/td[9]/a';
const xPath9Page = '//*[@id="nav"]/tbody/tr/td[10]/a';
const xPath10Page = '//*[@id="nav"]/tbody/tr/td[11]/a';


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
  await browser.findElement(by.xpath(xpathSearchButton)).click();
  browser.sleep(settings.sleep_delay);

  // перебираем все страницы и все ссылки на сайт
  for (let j = 1; j < 10; j++) {
    const elementsBlock = await browser.findElement(by.id('rso'));
    const aLinks = await elementsBlock.findElements(By.css('.r a'));
    console.log('aLinks', aLinks.length);
    /*for (let i = 0; i < aLinks.length; i++) {
      await manageLink(aLinks[i]);
    }*/
    // когда пебербали все ссылки, начинаем искать email адреса
    /*allLinks = allLinks.concat(customersLinks);
    console.log('allLinks', allLinks);
    for (let i = 0; i < customersLinks.length; i++) {
      await manageLinks(i);
    }
    console.log('customersEmails', customersEmails);
    manageEmails();*/
    // перебираем все сылки на сайты
    const pageLink = await browser.findElement(by.xpath(`//*[@id="nav"]/tbody/tr/td[${j + 2}]/a`));
    console.log('pageLink', pageLink);
    await pageLink.click();
    browser.sleep(settings.sleep_delay);
    console.log('clicked');
  }
}

async function findPageLinks(index) {
  const pagesBlock = browser.findElement(by.id('nav'));
  const pageLinks = await pagesBlock.findElements(by.xpath(`'/*[@id="nav"]/tbody/tr/td[${index + 2}]/a`));
  if (pageLinks && pageLinks[index]) {
    console.log('pageLinks', pageLinks.length);
    return pageLinks[index]
  }
  return null;
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
    for (let i = 0; i < allLinks.length; i++) {
      await findEmail(allLinks[i]);
    }
  } catch (e) {
    console.log('manageLinks error', e);
  }
}

async function findEmail(link) {
  try {
    const href = await link.getAttribute("href");
    if (href.indexOf('mailto:') !== -1) {
      console.log('href', href);
      if (customersEmails.indexOf(href) === -1) {
        customersEmails.push(href);
      }
    }
  }
  catch (err) {
    // console.log('findEmail error');
  }
}

// считываем данные из файла и работаем с ними
async function readFileAsync() {
  fs.readFile("emails.txt", "utf8", (error, data) => {
      console.log("Асинхронное чтение файла");
      if(error) throw error; // если возникла ошибка
      console.log(data);  // выводим считанные данные
      manageEmailsFile(data);
    });
}

// записываем данные в файл
async function writeFileAsync(memoryDataArray) {
  const data = memoryDataArray.join();
  fs.writeFile("emails.txt", data, (error) => {
    if(error) throw error; // если возникла ошибка
    console.log("Асинхронная запись файла завершена. Содержимое файла:");
  });
}

async function manageEmails() {
  const clearedEmails = [];
  customersEmails.forEach((elem) => {
    clearedEmails.push(elem.split(':')[1])
  });
  writeFileAsync(clearedEmails);
}

// возвращает массив данных из файла и памяти без повторений
function checkForRepeats(fileDataString, memoryDataArray) {
  const fileDataArray = fileDataString.split(',');
  memoryDataArray.forEach((elem) => {
    if (fileDataString.indexOf(elem) === -1) {
      fileDataArray.push(elem);
    }
  });
  return fileDataArray;
}