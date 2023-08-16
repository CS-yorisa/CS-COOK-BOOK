# Chapter 06. 불변성 유지하기

> 자바스크립트 배열과 객체에 **불변 데이터**를 다룰 수 있는 동작을 만들고 적용
>
> 데이터를 **불변형으로 유지**할 수 있는 원칙

- 배열과 객체 데이터에 쓸 수 있고, 깊이 중첩된 데이터에도 동작하는 **카피-온-라이트** 설계

  > **중첩(nested)** : 데이터 구조 안에 데이터 구조가 있는 경우
  >
  > - 깊이 중첩(deeply nested) : 중첩이 이어진다.

- 동작을 <u>읽기, 쓰기, 둘 다 하는 것</u>으로 분류할 수 있음

  - 읽기(read) : 데이터를 바꾸지 않고 정보를 꺼내는 것
    - ex. 제품 개수 가져오기, 가격 가져오기 등
  - 쓰기(write) : 데이터가 바뀔 수 있기 때문에 원본 데이터가 바뀌지 않도록 원칙이 필요
    - ex. 제품 추가하기, 가격 설정하기 등

<br>

## 카피-온-라이트

> 쓰기(write) 동작을 위한 불변성 원칙

### 카피-온-라이트 원칙 세 단계

1. 복사본 만들기
2. 복사본 변경하기 (원하는 만큼)
3. 복사본 리턴하기

```js
function add_element_last(array, elem) {
    var new_array = array.slice();  // 1. 복사본 만들기
    new_array.push(elem);  // 2. 복사본 변경하기
    return new_array;  // 3. 복사본 리턴하기
}
```

> 데이터를 바꾸지 않고 리턴했기 때문에 '쓰기'가 아닌 '읽기' 가 됨
>
> 카피-온-라이트는 쓰기를 읽기로 바꿈

### 예시

```js
// 제품 이름으로 장바구니에서 제품을 빼는 함수
function remove_item_by_name(cart, name) {
  var idx = null;
  for(var i = 0; i < cart.length; i++){
    if(cart[i].name === name)
      idx = i;
  }
  if(idx != null)
    cart.splice(idx, 1); // 배열에서 idx 위치의 항목을 1개 삭제하는 메서드
}
```

- 장바구니를 변경 불가능한 데이터로 사용하기 위해 카피-온-라이트 적용 

``` js
// 제품 이름으로 장바구니에서 제품을 빼는 함수
function remove_item_by_name(cart, name) {
  
  // 1. 장바구니 복사본 만들기
  var new_cart = cart.slice();
  var idx = null;
  
  // 2. 복사본 변경하기 (원하는 만큼)
  for(var i = 0; i < new_cart.length; i++){
    if(new_cart[i].name === name)
      idx = i;
  }
  if(idx != null)
    new_cart.splice(idx, 1);
  
  // 3. 복사본 리턴하기
  return new_cart;
}
```

- 이후 해당 함수를 사용하는 곳에서 전역변수를 변경하도록 코드 수정



### .splice() 메서드 일반화

``` js
// splice()를 재사용할 수 있도록 일반화. 배열이나 객체를 복사하는 코드 패턴 반복하지 않아도 됨
function removeItems(array, idx, count){
  var copy = array.slice();
  copy.splice(idx, count);
  return copy;
}


function remove_item_by_name(cart, name) {
  var idx = null;
  
  for(var i = 0; i < cart.length; i++){
    if(cart[i].name === name)
      idx = i;
  }
  if(idx != null)
    return removeItems(cart, idx, 1);
  return cart;
}
```



### 자바스크립트 배열 함수

- 인덱스로 값 찾기 `[idx]`
- 값 할당 하기 `[] =`
- 길이 `.length`
- 끝에 추가하기 `.push(el)`
- 끝에 있는 값 지우기 `.pop()`
- 앞에 추가하기 `.unshift(el)`
- 앞에 있는 값 지우기 `.shift()`
- 배열 복사하기 `.slice()` - 배열을 얇게 복사
- 항목 삭제 하기 `.splice(idx, num)`



### 자바스크립트 객체 함수

- 키로 값 찾기 `[key]`
- 키로 값 찾기 ``.key` (키가 자바스크립트 토큰 문법에만 맞는다면 쉽게 사용 가능)
- 키로 값 설정하기 ``.key=`` 또는 `[key] =`
- 키/값 쌍 지우기 `delete`
- 객체 복사하기 `Object.assign(a, b)`
  - b 객체의 모든 키 값을 a 객체로 복사 `Object.assign({}, object)`
- 키 목록 가져오기 `Object.keys()`



### 연습문제

- 메일링 리스트에 연락처를 추가하는 코드를 카피-온-라이트 형식으로 변경

``` js
var mailing_list = [];

function add_contact(email){
  mailing_list.push(email);
}

function submit_form_handler(event) {
  var form = event.target;
  var email = form.elements["email"].value;
  add_contact(email);
}
```



``` js
var mailing_list = [];

// 전역 변수에 접근하지 않도록 인자로 받아 복사하고 변경한 다음 리턴
function add_contact(mailing_list, email){
  var list_copy = mailing_list.slice();
  list_copy.push(email);
  return list_copy;
}

