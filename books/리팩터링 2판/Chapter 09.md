[TOC]

# Chapter 09. 데이터 조직화

<br>

## 9.1 변수 쪼개기

```js
let temp = 2 * (height + width);
console.log(temp);
temp = height * width;
console.log(temp);
```

```js
const perimeter = 2 * (height + width);
console.log(perimeter);
const area = height * width;
console.log(area);
```

### 배경

- 변수는 다양한 용도로 쓰이며, 그중 변수에 <u>값을 여러 번 대입</u>할 수밖에 없는 경우도 있음
  - **루프 변수** : 반복문을 한 번 돌 때마다 값이 바뀜
  - **수집 변수** : 메서드가 동작하는 중간중간 값을 저장
- 긴 코드의 결과를 저장했다가 나중에 쉽게 **참조**하려는 목적으로 쓰이는 경우, <u>값을 단 한 번만 대입</u>해야 함
  - <u>대입이 두 번 이상</u> 이뤄진다면 여러 가지 역할을 수행한다는 신호로, 이러한 변수가 있다면 쪼개야 함 (역할 하나당 변수 하나)

### 절차

1. 변수를 선언한 곳과 값을 처음 대입하는 곳에서 변수 이름 바꾸기
   → 이후의 대입이 항상 i = i + <무언가> 형태라면 수집 변수이므로 쪼개면 안 됨. 수집 변수는 총합 계산, 문자열 연결, 스트림에 쓰기, 컬렉션에 추가하기 등의 용도로 흔히 쓰임
2. 가능하면 이때 불변으로 선언
3. 이 변수에 두 번째로 값을 대입하는 곳 앞까지의 모든 참조(이 변수가 쓰인 곳)를 새로운 변수 이름으로 바꾸기
4. 두 번째 대입 시 변수를 원래 이름으로 다시 선언
5. 반복. 매 반복에서 변수를 새로운 이름으로 선언하고 다음번 대입 때까지의 모든 참조를 새 변수명으로 바꾸기. 이 과정을 마지막 대입까지 반복

### 예시

> **해기스**라는 음식이 다른 지역으로 전파된 거리를 구하는 코드

- 발상지에서 초기 힘을 받아 **일정한 가속도**로 전파되다가, 시간이 흐른 후 어떠한 계기로 두 번째 힘을 받아 **전파 속도가 빨라진다**고 가정

```js
function distanceTravelled(scenario, time) {
    let result;
    let acc = scenario.primaryForce / scenario.mass; // 가속도(a) = 힘(F) / 질량(m)
    let primaryTime = Math.min(time, scenario.delay);
    result = 0.5 * acc * primaryTime * primaryTime; // 전파된 거리
    let secondaryTime = time - scenario.delay;
    if (secondaryTime > 0) { // 두 번째 힘을 반영해 다시 계산
        let primaryVelocity = acc * scenario.delay;
        acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
        result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
    }
    return result;
}
```

- `acc` 변수에 값이 두 번 대입되고 있음 (역할이 두 개라는 신호)
- 첫 단계로 **1.** 변수에 새로운 이름을 지어주고, **2.** 선언 시 `const` 를 붙여 불변으로 만들기
- 그 다음 **3.** 두 번째 대입 전까지의 모든 참조를 새로운 이름으로 바꾸고, **4.** 두 번째로 대입할 때 변수를 다시 선언

```js
function distanceTravelled(scenario, time) {
    let result;
    const primaryAcceleration = scenario.primaryForce / scenario.mass; // 1. 2.
    let primaryTime = Math.min(time, scenario.delay);
    result = 0.5 * primaryAcceleration * primaryTime * primaryTime; // 3.
    let secondaryTime = time - scenario.delay;
    if (secondaryTime > 0) {
        let primaryVelocity = primaryAcceleration * scenario.delay; // 3.
        let acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass; // 4.
        result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
    }
    return result;
}
```

- 그 다음 **5.** 두 번째 용도에 적합한 이름으로 수정

