import appJson from '../../../app.json';

describe('deep link configuration', () => {
  it('has groovecore:// scheme configured in app.json', () => {
    expect(appJson.expo.scheme).toBe('groovecore');
  });

  it('scheme is a string (not an array)', () => {
    expect(typeof appJson.expo.scheme).toBe('string');
  });
});
