# CH4. 액션에서 계산 빼내기

## MegaMart.com

```js
var shopping_cart = [];
var shopping_cart_total = 0;

function add_item_to_cart(name, price) {
  shopping_cart.push({
    name: name,
    price: price
  });
  calc_cart_total();
}

function calc_cart_total() {
  shopping_cart_total = 0;
  for(var i = 0; i < shopping_cart.length; i++) {
    var item = shopping_cart[i];
    shopping_cart_total += item.price;
  }
  set_cart_total_dom();
}
```

- 쇼핑몰의 장바구니에 속한 금액의 합계를 보여주는 기능
- 장바구니에 속하는 상품을 배열에 담고, 각 상품의 금액을 누적, 이후 DOM에 업데이트

```js
function update_shipping_icons() {
  var buy_buttons = get_buy_buttons_dom();
  for(var i = 0; i < buy_buttons.length; i++) {
    var button = buy_buttons[i];
    var item = button.item;
    if(item.price + shopping_cart_total >= 20)
      button.show_free_shipping_icon();
    else
      button.hide_free_shipping_icon();
  }
}

function calc_cart_total() {
  shopping_cart_total = 0;
  for(var i = 0; i < shopping_cart.length; i++) {
    var item = shopping_cart[i];
    shopping_cart_total += item.price;
  }
  set_cart_total_dom();
  update_shipping_icons();
}
```

- 새로운 요구사항 : 20달러 이상이면 무료 배송을 하기 위하여, 특정 상품을 추가하면 무료배송이 가능한지 나타내는 아이콘
- 절차적 방법으로 구현하면,
    - 페이지의 모든 구매 버튼을 가져와서, 금액이 추가되면 무료배송이 가능한지 확인한 후 아이콘 활성 또는 비활성화
    - 앞서 만든 장바구니 금액 총합을 계산하는 코드에서 무료배송 아이콘을 업데이트하는 함수를 실해아도록 변경

```js
function update_tax_dom() {
  set_tax_dom(shopping_cart_total * 0.10);
}

function calc_cart_total() {
  shopping_cart_total = 0;
  for(var i = 0; i < shopping_cart.length; i++) {
    var item = shopping_cart[i];
    shopping_cart_total += item.price;
  }
  set_cart_total_dom();
  update_shipping_icons();
  update_tax_dom();
}
```

- 새로운 요구사항 : 장바구니 금액이 바뀔 때마다 세금을 구하는 함수

## 테스트하기 쉽게 만들기

- 위의 코드는 비즈니스 규칙을 테스트하기 어려움
    - 코드가 변경 될 때마다 테스트해야 하는 내용들이 있음
        - 브라우저 설정하기, 페이지 로드하기, 장바구니에 제품 담기 버튼 클릭, DOM 업데이트 대기, DOM에서 값 가져오기, 문자열 값을 숫자로 변경, 예상하는 값 비교
    - 기존 코드의 DOM에서 값을 가져오거나 업데이트 하는 함수가, 실질적으로 값을 가져오거나 설정하는 유일한 수단이 됨

## 재사용하기 쉽게 만들기

- 외부에서 기존 코드를 사용하기 어려움
    - 장바구니 정보를 전역변수에서 읽어오지만, 외부에서는 DB에서 값을 읽어와야 할 수 있음
    - 결과를 보여주기 위해 DOM을 직접 변경하지만, 그 값을 활용해 영수증, 운송장에 활용해야 할 수 있음
- 따라서, 전역변수에 의존하거나, DOM에 항상 접근 가능하다고 가정하면 안 되며, 함수가 결과값을 리턴해야 함

## 액션과 계산, 데이터 구분

- 코드를 개선하기 위해서는 액션, 계산, 데이터를 구분하는 일을 가장 먼저 해야 함
- DOM을 읽거나 쓰는 행위, 전역 변수를 읽는 행위 등은 모두 액션이고, 따라서 전체 코드가 액션이 됨

## 함수의 입출력

- 모든 함수는 입력과 출력을 가질 수 있고, 입력과 출력은 명시적 또는 암묵적일 수 있음
    - 명시적 입출력에는 인자나 반환값이 속하고
    - 암묵적 입출력에는 전역변수를 읽거나 콘솔에 찍는 행위 등이 속함
- 함수에 암묵적 입출력이 있으면 액션이 됨

## 테스트와 재사용성은 입출력과 연관이 있음

- 더 좋은 코드를 만들기 위한 제안들
    - DOM 업데이트와 비즈니스 규칙은 분리
    - 전역변수가 없어져야 함
    - 전역변수에 의존하지 않아야 함
    - DOM을 사용할 수 있는 곳에서 실행한다고 가정하면 안 됨
    - 함수가 결과값을 리턴해야 함

