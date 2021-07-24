import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { CatMinInfo } from '../@types/common';
import { allure } from 'allure-mocha/runtime';

const RandomInt = (max: number) => Math.floor(Math.random() * max);

//2 объявления ниже нужны, если удалять специального кота для удаления, чтобы не менять актуальный состав котов
const cats: CatMinInfo[] = [{ name: 'спец кот', description: 'для удаления', gender: 'unisex' }];
const namepart = cats[0].name;

//объявление ниже нужно, если удалять прям случайного из бд, то надо ввести буквы начала имени и закомментировать before-хук и раскомментировать after-
//const namepart = 'зе';

describe('найти-удалить-проверить', async () => {

  before(async () => {
    const search_response = await CoreApi.searchCatByPartName(namepart);
    if (search_response.status == 404) {
      const add_response = await CoreApi.addCat(cats);
      assert.ok(add_response.status === 200);
      console.log('добавили спец кота для удаления');
    } else {
      console.log('при поиске по имени кота для удаления ответ сервера не 404, а мы хотим удалить кота не из бд');
      assert.fail(`Кот, которого собрались удалять, есть в бд! Response:\n ${JSON.stringify(search_response.data, null, 2)}`);
    }
  });

  it('есть ли котики с именами, похожими на то, что ищем?',async () => {
    const response = await CoreApi.searchCatByPartName(namepart, 20);
    console.log(response.data.cats);
    allure.logStep(`выполнен запрос GET /search-pattern c параметром ${namepart}`);
    allure.testAttachment(
      'testAttachment',
      JSON.stringify(response.data, null, 2),
      'application/json'
    );
    const ok_stat =  (response.status  - (response.status % 100))/100; //успешные ответы начинаются с 2, будем проверять
    assert.equal(ok_stat, 2,'Статус ответа сервера не в диапазоне 200-299, попробуйте поискать по другой части имени');
  });

  let rand_name: string;
  let rand_id: number;

  it('выбор id случайного котика', async () => {
    const response_part = await CoreApi.searchCatByPartName(namepart, 20);
    allure.logStep(`выполнен запрос GET /search-pattern c параметром ${namepart}`);
    allure.testAttachment(
      'testAttachment',
      JSON.stringify(response_part.data, null, 2),
      'application/json'
    );
    const namepart_list = response_part.data.cats;
    const len = namepart_list.length;
    rand_id = response_part.data.cats[RandomInt(len)].id;

    const response_id = await CoreApi.getCatById(rand_id);
    allure.logStep(`выполнен запрос GET /get-by-id c параметром ${rand_id}`);
    allure.testAttachment(
      'testAttachment',
      JSON.stringify(response_id.data, null, 2),
      'application/json'
    );
    assert.ok(response_id.status === 200);
    rand_name = response_id.data.cat.name;
    console.log(`удалять будем кота по имени ${rand_name}`);
  });

    it('удаление выбраннного котика', async () => {
    const del_response = await CoreApi.removeCat(rand_id);
      allure.logStep(`выполнен запрос DELETE /delete c параметром ${rand_id}`);
      allure.testAttachment(
        'testAttachment',
        JSON.stringify(del_response.data, null, 2),
        'application/json'
      );
    const ok_stat =  (del_response.status  - (del_response.status % 100))/100;
    assert.equal(ok_stat, 2,'Статус ответа сервера не в диапазоне 200-299');
    console.log('котик удалился');
  });

  it('проверка поиском по имени', async () => {
    const check_response = await CoreApi.searchCatByPartName(rand_name);
    allure.logStep(`выполнен запрос GET /search-pattern c параметром ${rand_name}`);
    allure.testAttachment(
      'testAttachment',
      JSON.stringify(check_response.data, null, 2),
      'application/json'
    );
    assert.equal(check_response.status, 404,'Если бы удалили кота с тем именем, статус ответа был бы 404');
    console.log('точно удалился');
  });

//after hook нужен, если удаляем случайного из бд
//   after(async () => {
//     const add_response = await CoreApi.addCat(cats);
//     if (search_response.status == 404) {
//       const add_response = await CoreApi.addCat(cats);
//       assert.ok(add_response.status === 200);
//       console.log('добавили спец кота для удаления');
//     } else {
//       console.log('при поиске по имени кота для удаления ответ сервера не 404, а мы хотим удалить кота не из бд');
//       assert.fail(`Кот, которого собрались удалять, есть в бд! Response:\n ${JSON.stringify(search_response.data, null, 2)}`);
//     }
//   });

});