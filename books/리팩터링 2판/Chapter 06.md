# 06. 기본적인 리팩터링

## 6.1 함수 추출하기

- 반대 리팩터링 : 함수 인라인하기 (6.2)

``` js
function printOwing(invoice){
  printBanner();
  let outstanding = calculateOutstanding();
  
  // 세부 사항 출력
  console.log('고객명 : ${invoice.customer}');
  console.log('채무액 : ${outstanding}');
}
```

``` js
function printOwing(invoice){
  printBanner();
  let outstanding = calculateOutstanding();
  printDetails(outstanding);
  
  function printDetails(outstanding){
    console.log('고객명 : ${invoice.customer}');
  	console.log('채무액 : ${outstanding}');
  }
}
```

- 함수 추출 기준은 **목적과 구현을 분리하는 방식**이 가장 합리적
- 성능 문제?
  - 함수가 짧으면 함수 호출이 많아져 성능이 느려지지 않을까? > 함수가 짧으면 캐싱하기 더 쉽기 때문에 컴파일러가 최적화하는데 유리할 때가 많음




### 절차

1. 함수를 새로 만들고 목적을 잘 드러내는 이름을 붙인다 ('어떻게'가 아닌 '무엇을' 하는지가 드러나야 함)

   - 대상 코드가 간단하더라도, 함수로 뽑아서 목적이 더 잘드러나는 이름을 붙일 수 있다면 추출
   - 함수로 추출해서 사용해보고 효과가 크지 않으면 다시 원래 상태로 인라인

2. 추출할 코드를 원본 함수에서 복사하여 새 함수에 붙여넣는다

3. 추출한 코드 중 원본 함수의 지역 변수를 참조하거나 추출한 함수의 유효범위를 벗어나는 변수는 없는지 검사한다. 있으면 매개변수로 전달한다

   - 원본 함수의 중첩함수로 추출할 때는 이런 문제가 생기지 않음
   - 지역 변수와 매개변수 모두 인수로 전달하여 해결
   - 추출한 코드에서만 사용하는 변수가 추출 함수 밖에 선언되어 있다면 추출한 함수안에서 선언되도록 변경
   - 추출한 코드 안에서 값이 바뀌는 변수에 주의하고, 추출한 코드를 질의 함수로 취급하여 그 결과를 해당 변수에 대입
   - 추출한 코드에서 값을 수정하는 지역 변수가 너무 많다면 함수 추출 대신, 변수 쪼개기(9.1)나, 임시 변수를 질의 함수로 바꾸기(7.4)와 같은 다른 리팩터링 적용하여 코드를 단순하게 바꾼 후 함수 추출 시도

4. 변수를 다 처리했다면 컴파일 한다.

5. 원본 함수에서 추출한 코드 부분을 새로 만든 함수를 호출하는 문장으로 변경한다.

6. 테스트한다.

7. 다른 코드에 방금 추출한 것과 똑같거나 비슷한 코드가 없는지 살핀다. 있다면 방금 추출한 새 함수를 호출하도록 바꿀지 검토한다.

   

### 예시 : 유효 범위를 벗어나는 변수가 없을 때

- 기존 코드

``` js
function printOwing(invoice){
  let outstanding = 0;
  
  console.log("*****************");
  console.log("**** 고객 채무 ****");
  console.log("*****************");
  
  // 미해결 채무(outstanding)를 계산
  for (const o of invoice.orders){
    outstanding += o.amount;
  }
  
  // 마감일(dueDate)을 기록한다.
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  
  // 세부 사항을 출력한다.
  console.log(`고객명 : ${invoice.customer}`);
  console.log(`채무액 : ${outstanding}`);
  console.log(`마감일 : ${invoice.dueDate.toLocalDateString()}`);
}
```

- 추출

``` js
function printOwing(invoice){
  let outstanding = 0;
  
  printBanner(); // 배너 출력 로직을 함수로 추출
  
  // 미해결 채무(outstanding)를 계산
  for (const o of invoice.orders){
    outstanding += o.amount;
  }
  
  // 마감일(dueDate)을 기록한다.
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  
  printDetails(); // 세부 사항을 출력로직을 함수로 추출
  
  function printDetails(){ // 중첩함수
    console.log(`고객명 : ${invoice.customer}`);
    console.log(`채무액 : ${outstanding}`);
    console.log(`마감일 : ${invoice.dueDate.toLocalDateString()}`);
  }
}

function printBanner(){
  console.log("*****************");
  console.log("**** 고객 채무 ****");
  console.log("*****************");
}


```

- `printDetails()` 가 `printOwing()`에 중첩되도록 정의하여 추출한 함수에서 `printOwing`에 정의된 모든 변수에 접근할 수 있게 함
- 중첩 함수를 지원하지 않는 언어에서는 함수를 최상위 수준으로 추출하는 문제로 볼 수 있고, 원본 함수에서만 접근할 수 있는 변수들에 특별히 신경써서 리팩터링



### 예시 : 지역 변수를 사용할 때

``` js
function printOwing(invoice){
  let outstanding = 0;
  
  printBanner(); // 배너 출력 로직을 함수로 추출
  
  // 미해결 채무(outstanding)를 계산
  for (const o of invoice.orders){
    outstanding += o.amount;
  }
  
  // 마감일(dueDate)을 기록한다.
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  
  printDetails(invoice, outstanding); // 앞과 다르게 지역 변수를 매개 변수로 전달
 
}

function printDetails(invoice, outstanding){
  console.log(`고객명 : ${invoice.customer}`);
  console.log(`채무액 : ${outstanding}`);
  console.log(`마감일 : ${invoice.dueDate.toLocalDateString()}`);
}
```

