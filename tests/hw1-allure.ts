import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { allure } from 'allure-mocha/runtime';
//import { Cat } from '../@types/common';
//import { allure } from 'allure-mocha/runtime';

const RandomInt = (max: number) => Math.floor(Math.random() * max);
const namepart = 'ло'; // надо ввести буквы начала имени котика

describe('найти-удалить-проверить', async () => {

  let cat_to_del = [];
  let rand_name: string;
  let rand_id: number;
  let namepart_list = [];

  //есть ли котики, имя которых начинается с введённой в namepart строки?
  before(async () => {
    //выберем максимум 20 имён, среди которых разыграем удаление
    const search_response = await CoreApi.searchCatByPartName(namepart, 20);
    namepart_list = search_response.data.cats;
    allure.logStep(`выполнен запрос GET /search-pattern c параметром ${namepart}`);
    assert.equal(search_response.status, 200, `попробуйте найти кота для удаления иначе, чем по ${namepart}`);
    console.info(`при поиске по ${namepart}`, 'получен ответ на запрос GET /search-pattern:\n', namepart_list);
  });

  it('выбор случайного котика', async () => {
    //сколько на самом деле имён в списке
    const len = namepart_list.length;
    //розыгрыш
    const letitbe = RandomInt(len);
    //а вот и кот, выигравший удаление, и его id
    rand_id = namepart_list[letitbe].id;
    cat_to_del.push(namepart_list[letitbe]);
    //проверка, что выбрали котика
    const response_id = await allure.step(
      `выполнен запрос GET /get-by-id c параметром ${rand_id}`,
      async () => {
        console.info('выбор случайного кота\n', 'выполняется запрос GET /get-by-id');
        const response_id = await CoreApi.getCatById(rand_id);
        rand_name = response_id.data.cat.name;
        return response_id;
      }
      );
    console.info('при выборе кота по выпавшему случайному id', 'получен ответ на запрос GET /get-by-id:\n', response_id.data.cat);

    await allure.step(
      'выбрали ли кота?',
      () => {
        allure.attachment('имя кота, которого удалим', rand_name, 'application/json');
        assert.ok(response_id.status === 200);
      }
    );
  });

    it('удаление выбраннного котика', async () => {
      const del_response = await allure.step(
        `выполняется запрос DELETE /delete c параметром ${rand_id}`,
        async () => {
          console.info(`удаление кота\n`, `выполняется запрос DELETE /delete c параметром ${rand_id}`);
          const del_response = await CoreApi.removeCat(rand_id);
          console.info('при удалении', 'от сервера получен ответ на запрос DELETE /delete:\n', del_response.status);
          return del_response;
        }
      );
    console.info('котик удалился', 'получен ответ на запрос DELETE /delete:\n', del_response.data);
      await allure.step(
        'выполнено удаление кота',
        () => {
          //allure.attachment('server response', del_response.status, 'application/json');
          assert.ok(del_response.status === 200);
        }
      );
  });

  it('проверка поиском по имени', async () => {
    const check_response = await allure.step(
      `выполнен запрос GET /search-pattern c параметром ${rand_name}`,
      async () => {
        console.info('поиск удалённого кота', 'выполняется запрос GET /search-pattern');
        const check_response = await CoreApi.searchCatByPartName(rand_name);
        console.info('ищем удалённого по имени, ответ сервера', 'получен ответ на запрос GET /search-pattern\n', check_response.status);
        return check_response;
      }
    );
    console.info('точно удалился', 'получен ответ на запрос DELETE /delete:\n', check_response.data);
    await allure.step(
      'мы честно искали удаленного кота',
      () => {
        assert.ok(check_response.status === 404);
      }
    );
  });

  //вернём кота обратно
  after(async () => {
    const add_response = await CoreApi.addCat(cat_to_del);
    allure.logStep(`выполнен запрос POST /add c параметром ${cat_to_del}`);
    assert.equal(add_response.status, 200, `не вернули котика ${rand_name} обратно`);
    console.info(`при добавлении ${rand_name}`, 'получен ответ на запрос POST /add:\n', add_response.data.cats);
  });

});