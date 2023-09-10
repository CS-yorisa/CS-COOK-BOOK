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
3. 기존 메서드 선언을 차조하는 부분을 모두 찾아서 바뀐 형태로 수정한다.
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

- 수정한 코스를 테스트한 뒤 예전 함수를 인라인(6.2)하면, 예전 함수를 호출하는 부분이 모두 새 함수를 호출하도록 바뀜
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