``` js
function printOwing(invoice){
  let outstanding = 0;
  
  printBanner(); // 배너 출력 로직을 함수로 추출
  
  // 미해결 채무(outstanding)를 계산
  for (const o of invoice.orders){
    outstanding += o.amount;
  }
  
  recordDueDate(invoice); // 마감일 설정 로직을 함수로 추출
  printDetails(invoice, outstanding);
 
}

function recordDueDate(invoice){
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
}
```



### 예시 : 지역 변수의 값을 변경할 때

- 매개 변수에 값을 대입하는 코드를 발견하면 곧 바로 그 변수를 쪼개서 (9.1) 임시 변수를 새로 하나 만들어 그 변수에 대입하게 함



- 선언문을 변수가 사용되는 코드 근처로 슬라이드

``` js
function printOwing(invoice){
  
  printBanner(); // 배너 출력 로직을 함수로 추출
  
  // 미해결 채무(outstanding)를 계산
  let outstanding = 0; // 맨 위에 있던 선언문을 이 위치로 이동
  for (const o of invoice.orders){
    outstanding += o.amount;
  }
  
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
 
}
```

- 추출할 부분을 새로운 함수로 복사

``` js
function printOwing(invoice){
  
  printBanner(); // 배너 출력 로직을 함수로 추출
  
  // 미해결 채무(outstanding)를 계산
  let outstanding = 0;
  for (const o of invoice.orders){
    outstanding += o.amount;
  }
  
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
 
}

function calculateOutStanding(invoice){
  let outstanding = 0; // 추출할 코드 복사
  for (const o of invoice.orders){
    outstanding += o.amount;
  }
  return outstanding; // 수정된 값 반환
}
```

- 추출한 코드의 원래 자리를 새로 뽑아낸 함수를 호출하는 문장으로 교체 / 반환값 이름 바꾸기

``` js
function printOwing(invoice){
  
  printBanner(); // 배너 출력 로직을 함수로 추출
  
  // 함수 추출 완료, 함수가 반환한 값을 원래 변수에 저장
  // 원본 변수인 outstanding에 const를 붙여 불변으로 만듦
  const outstanding =  calculateOutstanding(invoice);
  
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
 
}

function calculateOutStanding(invoice){
  let result = 0;
  for (const o of invoice.orders){
    result += o.amount;
  }
  return result;
}
```



> 값을 반환할 변수가 여러개라면?
>
> - 각각을 반환하는 함수 여러 개로 만든다
> - 굳이 한 함수에서 여러 값을 반환해야 한다면, 임시 변수를 질의 함수로 바꾼다거나 변수를 쪼개는 식으로 처리



## 6.2 함수 인라인하기

- 반대 리팩터링 : 함수 추출 하기 (6.1)

``` js
function getRating(driver){
  return moreThanFiveLateDeliveries(driver) ? 2 : 1;
}

function morThanFiveLateDeliveries(driver){
  return driver.numberOfLateDeliveries > 5;
}
```

``` js
function getRating(driver){
  eturn driver.numberOfLateDeliveries > 5 ? 2 : 1;
}
```



- 함수 본문이 이름 만큼 명확한 경우 해당 함수 제거
- 쓸데 없는 간접 호출은 불필요. 간접 호출을 너무 과하게 쓰는 코드들도 인라인 대상.



### 절차

1. 다형 메서드(polymorphic method)인지 확인한다
   - 서브 클래스에서 오버라이드 하는 메서드는 인라인하면 안 된다.
2. 인라인할 함수를 호출하는 곳을 모두 찾는다.
3. 각 호출문을 함수 본문으로 교체한다.
4. 하나씩 교체할 때마다 테스트한다.
5. 함수 정의(원래 함수)를 삭제한다.



- 재귀 호출, 반환문이 여러개인 함수, 접근자가 없는 다른 객체에 메서드를 인라인 할 경우 등은 함수 인라인하기를 적용하지 않는게 낫다.



### 예시

``` js
function reportLines(aCustomer){
  const lines = [];
  gatherCustomerData(lines, aCustomer);
  return lines;
}

function gatherCustomerData(out, aCustomer){
  out.push(["name", aCustomer.name]);
  out.push(["location", aCustomer.location]);
}
```

- 단순히 잘라 붙이는 식으로는 인라인할 수 없음
- 여러 문장을 호출한 곳으로 옮기기(8.4)를 적용하여 한 번에 한 문장씩 옮기기

``` js
function reportLines(aCustomer){
  const lines = [];
  lines.push(["name", aCustomer.name]);
  lines.push(["location", aCustomer.location]);
  return lines;
}
```

- 핵심은 항상 단계를 잘게 나눠서 처리하는 데에 있음



## 6.3 변수 추출하기

- 반대 리팩터링 : 변수 인라인 하기(6.4)

``` js
return order.quantity * order.itemPrice - Math.max(0, order.quantity - 500) * order.itemPrice * 0.05 + Math.min(order.quantity * order.itemPrice * 0.1, 100);
```

``` js
const basePrice = order.quantity * order.itemPrice;
const quantityDiscount = Math.max(0, order.quantity - 500) * order.itemPrice * 0.05;
const shipping = Math.min(basePrice * 0.1, 100);
return basePrice - quantityDiscount + shipping;
```