```js
function distanceTravelled(scenario, time) {
    let result;
    const primaryAcceleration = scenario.primaryForce / scenario.mass;
    let primaryTime = Math.min(time, scenario.delay);
    result = 0.5 * primaryAcceleration * primaryTime * primaryTime;
    let secondaryTime = time - scenario.delay;
    if (secondaryTime > 0) {
        let primaryVelocity = primaryAcceleration * scenario.delay;
        const secondaryAcceleration = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass; // 5.
        result += primaryVelocity * secondaryTime + 0.5 * secondaryAcceleration * secondaryTime * secondaryTime; // 5.
    }
    return result;
}
```

### 예시 : 입력 매개변수의 값을 수정할 때

> 변수 쪼개기의 또 다른 예로 **입력 매개변수** 생각

```js
function discount(iuputValue, quantity) {
    if (inputValue > 50) inputValue = inputValue - 2;
    if (quantity > 100) inputValue = inputValue - 1;
    return inputValue;
}
```

- `inputValue` 는 함수에 데이터를 전달하는 용도와 결과를 호출자에 반환하는 용도로 쓰임
- 다음과 같이 `inputValue` 쪼개기

```js
function discount(originalInputValue, quantity) {
    let inputValue = originalInputValue; // 매개변수/결괏값 쪼개기
    if (inputValue > 50) inputValue = inputValue - 2;
    if (quantity > 100) inputValue = inputValue - 1;
    return inputValue;
}
```

- 변수 이름 바꾸기(6.7)를 두 번 수행해서 각각의 쓰임에 어울리는 이름 지어주기

```js
function discount(inputValue, quantity) {
    let result = inputValue;
    if (inputValue > 50) result = result - 2; // result 가 아닌 inputValue 와 비교하도록 수정 (입력 값에 기초하여 결괏값 누적 계산)
    if (quantity > 100) result = result - 1;
    return result;
}
```

<br>

## 9.2 필드 이름 바꾸기

```js
class Organization {
    get name() {...}
```

```js
class Organization {
    get title() {...}
```

### 배경

- **데이터 구조**는 프로그램을 이해하는 데 큰 역할을 하며, 그만큼 반드시 깔끔하게 관리해야 함
  - 개발을 진행할수록 데이터를 더 잘 이해하게 되고, 깊어진 이해를 <u>프로그램에 반영</u>해야 함
- 이 과정에서 <u>레코드의 필드 이름</u>을 바꾸고 싶을 수 있는데, 클래스에서도 마찬가지로 작용

### 절차

1. 레코드의 유효 범위가 제한적이라면 필드에 접근하는 모든 코드를 수정한 후 테스트. 이후 단계는 필요 없음
2. 레코드가 캡슐화되지 않았다면 우선 레코드를 캡슐화
3. 캡슐화된 객체 안의 private 필드명을 변경하고, 그에 맞게 내부 메서드들을 수정
4. 생성자의 매개변수 중 필드와 이름이 겹치는 게 있다면 함수 선언 바꾸기(6.5)로 변경
5. 접근자들의 이름도 바꾸기(6.5)

### 예시

```js
const organization = {name: "애크미 구스베리", country: "GB"}
```

- "name"을 "title" 로 바꾸기
- 우선 **2.** `organization` 레코드를 클래스로 **캡슐화(7.1)**

```js
class Organization {
    constructor(data) {
        this._name = data.name;
        this._country = data.country;
    }
    get name() {return this._name;}
    set name(aString) {this._name = aString;}
    get country() {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}

const organization = new Organization({name: "애크미 구스베리", country: "GB"});
```

- 입력 데이터 구조를 <u>내부 데이터 구조로 복제</u>했으므로 둘을 구분해야 독립적으로 작업할 수 있음
  - **3.** 별도의 필드를 정의하고 생성자와 접근자에서 둘을 구분해 사용
  - 생성자에서 "title" 도 받아들일 수 있도록 조치

