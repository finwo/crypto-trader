export class AbstractEntity {
  static idField = 'uuid';

  constructor(data = {}) {
    const clone = Object.assign({},data);
    delete clone['@id'];
    delete clone['@type'];
    Object.assign(this,clone);
  }
}