- 지역 변수를 활용하여 표현식을 쪼개 관리하기 쉽게 만들고, 코드의 목적을 명확하게 드러낼 수 있음
  - 디버거에 중단점(breakpoint)을 지정하거나, 상태를 출력하는 문장을 출력할 수 있어 디버깅에도 도움이됨
- 현재 함수 안에서만 의미가 있다면 변수로 추출하지만, 함수를 벗어난 넓은 문맥에서까지의 의미가 된다면 함수로 추출해야함 (다른 코드에서의 재사용성 고려)



### 절차

1. 추출하려는 표현식에 부작용은 없는지 확인한다
2. 불변 변수를 하나 선언하고 이름을 붙일 표현식의 복제본을 대입한다
3. 원본 표현식을 새로 만든 변수로 교체한다
4. 테스트한다
5. 표현식을 여러 곳에서 사용한다면 각각을 새로 만든 변수로 교체하며 테스트한다



### 예시 : 클래스 안에서

``` js
class Order{
  constructor(aRecord){
    this._data = aRecord;
  }
  
  get quantity() {
    return this._data.quantity;
  }
  get itemPrice() {
    return this._data.itemPrice;
  }
  
  get Price(){
    return this.quantity * this.itemPrice - Math.max(0, this.quantity - 500) * this.itemPrice ** 0.05 + Math.min(this.quantity * this.itemPrice * 0.1, 100);
  }
}
```

- 추출하려는 이름이 가격을 계산하는  price() 메서드 범위를 넘어, 주문을 표현하는 Order 클래스 전체에 적용됨 (메서드로 추출)

``` js
class Order{
  constructor(aRecord){
    this._data = aRecord;
  }
  
  get quantity() {
    return this._data.quantity;
  }
  get itemPrice() {
    return this._data.itemPrice;
  }
  
  get Price(){
    return this.base - this.quantityDiscount + this.shipping;
  }
  
  get basePrice(){
    return this.quantity * this.itemPrice;
  }
  get quantityDiscount(){
    return Math.max(0, this.quantity - 500) * this.itemPrice ** 0.05;
  }
  get shipping(){
     return Math.min(this.quantity * this.itemPrice * 0.1, 100);
  }
}
```

- 객체는 특정 로직과 데이터를 외부와 공유하려 할 때 공유할 정보를 설명해주는 적당한 크기의 문맥이 되어줌
- 덩치가 큰 클래스에서 공통 동작을 별도 이름으로 뽑아내어 추상화해두면 그 객체를 다룰 때 쉽게 활용할 수 있어서 매우 유용함



## 6.4 변수 인라인하기

- 반대 리팩터링 : 변수 추출하기

``` js
let basePrice = anOrder.basePrice;
return (basePrice > 1000);
```

``` js
return anOrder.basePrice > 1000;
```

- 변수 이름이 원래 표현식과 다를 바 없거나, 주변 코드를 리팩터링하는 데 방해가 될 때 인라인



### 절차

1. 대입문의 우변(표현식)에서 부작용이 생기지 않는지 확인한다
2. 변수가 불변으로 선언되지 않았다면 불변으로 만든 후 테스트한다
3. 이 변수를 가장 처음 사용하는 코드를 찾아서 대입문 우변의 코드로 바꾼다.
4. 테스트한다
5. 변수를 사용하는 부분을 모두 교체할 때까지 이 과정을 반복한다
6. 변수 선언문과 대입문을 지운다
7. 테스트한다



## 6.5 함수 선언 바꾸기

``` js
function circum(radius){ // 주위를 의미하는 접두어
  ...
}
```

``` js
function circumference(radius){ // 둘레 (이름을 너무 축약해두어서 쉽게 바꿈)
  ...
}
```

- 함수는 프로그램을 작은 부분으로 나누는 주된 수단
- 함수 선언은 각 부분이 서로 맞물리는 방식을 표현하며, 소프트웨어 시스템의 구성요소를 조립하는 연결부 역할
- 함수의 이름이 좋으면 함수의 구현 코드를 살펴볼 필요 없이 호출문만 보고도 무슨 일을 하는지 파악할 수 있음
- 매개변수는 함수를 사용하는 문맥을 설정하므로 매개변수를 올바르게 선택하는 것도 중요함



### 절차

#### 간단한 절차

1. 매개변수를 제거하려거든 먼저 함수 본문에서 제거 대상 매개변수를 참조하는 곳은 없는지 확인한다.
2. 메서드 선언을 원하는 형태로 바꾼다.
3. 기존 메서드 선언을 참조하는 부분을 모두 찾아서 바뀐 형태로 수정한다.
4. 테스트한다.

- 변경할 게 둘 이상(이름 변경과 매개 변수 추가를 모두 하고 싶을 경우)이면 나눠서 처리



#### 마이그레이션 절차

1. 이어지는 추출 단계를 수월하게 만들어야 한다면 함수 본문을 적절히 리팩터링한다.
2. 함수 본문을 새로운 함수로 추출(6.1)한다.
   - 새로 만들 함수 이름이 기존 함수와 같다면 일단 검색하기 쉬운 이름을 임시로 붙여둔다
3. 추출한 함수에 매개변수를 추가해야 한다면 '간단한 절차'를 따라 추가한다.
4. 테스트한다.
5. 기존 함수를 인라인(6.2)한다.
6. 이름을 임시로 붙여뒀다면 함수 선언 바꾸기를 한 번 더 적용해서 원래 이름으로 되돌린다.
7. 테스트한다.