```js
class Organization {
    constructor(data) {
        this._title = (date.title !== undefined) ? data.title : data.name; // 별도의 필드 정의, "title" 도 받아들일 수 있도록 조치
        this._country = data.country;
    }
    get name() {return this._title;} // "title" 적용
    set name(aString) {this._title = aString;} // "title" 적용
    get country() {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}

const organization = new Organization({name: "애크미 구스베리", country: "GB"});
```

- 이제 생성자를 호출하는 쪽에서는 "name" 과 "title" 을 모두 사용할 수 있게 되었음 (둘 다 등장할 시 "title" 이 우선)
  - 생성자를 호출하는 곳을 모두 찾아서 <u>새로운 이름인 "title" 을 사용</u>하도록 하나씩 수정
  - 모두 수정했다면 생성자에서 "name" 을 사용할 수 있게 하던 코드를 제거

```js
class Organization {
    constructor(data) {
        this._title = data.title; // "name" 은 사용되지 않도록 수정
        this._country = data.country;
    }
    get name() {return this._title;}
    set name(aString) {this._title = aString;}
    get country() {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}

const organization = new Organization({title: "애크미 구스베리", country: "GB"}); // "title" 을 사용하도록 수정
```

- 접근자 각각의 이름도 바꿔주기 (**함수 이름 바꾸기(6.5)**)

```js
class Organization {
    constructor(data) {
        this._title = data.title;
        this._country = data.country;
    }
    get title() {return this._title;} // 접근자 이름 바꾸기
    set title(aString) {this._title = aString;} // 접근자 이름 바꾸기
    get country() {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}

const organization = new Organization({title: "애크미 구스베리", country: "GB"});
```

<br>

## 9.3 파생 변수를 질의 함수로 바꾸기

```js
get discountedTotal() {return this._discountedTotal;}
set discount(aNumber) {
    const old = this._discount;
    this._discount = aNumber;
    this._discountedTotal += old - aNumber;
}
```

```js
get discountedTotal() {return this._baseTotal - this._discount;}
set discount(aNumber) {this._discount = aNumber;}
```

### 배경

- **가변 데이터**는 서로 다른 두 코드를 결합하는 등 소프트웨어에 문제를 일으키기 쉬우며, <u>유효 범위를 가능한 한 좁히는 것</u>이 좋음
- <u>값을 쉽게 계산해낼 수 있는 변수들</u>을 모두 제거하는 것도 효과적인 방법
- 새로운 데이터 구조를 생성하는 **변형 연산**이라면 비록 계산 코드로 대체할 수 있더라도 그대로 두는 것도 좋음
  - 데이터 구조를 감싸며 그 데이터에 기초하여 계산한 결과를 속성으로 제공하는 객체
  - 데이터 구조를 받아 다른 데이터 구조로 변환해 반환하는 함수

### 절차

1. 변수 값이 갱신되는 지점을 모두 찾기. 필요하면 변수 쪼개기(9.1)를 활용해 각 갱신 지점에서 변수를 분리
2. 해당 변수의 값을 계산해주는 함수 만들기
3. 해당 변수가 사용되는 모든 곳에 어서션을 추가(10.6)하여 함수의 계산 결과가 변수의 값과 같은지 확인
   → 필요하면 변수 캡슐화하기(6.6)를 적용하여 어서션이 들어갈 장소를 마련
4. 변수를 읽는 코드를 모두 함수 호출로 대체
5. 변수를 선언하고 갱신하는 코드를 죽은 코드 제거하기(8.9)로 없애기

### 예시

```js
// ProductionPlan 클래스...
get production() {return this._production;}
applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += anAdjustment.amount;
}
```

- 조정 값 `adjustment` 를 적용하는 과정에서 직접 관련이 없는 누적 값 `production` 까지 갱신하는 **데이터 중복** 발생
  - 이 누적 값은 매번 갱신하지 않고도 계산할 수 있음 → 하지만, 이는 가정일 뿐이니 **어서션을 추가(10.6)**하여 검증

```js
// ProductionPlan 클래스...
get production() {
    assert(this._production === this.calculatedProduction);
    return this._production;
}

get calculatedProduction() {
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
}
```

