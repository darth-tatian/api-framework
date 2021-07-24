import { assert, expect } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { CatMinInfo, CatsList } from '../@types/common';

const cats: CatMinInfo[] = [{ name: 'Валёк', description: '', gender: 'male' }];

describe('Функционал добавления кота', async () => {
  before(async () => {
    const search_response = await CoreApi.searchCatByPartName(cats[0].name);
    if (search_response.status !== 404) {
      const id = search_response.data.cats[0].id;
      const remove_response = await CoreApi.removeCat(id);
      assert.ok(remove_response.status === 200);
    }
  });

  it('Добавление нового несуществующего кота', async () => {
    const response = await CoreApi.addCat(cats);
    console.log(response.data.cats);
    if (response.data.cats[0].errorDescription) {
      assert.fail(
        `Произошла ошибка при добавлении кота: ${response.data.cats[0].errorDescription}`
      );
    }
    expect((<CatsList>response.data).cats[0]).to.include(cats[0]);
  });

  after(async () => {
    const search_response = await CoreApi.searchCatByPartName(cats[0].name);
    if (search_response.status !== 404) {
      const id = search_response.data.cats[0].id;
      const remove_response = await CoreApi.removeCat(id);
      assert.ok(remove_response.status === 200);
    }
  });
});