- 다형성을 구현한 클래스, 즉 상속 구조 속에 있는 클래스의 메서드를 변경할 때는 다형 관계인 다른 클래스들에도 변경이 반영되어야 함
- 간접 호출 방식으로 원하는 형태의 메서드를 새로 만들어서 원래 함수를 호출하는 전달 메서드로 활용하는 우회 방법도 있음



### 예시 : 함수 이름 바꾸기 (마이그레이션 절차)

``` js
function circum(radius){
  return circumference(radius);
}

// 함수 본문 전체를 새로운 함수로 추출(6.1)
function circumference(radius){
  return 2 * Math.PI * radius;
}
```

- 수정한 코드를 테스트한 뒤 예전 함수를 인라인(6.2)하면, 예전 함수를 호출하는 부분이 모두 새 함수를 호출하도록 바뀜
- 함수 선언 바꾸기는 공개된 API(직접 수정할 수 없는 외부 코드가 사용하는 부분)를 리팩터링하기 좋음



### 예시 : 매개변수 추가하기

``` js
// 도서 관리 프로그램의 Book 클래스에 예약 기능이 구현되어 있음
addReservation(customer){
  this._reservations.push(customer);
}
```

- 예약 시 우선순위 큐를 지원하라는 새로운 요구 추가
- `addReservation()` 의 호출할 때 예약 정보를 일반 큐에 넣을지, 우선 순위 큐에 넣을지를 지정하는 매개 변수를 추가

``` js
// 본문을 새로운 함수로 추출
addReservation(customer){
  this.zz_addReservation(customer);
}

zz_addReservation(customer){ // 임시 이름
  this._reservations.push(customer);
}
```

``` js
// 새 함수의 선언문과 호출문에 원하는 매개변수 추가
addReservation(customer){
  this.zz_addReservation(customer, false);
}

zz_addReservation(customer, isPriority){ // 임시 이름
  this._reservations.push(customer);
}
```

- 자바스크립트로 프로그래밍 한다면, 호출문 변경 전 어서션을 추가(10.6)하여 호출 하는 곳에서 매개변수를 실제로 사용하는지 확인

``` js
zz_addReservation(customer, isPriority){
  assert(isPriority === true || isPriority === false)
  this._reservations.push(customer);
}
```

- 기존 함수를 인라인(6.2)하여 호출 코드들이 새로운 함수를 이용하도록 고치고, 새 함수의 이름을 기존 함수의 이름으로 바꿈



### 예시 : 매개변수를 속성으로 바꾸기

- 복잡한 예 : 고객이 뉴잉글랜드에 살고 있는지 확인하는 함수

``` js
function ninNewEngland(aCustomer){
  return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(aCustomer.address.state);
}

// 호출문
const newEnglanders = someCustomers.filter(c => inNewEngland(c));
```

- 함수가 주(state) 식별 코드를 매개변수로 받도록 리팩터링. 고객에 대한 의존성 제거

``` js
// 매개 변수로 사용할 코드를 변수로 추출 (6.3)
function inNewEngland(aCustomer){
  const stateCode = aCustomer.address.state;
  return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```

- 함수 추출하기(6.1)

``` js
function inNewEngland(aCustomer){
  const stateCode = aCustomer.address.state;
  return xxNewinNewEngland(stateCode);
}
function xxNewinNewEngland(aCustomer){
  return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```

- 기존 함수에 변수로 추출해둔 입력 매개 변수를 인라인(6.4)

``` js
function inNewEngland(aCustomer){
  return xxNewinNewEngland(aCustomer.address.state);
}
function xxNewinNewEngland(stateCode){
  return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```

- 함수 인라인하기(6.2)로 기존 함수의 본문을 호출문들에 집어넣기. 실질적으로 기존 함수 호출문을 새 함수 호출문으로 교체

``` js
const newEnglanders = someCustomers.filter(c => xxNewinNewEngland(c.address.state));
```

- 함수 선언 바꾸기를 다시 적용하여 새 함수의 이름을 기존 함수의 이름으로 바꾸기

``` js
const newEnglanders = someCustomers.filter(c => inNewEngland(c.address.state));

function inNewEngland(stateCode){
  return ["MA", "CT", "ME", "VT", "NH", "RI"].includes(stateCode);
}
```

## 6.6 변수 캡슐화하기

```js
// before
let defaultOwner = {firstName: "마틴", lastName: "파울러"}

// after
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"}
export function defaultOwener() {return defaultOwnerData}
export function setDefaultOwner(arg) {defaultOwnerData = arg}
```

### 배경

- 리팩터링은 프로그램의 요소를 조작하는 일
    - 함수는 데이터보다 다루기 쉬움
    - 데이터는 함수보다 다루기 까다로움, 데이터가 참조하는 모든 부분을 변경해야됨
- 데이터를 옮길 때 먼저 데이터로의 접근을 독점하는 함수를 만드는 방식이 가장 좋을 수 있음
- 데이터 캡슐화는 데이터를 변경하고 사용하는 코드를 감시할 통로를 만들 수 있음
- 데이터의 유효범위가 넓을수록 캡슐화 해야 됨
- 객체 지향에서 객체의 데이터를 항상 private로 유지해야 한다는 이유
    - 저자는 public 필드를 발견할 때마다 캡슐화해서 가시 범위를 제한
    - 일뷰는 클래스 안에서 필드를 참조할 때조차 반드시 접근자를 통하게 하려 하는 자가 캡슐화를 주장하지만, 조금 지나친 것 같은 느낌도 있음
