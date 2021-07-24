import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { allure } from 'allure-mocha/runtime';
//import { Cat } from '../@types/common';
//import { allure } from 'allure-mocha/runtime';

const RandomInt = (max: number) => Math.floor(Math.random() * max);
const namepart = 'ли'; // надо ввести буквы начала имени котика

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
    assert.equal(search_response.status, 200, `попробуйте найти кота для удаления иначе, чем по ${namepart}`);
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
    const response_id = await CoreApi.getCatById(rand_id);
    rand_name = response_id.data.cat.name;
    console.log(`удалять будем кота по имени ${rand_name}`);
  });

    it('удаление выбраннного котика', async () => {
    const del_response = await CoreApi.removeCat(rand_id);
    assert.ok(del_response.status === 200);
    console.log('котик удалился');
  });

  it('проверка поиском по имени', async () => {
    const check_response = await CoreApi.searchCatByPartName(rand_name);
    assert.equal(check_response.status, 404,'Если бы удалили кота с тем именем, статус ответа был бы 404');
    console.log('точно удалился');
  });

  //вернём кота обратно
  after(async () => {
    const add_response = await CoreApi.addCat(cat_to_del);
    assert.equal(add_response.status, 200, `не вернули котика обратно`);
  });

});