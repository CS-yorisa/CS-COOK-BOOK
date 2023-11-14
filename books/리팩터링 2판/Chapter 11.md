# Chapter 11. API 리팩터링

## 11.1 질의 함수와 변경 함수 분리하기

```js
// before
function getTotalOutstandingAndSendBill() {
    const result = customer.invoices.reduce(
        (total, each) => each.aamount + total,0
    )
    sendBill()
    return result
}

// after
function totalOudstanding(){
    return customer.invoices.reduce(
        (total, each) => each.aamount + total,0
    )
}
function sendBill() {
    emailGetaway.send(formatBill(customer))
}
```

### 배경

- 외부에서 관찰할 수 있는 겉보기 부수효과가 전혀 없이 값을 반환해주는 함수 추구
  - 이런 함수는 어느 때건 원하는 만큼 호출해도 문제 없음
- 겉보기 부수효과가 있는 함수는 없는 함수와 명확하게 분리하는 것이 좋음
  - 이를 위해 명령-질의 분리를 할 수 있음

### 절차

- 1️⃣ 대상 함수를 복제하고 질의 목적에 충실한 이름 지음
- 2️⃣ 새 질의 함수에서 부수효과 모두 제거
- 3️⃣ 정적 검사 수행
- 4️⃣ 원래 함수를 호출하는 곳을 모두 찾아내여 추가
- 5️⃣ 원래 함수에서 질의 관련 코드 제거
- 6️⃣ 테스트

### 예시

```js
function alertForMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            sendOffAlarms()
            return "조커"
        }
        if (p === "사루만") {
            sendOffAlarms()
            return "사루만"
        }
    }
    return ""
}
```

- 이름 목록에서 악당을 찾고, 
  - 악당을 찾으면 알람을 울리고, 악당 이름 반환

```js
function findMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            sendOffAlarms()
            return "조커"
        }
        if (p === "사루만") {
            sendOffAlarms()
            return "사루만"
        }
    }
    return ""
}
```

- 1️⃣ 함수 복제, 적당한 이름 짓기

```js
function findMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            return "조커"
        }
        if (p === "사루만") {
            return "사루만"
        }
    }
    return ""
}
```

- 2️⃣ 부수 효과를 낳는 부분 제거

```js
// before
const found = alertForMiscreant(people)

// after
const found = findMiscreant(people)
```

- 4️⃣ 원래 함수를 이용하던 곳에서 새로운 함수를 호출하도록 바꿈

```js
function alertForMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            sendOffAlarms()
            return
        }
        if (p === "사루만") {
            sendOffAlarms()
            return
        }
    }
    return
}
```

- 5️⃣ 원래의 함수에서 질의 관련 코드 제거

<br>

## 11.2 함수 매개변수화하기

```js
function tenPercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.1);
}
function fivePercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.05);
}
```

```js
function raise(aPerson, factor) {
    aPerson.salary = aPerson.salary.multiply(1 + factor);
}
```

### 배경

- 두 함수의 로직이 아주 비슷하고 리터럴 값만 다르다면, <u>다른 값만 매개변수로 받아 처리</u>하는 함수 하나로 합쳐서 중복을 없앨 수 있음

### 절차

1. 비슷한 함수 중 하나를 선택
2. **함수 선언 바꾸기(6.5)**로 리터럴들을 매개변수로 추가
3. 이 함수를 호출하는 곳 모두에 적절한 리터럴 값 추가
4. 매개변수로 받은 값을 사용하도록 함수 본문을 수정
5. 비슷한 다른 함수를 호출하는 코드를 찾아 매개변수화된 함수를 호출하도록 하나씩 수정

### 예시

```js
function tenPercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.1);
}

function fivePercentRaise(aPerson) {
    aPerson.salary = aPerson.salary.multiply(1.05);
}
```

- 앞의 두 함수는 다음 함수로 대체할 수 있음

```js
function raise(aPerson, factor) {
    aPerson.salary = aPerson.salary.multiply(1 + factor);
}
```

- 간단히 끝나지 않는 다음과 같은 코드도 있음