- 불변데이터는 캡슐화할 이유가 적음

### 절차

1. 변수로의 접근과 갱신을 전담하는 캡슐화 함수 만들기
2. 정적 검사 수행
3. 변수를 직접 참조하던 부분을 모두 적절한 캡슐화 함수 호출로 변경
4. 변수 접근 범위 제한
5. 테스트
6. 변수 값이 레코드라면, 레코드 캡슐화하기(7.1)를 적용할지 고민

### 예시

```js
let defaultOwner = {firstName: "마틴", lasetName: "파울러"}
spaceship.owner = defaultOwner
defaultOwner = {firstName: "레베카", lasetName: "파슨스"}
```

- 전경변수에 중요한 데이터가 담겨있는 코드
    - 그 데이터를 참조 및 갱신하는 코드가 있음

```js
function getDefaultOwner() {return defaultOwner}
function setDefualtOwner(arg) {defaultOwner = arg}
```

- 캡슐화를 위해 데이터를 읽고 쓰는 함수 정의

```js
spaceship.owner = getDefaultOwner()
setDefaultOwner({firstName: "레베카", lasetName: "파슨스"})
```

- defaultOwner를 참조하는 코드를 찾아서 방금 만든 게터 함수 호출하도록, 대입문은 세터 함수를 호출하도록 변경

```js
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"}
export function defaultOwener() {return defaultOwnerData}
export function setDefaultOwner(arg) {defaultOwnerData = arg}
```

- 변수의 가시 범위 제한, 필요한 함수의 경우만 노출(export)
- 변수로의 접근 제한을 한다면 이름을 바꾸는 경우도 좋음 (ex. `__privateOnly_defaultOwner`)
- 저자는 게터 이름에 get을 붙이는 것을 선호하지 않아 제거함

#### 값 캡슐화하기

- 위의 예시에서 데이터 구조로의 참조를 캡슐화하면, 접근이나 다시 대입하는 행위는 제어할 수 있지만, 필드를 변경하는 일은 제어할 수 없음

```js
let defaultOwnerData = {firstName: "마틴", lastName: "파울러"}
export function defaultOwener() {
    return Object.assing({}, defaultOwnerData)
}
export function setDefaultOwner(arg) {defaultOwnerData = arg}

class Person {
    constructor(data) {
        this._lastName = data.lastName
        this._firstName = data.firstName
    }
    get lastName() {return this._lastName}
    get firstName() {return this._firstName}
}
```

- 가장 간단한 방법은 값을 변경하지 못하도록 하는 것
    - 게터가 데이터의 복제본을 반환하는 방식으로 구성할 수 있음
    - 리스트에 이 기법을 많이 사용함
    - 데이터를 변경하기를 원하는 클라이언트가 있을 수 있음 → 레코드 캡슐화하기(7.1)

- 위의 예시에서는 게터에서의 데이터 복제를 구현,
    - 세터에서도 데이터 복제를 활용하는게 좋을 수 있음
- 데이터 복제본을 만드는 방식은 깊이가 1인 구조까지만 효과기 있고, 더 깊이 글어가면 래핑 단계가 더 늘어날 수 있음
- 캡슐화는 간단하지만, 과정은 간단하지 않음
- 데이터의 사용 범위가 넓을수록 적절히 캡슐화 하는 것이 좋음

## 6.7 변수 이름 바꾸기

```js
// before
let a = height * width
// after
let area = height * width
```

### 배경

- 명확한 프로그래밍읜 핵심은 이름 짓기
- 이름의 중요성은 사용 범위에 영향을 많이 받음
    - 한 줄 짜리 람다식, 함수의 매개변수는 짧게 지어도 좋음
    - 한 번 호출로 끝나지 않는 함수나 영속되는 필드라면 신경을 써야됨

### 절차

1. 폭넓게 쓰이는 변수라면 캡슐화하기(6.6)를 고려
2. 이름을 바꿀 변수를 참조하는 곳을 모두 찾아서 하나씩 변경
3. 테스트

### 예시

- 가장 간단한 예시는 임시 변수나 인수처럼 유효한 범위가 하나로 국한된 변수
- 하지만, 함수 밖에서도 참조할 수 있는 변수면 조심해야됨

```js
let tpHd = "untitled"
result += `<h1>${tpHd}</h1>`
tpHd = obj["articleTitle"]

// 캡슐화하기
setTitle(obj["articleTitle"])

function title() {return tpHd}
function setTitle(arg) {tpHd = arg}
```

- 어떤 값을 참조, 수정하는 경우, 캡슐화할 수 있음

```js
let _title = "untitled"
function title() {return _title}
function setTitle(arg) {_title = arg}
```

- 래퍼 함수들을 인라인해서 모든 호출자가 변수에 직접 접근하게 하는 방법도 있지만
    - 저자가 선호하는 방식은 아님
    - 널리 사용되는 변수라면 함수안에서 캡슐화된 채로 두는 편이 좋다고 생각

#### 예시: 상수 이름 바꾸기

```js
// before
const cpyNm = "애크미 구스베리"
// after
const companyName = "애크미 구스베리"
const cpyNm = companyName
```

- 상수의 이름은 캡슐화하지 않고도 복제 방식으로 점진적으로 바꿀 수 있음