// 기존 함수가 리턴값을 전역 변수에 할당
function submit_form_handler(event){
  var form = event.target;
  var email = form.elements["email"].value;
  mailing_list = add_contact(mailing_list, email);
}
```



## 쓰면서 읽기도 하는 함수 분리하기

> 값을 바꾸는 동시에 배열의 첫 번째 항목을 리턴하는 .shift() 메서드를 카피-온-라이트로 바꾸기

### 1. 함수를 분리하기

- 책임이 확실히 분리되는 좋은 방법

1. 읽기와 쓰기 동작으로 분리하기

``` js
// 단순히 값을 리턴하는 읽기 함수
function first_element(array){
  return array[0];
}

// .shift()을 실행하고 결과값은 무시 (리턴 값이 없어 읽기 동작을 하지 않는다는 것을 강조)
function drop_first(array){
  array.shift();
}
```

2) 쓰기 동작을 카피-온-라이트로 바꾸기

``` js
function drop_first(array){
  var array_copy = array.slice();
  array_copy.shift();
  return array_copy;
}
```



### 2. 값을 두 개 리턴하기

1. 동작을 감싸기

```js
function shift(array){
  // .shift() 메서드를 바꿀 수 있도록 새로운 함수로 감쌈
  // 여기서 함수 리턴 값을 무시 X
  return array.shift();
}
```

2. 읽으면서 쓰기도 하는 함수를 읽기 함수로 바꾸기

``` js
function shift(array){
  // 인자를 복사
  var array_copy = array.slice();
  // 복사한 값의 첫 번째 항목을 지우고
  var first = array_copy.shift();
  // 지운 첫 번째 항목과 변경된 배열을 함께 리턴하도록 바꿈
  return {
    first : first,
    array : array_copy
  };
}
```

- 첫 번째 접근 방식을 사용해 두 값을 객체로 조합

``` js
function shift(array){
  return {
    first : first_elment(array),
    array : drop_first(array)
  };
}
```



### 연습 문제 

> `.pop()` 메서드를 카피-온-라이트 버전으로 바꾸기

1. 읽기 함수와 쓰기 함수로 분리

``` js
function last_element(array){
  return array[array.length -1];
}

function drop_last(array){
  array.pop();
}
```

2. 값 두 개를 리턴하는 함수로 만들기

``` js
function pop(array){
  var array_copy = array.slice();
  var first = array_copy.pop();
  return {
    first : first,
    array : array_copy
  };
}
```



> `.push()` 메서드를 카피-온-라이트 버전으로 만들고, 이를 이용해 add_contact() 함수 리팩터링

``` js
// 원래 함수
function add_contact(mailing_list, email){
  var list_copy = mailing_list.slice();
  list_copy.push(email);
  return list_copy;
}

// push 카피-온-라이트
function push(array, elem){
  var copy = array.slice();
  copy.push(elem);
  return copy;
}

// push에서 복사본 사용하므로 add_contact에 적을 필요 없음
function add_contact(mailing_list, email){
  return push(mailing_list, email);
}
```



> 배열 항목을 카피-온-라이트 방식으로 설정하는 arraySet() 함수

``` js
function arraySet(array, idx, value){
  var copy = array.slice();
  copy[idx] = value;
  return copy;
}
```



## 데이터 구조 읽기

- 변경 가능한 데이터를 읽는 것은 액션
- 쓰기는 데이터를 변경 가능한 구조로 만듦
- 어떤 데이터에 쓰기가 없다면 데이터는 변경 불가능한 데이터
- 불변 데이터 구조를 읽는 것은 계산
- 쓰기를 읽기로 바꾸면 코드에 계산이 많아짐



### 불변 데이터 구조

- 일반적으로 변경 가능한 데이터 구조보다 더 많은 메모리를 사용하고 느리지만 언제든 최적화할 수 있음
- 가비지 콜렉터 사용
- 데이터 구조의 최상위 단계만 복사하는 **얕은 복사(shallow copy)** 사용
  - 같은 메모리를 가리키는 참조에 대한 복사본을 만드는 **구조적 공유(structural sharing)**
  - 객체가 들어있는 배열이 있다면 배열만 복사하고, 안에 있는 객체는 참조로 공유



## 중첩된 쓰기를 읽기로 바꾸기

- 제품 이름으로 해당 제품의 가격을 바꾸는 쓰기 동작

```js
// 원래 코드
function setPriceByName(cart, name, price){
  for(var i = 0; i < cart.length; i++){
    if(cart[i].name === name)
      cart[i].price = price;
  }
}
```

- 중첩된 데이터 구조를 바꿔야하는 것으로, 가장 안 쪽에 있는 쓰기 동작부터 변경

``` js
// 카피-온-라이트로 고침
function setPriceByName(cart, name, price){
  var cartCopy = cart.slice();
  for(var i = 0; i < cartCopy.length; i++){
    if(cartCopy[i].name === name)
      // 중첩된 항목을 바꾸기 위해 카피-온-라이트 동작을 부름
      cartCopy[i] = setPrice(cartCopy[i], price);
  }
  return cartCopy;
}

function setPrice(item, new_price){
  var item_copy = Object.assign({}, item);
  item_copy.price = new_price;
  return item_copy;
}
```

- 배열 하나(장바구니)에 객체 세 개(티셔츠, 신발, 양말)이 있었다고 하면, 복사본은 배열 하나(장바구니)와 가격을 바꿀 객체 하나
  - 중첩된 데이터에 얕은 복사를 해서 구조적 공유가 됨

