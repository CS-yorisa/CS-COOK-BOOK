[TOC]

# Chapter 05. 더 좋은 액션 만들기

> 액션에서 암묵적 입력과 출력을 줄여 설계를 개선하는 방법

<br>

## 비즈니스 요구 사항에 맞추기

### 더 나은 추상화 단계 선택

- `gets_free_shipping` 함수를 **장바구니 제품의 무료 배송 확인**이라는 요구 사항에 맞게 인자 변경

  - 인자 : `total, item_price` (합계, 가격) → `cart` (entity 타입)
  - `calc_total` 함수를 `gets_free_shipping` 함수에 재사용하면서 동시에 중복도 제거

  ```js
  /* 원래 코드 */
  // function gets_free_shipping(total, item_price) {
  //     return item_price + total >= 20;
  // }
  ```

  ```js
  // 새 시그니처를 적용한 코드
  function gets_free_shipping(cart) {
      return calc_total(cart) >= 20;
  }
  ```

- `gets_free_shipping` 함수가 사용되는 `update_shipping_icons` 함수도 수정 (<u>함수의 시그니처가 변경</u>되었기 때문에 → 리팩터링X)

  ```js
  function update_shipping_icons() {
      var buttons = get_buy_buttons_dom();
      for (var i = 0; i < buttons.length; i++) {
          var button = buttons[i];
          var item = button.item;
          
          /* 원래 코드 */
          // if (gets_free_shipping(shopping_cart_total, item.price)) {
          //     button.show_free_shipping_icon();
          // } else {
          //     button.hide_free_shipping_icon();
          // }
          
          /* 새 시그니처를 적용한 코드 */
          var new_cart = add_item(shopping_cart, item.name, item.price);
          if (gets_free_shipping(new_cart)) {
              button.show_free_shipping_icon();
          } else {
              button.hide_free_shipping_icon();
          }
      }
  }
  ```

  > `add_item()` 함수를 부를 때마다 배열의 복사본을 만들면 배열을 바꾸는 것보다 큰 비용이 발생하지만, 최신 프로그래밍 언어에서는 그리 크지 않음
  >
  > 오히려 기존의 값을 바꾸지 않으면서 얻는 장점도 있고, 성능은 최적화를 통해 개선할 수 있음

<br>

## 암묵적 입력과 출력 줄이기

> 암묵적 입력과 출력을 명시적으로 바꿔 모듈화된 컴포넌트로 바꾸기

