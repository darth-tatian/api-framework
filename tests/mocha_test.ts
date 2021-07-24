import { assert } from 'chai';

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

describe('Тесты', () => {
  before('Я могу дать название хуку', () => {
    console.log('before всегда первый!');
  });
  beforeEach(() => {
    console.log('beforeEach запускается перед каждым тестом!');
  });
  afterEach(() => {
    console.log('afterEach запускается после каждого теста!');
  });
  after(() => {
    console.log('after всегда последний!');
  });
  it.skip('Сломанный тест', () => {
    assert.fail('Я сломан!');
  });

  [1, 2, 3].forEach((value) => {
    it(`Параметризованный тест ${value}`, function () {
      console.log(this.test.title);
    });
  });

  it('retries', function () {
    this.retries(2);
    const currentRetry = this.test['_currentRetry'];
    const randomValue = getRandomInt(6);
    const msg = `currentRetry = ${currentRetry}, randomValue = ${randomValue}`;
    console.log(msg);
    assert.equal(randomValue, 6, msg);
  });
});

describe('Проверка денежной операции', () => {
  describe('Оплата', () => {
    it('Карта1', function () {
      console.log(`${this.test.parent.title} ${this.test.title}`);
    });
    it('Карта2', function () {
      console.log(`${this.test.parent.title} ${this.test.title}`);
    });
  });
  describe('Перевод', () => {
    it('Карта1', function () {
      console.log(`${this.test.parent.title} ${this.test.title}`);
    });
    it('Карта2', function () {
      console.log(`${this.test.parent.title} ${this.test.title}`);
    });
  });
});