```js
function baseCharge(usage) {
    if (usage < 0) return usd(0);
    const amount = bottomBand(usage) * 0.03
    			   + middleBand(usage) * 0.05
    			   + topBand(usage) * 0.07;
    return use(amount);
}

function bottomBand(usage) {
    return Math.min(usage, 100);
}

function middleBand(usage) {
    return usage > 100 ? Math.min(usage, 200) - 100 : 0;
}

function topBand(usage) {
    return usage > 200 ? usage - 200 : 0;
}
```

- **1.** 먼저 대상 함수 중 하나를 골라 **매개변수**를 추가 (다른 함수들까지 고려해서 선택 → 범위를 다루는 로직에서는 대개 <u>중간에 해당하는 함수</u>가 좋음)
- **2.** `middleBand()` 는 리터럴을 두 개(100과 200) 사용하며, 여기에 **함수 선언 바꾸기(6.5)** 적용
- **3.** 이 리터럴들을 호출 시점에 입력하도록 변경

```js
function withinBand(usage, bottom, top) {  // 1. 매개변수 추가, 2. 함수 선언 바꾸기
    return usage > 100 ? Math.min(usage, 200) - 100 : 0;
}

function baseCharge(usage) {
    if (usage < 0) return usd(0);
    const amount = bottomBand(usage) * 0.03
    			   + withinBand(usage, 100, 200) * 0.05  // 3. 리터럴들을 호출 시점에 입력
    			   + topBand(usage) * 0.07;
    return use(amount);
}
```

- **4.** 함수에서 사용하던 리터럴들을 적절한 **매개변수**로 대체

```js
function withinBand(usage, bottom, top) {
    return usage > bottom ? Math.min(usage, top) - bottom : 0;  // 리터럴들을 매개변수로 대체
}
```

- **5.** 대역의 하한(`bottomBand`)과 상한(`topBand`)을 호출하는 부분도 새로운 함수로 변경

```js
function baseCharge(usage) {
    if (usage < 0) return usd(0);
    const amount = withinBand(usage, 0, 100) * 0.03  // 하한 함수 변경
    			   + withinBand(usage, 100, 200) * 0.05
    			   + withinBand(usage, 200, Infinity) * 0.07;  // 상한 함수 변경 (Infinity 활용)
    return use(amount);
}
```

<br>

## 11.3 플래그 인수 제거하기

```js
function setDimension(name, value) {
    if (name === "height") {
        this._height = value;
        return;
    }
    if (name === "width") {
        this._width = value;
        return;
    }
}
```

```js
function setHeight(value) {this._height = value;}
function setWidth(value) {this._width = value;}
```

### 배경

- **플래그 인수**는 호출되는 함수가 실행할 로직을 <u>호출하는 쪽에서 선택</u>하기 위해 전달됨
  - 호출할 수 있는 함수들이 무엇이고 어떻게 호출해야 하는지를 이해하기 어려워질 수 있음 (필요한 플래그 인수 또한 알아내야 함)
  - 플래그 인수로 인해 함수들의 기능 차이가 잘 드러나지 않음
- 플래그 인수를 사용하여 **함수의 수**를 줄일 수 있지만, 다른 관점에서는 함수 하나가 <u>너무 많은 일을 처리</u>하고 있다고 볼 수 있음

### 절차

1. 매개변수로 주어질 수 있는 값 각각에 대응하는 명시적 함수들을 생성
   → 주가 되는 함수에 깔끔한 분배 조건문이 포함되어 있다면 **조건문 분해하기(10.1)**로 명시적 함수들을 생성, 그렇지 않다면 래핑 함수 형태로 만들기
2. 원래 함수를 호출하는 코드들을 모두 찾아서 각 리터럴 값에 대응되는 명시적 함수를 호출하도록 수정

### 예시

> 배송일자를 계산하는 호출

```js
aShipment.deliveryData = deliveryDate(anOrder, true);
aShipment.deliveryData = deliveryDate(anOrder, false);
```

- 해당 불리언 값이 무엇을 의미하는지 파악하기 어려움

```js
function deliveryData(anOrder, isRush) {
    if (isRush) {
        let deliveryTime;
        if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
        else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
        else deliveryTime = 3;
        return anOrder.placedOn.plusDays(1 + deliveryTime);
    }
    else {
        let deliveryTime;
        if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
        else if (["ME", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
        else deliveryTime = 4;
        return anOrder.placedOn.plusDays(2 + deliveryTime);
    }
}
```