- 액션의 암묵적 입력을 <u>명시적 입력</u>인 **인자**로 변경

  - `update_shipping_icons` 함수에 적용

  ```js
  // [Before] function update_shipping_icons() {
  function update_shipping_icons(cart) { // 명시적 인자 추가
      var buttons = get_buy_buttons_dom();
      for (var i = 0; i < buttons.length; i++) {
          var button = buttons[i];
          var item = button.item;
          // [Before] var new_cart = add_item(shopping_cart, item.name, item.price);
          var new_cart = add_item(cart, item.name, item.price); // 전역변수 대신 인자로 변경
          if (gets_free_shipping(new_cart)) {
              button.show_free_shipping_icon();
          } else {
              button.hide_free_shipping_icon();
          }
      }
  }
  ```

  - 함수 시그니처가 변경됨에 따라 호출하는 `calc_cart_total` 함수도 변경

  ```js
  function calc_cart_total() {
      shopping_cart_total = calc_total(shopping_cart);
      set_cart_total_dom();
      // [Before] update_shipping_icons();
      update_shipping_icons(shopping_cart); // 인자로 전달
      update_tax_dom();
  }

- 다른 액션들에서도 <u>전역변수를 읽는 부분</u>을 인자로 바꾸기

  ```js
  function add_item_to_cart(name, price) {
      shopping_cart = add_item(shopping_cart, name, price);
      // [Before] calc_cart_total();
      calc_cart_total(shopping_cart); // 인자로 전달
  }
  
  // [Before] function calc_cart_total() {
  function calc_cart_total(cart) { // 명시적 인자 추가
      /* [Before]
      	shopping_cart_total = calc_total();
      	set_cart_total_dom();
      	update_shipping_icons(shopping_cart);
      	update_tax_dom();
      */
      
      var total = calc_total(cart); // 인자로 전달
      set_cart_total_dom(total);
      update_shipping_icons(cart);
      update_tax_dom(total);
      shopping_cart_total = total; // 어디서도 읽지 않는 전역변수가 됨 → 불필요한 코드
  }
  
  // [Before] function update_tax_dom() {
  function update_tax_dom(total) { // 명시적 인자 추가
      // [Before] set_tax_dom(calc_tax(shopping_cart_total));
      set_tax_dom(calc_tax(total)); // 인자로 전달
  }
  ```

- 조금 과한 `calc_cart_total` 함수와 사용하지 않는 `shopping_cart_total` 변수 정리

  ```js
  function add_item_to_cart(name, price) {
      shopping_cart = add_item(shopping_cart, name, price);
      
      var total = calc_total(cart);
      set_cart_total_dom(total);
      update_shipping_icons(cart);
      update_tax_dom(total);
  }
  ```

  > `calc_cart_total` 함수를 `add_item_to_cart` 함수 안으로 옮기고, `shopping_cart_total` 변수는 삭제

<br>

## 계산 분류하기

> 계산을 **의미 있는 계층(C, I, B)**으로 분류하기

- C : cart 에 대한 동작
- I : item 에 대한 동작
- B : 비즈니스 규칙

```js
function add_item(cart, name, price) { // C, I
    var new_cart = cart.slice();
    new_cart.push({
        name: name,
        price: price
    });
    return new_cart;
}

function calc_total(cart) { // C, I, B (MegaMart 에서 합계를 결정하는 비즈니스 규칙도 포함)
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        total += item.price;
    }
    return total;
}

function gets_free_shipping(cart) { // B
    return calc_total(cart) >= 20;
}

function calc_tax(amount) { // B
    return amount * 0.10;
}
```

<br>

## 계층에 따라 함수 분리하기

- `add_item` 함수를 계층에 따라 분리하고, **카피-온-라이트 패턴**을 별도로 빼기

  ```js
  // item 계층을 다루는 함수를 따로 분리
  function make_cart_item(name, price) {
      return {
          name: name,
          price: price
      };
  }
  
  // 카피-온-라이트 패턴을 별도로 일반화하여 유틸리티 함수로 활용 (배열이 필요한 로직에 재사용)
  function add_element_last(array, elem) {
      var new_array = array.slice();
      new_array.push(elem);
      return new_array;
  }
  
  function add_item(cart, item) {
      return add_element_last(cart, item);
  }
  ```

- 변경된 `add_item` 사용하기

  ```js
  function add_item_to_cart(name, price) {
      // [Before] shopping_cart = add_item(shopping_cart, name, price);
      var item = make_cart_item(name, price); // item 생성
      shopping_cart = add_item(shopping_cart, item); // 'name, price' 대신 item 전달
      
      var total = calc_total(cart);
      set_cart_total_dom(total);
      update_shipping_icons(cart);
      update_tax_dom(total);
  }
  ```

<br>

## 수정된 계산 분류하기

- C : cart 에 대한 동작
- I : item 에 대한 동작
- B : 비즈니스 규칙
- A : 배열 유틸리티

```js
function add_element_last(array, elem) { // A
    var new_array = array.slice();
    new_array.push(elem);
    return new_array;
}

function add_item(cart, item) { // C
    return add_element_last(cart, item);
}

function make_cart_item(name, price) { // I
    return {
        name: name,
        price: price
    };
}
```

### 액션(A)/계산(C)/데이터(D) 분류

- **액션(A)** : `shopping_cart`, `add_item_to_cart`, `update_shipping_icons`, `update_tax_dom`
  - 전역변수, 전역변수 읽기, DOM 수정 등
- **계산(C)** : `add_element_last`, `add_item`, `make_cart_item`, `calc_total`, `gets_free_shipping`, `calc_tax`
  - 암묵적 입력과 출력이 없음
