
export class Success<S> {
  readonly ok: true;
  readonly result: S;
  
  constructor(value:S) {
    this.ok = true;
    this.result = value;
  }
};
