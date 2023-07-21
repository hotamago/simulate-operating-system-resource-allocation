class BaseService {
  constructor(type, id) {
    // this.id = `${type}-${id}`;
    this.id = `${type}-${id}-${this.randomId()}`;
  }
  // Hàm random ngẫu nhiên hậu tố id cho các đối tượng
  randomId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

export default BaseService;