- 테스트 후 어서션이 실패하지 않으면 필드를 반환하던 코드를 수정하여 <u>계산 결과를 직접 반환</u>하도록 함

```js
// ProductionPlan 클래스...
get production() {
    return this.calculatedProduction;
}

get calculatedProduction() {
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
}
```

- `calculatedProduction()` **메서드 인라인(6.2)**
- 옛 변수를 참조하는 모든 코드를 **죽은 코드 제거하기(8.9)**로 정리

```js
// ProductionPlan 클래스...
get production() {
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
}
applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    // this._production += anAdjustment.amount; // 죽은 코드 제거
}
```

### 예시 : 소스가 둘 이상일 때

```js
// ProductionPlan 클래스...
constructor(production) {
    this._production = production; // 생성자에서 초깃값이 설정됨
    this._adjustments = [];
}

get production() {return this._production;}
applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += andAdjustment.amount;
}
```

- 어서션 코드를 동일하게 작성하면 `_production` 의 초깃값이 0이 아니면 실패함
  - **변수 쪼개기(9.1)**를 먼저 적용하면 이 파생 데이터를 대체할 수 있음

```js
constructor(production) {
    // 변수 쪼개기
    this._initialProduction = production;
    this._productionAccumulator = 0;
    this._adjustments = [];
}

get production() {
    return this._initialProduction + this._productionAccumlator; // 변수 쪼개기
}
applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += andAdjustment.amount;
}
```

- **어서션 추가(10.6)**

```js
// ProductionPlan 클래스...
constructor(production) {
    this._initialProduction = production;
    this._productionAccumulator = 0;
    this._adjustments = [];
}

get production() {
    assert(this._productionAccumulator === this.calculatedProductionAccumulator); // 어서션 추가
    return this._initialProduction + this._productionAccumlator;
}
get calculatedProductionAccumulator() { // 계산 함수 작성 (인라인이 아닌 속성으로 남겨두기)
    return this._adjustments.reduce((sum, a) => sum + a.amount, 0);
}
applyAdjustment(anAdjustment) {
    this._adjustments.push(anAdjustment);
    this._production += andAdjustment.amount;
}
```

<br>

## 9.4 참조를 값으로 바꾸기

```js
class Product {
    applyDiscount(arg) {this._price.amount -= arg;}
```

```js
class Product {
    applyDiscount(arg) {
        this._price = new Money(this._price.amount - arg, this._price.currency);
    }
```

### 배경

- 객체(데이터 구조)를 다른 객체(데이터 구조)에 중첩하면 내부 객체를 참조 혹은 값으로 취급할 수 있음
  - **참조** : 내부 객체는 그대로 둔 채 그 객체의 속성만 갱신
  - **값** : 새로운 속성을 담은 객체로 기존 내부 객체를 통째로 대체
- 필드를 값으로 다룬다면 내부 객체의 클래스를 수정하여 **값 객체**로 만들 수 있음
  - **값 객체**는 불변이므로 다루기 쉽고, <u>분산 시스템과 동시성 시스템</u>에서 유용함
- 특정 객체를 <u>여러 객체에서 공유</u>하고자 한다면, 값을 변경했을 때 이를 관련 객체에 모두 알려줘야 해서 공유 객체를 **참조**로 다뤄야 함

### 절차

1. 후보 클래스가 불변인지, 혹은 불변이 될 수 있는지 확인
2. 각각의 세터를 하나씩 제거(11.7)
3. 이 값 객체의 필드들을 사용하는 동치성 비교 메서드 만들기
   → 대부분의 언어는 이런 상황에 사용할 수 있도록 오버라이딩 가능한 동치성 비교 메서드를 제공. 동치성 비교 메서드를 오버라이드할 때는 보통 해시코드 생성 메서드도 함께 오버라이드해야 함

### 예시

> 사람 객체가 있고, 이 객체는 다음 코드처럼 생성 시점에 전화번호가 올바로 설정되지 못하게 짜여 있음

