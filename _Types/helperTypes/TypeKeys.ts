/*TRANSLATE:
    STEP 1: Checking the type of the keys "K" whether they are string or number "string extends K, number extends K"

    STEP 2: Mapped Types transformation with `as`:
        -  after checking both conditions if yes, then we're going to use as to transform the type of K to never to exclude it.

    STEP 3: [K in keyof as the condition result]

    STEP 4: Getting the keys of the resulting object:
        - after excluding process that's been done in the "Mapped Types transformation with `as`", 
            we're going to get the keys using keyof

    NOTE: string extends K ...means: Is every possible string assignable to K? Which is true only when K is the broad type string, and not when K is "name" (a specific string literal)
    example:
    type A = string extends "name" ? true : false; // ❌ false
    type B = string extends string ? true : false; // ✅ true

    conclusion 👉🏻: in the type system, a literal like "name" is more specific than string, so "name" does not include all strings.
                    so when we write "string extends K", we're saying "Is K so wide that it could include all strings?"
*/

export type KnownKeys<T> = keyof { 
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K] 
};

/*TRANSLATE:
type KeysOfDocument<T> = {
  [KEY in keyof T]: KEY extends Array<any> : T[KEY] ? KEY extends object ? never : T[KEY]
  }[keyof T];
  the Array is TECHNICALLY an object, but we don't want to exclude any key of type array, for example: userAddresses:Array<something>,
  so in order to keep the Arrays whilst removing the deep nested objects for example: fullName: {first:string, middle:string, last:string}
  we're going to check it independently at the first stage.
  This type can also be called something like: TopLevelKeys, this name does indicate that it returns all the keys except for the nested keys
*/

/* ❌
type DKArray<T> = Array<keyof T>
type keys2 = DKArray<StoreBasic>

const fields:keys2 = [""]
*/

/* ❌
type FBeforeDK<T> = {
  [K in keyof T] : K
}

type keys3 = Array<keyof FBeforeDK<StoreBasic>>
const fields:keys3 = [""]
*/

/* ❌
type DocumentKeys<T> = T extends T ? keyof T: never;
type StoreDocumentKeys<T> = Array<DocumentKeys<T>>;
*/
