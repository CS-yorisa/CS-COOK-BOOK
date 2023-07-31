[TOC]

# PART Ⅱ. 일급 추상

> **일급 함수(first-class function)**를 중심으로 **일급 값(first-class value)**에 대해 알아보기

<br>

## Chapter 10. 일급 함수 Ⅰ

> 코드의 냄새와 중복을 없애 추상화를 잘할 수 있는 리팩터링 2개 알아보기

#### 마케팅팀에서 요청한 요구사항

- 장바구니에 있는 <u>제품 값</u>을 설정하는 기능 (가격 설정)
- 장바구니에 있는 <u>제품 개수</u>를 설정하는 기능 (개수 설정)
- 장바구니에 있는 <u>제품에 배송</u>을 설정하는 기능 (배송 설정)

> 모든 요구사항이 설정하는 필드만 다르고 비슷함

<br>

### 코드의 냄새: 함수 이름에 있는 암묵적 인자

> 어떤 제품은 무료 배송, 어떤 제품은 가격을 0으로 설정해야 함

```javascript
function setPriceByName(cart, name, price) { // 문자열이 함수 이름에 있음
    var item = cart[name];
    var newItem = objectSet(item, 'price', price); // 함수들은 문자열만 다름
    var newCart = objectSet(cart, name, newItem);
    return newCart;
}

function setQuantityByName(cart, name, quant) {
    var item = cart[name];
    var newItem = objectSet(item, 'quantity', quant);
    var newCart = objectSet(cart, name, newItem);
    return newCart;
}

function setShippingByName(cart, name, ship) {
    var item = cart[name];
    var newItem = objectSet(item, 'shipping', ship);
    var newCart = objectSet(cart, name, newItem);
    return newCart;
}

function setTaxByName(cart, name, tax) {
    var item = cart[name];
    var newItem = objectSet(item, 'tax', tax);
    var newCart = objectSet(cart, name, newItem);
    return newCart;
}

function objectSet(object, key, value) {
    var copy = Object.assign({}, object);
    copy[key] = value;
    return copy;
}
```

- 함수 구현이 거의 동일하고, 함수 이름이 구현의 차이를 만듬

### 리팩터링: 암묵적 인자를 드러내기

```js
// 리팩터링 전 (암묵적 인자 price 포함)
function setPriceByName(cart, name, price) {
    var item = cart[name];
    var newItem = objectSet(item, 'price', price);
    var newCart = objectSet(cart, name, newItem);
    return newCart;
}

cart = setPriceByName(cart, "shoe", 13);
cart = setQuantityByName(cart, "shoe", 3);
cart = setShippingByName(cart, "shoe", 0);
cart = setTaxByName(cart, "shoe", 2.34);
```

```javascript
// 리팩터링 후 (명시적인 인자 field 추가, 원래 인자는 value 로 수정)
function setFieldByName(cart, name, field, value) {
    var item = cart[name];
    var newItem = objectSet(item, field, value);
    var newCart = objectSet(cart, name, newItem);
    return newCart;
}

cart = setFieldByName(cart, "shoe", 'price', 13); // 새로운 인자 사용
cart = setFieldByName(cart, "shoe", 'quantity', 3);
cart = setFieldByName(cart, "shoe", 'shipping', 0);
cart = setFieldByName(cart, "shoe", 'tax', 2.34);
```

- 리팩터링을 통해 <u>필드명</u>을 **일급 값**으로 만들었음 (변수나 배열에 담을 수 있음)

<br>

### 일급인 것과 일급이 아닌 것을 구별하기

- **자바스크립트에서 일급이 아닌 것 :** 수식 연산자, 반복문, 조건문, try/catch 블록

  > 일급이 아닌 것을 일급으로 만드는 과정도 중요

- **일급으로 할 수 있는 것**

  1. 변수에 할당
  2. 함수의 인자로 넘기기
  3. 함수의 리턴값으로 받기
  4. 배열이나 객체에 담기

- 자바스크립트의 경우 <u>함수명의 일부</u>를 인자로 바꿔 일급으로 만듬

  - 객체 필드에 접근할 때 **문자열**을 사용

    ```js
    // 접근 가능한 필드를 명시하여 런타임에 valid 체크
    var validItemFields = ['price', 'quantity', 'shipping', 'tax'];
    
    function setFieldByName(cart, name, field, value) {
        // 필드명이 올바르지 않을 경우 런타임에 throw 발생
        if (!validItemFields.includes(field)) {
            throw "Not a valid item field: " + "'" + field + "'.";
        }
        var item = cart[name];
        var newItem = objectSet(item, field, value);
        var newCart = objectSet(cart, name, newItem);
        return newCart;
    }
    ```

    > **TypeScript** 와 같은 정적 타입 언어를 활용하면 <u>컴파일 단계</u>에서 valid 를 체크할 수 있음

  - <u>추상화 벽 위</u>에서 **필드명이 변경**되는 경우 <u>추상화 벽 아래</u>에 있는 객체에 적용하는 법

    ```js
    var validItemFields = ['price', 'quantity', 'shipping', 'tax'];
    // 변경된 필드명을 적용할 수 있도록 내부에서 변경
    var translations = {'quantity': 'number'};
    
    function setFieldByName(cart, name, field, value) {
        if (!validItemFields.includes(field)) {
            throw "Not a valid item field: " + "'" + field + "'.";
        }
        // 해당 속성을 가지고 있는 경우 필드명을 변경
        if (translations.hasOwnProperty(field)) {
            field = translations[field];
        }
        var item = cart[name];
        var newItem = objectSet(item, field, value);
        var newCart = objectSet(cart, name, newItem);
        return newCart;
    }
    ```

  > 이러한 방법들 또한 필드명이 일급이기 때문에 가능

  - 장바구니와 제품처럼 **일반적인 엔티티**는 <u>객체와 배열</u>처럼 일반적인 데이터 구조를 사용해야 함

    >**데이터 지향 (data orientation) :** 이벤트와 엔티티에 대한 사실을 표현하기 위해 일반 데이터 구조를 사용하는 프로그래밍 형식