## 6.8 매개변수 객체 만들기

```js
//before
function amountInvoiced(startDate, endDate) {...}
function amountReveibed(startDate, endDate) {...}
function amountOverdue(startDate, endDate) {...}
//after
function amountInvoiced(aDateRange) {...}
function amountReveibed(aDateRange) {...}
function amountOverdue(aDateRange) {...}
```

### 배경

- 데이터 항목 여러 개가 이 함수에서 저 함수로 함께 몰려다니는 경우
    - 데이터 무리를 데이터 구조 하나로 모으는 작업
    - 데이터를 데이터 구조로 묶으면 데이터 사이 관계가 명확해지는 이점이 있음
    - 데이터 구조를 받게 하면 매개변수 수가 줄어듬
- 이 리팩터링의 진정함 힘은 코드를 더 근본적으로 바꿔줌
    - 데이터 구조를 활용하는 형태로 프로그램 동작을 재구성
    - 데이터에 공통으로 적용되는 동작을 추출해서 함수로 만듬
    - 새로 만든 데이터 구조가 문제 영역을 훨씬 간결하게 표현하는 추상 개념으로 격상, 코드의 개념적인 그림을 다시 그릴 수 있음

### 절차

1. 적당한 데이터 구조가 아직 마련되어 있지 않다면 새로 만듬
2. 테스트
3. 함수 선언 바꾸기(6.5)로 새 데이터 구조를 매개변수로 추가
4. 테스트
5. 함수 호출 시 새로운 데이터 구조 인스턴스를 넘기도록 수정 (+테스트)
6. 기존 매개변수를 사용하던 코드를 새 데이터 구조의 원소를 사용하도록 바꿈
7. 다 꿨다면 기존 매개변수 제거, 테스트

### 예시

```js
const station = {
    name: "zB1",
    readings: [
        {temp: 47, time: "2015-11-10 09:10"},
        {temp: 53, time: "2015-11-10 09:20"},
        {temp: 58, time: "2015-11-10 09:30"},
        {temp: 53, time: "2015-11-10 09:40"},
        {temp: 51, time: "2015-11-10 09:50"},
    ]
}

function readingOutsideRange(station, min, max) {
    return station.readings.filter(
        r => r.temp < min || r.temp > max
    )
}

alerts = readingsOutsideRange(
    station,
    operatingPlan.temperatureFloor, // 최저 온도
    opertaingPlan.temperatureCeiling // 최고 온도
)
```

- 온도 측정값을 기록한 데이터와 정상 범위를 벗어나는지 검사하는 함수
    - 검사하는 함수는 또 다른 함수에서 호출 및 활용될 수 있음
    - 호출 코드에서 데이터 항목 두 개 쌍을 가져와서 전달하는데, 이를 하나로 묶을 수 있음

```js
class NumberRange {
    constructor(min, max) {
        this.data = {min:min, max:max}
    }
    get min() {return this._data.min}
    get max() {return this._data.max}
}
```

- 묶은 데이터를 나타낼 클래스 선언

```js
function readingsOutsideRange(station, min, max, range) {
    return station.readings.filter(
        r => r.temp < min || r.temp > max
    )
}

alerts = readingsOutsideRange(
    station,
    operatingPlan.temperatureFloor,
    opertaingPlan.temperatureCeiling,
    null
)
```

- 새로 만든 객체를 매개변수에 추가하고, 아직은 호출문에 넣을 값이 없기 때문에 `null`을 입력

```js
const range = new NumberRange(
    operatingPlan.temperatureFloor,
    opertaingPlan.temperatureCeiling
)
alerts = readingsOutsideRange(
    station,
    operatingPlan.temperatureFloor,
    opertaingPlan.temperatureCeiling,
    range
)
```

- 온도 범위를 객체 형태로 만들고, 그 객체를 전달

```js
function readingsOutsideRange(station, range) {
    return station.readings.filter(
        r => r.temp < range.min || r.temp > range.max
    )
}
alerts = readingsOutsideRange(station, range)
```

- 매개변수를 직접 사용하도록 수정

#### 진정한 값 객체로 거듭나기

- 데이터 구조를 만들게 되면, 관련된 동작을 클래스의 메서드로 옮길 수 있는 이점이 생김
    - 온도 범위를 검사하는 메서드를 클래스에 추가할 수 있음

## 6.9 여러 함수를 클래스로 묶기

```js
// before
function base(aReading) {...}
function texableCharge(aRedaing) {...}
function calculateBaseCharge(aReading) {...}
// after
class Reading {
    base() {...}
    texableCharge() {...}
    calculateBaseCharge() {...}
}
```

### 배경

- 클래스는 대다수의 최신 프로그래밍언어가 제공하는 기본적인 빌딩 블록
    - 클래스는 데이터와 함수를 하나의 공유 환경으로 묶은 후 다른 프로그램 요소와 어우러질 수 있도록 그중 일부를 외부에 제공
- 공통 데이터를 중심으로 묶게 되면
    - 함수들이 공유하는 공통 환경을 더 명확히 표현할 수 있고
    - 함수에 전달되는 인수를 줄여서 객체 안에서의 함수 호출을 간결하게 만들 수 있음
- 함수를 묶는 다른 방법으로, 여러 함수를 변환 함수로 묶기(6.10)
- 클래스로 묶을 때의 두드러진 장점은 객체의 핵심 데이터를 변경할 수 있고, 파생 객체들을 일관되게 관리할 수 있음
- 중첩 함수로도 구현가능하지만, 클래스 구조가 외부에 공개할 때 더 유용할 수 있음
- 클래스를 지원하지 않는 언어에서는 “함수를 객체처럼”을 이용할 수 있음

