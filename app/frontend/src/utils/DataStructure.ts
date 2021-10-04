export class Queue<Type> {

  private _arr: Type[];

  constructor() {
    this._arr = [];
  }

  push(item: Type) {
    this._arr.push(item);
  }

  pop() {
    return this._arr.shift();
  }
}

export class Stack<Type> {

  private _arr: Type[];

  constructor() {
    this._arr = [];
  }

  push(item: Type) {
    this._arr.push(item);
  }

  pop() {
    return this._arr.pop();
  }
}