## 액션에서 계산 빼내기 1

```js
function calc_cart_total() {
  shopping_cart_total = 0;
  for(var i = 0; i < shopping_cart.length; i++) {
    var item = shopping_cart[i];
    shopping_cart_total += item.price;
  }

  set_cart_total_dom();
  update_shipping_icons();
  update_tax_dom();
}
```

- 기존 코드
- 계산에 해당하는 부분과 액션에 해당하는 부분이 같이 있음

```js
function calc_cart_total() {
  calc_total();
  set_cart_total_dom();
  update_shipping_icons();
  update_tax_dom();
}

function calc_total() {
  shopping_cart_total = 0;
  for(var i = 0; i < shopping_cart.length; i++) {
    var item = shopping_cart[i];
    shopping_cart_total += item.price;
  }
}
```

- 기존 코드에서 계산으로 분리 가능한 부분을 추출 : **서브루틴 추출하기**
- 전역 변수를 사용하는 입력(`shopping_cart`)와 출력(`shopping_cart_total`)이 있음

```js
function calc_cart_total() {
  shopping_cart_total = calc_total();
  set_cart_total_dom();
  update_shipping_icons();
  update_tax_dom();
}

function calc_total() {
  var total = 0;
  for(var i = 0; i < shopping_cart.length; i++) {
    var item = shopping_cart[i];
    total += item.price;
  }
  return total;
}
```

- 암묵적 출력 제거

```js
function calc_cart_total() {
  shopping_cart_total = calc_total(shopping_cart);
  set_cart_total_dom();
  update_shipping_icons();
  update_tax_dom();
}

function calc_total(cart) {
  var total = 0;
  for(var i = 0; i < cart.length; i++) {
    var item = cart[i];
    total += item.price;
  }
  return total;
}
```

- 암묵적 입력 제거

## 액션에서 계산 빼내기 2

```js
function add_item_to_cart(name, price) {
  shopping_cart.push({
    name: name,
    price: price
  });

  calc_cart_total();
}
```

- 기존 코드
- 전역변수를 사용하여 입출력을 적용한 부분이 있음

```js
function add_item_to_cart(name, price) {
  add_item(name, price);
  calc_cart_total();
}

function add_item(name, price) {
  shopping_cart.push({
    name: name,
    price: price
  });
}
```

- 계산을 추가하여 함수로 분리
- 전역변수를 사용한 입출력을 하고 있는 문제가 있음

```js
function add_item_to_cart(name, price) {
  add_item(shopping_cart, name, price);
  calc_cart_total();
}

function add_item(cart, name, price) {
  cart.push({
    name: name,
    price: price
  });
}
```

- 전역변수를 사용하는 대신 인자로 받아서 사용
- 암묵적 출력이 여전히 남아 있는 상태

```js
function add_item_to_cart(name, price) {
  shopping_cart = add_item(shopping_cart, name, price);
  calc_cart_total();
}

function add_item(cart, name, price) {
  var new_cart = cart.slice();
  new_cart.push({
    name: name,
    price: price
  });
  return new_cart;
}
```

- 암묵적 출력을 제거, 지연변수와 함수 반환값 사용
- 위의 두가지 예시를 적용한다면, 이전에 제시되었던 문제들, DOM을 읽거나 쓰는 문제, 전역변수 활용 문제 등은 해결됨
- 위의 과정은 순서대로 다음과 같은 방식으로 리팩토링을 진행함
    - 코드를 선택하고 추출, 암묵적 입출력 제거

## 연습 문제

```js
 // before
function update_tax_dom() {
  set_tax_dom(shopping_cart_total * 0.10);
}

//after
function update_tax_dom() {
  set_tax_dom(calc_tax(shopping_cart_total));
}

function calc_tax(amount) {
  return amount * 0.10;
}
```

- 세금을 계산하는 코드에 적용

## 연습 문제

```js
// before
function update_shipping_icons() {
  var buy_buttons = get_buy_buttons_dom();
  for(var i = 0; i < buy_buttons.length; i++) {
    var button = buy_buttons[i];
    var item = button.item;
    if(item.price + shopping_cart_total >= 20)
      button.show_free_shipping_icon();
    else
      button.hide_free_shipping_icon();
  }
}

// after
function update_shipping_icons() {
  var buy_buttons = get_buy_buttons_dom();
  for(var i = 0; i < buy_buttons.length; i++) {
    var button = buy_buttons[i];
    var item = button.item;
    if(gets_free_shipping(item.price))
      button.show_free_shipping_icon();
    else
      button.hide_free_shipping_icon();
    }
  }

function gets_free_shipping(item_price) {
  return item_price + shopping_cart_total >= 20;
}
```

- 무료 배송 아이콘과 관련한 코드에 적용