### 절차

1. 함수들이 공유하는 공통 데이터 레코드를 캡슐화(7.1)
2. 공통 레코드를 사용하는 함수 각각을 새 클래스로 옮기기(8.1)
3. 데이터를 조작하는 로직을 함수로 추출(6.1)

### 예시

```js
reading = {customer: "ivan", quantity: 10, month: 5, year: 10}
```

- 계량기를 읽어 측정값을 기록

```js
// 클라이언트 1
const aReading = acquireReading()
const baseCharge = baseRate(aReading.month, aRedagin.year) * aReading.quantity

// 클라이언트 2
const aReading = acquireReading()
const base = (baseRate(aReading.month, aRedagin.year) * aReading.quantity)
const texableCharge = Math.max(0, base - taxThreshold(aReading.year))

// 클라이언트 3
const aReading = acquireReading()
const baseChargeAmount = calculateBaseCharge(aReading)

function calculateBaseCharge(aReading) {
    return baseRate(aReading.month, aReading.year)
}
```

- 기본요금을 계산하는 코드
- 부과할 세금을 계산하는 코드
- 기본 요금을 계산하는 코드

```js
class Reading {
    constructor(data) {
        this._customer = data.customer
        this._quantity = data.quantity
        this._month = data.month
        this._year = data.year
    }
    get customer() {return this._customer}
    get quantity() {return this._quantity}
    get month() {return this._month}
    get year() {return this._year}

    get calculateBaseCharge() {
        return this.baseRate(this.month, this.year) * this.quantity
    }
    get baseCharge () {
        return baseRate(this.month, this.year) * this.quantity
    }
    get texableCharge() {
        return Math.max(0, this.baseCharge - taxThreshold(this.year))
    }
}
```

- 동일한 데이터를 사용하는 함수들이 있어, 데이터를 클래스로 만듬
    - 레코드를 캡슐화 하기(7.1)
- 이후 해당 데이터를 사용하는 함수들을 메서드로 추출

## 6.10 여러 함수를 변환 함수로 묶기

```js
// before
function base(aReading) {...}
function taxableCharge(aReading) {...}

//after
function enrichReading(argReading) {
    const aReading = _.cloneDeep(argReading)
    aReading.baseCharge = base(aReading)
    aReading.taxableCharge = taxableCharge(aReading)
    return aRedaing
}
```

### 배경

- 소프트웨어는 데이터를 입력을 받아 여러 가지 정보를 도출
    - 도출된 정보는 여러 곳에서 사용될 수 있음
    - 정보가 사용되는 곳마다 같은 도출 로직이 반복되기도 함
    - 이러한 도출 작업을 한 곳으로 모아두는 것이 더 좋을 수 있음
- 이 리팩터링 대신 여러 함수를 클래스로 묶기(6.9)로 처리해도 됨
    - 원본 데이터가 코드 안에서 갱신될 때는 클래스로 묶는 편이 나음
- 함수를 한 데로 묶는 것은
    - 도출 로직의 중복을 피하기 위함
    - 함수로 추출(6.1)만으로도 같은 효과를 낼 수 있지만, 이 경우 함수가 근처에 있지 않으면 발견하기 어려울 때가 많음

### 절차

1. 변환할 레코드를 입력받아서 값을 그대로 반환하는 변환 함수 만듬
2. 묶을 함수 중 함수 하나를 골라서 본문 코드를 변환 함수로 옮기고,
   처리 결과를 레코드에 새 필드에 기록,
   클라이언트 코드가 이 필드를 사용하도록 수정
3. 테스트
4. 나머지 관련 함수도 위의 방식으로 처리

### 예시

```js
reading = {customer: "ivan", quantity: 10, month: 5, year: 10}
```

- 사용자가 계량기에서 사용할 양을 측정

```js
// 클라이언트 1
const aReading = acquireReading()
const baseCharge = baseRate(aReading.month, aRedagin.year) * aReading.quantity

// 클라이언트 2
const aReading = acquireReading()
const base = (baseRate(aReading.month, aRedagin.year) * aReading.quantity)
const texableCharge = Math.max(0, base - taxThreshold(aReading.year))

// 클라이언트 3
const aReading = acquireReading()
const baseChargeAmount = calculateBaseCharge(aReading)

function calculateBaseCharge(aReading) {
    return baseRate(aReading.month, aReading.year)
}
```

- 사용자의 요금을 계산할 코드
- 세금을 부과할 소비량을 계산하는 코드
- 기본 요금을 계산하는 코드
- 같은 연산이 다양한 곳에서 이루어진다고 할 때, 해당 기능을 한 곳으로 모아 둘 수 있음

```js
function enrichReading(argReading) {
    const aReading = _.cloneDeep(argReading)
    aReading.baseCharge = base(aReading)
    aReading.taxableCharge = taxableCharge(aReading)
    return aRedaing
}
```

- 하나의 함수를 만들어 관련한 계산을 한 곳에서 처리하고 반환할 수 있도록 함
- 이후, 이 함수를 사용하여 클라리언트에서도 사용하도록 수정

## 6.11 단계 쪼개기

