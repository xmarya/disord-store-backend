export type PlansMap = {
  basic: {
    price:number,
    quota:[]
  };
  plus: {
    price:number,
    quota:[]
  };
  unlimited: {
    price:number,
    quota:[]
  };
};

export type Plan = keyof PlansMap;