- 이 함수가 어느 코드를 실행할지는 전적으로 <u>호출자의 지시</u>에 따르게 됨, 따라서 **명시적인 함수**를 사용해 호출자의 의도를 분명히 밝히는 것이 좋음
- **1.** **조건문 분해하기(10.1)** 적용

```js
function deliveryData(anOrder, isRush) {
    if (isRush) return rushDeliveryDate(anOrder);
    else return regularDeliveryData(anOrder);
}

function rushDeliveryDate(anOrder) {
    let deliveryTime;
    if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
    else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else deliveryTime = 3;
    return anOrder.placedOn.plusDays(1 + deliveryTime);
}

function regularDeliveryDate(anOrder) {
    let deliveryTime;
    if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
    else if (["ME", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
    else deliveryTime = 4;
    return anOrder.placedOn.plusDays(2 + deliveryTime);
}
```

- **2.** 처음의 호출을 다음과 같이 대체

```js
aShipment.deliveryData = rushDeliveryDate(anOrder);
aShipment.deliveryData = regularDeliveryDate(anOrder);
```

### 예시 : 매개변수를 까다로운 방식으로 사용할 때

```js
function deliveryDate(anOrder, isRush) {
    let result;
    let deliveryTime;
    if (anOrder.deliveryState === "MA" || anOrder.deliveryState === "CT") {
        deliveryTime = isRush ? 1 : 2;
    } else if (anOrder.deliveryState === "NY" || anOrder.deliveryState === "NH") {
        deliveryTime = 2;
        if (anOrder.deliveryState === "NH" && !isRush) {
            deliveryTime = 3;
        }
    } else if (isRush) {
        deliveryTime = 3;
    } else if (anOrder.deliveryState === "ME") {
        deliveryTime = 3;
    } else {
        deliveryTime = 4;
    }
    result = anOrder.placedOn.plusDays(2 + deliveryTime);
    if (isRush) result = result.minusDays(1);
    return result;
}
```

- 이 코드에서 `isRush` 를 **최상위 분배 조건문**으로 뽑아내려면 생각보다 일이 커질 수 있음
- **1.** `deliveryDate()` 를 감싸는 **래핑 함수**를 생각해볼 수 있음

```js
function rushDeliveryDate(anOrder) {return deliveryDate(anOrder, true);}
function regularDeliveryDate(anOrder) {return deliveryDate(anOrder, false);}
```

<br>

## 11.4 객체 통째로 넘기기

```js
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (aPlan.withinRange(low, high))
```

```js
if (aPlan.withinRange(aRoom.daysTempRange))
```

### 배경

- 하나의 레코드에서 값 두어 개를 가져와 인수로 넘기는 코드는 **레코드를 통째**로 넘기고 <u>함수 본문에서 값을 꺼내 쓰도록</u> 수정할 수 있음
  - 매개변수 목록이 짧아져서 **함수 사용법**을 익히기 쉽고, 비슷한 데이터를 사용하는 함수들끼리의 **로직 중복**을 없앨 수 있음
- 레코드와 함수가 **서로 다른 모듈**에 속해서, 함수가 <u>레코드 자체에 의존하기를 원치 않을 때</u>는 이 리팩터링을 수행하지 않음
- **매개변수 객체 만들기(6.8)** 후 산재한 수많은 데이터 더미를 새로운 객체로 묶은 후 적용하는 경우가 많음
- 한 객체가 제공하는 기능 중 항상 <u>똑같은 일부만을 사용</u>하는 코드가 많다면, 따로 묶어서 **클래스로 추출(7.5)** 하라는 신호

### 절차

1. 매개변수들을 원하는 형태로 받는 빈 함수 만들기
   → 마지막 단계에서 이 함수의 이름을 변경해야 하니 검색하기 쉬운 이름으로 지어주기
2. 새 함수의 본문에서는 원래 함수를 호출하도록 하며, 새 매개변수와 원래 함수의 매개변수를 매핑
3. 모든 호출자가 새 함수를 사용하게 수정
   → 수정 후에는 원래의 매개변수를 만들어내는 코드 일부가 필요 없어질 수 있음. 따라서 **죽은 코드 제거하기(8.9)**로 없애기
4. 호출자를 모두 수정했다면 **원래 함수를 인라인(6.2)**
5. 새 함수의 이름을 적절히 수정하고 모든 호출자에 반영