```js
// Person 클래스...
constructor() {
    this._telephoneNumber = new TelephoneNumber();
}

get officeAreaCode() {return this._telephoneNumber.areaCode;}
set officeAreaCode(arg) {this._telephoneNumber.areaCode = arg;}
get officeNumber() {return this._telephoneNumber.number;}
set officeNumber(arg) {this._telephoneNumber.number = arg;}
```

```js
// TelephoneNumber 클래스...
get areaCode() {return this._areaCode;}
set areaCode(arg) {this._areaCode = arg;}
get number() {return this._number;}
set number(arg) {this._number = arg;}
```

- 추출해서 새로 만들어진 객체(`TelephoneNumber`)를 갱신하는 메서드들은 여전히 추출 전 클래스에 존재
  - 새 클래스를 가리키는 참조가 하나뿐이므로 참조를 값으로 바꾸기 좋은 상황
- **1.** 전화번호를 불변으로 만들 수 있는지 확인
- **2.** **필드들의 세터 제거(11.7)**
  - 세터로 설정하던 두 필드를 생성자에서 입력받아 설정 (**함수 선언 바꾸기(6.5)**)
  - 세터를 호출하는 쪽을 살펴서 전화번호를 매번 다시 대입하도록 바꾸기

```js
// Person 클래스...
get officeAreaCode() {return this._telephoneNumber.areaCode;}
set officeAreaCode(arg) {
    this._telephoneNumber = new TelephoneNumber(arg, this.officeNumber); // 생성자로 입력
}
get officeNumber() {return this._telephoneNumber.number;}
set officeNumber(arg) {
    this._telephoneNumber = new TelephoneNumber(this.officeAreaCode, arg); // 생성자로 입력
}
```

```js
// TelephoneNumber 클래스...
consturctor(areaCode, number) { // 생성자 설정
    this._areaCode = areaCode;
    this._number = number;
}

get areaCode() {return this._areaCode;}
set areaCode(arg) {this._areaCode = arg;}
get number() {return this._number;}
set number(arg) {this._number = arg;}
```

- **3.** 전화번호는 불변이 되었으니, 동치성을 값 기반으로 평가
  - 자바스크립트는 참조 기반 동치성을 값 기반 동치성으로 대체하는 언어나 핵심 라이브러리가 없음 → `equals` 메서드 직접 작성

```js
// TelephoneNumber 클래스...
equals(other) {
    if (!(other instanceof TelephoneNumber)) return false;
    return this.areaCode === other.areaCode && this.number === other.number;
}
```

```js
// 테스트
it('telephone equals', function() {
    assert(new TelephoneNumber("312", "555-0142").equals(new TelephoneNumber("312", "555-0142")));
})
```

- 전화번호를 사용하는 곳이 둘 이상이라도 절차는 동일하며, **세터를 제거(11.7)**할 때 해당 <u>사용처 모두를 수정</u>하면 됨

<br>

## 9.5 값을 참조로 바꾸기

```js
let customer = new Customer(customerData);
```

```js
let customer = customerRepository.get(customerData.id);
```

### 배경

- 같은 데이터를 물리적으로 복제해 사용할 때 가장 크게 문제되는 상황은 그 데이터를 갱신해야 할 때이며, 이런 상황이라면 복제된 데이터를 모두 참조로 바꿔주는 것이 좋음
- 값을 참조로 바꾸면 엔티티 하나당 객체도 단 하나만 존재하게 되는데, 이런 객체들을 모아두고 클라이언트들의 접근을 관리하는 저장소가 필요해짐
- 각 엔티티를 표현하는 객체를 한 번만 만들고, 객체가 필요한 곳에서는 모두 이 저장소로부터 얻어 쓰는 방식이 됨

### 절차

1. 같은 부류에 속하는 객체들을 보관할 저장소 만들기 (이미 있다면 생략)
2. 생성자에서 이 부류의 객체들 중 특정 객체를 정확히 찾아내는 방법이 있는지 확인
3. 호스트 객체의 생성자들을 수정하여 필요한 객체를 이 저장소에서 찾도록 하기

