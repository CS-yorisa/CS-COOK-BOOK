[TOC]

# Chapter 17. 타임라인 조율하기

> 타임라인을 조율하고 잘못된 실행 순서를 없애기 위한 **동시성 기본형** 구현

- **좋은 타임라인의 원칙**
  1. 타임라인은 적을수록 이해하기 쉬움
  2. 타임라인은 짧을수록 이해하기 쉬움
  3. 공유하는 자원이 적을수록 이해하기 쉬움
  4. 자원을 공유한다면 서로 조율해야 함
  5. <u>시간을 일급으로 다룸</u> → 이번 장에서 다룰 내용

<br>

## 성능 최적화 후 발생하는 버그 파악

> 장바구니에 대한 속도 개선과 제품 추가 버튼에 대한 최적화 후 발생하는 잘못된 합계 버그 원인 파악

```js
// 최적화하기 전 (동작) - 지난 장과 동일
function calc_cart_total(cart, callback) {
    var total = 0;
    cost_ajax(cart, function(cost) {
        total += cost;
        shipping_ajax(cart, function(shipping) {
            total += shipping;
            callback(total);
        });
    });
}

// 최적화한 후 (동작하지 않음)
function calc_cart_total(cart, callback) {
    var total = 0;
    cost_ajax(cart, function(cost) {
        total += cost;
    });
    // 해당 부분이 밖으로 나옴
    shipping_ajax(cart, function(shipping) {
        total += shipping;
        callback(total);
    });
}
```

> `cost_ajax(), shipping_ajax()` 두 요청이 <u>동시에 실행</u>되기 때문에 빠르지만, 이때문에 버그가 발생

### 다이어그램 그리기

1. 액션을 확인하기

2. 각 액션을 그리기

3. 단순화하기

   3-1. 액션을 통합하기

   3-2. 타임라인을 통합하기

- `cost_ajax()` 의 콜백이 완료되기 이전에 `shipping_ajax()` 내부에서 `callback(total)` 이 먼저 호출되는 버그 발생

<br>

## 모든 병렬 콜백 기다리기

> 병렬으로 요청되는 `cost_ajax(), shipping_ajax()` 의 콜백이 모두 완료되기까지 기다리는 **컷(Cut)** 구현

- 두 콜백이 완료되고 `callback(total)` 이 시작되는 사이에 위치
  - **컷(Cut)** 앞부분이 모두 완료되면, 뒷부분이 실행되어 순서를 보장해줌

```js
// 컷(Cut) 함수
function Cut(num, callback) {
    var num_finished = 0;
    return function() {
        num_finished += 1;
        // 함수가 num 만큼 실행되면 callback 을 호출
        if (num_finished === num) {
            callback();
        }
    };
}
```

```js
// 원래 코드에 Cut() 적용
function calc_cart_total(cart, callback) {
    var total = 0;
    // done 이 2회 실행되면 callback 호출
    var done = Cut(2, function() {
        callback(total);
    });
    cost_ajax(cart, function(cost) {
        total += cost;
        done();
    });
    shipping_ajax(cart, function(shipping) {
        total += shipping;
        done();
    });
}
```

> `cost_ajax(), shipping_ajax()` 에 있는 `done()` 이 모두 실행되어야 `callback(total)` 이 실행되게 됨

### 여러 번 클릭하는 경우 분석

> **컷(Cut)** 이 <u>두 번 이상 클릭</u>하는 경우에도 잘 동작하는지 분석

- 클릭에 대한 순서는 이전에 만든 **큐(Queue)** 에 의해 보장되고 있으며, 한 사이클은 **컷(Cut)** 이 완료되고 `callback(total)` 이 완료되는 범위
  - 두 번째 클릭이 동작하는 시점은 첫 번째 클릭의 **큐(Queue)** 가 끝나는 시점 → 순서가 보장됨

<br>

## 복잡성에 대한 고민

- **복잡성이 생기는 부분**
  1. **비동기 웹 요청**
     - ajax 요청을 사용하지 않으면 없앨 수 있지만, 작은 변경에도 페이지가 새로 고쳐지는 문제 발생
  2. **결과를 합쳐야 하는 두 개의 API 응답**
     - 두 개의 API 를 하나로 합치는 것은 복잡성을 서버로 옮긴 것 밖에 안됨 (서버의 복잡성 또한 백엔드 아키텍처에 따라 다름)
  3. **예측 불가능한 사용자의 액션**
     - 인터랙션을 제한하는 것은 사용자에게 좋지 않은 경험을 줄 수 있음

> 복잡성은 <u>바꾸지 않으려고 하는 선택들</u>로부터 생기기 때문에, 복잡성을 다룰 수 있는 **좋은 프로그래밍 기술**이 필요

<br>

## 딱 한 번만 호출하는 기본형

> <u>마지막 타임라인</u>이 `done()` 부르면 콜백을 실행하는 컷(Cut) 과 달리 <u>첫 번째 타임라인</u>이 `done()` 을 부르면 콜백이 실행되는 **동시성 기본형** 구현

- 액션을 여러 번 호출해도 한 번만 실행되도록 만드는 고차 함수 `JustOnce()` 구현 → 어떤 액션이든 **멱등원**으로 만들어 줌

  > **멱등원(idempotent)** : 최초 한 번만 효과가 발생하는 액션

```js
function JustOnce(action) {
    var alreadyCalled = false;
    return function(a, b, c) {
        // 실행한 적이 있다면 바로 종료
        if (alreadyCalled) {
            return;
        }
        alreadyCalled = true;
        return action(a, b, c);
    };
}

// 함수를 호출할 때마다 메시지 전달
function sendAddToCartText(number) {
    sendTextAjax(number, "Thanks for adding something to your cart. " + "Reply if you have any questions!");
}

var sendAddToCartTextOnce = JustOnce(sendAddToCartText);

sendAddToCartTextOnce("555-555-5555-55");
sendAddToCartTextOnce("555-555-5555-55");
sendAddToCartTextOnce("555-555-5555-55");
sendAddToCartTextOnce("555-555-5555-55");
```

> 고차 함수를 적용한 함수 `sendAddToCartTextOnce()` 를 여러 번 호출해도 **한 번만 실행됨**

<br>

## 암묵적 시간 모델 vs 명시적 시간 모델

- **자바스크립트의 (암묵적) 시간 모델**
  1. 순차적 구문은 순서대로 실행됨 (순서)
  2. 두 타임라인에 있는 단계는 왼쪽 먼저 실행되거나, 오른쪽 먼저 실행될 수 있음 (순서)
  3. 비동기 이벤트는 새로운 타임라인에서 실행됨 (순서)
  4. 액션은 호출할 때마다 실행됨 (반복)
- **암묵적 시간 모델**은 간단한 프로그램에서 좋지만, 애플리케이션에서 <u>필요한 실행 방식과 딱 맞을 일은 거의 없음</u>
  - 함수형 개발자는 필요한 실행 방식에 가깝게 새로운 **(명시적) 시간 모델**을 만듬 (ex. 큐, `JustOnce()` 등)