### 예시

> 실내온도 모니터링 시스템, 일일 최저/최고 기온이 난방 계획에서 정한 범위를 벗어나는지 확인함

```js
// 호출자
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high)) {
    alerts.push("방 온도가 지정 범위를 벗어났습니다.");
}
```

```js
// HeatingPlan 클래스
withinRange(bottom, top) {
    return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
}
```

- 최저/최고 기온을 뽑아내어 인수로 건네는 대신 범위 객체를 통째로 전달
  - **1.** 원하는 인터페이스를 갖춘 빈 메서드 만들기
  - **2.** 본문은 기존 `withinRange()` 를 호출하는 코드로 채우기

```js
// HeatingPlan 클래스
xxNEWwithinRange(aNumberRange) {  // 1. 빈 메서드 만들기
    return this.withinRange(aNumberRange.low, aNumberRange.high);  // 2. 본문은 기존 함수 호출
}
```

- **3.** 기존 함수를 호출하는 코드를 찾아서 새 함수를 호출하게 수정
  - 기존의 매개변수를 만들어내는 코드 삭제

```js
// 호출자
// 기존의 매개변수 생성 코드 삭제
// const low = aRoom.daysTempRange.low;
// const high = aRoom.daysTempRange.high;
if (!aPlan.xxNEWwithinRange(aRoom.daysTempRange)) {
    alerts.push("방 온도가 지정 범위를 벗어났습니다.");
}
```

- **4.** 모두 새 함수로 대체한 뒤 원래 함수를 인라인
- **5.** 새 함수에서 접두어를 제거하고 호출자들에도 모두 반영

```js
// HeatingPlan 클래스
withinRange(aNumberRange) {  // 5. 접두어 제거
    // 4. 원래 함수 인라인
    return (aNumberRange.low >= this._temperatureRange.low) && (aNumberRange.high <= this._temperatureRange.high);
}
```

```js
// 호출자
if (!aPlan.withinRange(aRoom.daysTempRange)) {  // 5. 호출자 접두어 제거
    alerts.push("방 온도가 지정 범위를 벗어났습니다.");
}
```

### 예시 : 새 함수를 다른 방식으로 만들기

> 코드 작성 없이 순전히 다른 리팩터링들을 연달아 수행하여 새 메서드 만들기

- 조건문과 매개변수에 **변수 추출하기(6.5)** 적용

```js
// 호출자
const tempRange = aRoom.daysTempRange;  // 매개변수 추출
const low = tempRange.low;
const high = tempRange.high;
const isWithinRange = aPlan.withinRange(low, high);  // 조건문 추출
if (!isWithinRange) {
    alerts.push("방 온도가 지정 범위를 벗어났습니다.");
}
```

- **함수 추출하기(6.1)** 로 새 메서드 만들기

```js
// 호출자
const tempRange = aRoom.daysTempRange;
const isWithinRange = xxNEWwithinRange(aPlan, tempRange);  // 함수 추출하기
if (!isWithinRange) {
    alerts.push("방 온도가 지정 범위를 벗어났습니다.");
}
```

```js
// 최상위
function xxxNEWwithinRange(aPlan, tempRange) {  // 함수 추출하기
    const low = tempRange.low;
    const high = tempRange.high;
    const isWithinRange = aPlan.withinRange(low, high);
    return isWithinRange;
}
```

- 원래 메서드는 다른 컨텍스트(`HeatingPlan` 클래스)에 있으니 **함수 옮기기(8.1)** 수행

```js
// 호출자
const tempRange = aRoom.daysTempRange;
const isWithinRange = aPlan.xxNEWwithinRange(tempRange);
if (!isWithinRange) {
    alerts.push("방 온도가 지정 범위를 벗어났습니다.");
}
```

```js
// HeatingPlan 클래스
xxxNEWwithinRange(tempRange) {  // 함수 추출하기
    const low = tempRange.low;
    const high = tempRange.high;
    const isWithinRange = aPlan.withinRange(low, high);
    return isWithinRange;
}
```

- 이후의 로직은 앞과 동일 (다른 호출자 수정, 옛 메서드를 새 메서드 안으로 인라인 등)

<br>

## 11.5 매개변수를 질의 함수로 바꾸기