### 예시

- 주문(Order) 클래스는 주문 데이터를 생성자에서 JSON 문서로 입력받아 필드를 채움
- 이 과정에서 주문 데이터에 포함된 고객 ID를 사용해 고객(customer) 객체를 생성

``` js
// Order 클래스
constructor(data){
  this._number = data.number;
  this._customer = new Customer(data.customer); // data.customer가 고객 ID
  // 다른 데이터를 읽어 들인다
}

get customer() {return this._customer;}
```

``` js
// Customer 클래스
constructor(id) {
  this._id = id;
}

get id() {return this._id;}
```

- 이 방식으로 생성한 고객 객체는 값이며, 고객 ID가 123인 주문을 다섯 개 생성한다면 독립된 고객 객체가 5개 만들어지며 이 중 하나를 수정하더라도 나머지 네 개에는 반영되지 않음
- 같은 엔티티를 표현하는 객체가 여러 개 만들어지는 상황에서 이 객체가 불변이 아니라면 일관성이 깨질 수 있음

1. 항상 물리적으로 똑같은 고객 객체를 사용하고 싶다면, 유일한 객체를 저장해둘 곳이 필요함

``` js
let _repositoryData;

export function initialize() {
  _repositoryData = {};
  _repositoryData.customer = new Map();
}

export function registerCustomer(id) {
  if (! _repositoryData.customers.has(id))
    _repositoryData.customers.set(id, new Customer(id));
  return findCustomer(id);
}

export function findCustomer(id) {
  return _repositoryData.customers.get(id);
}
```

- 이 저장소는 고객 객체를 ID와 함께 등록할 수 있으며, ID 하나당 오직 하나의 고객 객체만 생성됨을 보장함

2. 주문의 생성자에서 올바른 고객 객체를 얻어오는 방법 강구 (예시에서는 고객 ID가 입력 데이터 스트림으로 전달되어 해결 가능)
3. 수정

``` js
// Order 클래스
constructor(data) {
  this._number = data.number;
  this._customer = registerCustomer(data.customer);
  // 다른 데이터를 읽어 들인다.
}

get customer() {return this._customer;}
```

- 이제 특정 주문과 관련된 고객 정보를 갱신하면 같은 고객을 공유하는 주문 모두에서 갱신된 데이터를 사용
- 고객 목록을 미리 다 만들어서 저장소에 저장해놓고, 주문 정보를 읽을 때 연결해주는 방법도 자주 사용하나 저장소에 없는 고객 ID를 사용하는 주문에서 오류 발생
- 이 예시 코드는 생성자 본문이 전역 저장소와 결합된다는 문제가 있으며, 저장소를 생성자 매개변수로 전달하도록 수정할 수 있음 (의존성 주입 중 생성자 주입)



## 9.6 매직 리터럴 바꾸기

```js
function potentialEnergy(mass, height) {
    return mass * 9.81 * height;
}
```

```js
const STANDARD_GRAVITY = 9.81;
function potentialEnergy(mass, height) {
    return mass * STANDARD_GRAVITY * height;
}
```

### 배경

- 매직 리터럴(magic literal)이란 소스 코드에 등장하는 일반적인 리터럴 값을 말함
- 상수를 정의하고 숫자 대신 상수를 사용하도록 변경
- 상수가 특별한 비교로직에 쓰이는 경우에는 함수 호출로 바꾸는 방법도 있음
- 의미 전달면에서 값을 바로 쓰는 게 나은 경우나, 리터럴이 함수 하나에서만 쓰이고 그 함수가 맥락 정보를 충분히 제공할 경우는 사용하지 않음



### 방법

1. 상수를 선언하고 매직 리터럴을 대입
2. 해당 리터럴이 사용되는 곳을 모두 찾기
3. 찾은 곳 각각에서 리터럴이 새 상수와 똑같은 의미로 쓰였는지 확인하여, 같은 의미라면 상수로 대체한 후 테스트