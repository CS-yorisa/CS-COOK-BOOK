# CH 7. 방어적 복사

- 바꿀 수 없는 라이브러리나 레거시 코드가 데이터를 변경한다면 카피-온-라이트 적용 불가능
- 데이터를 변경하지 않고 데이터를 교체할 수 있는 **방어적 복사(defensive copy)** 만들기



## 복사본 만들기

### 신뢰할 수 없는 코드 > 안전지대 

- 바뀔 수도 있는 데이터가 신뢰할 수 없는 코드에서 안전지대*로 들어옴
  - 안전지대 : 불변성이 지켜지는 상태
- 들어온 데이터로 깊은 복사본을 만들고 변경 가능한 원본은 무시

### 안전지대 > 신뢰할 수 없는 코드

- 안전지대 밖으로 나가는 데이터도 **깊은 복사***본을 만들어 내보냄
  - 원본의 어떤 데이터 구조도 공유하지 않으며 중첩된 모든 객체나 배열을 복사
  - 자바스크립트는 Lodash의 `.cloneDeep()`함수 사용 추천
  - 비공유 아키텍처(shared nothing architecture)를 구현하기 좋음
- 데이터가 바뀌어도 원본은 안전지대에 있어 영향 없음

> 안전지대의 불변성을 유지하고, 바뀔 수도 있는 데이터가 안전지대로 들어오지 못하도록 하는 것이 방어적 복사의 목적
>
> 불변성을 위한 완전한 방법으로 다른 원칙이 없어도 쓸 수 있음



## 방어적 복사 구현

- 안전지대에 신뢰할 수 없는 코드가 추가됨

``` js
function add_item_to_cart(name, price){
  var item = make_cart_item(name, price);
  shopping_cart = add_item(shopping_cart, item);
  var total = calc_total(shopping_cart);
  set_cart_total_dom(total);
  update_shipping_icons(shopping_cart);
  update_tax_dom(total);
  
  // 신뢰할 수 없는 코드
  black_friday_promotion(shopping_cart);
}
```

- 깊은 복사 수행

``` js
function add_item_to_cart(name, price){
  var item = make_cart_item(name, price);
  shopping_cart = add_item(shopping_cart, item);
  var total = calc_total(shopping_cart);
  set_cart_total_dom(total);
  update_shipping_icons(shopping_cart);
  update_tax_dom(total);
  
  // 데이터 전달하기 전에 복사
  var cart_copy = deepCopy(shopping_cart);
  // 신뢰할 수 없는 코드
  black_friday_promotion(cart_copy);
  // cart_copy 의 참조를 가진 black ... 이 데이터를 바꿀 수 있으므로
  // 들어오는 데이터를 위한 복사
  shopping_cart = deepCopy(cart_copy);
}
```



### 규칙

1. 데이터가 안전한 코드에서 나갈 때 복사하기
   1. 불변성 데이터를 위한 깊은 복사본 생성
   2. 신뢰할 수 없는 코드로 복사본을 전달
2. 안전한 코드로 데이터가 들어올 때 복사하기
   1. 변경될 수도 있는 데이터가 들어오면 바로 깊은 복사본을 만들어 안전한 코드로 전달
   2. 복사본을 안전한 코드에서 사용



> 코드의 이해 및 재사용을 위해 방어적 복사 코드를 **분리하여 새로운 함수**로 만드는 것이 좋음



## 연습 문제

> 급여 계산을 위한 외부 라이브러리
>
> payrollCalc()에 모든 직원 배열을 넘기면 급여가 배열로 리턴되나 신뢰할 수 없는 코드
>
> 직원 배열이 바뀔 수도 있고, 급여 계산에 영향을 끼칠 수도 있어 방어적 복사 적용 필요

``` js
function payrollCalc(employees){
  ...
  return payrollChecks
}
```

- 방어적 복사 적용한 새로운 함수

``` js
function payrollCalcSafe(employees){
  var copy = deepCopy(employees);
  var payrollChekcs = payrollCalc(copy);
  return deepCopy(payrollChecks);
}
```



> 사용자 정보가 바뀔 때마다 바뀐 사용자 정보를 알 수 있는 레거시 시스템
>
> 구독하는 모든 코드는 같은 사용자 데이터를 전달 받으며, 모두 참조 값으로 메모리의 같은 객체를 가리키고 있음 
>
> 사용자 데이터는 신뢰할 수 없는 코드로부터 유입. 방어적 복사로 사용자 데이터 보호 (나가는 데이터 X)

``` js
// 사용자 구독 함수 사용 예제
// 콜백함수를 넘기며 모든 콜백함수는 같은 사용자 데이터 참조를 받음
userChanges.subscribe(function(user){
  processUser(user); // 안전지대에 있는 함수
});
```

- 방어적 복사 적용

``` js
userChanges.subscribe(function(user){
  var userCopy = deepCopy(user);
  processUser(userCopy);
});
```





## 방어적 복사 예시

### 웹 API

- 대부분의 웹 기반 API는 암묵적으로 방어적 복사 진행
- JSON 데이터가 API에 요청으로 들어온 상황
  - 클라이언트는 데이터를 인터넷을 통해 API로 보내려고 직렬화 (이때 JSON 데이터는 깊은 복사본)
  - 서비스가 잘 동작한다면 JSON으로 응답 (이때 JSON도 깊은 복사본)
  - 서비스에 들어올 때나 나갈 때 데이터를 복사
- 방어적 복사로 서로 다른 코드와 원칙을 가진 서비스들이 문제없이 통신 가능



### 얼랭과 엘릭서에서 방어적 복사

- 얼랭, 엘릭서라는 함수형 프로그래밍 언어에서 구현이 잘 되어 있음
- 프로세스가 서로 메시지를 주고받을 때 수신자의 메일 박스에 메시지가 복사
- 프로세스에서 데이터가 나갈 때도 데이터를 복사
- 고가용성을 보장하는 핵심 기능



## 카피-온-라이트 vs 방어적 복사

|           | 카피-온-라이트                                               | 방어적 복사                                                  |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 사용 시점 | 통제할 수 있는 데이터를 바꿀 때                              | 신뢰할 수 없는 코드와 데이터를 주고받아야 할 때              |
| 사용 위치 | 안전지대 어디에서나 사용 가능<br /><br />카피-온-라이트가 불변성을 가진 안전지대를 생성 | 안전지대의 경계에서 데이터가 오고 갈 때                      |
| 복사 방식 | 얕은 복사 (상대적으로 적은 비용)                             | 깊은 복사 (상대적으로 많은 비용)                             |
| 규칙      | 1. 바꿀 데이터의 얕은 복사 생성<br />2. 복사본을 변경<br />3. 복사본을 리턴 | 1. 안전지대로 들어오는 데이터에 깊은 복사 생성<br />2. 안전지대에서 나가는 데이터에 깊은 복사 생성 |

- 복사본이 많이 필요하지 않기 때문에 카피-온-라이트를 더 많이 사용