```js
availableVacation(anEmployee, anEmployee.grade);

function availableVacation(anEmployee, grade) {
    // 연휴 계산...
}
```

```js
availableVacation(anEmployee)

function availableVacation(anEmployee) {
    const grade = anEmployee.grade;
    // 연휴 계산...
}
```

### 배경

- 피호출 함수가 스스로 **'쉽게' 결정할 수 있는 값**을 매개변수로 건네는 것도 일종의 중복

  - 매개변수가 있다면 결정 주체가 <u>호출자</u>, 없다면 <u>피호출 함수</u>가 됨

  - 제거하려는 매개변수의 값을 다른 매개변수에 질의해서 얻을 수 있다면 안심하고 질의 함수로 변경 (대상 함수는 **참조 투명**해야 함)

    > **참조 투명** : 함수에 똑같은 값을 건네 호출하면 항상 똑같이 동작

- 매개변수를 제거하면 피호출 함수에 <u>원치 않는 의존성이 생기는 경우</u> 리팩터링을 시행하지 않음

### 절차

1. 필요하다면 대상 매개변수의 값을 계산하는 코드를 **별도 함수로 추출(6.1)** 해놓기
2. 함수 본문에서 대상 매개변수로의 참조를 모두 찾아서 그 매개변수의 값을 만들어주는 표현식을 참조하도록 바꾸기
3. **함수 선언 바꾸기(6.5)** 로 대상 매개변수 없애기

### 예시

> 다른 리팩터링을 수행한 뒤 특정 매개변수가 더는 필요 없어졌을 때

```js
// Order 클래스
get finalPrice() {
    const basePrice = this.quantity * this.itemPrice;
    let discountLevel;
    if (this.quantity > 100) discountLevel = 2;
    else discountLevel = 1;
    return this.discountedPrice(basePrice, discountLevel);
}

discountedPrice(baseprice, discountLevel) {
    switch (discountLevel) {
    	case 1: return basePrice * 0.95;
        case 2: return basePrice * 0.9;
    }
}
```

- 함수를 간소화하다 보면 **임시 변수를 질의 함수로 바꾸기(7.4)** 를 적용할 때가 많음 (`finalPrice()` 함수에 적용)

```js
// Order 클래스
get finalPrice() {
    const basePrice = this.quantity * this.itemPrice;
    return this.discountedPrice(basePrice, this.discountLevel);
}

get discountLevel() {
    return (this.quantity > 100) ? 2 : 1;
}
```

- 그 결과로 `discountedPrice()` 함수에 `discountLevel()` 의 반환 값을 건넬 이유가 사라짐
  - **2.** 매개변수를 참조하는 코드를 모두 함수 호출로 변경
  - **3.** **함수 선언 바꾸기(6.5)** 로 매개변수 제거

```js
// Order 클래스
get finalPrice() {
    const basePrice = this.quantity * this.itemPrice;
    return this.discountedPrice(basePrice);  // 3. 함수 선언 바꾸기
}

get discountLevel() {
    return (this.quantity > 100) ? 2 : 1;
}

discountedPrice(baseprice) {  // 3. 함수 선언 바꾸기
    switch (this.discountLevel) {  // 2. 참조 코드 함수 호출로 변경
    	case 1: return basePrice * 0.95;
        case 2: return basePrice * 0.9;
    }
}
```

<br>

## 11.6 질의 함수를 매개변수로 바꾸기

```js
targetTemperature(aPlan)

function targetTemperature(aPlan) {
    currentTemperature = thermostat.currentTemperature;
    // 생략
}
```

```js
targetTemperature(aPlan, thermostat.currentTemperature)

function targetTemperature(aPlan, currentTemperature) {
    // 생략
}
```

### 배경

- 함수 안에서 **전역 변수**를 참조한다거나 **제거하길 원하는 원소**를 참조하는 경우, 해당 참조를 매개변수로 바꿔 해결할 수 있음 (책임을 <u>호출자</u>로 옮기기)
  - 대상 함수가 더 이상 특정 원소에 의존하길 원치 않을 때 진행
- 참조 투명하지 않은 원소에 접근하는 모든 함수는 참조 투명성을 잃게 되는데, 이는 해당 원소를 **매개변수**로 바꾸면 해결됨
- <u>어떤 값을 제공</u>할지를 호출자가 알아내야 한다는 단점 존재