```js
//before
const orerData = orderString.split(/\s+/)
const productPrice = priceList[orderData[0].split("-")[1]]
const orderPrice = parseInt(orderData[1]) * productPrice
//after
const orderRecord =parseOrder(order)
const orderPrice = price(orderRecord, priceList)

function parseOrder(string) {
    const values = aString.split(/\s+/)
    return ({
        productID: values[0].splie("-")[1],
        quantity: parseInt(values[1])
    })
}
function price(order, priceList) {
    return order.quantity * priceList[order.productID]
}
```

### 배경

- 서로 다른 두 대상을 한꺼번에 다루는 코드를 발견하면, 각각을 별개의 모듈로 나누는 방법을 모색
    - 코드를 수정할 때 두 대상을 동시에 생각할 필요 없이 하나에만 집중하기 위함
- 가장 간단한 방법은 연이은 두 단계로 쪼개는 것
    - 적합하지 않은 형태로 들어오게 되면, 입력 값을 다루기 편한 평태로 가공, 이후 로직 실행
    - 가장 대표적인 예시는 컴파일러
        - 어떤 텍스트를 받아 실행 가능한 형태로 변환
        - 컴파일러 역사가 오래되어, 여러 단계가 순차적으로 연결된 형태로 분리하면 좋다느 사실을 깨달음

### 절차

1. 두 번째 단계에 해당하는 코드를 독립 함수로 추출
2. 테스트
3. 중간 데이터 구조를 만들어 앞에서 추출한 함수의 인수로 추가
4. 테스트
5. 추출한 두 번째 단계 함수의 매개변수를 하나씩 검토
6. 첫 번째 단계 코드를 함수로 추출(6.1), 중간 데이터 구조를 반환하도록 만듬

### 예시

```js
function priceOrder(product, quantity, shippingMethod) {
    const basePrice = product.basePrice * quantity
    const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate
    const shippingPerCase = 
        (basePrice > shippingMethod.discountThreshold)
         ? shippingMethod.discountedFee
         : shippingMethod.freePerCase
    const shippingCost = quantity * shippingPerCase
    const price = basePrice - discount + shippingCost
    return price
}
```

- 상품 결제 금액을 계산하는 코드
    - 앞의 몇 줄은 상품 정보를 이용해서 결제 금액 중 상품 가격 계산
    - 뒤의 코드는 배송 정보를 이용하여 결제 금액 중 배소비 계산

```js
function priceOrder(product, quantity, shippingMethod) {
    const basePrice = product.basePrice * quantity
    const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate
    const price = applyShipping(basePrice, shippingMethod, quantity, discount)
    return price
}

function applyShipping(basePrice, shippingMethod, quantity, discount) {
    const shippingPerCase = 
        (basePrice > shippingMethod.discountThreshold)
         ? shippingMethod.discountedFee
         : shippingMethod.freePerCase
    const shippingCost = quantity * shippingPerCase
    const price = basePrice - discount + shippingCost
    return price
}
```

- 뒷부분의 배송비 계산 부분을 함수로 추출, 원래 함수에서 인자로 전달

```js
function priceOrder(product, quantity, shippingMethod) {
    const basePrice = product.basePrice * quantity
    const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate
    const priceData = {} // 중간 데이터 구조
    const price = applyShipping(basePrice, shippingMethod, quantity, discount)
    return price
}

function applyShipping(basePrice, shippingMethod, quantity, discount) {
    const shippingPerCase = 
        (basePrice > shippingMethod.discountThreshold)
         ? shippingMethod.discountedFee
         : shippingMethod.freePerCase
    const shippingCost = quantity * shippingPerCase
    const price = basePrice - discount + shippingCost
    return price
}
```

- 첫 번째 단계와 두 번째 단계가 주고받을 중간 데이터 구조 생성

```js
function priceOrder(product, quantity, shippingMethod) {
    const basePrice = product.basePrice * quantity
    const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate
    const priceData = {
        basePrice: basePrice,
        quantity: quantity,
        discount: discount
    }
    const price = applyShipping(priceData, shippingMethod)
    return price
}

function applyShipping(priceData, shippingMethod) {
    const shippingPerCase = 
        (priceData.basePrice > shippingMethod.discountThreshold)
         ? shippingMethod.discountedFee
         : shippingMethod.freePerCase
    const shippingCost = priceData.quantity * shippingPerCase
    const price = priceData.basePrice - priceData.discount + shippingCost
    return price
}
```

- 중간 데이터 구조로 추출

```js
function priceOrder(product, quantity, shippingMethod) {
    const priceData = calculatePricingData(product, quantity)
    const price = applyShipping(priceData, shippingMethod)
    return price
}

function calculatePricingData(product, quantity) {
    const basePrice = product.basePrice * quantity
    const discount = Math.max(quantity - product.discountThreshold, 0) * product.basePrice * product.discountRate
    return priceData = {
        basePrice: basePrice,
        quantity: quantity,
        discount: discount
    }
}

function applyShipping(priceData, shippingMethod) {
    const shippingPerCase = 
        (priceData.basePrice > shippingMethod.discountThreshold)
         ? shippingMethod.discountedFee
         : shippingMethod.freePerCase
    const shippingCost = priceData.quantity * shippingPerCase
    const price = priceData.basePrice - priceData.discount + shippingCost
    return price
}
```

- 앞부분 계산을 추출하여, 중간 데이터 구조를 반환하도록 변경
    - 추가로 마지막줄 계산 후 반환하는 대신, 바로 반환하도록 변경할 수 있음
