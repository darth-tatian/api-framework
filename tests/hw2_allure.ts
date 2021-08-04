import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import LikeApi from '../src/http/LikeApi';
import { allure } from 'allure-mocha/runtime';

const RandomInt = (max: number) => Math.floor(Math.random() * max);
const n = 10;
const m = 3;

describe('проверка лайков и дизлайков', async () => {

  let LikesBefore: number;
  let LikesAfter: number;
  let DislikesBefore: number;
  let DislikesAfter: number;
  let RandId: number;

  before(async () => {
    //возьмём список имён всех котиков
    const AllCats = await CoreApi.getAllCats();
    allure.logStep(`выполнен запрос GET метода getAllCats`);
    //выберем случайную букву для выбора случайного имени
    const TitleLen = AllCats.data.groups.length;
    const RandTitle = RandomInt(TitleLen);
    allure.logStep(`выбрали случайную букву ${AllCats.data.groups[RandTitle].title}`);
    //выберем случайный номер в списке котов, начинающихся с этой буквы
    const ThatLetterLen = AllCats.data.groups[RandTitle].cats.length;
    const RandNumThatLetter = RandomInt(ThatLetterLen);
    allure.logStep(`выбрали случайный номер ${RandNumThatLetter}  из ${ThatLetterLen} в списке имён на ${AllCats.data.groups[RandTitle].title}`);
    //по разыгранным номерам найдём id кота для залайкивания
    RandId = AllCats.data.groups[RandTitle].cats[RandNumThatLetter].id;
    allure.logStep(`выбрали случайного кота с id ${RandId}`);
    assert.equal(AllCats.status, 200, `искали список всех котов, но код ответа сервера не 200`);
    console.info(`вывели список всех имён методом /getAllCats, выбрали случайную букву и случайный порядковый номер`, 'так получили случайный id: ', RandId);
  });

  it('найти случайного кота-запомнить количество лайков-пролайкать-проверить количество лайков', async () => {
    const OurCat = await allure.step(
      `выполняется запрос GET /get-by-id c параметром ${RandId}`,
      async () => {
        const OurCat = await CoreApi.getCatById(RandId);
        LikesBefore = OurCat.data.cat.likes;

        const data = JSON.stringify(OurCat.data.cat, null, 2);
        allure.attachment('случайно выбранный кот', data, 'application/json');

        return OurCat;
        }
    );
    console.info('при выборе кота по выпавшему случайному id', 'получен ответ на запрос GET /get-by-id:\n', OurCat.data.cat);

    await allure.step(
      'что за кот и сколько лайков было?',
      () => {
        allure.attachment('id кота, которого залайкаем', `${RandId}`, 'application/json');
        allure.attachment('количество лайков до залайкивания', `${LikesBefore}`, 'application/json');
        assert.ok(OurCat.status === 200);
      }
    );

    for (let i = 0; i < n; i++) {
      const LikeIt = await LikeApi.likes(RandId, { like: true, dislike: null });
    }

    const OurCatLiked = await allure.step(
      `выполняется запрос GET /get-by-id c параметром ${RandId}`,
      async () => {
        const OurCatLiked = await CoreApi.getCatById(RandId);
        LikesAfter = OurCatLiked.data.cat.likes;
        console.log(`после пролайкивания ожидалось ${LikesBefore + n} лайков, получилось ${LikesAfter} лайков`);
        assert.equal(LikesAfter, LikesBefore + n);
        return OurCatLiked;
        }
    );
    console.info('после пролайкивания кота с помощью GET-запроса /get-by-id', ' на запрос :\n', OurCatLiked.data.cat);
    await allure.step(
      'сколько лайков стало?',
      () => {
        allure.attachment('количество лайков после', `${LikesAfter}`, 'application/json');
        assert.ok(OurCatLiked.status === 200);
      }
    );
  });

  it('найти случайного кота-запомнить количество дизлайков-продизлайкать-проверить количество дизлайков', async () => {
    const OurCat = await allure.step(
      `выполняется запрос GET /get-by-id c параметром ${RandId}`,
      async () => {
        const OurCat = await CoreApi.getCatById(RandId);
        DislikesBefore = OurCat.data.cat.dislikes;

        const data = JSON.stringify(OurCat.data.cat, null, 2);
        allure.attachment('случайно выбранный кот', data, 'application/json');

        return OurCat;
      }
    );
    console.info('при выборе кота по выпавшему случайному id', 'получен ответ на запрос GET /get-by-id:\n', OurCat.data.cat);

    await allure.step(
      'что за кот и сколько дизлайков было?',
      () => {
        allure.attachment('id кота, которого задизлайкаем', `${RandId}`, 'application/json');
        allure.attachment('количество лайков до задизлайкивания', `${DislikesBefore}`, 'application/json');
        assert.ok(OurCat.status === 200);
      }
    );

    for (let i = 0; i < m; i++) {
      const DislikeIt = await LikeApi.likes(RandId, {like: null, dislike: true});
    }

    const OurCatDisliked = await allure.step(
      `выполняется запрос GET /get-by-id c параметром ${RandId}`,
      async () => {
        const OurCatDisliked = await CoreApi.getCatById(RandId);
        DislikesAfter = OurCatDisliked.data.cat.dislikes;
        console.log(`после продизлайкивания ожидалось ${DislikesBefore + m} дизлайков, получилось ${DislikesAfter} дизлайков`);
        assert.equal(DislikesAfter, DislikesBefore + m);
        return OurCatDisliked;
      }
    );
    console.info('после продизлайкивания кота с помощью GET-запроса /get-by-id', ' на запрос :\n', OurCatDisliked.data.cat);
    await allure.step(
      'сколько дизлайков стало?',
      () => {
        allure.attachment('количество дизлайков после', `${DislikesAfter}`, 'application/json');
        assert.ok(OurCatDisliked.status === 200);
      }
    );
  });

  //открутим накрученные лайки и дизлайки
after(async () => {
    for (let i = 0; i < n; i++) {
      const like_it = await LikeApi.likes(RandId, {like: false, dislike: null});
    }

  for (let i = 0; i < m; i++) {
    const like_it = await LikeApi.likes(RandId, {like:null, dislike: false});
  }
    const CheckLikes = await CoreApi.getCatById(RandId);
    LikesAfter = CheckLikes.data.cat.likes;
    DislikesAfter = CheckLikes.data.cat.dislikes;
    console.log(`после отмены ожидалось ${LikesBefore} лайков и ${DislikesBefore} дизлайков, получилось ${LikesAfter} лайков и ${DislikesAfter} дизлайков`);
    assert.equal(LikesBefore, LikesAfter);
    assert.equal(DislikesBefore, DislikesAfter);
  });

});