### 절차

1. **변수 추출하기(6.3)** 로 질의 코드를 함수 본문의 나머지 코드와 분리
2. 함수 본문 중 해당 질의를 호출하지 않는 코드들을 **별도 함수로 추출(6.1)**
   → 이 함수의 이름은 나중에 수정해야 하니 검색하기 쉬운 이름으로 짓기
3. 방금 만든 **변수를 인라인(6.4)** 하여 제거
4. 원래 **함수도 인라인(6.2)**
5. 새 함수의 이름을 원래 함수의 이름으로 고치기

### 예시

> 실내온도 제어 시스템. 온도조절기로 온도를 설정할 수 있지만, 목표 온도는 난방 계획에서 정한 범위에서만 선택할 수 있음

```js
// HeatingPlan 클래스
get targetTemperature() {
    if (thermostat.selectedTemperature > this._max) return this._max;
    else if (thermostat.selectedTemperature < this._min) return this._min;
    else return thermostat.selectedTemperature;
}
```

```js
// 호출자
if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();
```

- `targetTemperature()` 메서드가 전역 객체인 `thermostat` 에 의존함
- **1.** **변수 추출하기(6.3)** 를 이용하여 메서드에서 사용할 매개변수 준비

```js
// HeatingPlan 클래스
get targetTemperature() {
    const selectedTemperature = thermostat.selectedTemperature;  // 1. 변수 추출하기
    if (selectedTemperature > this._max) return this._max;
    else if (selectedTemperature < this._min) return this._min;
    else return selectedTemperature;
}
```

- **2.** 매개변수의 값을 구하는 코드를 제외한 나머지를 **메서드로 추출(6.1)**

```js
// HeatingPlan 클래스
get targetTemperature() {
    const selectedTemperature = thermostat.selectedTemperature;
    return this.xxNEWtargetTemperature(selectedTemperature);  // 2. 메서드 추출
}

xxNEWtargetTemperature(selectedTemperature) {  // 2. 메서드 추출
    if (selectedTemperature > this._max) return this._max;
    else if (selectedTemperature < this._min) return this._min;
    else return selectedTemperature;
}
```

- **3.** 방금 추출한 **변수를 인라인(6.4)**
- **4.** **메서드까지 인라인(6.2)**

```js
// HeatingPlan 클래스
get targetTemperature() {
    return this.xxNEWtargetTemperature(thermostat.selectedTemperature);  // 3. 변수 인라인
}
```

```js
// 호출자
// 4. 메서드 인라인
if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
else if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
else setOff();
```

- **5.** 새 메서드의 이름을 원래 메서드의 이름으로 바꾸기

```js
// HeatingPlan 클래스
get targetTemperature(selectedTemperature) {  // 5. 원래 메서드의 이름으로 바꾸기
    if (selectedTemperature > this._max) return this._max;
    else if (selectedTemperature < this._min) return this._min;
    else return selectedTemperature;
}
```

```js
// 호출자
// 5. 원래 메서드의 이름으로 바꾸기
if (thePlan.targetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
else setOff();
```

<br>

## 11.7 세터 제거하기

```js
class Person {
    get name() {...}
    set name(aString) {...}
}
```

```js
class Person {
    get name() {...}
}
```

### 배경

- 사람들이 **접근자 메서드**를 통해서만 필드를 다루려 할 때, 세터를 제거해서 객체가 생성된 후에는 <u>값이 바뀌면 안 된다</u>는 뜻을 나타낼 수 있음

- 클라이언트에서 **생성 스크립트**를 사용해 객체를 생성할 때는, 스크립트가 완료된 뒤 <u>객체의 필드 일부/전체가 변경되지 않는다</u>는 의도를 전달할 수 있음

  > **생성 스크립트** : 생성자를 호출한 후 일련의 세터를 호출하여 객체를 완성하는 형태의 코드

### 절차

1. 설정해야 할 값을 생성자에서 받지 않는다면 그 값을 받을 매개변수를 생성자에 추가 (**함수 선언 바꾸기(6.5)**), 그런 다음 생성자 안에서 적절한 세터 호출
   → 세터 여러 개를 제거하려면 해당 값 모두를 한꺼번에 생성자에 추가
