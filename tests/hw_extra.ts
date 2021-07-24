import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import LikeApi from '../src/http/LikeApi';

const RandomInt = (max: number) => Math.floor(Math.random() * max);
const namepart = 'р'; //если удалять прям случайного из бд, то надо ввести буквы начала имени
const n = 10;
const m = 3;

describe('найти случайного кота-запомнить лойсы-отлайкать-проверить', async () => {

  let likes_before: number;
  let likes_after: number;
  let Cat = { };
  let rand_name: string;
  let rand_id: number;

  //есть ли хоть один котик, имя которого начинается с введённой в namepart строки?
  before(async () => {
    const search_response = await CoreApi.searchCatByPartName(namepart, 1);
    assert.equal(search_response.status, 200, `попробуйте найти кота для удаления иначе, чем по ${namepart}`);
  });

  it('выбор случайного котика', async () => {
    //выберем максимум 20 имён, среди которых разыграем залайкивание
    const response_part = await CoreApi.searchCatByPartName(namepart, 20);
    const namepart_list = response_part.data.cats;
    //сколько на самом деле имён в списке
    const len = namepart_list.length;
    //розыгрыш
    const letitbe = RandomInt(len);
    //а вот и кот, выигравший залайкивание, и его id
    Cat = response_part.data.cats[letitbe];
    rand_id = response_part.data.cats[letitbe].id;
    likes_before = response_part.data.cats[letitbe].likes;
    //проверка, что выбрали котика
    const response_id = await CoreApi.getCatById(rand_id);
    assert.ok(response_id.status === 200);
    rand_name = response_id.data.cat.name;
    console.log(`лайкать будем кота по имени ${rand_name}`);
  });

  it('залайкивание', async () => {
    console.time('for');
    for (let i = 0; i < n; i++) {
      const like_it = await LikeApi.likes(rand_id, {like: true, dislike: false});
    }
    console.timeEnd('for');

    const response_id = await CoreApi.getCatById(rand_id);
    rand_name = response_id.data.cat.name;
    likes_after = response_id.data.cat.likes;
    console.log(`ожидалось ${likes_before+n} лайков, получилось ${likes_after} лайков`);
    assert.equal(likes_after, likes_before+n);
  });

  //открутим накрученные лойсы
  after(async () => {
    for (let i = 0; i < n; i++) {
      const like_it = await LikeApi.likes(rand_id, {like: false, dislike: true});
    }
    console.timeEnd('for');

    const response_id = await CoreApi.getCatById(rand_id);
    rand_name = response_id.data.cat.name;
    likes_after = response_id.data.cat.likes;
    console.log(`ожидалось ${likes_before} лайков, получилось ${likes_after} лайков`);
    assert.equal(likes_after, likes_before);
  });

});

describe('найти случайного кота-запомнить дизлайки-отдизлайкать-проверить', async () => {

  let dislikes_before: number;
  let dislikes_after: number;
  let Cat = { };
  let rand_name: string;
  let rand_id: number;

  //есть ли хоть один котик, имя которого начинается с введённой в namepart строки?
  before(async () => {
    const search_response = await CoreApi.searchCatByPartName(namepart, 1);
    assert.equal(search_response.status, 200, `попробуйте найти кота для удаления иначе, чем по ${namepart}`);
  });

  it('выбор случайного котика', async () => {
    //выберем максимум 20 имён, среди которых разыграем залайкивание
    const response_part = await CoreApi.searchCatByPartName(namepart, 20);
    const namepart_list = response_part.data.cats;
    //сколько на самом деле имён в списке
    const len = namepart_list.length;
    //розыгрыш
    const letitbe = RandomInt(len);
    //а вот и кот, выигравший залайкивание, и его id
    Cat = response_part.data.cats[letitbe];
    rand_id = response_part.data.cats[letitbe].id;
    dislikes_before = response_part.data.cats[letitbe].dislikes;
    //проверка, что выбрали котика
    const response_id = await CoreApi.getCatById(rand_id);
    assert.ok(response_id.status === 200);
    rand_name = response_id.data.cat.name;
    console.log(`лайкать будем кота по имени ${rand_name}`);
  });

  it('задизлайкивание', async () => {
    console.time('for');
    for (let i = 0; i < m; i++) {
      const dislike_it = await LikeApi.likes(rand_id, {like: false, dislike: true});
    }
    console.timeEnd('for');
    const response_id = await CoreApi.getCatById(rand_id);
    rand_name = response_id.data.cat.name;
    dislikes_after = response_id.data.cat.dislikes;
    console.log(`ожидалось ${dislikes_before+m} лайков, получилось ${dislikes_after} лайков`);
    assert.equal(dislikes_after, dislikes_before+m);
  });

  //открутим накрученные дизлайки
  after(async () => {
    for (let i = 0; i < m; i++) {
      const dislike_it = await LikeApi.likes(rand_id, {like: true, dislike: false});
    }
    console.timeEnd('for');

    const response_id = await CoreApi.getCatById(rand_id);
    rand_name = response_id.data.cat.name;
    dislikes_after = response_id.data.cat.dislikes;
    console.log(`ожидалось ${dislikes_before} лайков, получилось ${dislikes_after} лайков`);
    assert.equal(dislikes_after, dislikes_before);
  });

});