<br>

### 반복문 예제: 먹고 치우기

> 반복문을 일급으로 만드는 방법 (고차 함수 만들기)
>
> **고차 함수 (higher-order function) :** 인자로 함수를 받거나 리턴값으로 함수를 리턴할 수 있는 함수

```js
// 리팩터링 전

/* 1. 준비하고 먹기 */
function cookAndEatFoods() {
    for (var i = 0; i < foods.length; i++) {
        var food = foods[i];
        cook(food);
        eat(food);
    }
}

/* 2. 설거지하기 */
function cleanDishes() {
    for (var i = 0; i < dishes.length; i++) {
        var dish = dishes[i];
        wash(dish);
        dry(dish);
        putAway(dish);
    }
}
```

- 반복문이 거의 <u>똑같은 구조</u>를 가지고 있으며, **암묵적 인자**가 존재함

```js
// 1차 리팩터링 후

/* 1. 준비하고 먹기 */
function cookAndEatArray(array) { // 암묵적 인자를 명시적 인자 array 로 변경
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        cookAndEat(item); // 반복문 안에 있는 본문을 분리
    }
}
function cookAndEat(food) {
    cook(food);
    eat(food);
}

/* 2. 설거지하기 */
function cleanArray(array) {
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        clean(item);
    }
}
function clean(dish) {
    wash(dish);
    dry(dish);
    putAway(dish);
}
```

- 여전히 구현이 비슷하고, 함수 이름에서 다른 부분이 함수에서 사용됨 (ex. cookAndEat)

```js
// 2차 리팩터링 후 (완료)

// 고차 함수인 forEach 구현
function forEach(array, f) { // 함수(f)를 인자로 받음 → 고차 함수
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        f(item);
    }
}

/* 1. 준비하고 먹기 */
forEach(foods, function(food) { // 익명 함수 사용
    cook(food);
    eat(food);
})

/* 2. 설거지하기 */
forEach(dishes, function(dish) {
    wash(dish);
    dry(dish);
    putAway(dish);
})
```

<br>

### 리팩터링: 함수 본문을 콜백으로 바꾸기

> **try/catch 구문**에서 <u>중복되는 catch 구문</u>을 리팩터링
>
> **콜백 함수 (callback function) :** 자바스크립트에서 인자로 전달하는 함수 <u>= 핸들러 함수 (handler function)</u>

```js
// 리팩터링 전
try { // 앞부분
    saveUserData(user); // 본문
// 아래에 해당하는 부분(뒷부분)이 다수 중복되는 상황
} catch (error) {
    logToSnapErrors(error);
}
```

- **함수 본문을 콜백으로 바꾸는 단계**
  1. 본문과 본문의 앞부분과 뒷부분을 구분
  2. 전체를 함수로 빼내기
  3. 본문 부분을 빼낸 함수의 인자로 전달한 함수로 바꾸기

```js
// 리팩터링 후
function withLogging(f) { // 함수 본문을 콜백으로 전달
    try {
        f();
    } catch (error) {
        logToSnapErrors(error);
    }
}

withLogging(function() { // 익명 함수를 본문으로 전달
    saveUserData(user);
})
```

> `withLogging(saveUserData(user))` 처럼 호출하는 경우 함수가 (try/catch 밖에서) 바로 실행되기 때문에, 함수로 감싸서 넘겨야함

<br>

#### 함수를 정의하는 세 가지 방법

##### 1. 전역으로 정의하기

> 함수를 전역적으로 정의하고 이름을 붙여 프로그램 어디서나 사용 가능

```js
function saveCurrentUserData() { // 전역으로 함수 정의
    saveUserData(user);
}

withLogging(saveCurrentUserData); // 함수 이름으로 다른 함수에 전달
```

##### 2. 지역적으로 정의하기

> 함수를 지역 범위 안에서 정의하고 이름을 붙여 범위 안에서만 사용

```js
function someFunction() {
    var saveCurrentUserData = function() {
        saveUserData(user);
    };
    withLogging(saveCurrentUserData);
}
```

##### 3. 인라인으로 정의하기

> 함수를 사용하는 곳에서 바로 정의, 한 번만 쓰는 짧은 함수에 사용 **(익명 함수)**

```js
withLogging(function() { saveUserData(user); }); // 보통 필요한 곳에서 인라인(inline)으로 정의
```