2. 생성자 밖에서 세터를 호출하는 곳을 찾아 제거하고, 대신 새로운 생성자를 사용하도록 함
   → (갱신하려는 대상이 공유 참조 객체라서) 새로운 객체를 생성하는 방식으로는 세터 호출을 대체할 수 없다면 이 리팩터링을 취소
3. 세터 **메서드를 인라인(6.2)**. 가능하다면 해당 필드를 불변으로 만들기

### 예시

> 간단한 사람 클래스

```js
// Person 클래스
get name() {return this._name;}
set name(arg) {this._name = arg;}
get id() {return this._id;}
set id(arg) {this._id = arg;}
```

```js
const martin = new Person();
martin.name = "마틴";
martin.id = "1234";
```

- 이름은 객체를 생성한 뒤라도 변경될 수 있겠지만 `id` 는 그러면 안 됨 → **1.** **함수 선언 바꾸기(6.5)** 로 생성자에서 ID 받기
- **2.** 생성 스크립트가 이 생성자를 통해 ID 를 설정하게끔 수정

```js
// Person 클래스
constructor(id) {  // 1. 함수 선언 바꾸기
    this.id = id;
}
```

```js
const martin = new Person("1234");  // 2. 생성자 수정
martin.name = "마틴";
// martin.id = "1234";
```

- 모두 수정했다면 **3.** **세터 메서드 인라인(6.2)**

```js
// Person 클래스
constructor(id) {
    this._id = id;  // 3. 메서드 인라인
}

get name() {return this._name;}
set name(arg) {this._name = arg;}
get id() {return this._id;}
// set id(arg) {this._id = arg;}  // 3. 메서드 인라인
```

<br>

## 11.8 생성자를 팩터리 함수로 바꾸기

```js
leadEngineer = new Employee(document.leadEngineer, 'E');
```

```js
leadEngineer = createEngineer(document.leadEngineer);
```

### 배경

- 생성자는 **객체를 초기화**하는 특별한 용도의 함수로, <u>새로운 객체를 생성</u>할 때면 주로 생성자를 호출함
- 생성자에는 일반 함수에는 없는 <u>이상한 제약</u>이 따라붙기도 함
  - 자바 생성자는 반드시 그 생성자를 정의한 클래스의 인스턴스를 반환해야 함 (서브클래스의 인스턴스나 프락시를 반환할 수 없음)
  - 생성자의 이름도 고정되어, 기본 이름보다 더 적절한 이름이 있어도 사용할 수 없음
- 팩터리 함수에는 생성자와 같은 제약이 없고, 함수 구현 과정에서 생성자를 호출할 수 있지만 다른 무언가로 대체 가능

### 절차

1. 팩터리 함수 만들기. 팩터리 함수의 본문에서는 원래의 생성자를 호출
2. 생성자를 호출하던 코드를 팩터리 함수 호출로 변경
3. 생성자의 가시 범위가 최소가 되도록 제한

### 예시

> 직원 유형을 다루는, 간단하지만 이상한 예

```js
// Employee 클래스
constructor(name, typeCode) {
    this._name = name;
    this._typeCode = typeCode;
}

get name() {return this._name;}
get type() {
    return Employee.legalTypeCodes[this._typeCode];
}
static get legalTypeCodes() {
    return {"E": "Engineer", "M": "Manager", "S": "Salesperson"};
}
```

```js
// 호출자
candidate = new Employee(document.name, document.empType);
const leadEngineer = new Employee(document.leadEngineer, 'E');
```

- **1.** 팩터리 함수 만들기 (팩터리 본문은 단순히 생성자에 위임)
- **2.** 생성자를 호출하는 곳을 찾아 수정

```js
// 최상위
function createEmployee(name, typeCode) {  // 1. 팩터리 함수 만들기
    return new Employee(name, typeCode);
}
```

```js
// 호출자
// 2. 생성자 호출하는 곳 수정
candidate = createEmployee(document.name, document.empType);
const leadEngineer = createEmployee(document.leadEngineer, 'E');
```

- 함수에 문자열 리터럴 `E` 을 건네는 건 권장하는 코드 스타일이 아님 → 직원 유형을 팩터리 함수의 **이름**에 녹이기

```js
// 최상위
function createEngineer(name) {
    return new Employee(name, 'E');
}
```

```js
// 호출자
const leadEngineer = createEngineer(document.leadEngineer);
```

