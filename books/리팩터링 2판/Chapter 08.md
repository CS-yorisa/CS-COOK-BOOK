# Chapter 08. 기능 이동



## 8.1 함수 옮기기

``` js
class Account {
  getoverdraftCharge();
}
```

``` js
class AccountType {
  get overdraftCharge() {
    //...
  }
}
```



### 배경

- 좋은 소프트웨어 설계의 핵심은 모듈화가 얼마나 잘 되어 있느냐를 뜻하는 모듈성
  - 프로그램 수정 시 해당 기능과 깊이 관련된 작은 일부만 이해해도 가능하게 해줌
  - 모듈성을 높이려면 서로 연관된 요소를 함께 묶고, 요소 사이의 연결 관계를 쉽게 찾고 이해할 수 있도록 해야 함
- 객체 지향 프로그래밍의 핵심 모듈화 컨텍스트는 클래스
- 함수 이동 전에 대상 함수의 현재 컨텍스트와 후보 컨텍스트를 둘러보며 판단



### 절차

1. 선택한 함수가 현재 컨텍스트에서 사용 중인 모든 프로그램 요소를 살피고 이 요소들 중에서도 함께 옮겨야 할 게 있는지 확인
   - 호출되는 함수 중 함께 옮길 게 있다면 그 함수를 먼저 옮기는 게 나으며 얽혀 있는 함수가 여러 개라면 다른 곳에 미치는 영향이 적은 함수부터 이동
   - 하위 함수들의 호출자가 고수준 함수 하나뿐이면 먼저 하위 함수들을 고수준 함수에 인라인한 다음, 고수준 함수를 옮기고, 옮긴 위치에서 개별 함수들로 다시 추출
2. 선택한 함수가 다형 메서드인지 확인
   - 객체 지향 언어에서는 같은 메서드가 슈퍼클래스나 서브클래스에도 선언되어 있는지까지 고려
3. 선택한 함수를 타깃 컨텍스트로 복사 (원래의 함수를 소스 함수라하고 복사해서 만든 새로운 함수를 타깃 함수라 함) 후 타깃 함수 다듬기
   - 함수 본문에서 소스 컨텍스트의 요소를 사용한다면 해당 요소들을 매개변수로 넘기거나 소스 컨텍스트 자체를 참조로 넘겨줌
   - 필요하다면 새로운 컨텍스트에 어울리는 함수 이름으로 변경
4. 정적 분석 수행
5. 소스 컨텍스트에서 타깃 함수를 참조할 방법을 찾아 반영
6. 소스 함수를 타깃 함수의 위임 함수가 되도록 수정
7. 테스트
8. 소스 함수를 인라인할지 고민
   - 소스 함수는 언제까지라도 위임 함수로 남겨둘 수 있지만, 소스 함수를 호출하는 곳에서 함수를 직접 호출하는데 무리가 없다면 중간 단계(소스 함수)는 제거하는 편이 나음



### 예시 : 중첩 함수를 최상위로 옮기기

- GPS 추적 기록의 총 거리를 계산하는 함수

``` js
function trackSummary(points){
  const totalTime = calculateTime();
  const totalDistance = calculateDistance();
  const pace = totalTime / 60 / totalDistance;
  return {
    time : totalTime,
    distance : totalDistance,
    pace : pace
  };
  
  function calculateDistance(){ // 총 거리 계산
    let result = 0;
    for (let i = 1; i < points.length; i++){
      result += distance(points[i-1], points[i]);
    }
    return result;
  }
  
	function distance(p1, p2) { ... } // 두 지점의 거리 계산
	function radians(degrees) { ... } // 라디안 값으로 변환
	function calculateTime() { ... } // 총 시간 계산
}
```

- 이 함수 중에서 중첩 함수인 calculateDistance()를 최상위로 옮겨서 추적 거리를 다른 정보와는 독립적으로 계산하고 싶을때, 가장 먼저 해당 함수를 최상위로 복사

``` js
// 최상위로 복사하며 새로운(임시) 이름을 지어줌
function top_calculateDistance(){
  let result = 0;
  for (let i = 1; i < points.length; i++){
    result += distance(points[i-1], points[i]);
  }
  
  return result;
}
```

- 새 함수가 정의되지 않은 심벌(distance, points)을 사용하고 있어, 매개 변수로 넘겨받도록 수정

``` js
function top_calculateDistance(points){
  let result = 0;
  for (let i = 1; i < points.length; i++){
    result += distance(points[i-1], points[i]);
  }
  
  return result;
}
```

- distance() 함수는 calculateDistance()와 함께 옮기기

``` js
function distance(p1, p2){
  const EART_RADIUS = 3959;
  const dLat = radians(p2.lat) - radians(p1.lat);
  const dLon = radians(p2.lon) = radians(p1.lon);
  // ... 계산 로직 (생략)
}

function radians(drgees){
  return degrees * Math.PI / 180;
}
```

- distance()는 radians()만 사용하며, radians()는 현재 컨텍스트에 있는 어떤 것도 사용하지 않으므로 두 함수를 매개변수로 넘기기보다는 함께 `calculateDistance()` 함수 안으로 옮겨버리는게 나음
- 정적 분석과 테스트를 활용해 문제가 있는지 검증하고, 문제가 없으면 같은 내용을 새로 만든 top_calculateDistance() 함수로도 복사

``` js
function top_calculateDistance(points){
  let result = 0;
  for (let i = 1; i < points.length; i++){
    result += distance(points[i-1], points[i]);
  }
  
  return result;
  
  function distance(p1, p2) { ... }
	function radians(degrees) { ... }
}
```

- 소스 함수인 calculateDistance()의 본문을 수정하여 top_calculateDistance()를 호출하게 함

``` js
function calculateDistance(){
  return top_calculateDistance(points);
}
```

- 모든 테스트가 통과했는지 확인 하고 소스 함수를 대리자 역할로 그대로 둘지 확인
  - 이 경우는 호출자가 많지 않은 지역화된 함수라 제거하는 편이 나음

``` js
function trackSummary(points){
  const totalTime = calculateTime();
  const totalDistance = top_calculateDistance(points);
  const pace = totalTime / 60 / totalDistance;
  return {
    time : totalTime,
    distance : totalDistance,
    pace : pace
  };
}
```

- 새 함수에 새로운 이름 붙이기
- 해당 함수에서 totalDistance()라는 함수 이름이 적당해보이나, 이미 똑같은 이름의 변수가 있어 변수 인라인하기로 해결
- distance()와 radians() 함수도 totalDistance() 안의 어떤 것도 의존하지 않으므로 해당 함수들도 모두 최상위로 옮길 수도 있고, totalDistance() 안에 그대로 둘 수도 있음



### 예시 : 다른 클래스로 옮기기

``` js
// Account 클래스
get bankCharge() {
  let result = 4.5;
  if (this._daysOverdrawn > 0) result += this.overdraftCharge;
  return result;
}

get overdraftCharge() { // 초과 인출 이자 계산
  if (this.type.isPremium){
    const baseCharge = 10;
    if (this.daysOverdrawn <= 7)
      return baseCharge;
    else
      return baseCharge + (this.daysOverdrawn - 7) * 0.85;
  }
  else
    return this.daysOverdrawn * 1.75;
}
```

- 계좌 종류에 따라 이자 책정 알고리즘이 달라지도록 고치기
  - 마이너스 통장의 초과 인출 이자를 계산하는 `overdraftCharge()`를 계좌 종류 클래스인 AccountType으로 옮기는게 자연스러울 것
- `overdraftCharge()` 메서드가 사용하는 기능들을 살펴보고, 그 모두를 한꺼번에 옮겨야할 지 확인
  - `daysOverdrawn()` 메서드는 계좌 종류가 아닌, 계좌별로 달라지는 메서드라 남겨둠
- `overdraftCharge()` 본문을 `AccountType` 클래스로 복사한 후 새 보금자리에 맞게 정리

``` js 
// AccountType 클래스
// 우선은 간단히 daysOverdrawn 값만 넘기도록 변경하였고, 다른 정보가 필요해지면 계좌 자체를  넘기도록 변경
get overdraftCharge(daysOverdrawn) {
  if (this.isPremium){
    const baseCharge = 10;
    if (daysOverdrawn <= 7)
      return baseCharge;
    else
      return baseCharge + (daysOverdrawn - 7) * 0.85;
  }
  else
    return daysOverdrawn * 1.75;
}
```

- 원래 메서드의 본문을 수정하여 새 메서드 호출. 이러면 원래 메서드는 위임 메서드가 됨

``` js
get bankCharge(){
  let result = 4.5;
	if (this._daysOverdrawn > 0) result += this.overdraftCharge;
  return result;
}

get overdraftCharge() { // 위임 메서드
  return this.type.overdraftCharge(this.daysOverdrawn);
}
```

- 위임 메서드인 `overdraftCharge()` 를 남겨둘 지 인라인 할지 정하고 처리

``` js
get bankCharge(){
  let result = 4.5;
	if (this._daysOverdrawn > 0) result += this.type.overdraftCharge(this.daysOverdrawn);
  return result;
}
```

## 8.2 필드 옮기기

```js
// before
class Customer {
    get plan() {return this._plan}
    get discountRate() {return this._discountRate}
}

// after
class Custormer {
    get plan() {return this._plan}
    get discountRate() {return this.plan.discountRate}
}
```

### 배경

- 프로그램의 상당 부분이 동작을 구현하는 코드로 이루어지지만, 진짜 힘은 데이터 구조에서 나옴
- 데이터 구조를 잘못 선택하면, 아귀가 맞지 않는 데이터를 다루기 위한 코드로 범벅이 됨
- 데이터 구조가 중요하지만, 초기 설계에서는 실수가 빈번함
- 데이터 구조가 적합하지 않음을 알게 되면, 곧바로 수정해야됨
    - 어떤 레코드를 넘길 때마다 레코드의 필드를 넘기고 있다면, 데이터 위치를 옮겨야 됨
    - 함수에 항상 함께 건네지는 데이터 조각들은 상호 관계가 명확해야됨
    - 한 레코드를 변경하려 할 대, 다른 레코드의 필드까지 변경해야만 한다면, 필드 위치가 잘못 된 것
- 레코드라는 용어를 사용했지만, 레코드 대신 클래스나 객체의 경우도 같음
    - 이어지는 설명에서도 클래스를 사용한다고 가정

### 절차

1. 소스 필드가 캡슐화되어 있지 않다면 캡슐화
2. 테스트
3. 타깃 객체에 필드(와 접근자 메서드)를 생성
4. 정적 검사 수행
5. 소스 객체에서 타깃 객체를 참조할 수 있는지 확인
    - 기존 필드나 메스드 중 타깃 객체를 넘겨주는 게 있을지 모름
    - 없다면 이런 기능의 메스드를 쉽게 만들 수 있는지 확인
6. 접근자들이 타깃 필드를 사용하도록 수정
    - 여로 소스에서 같은 타깃을 공유한다면, 세터를 수정하여 타깃 필드와 소스 필드를 모두 갱신하도록 함
    - 이어서 객신을 검출할 수 있는 어서션(10.6)
7. 테스트
8. 소스 필드 제거
9. 테스트

### 예시

```js
// Customer class
constructor(name, discountRate) {
    this._name = name
    this._discountRate = distcountRate
    this._contract = new CustomerContract(dateToday())
}
get discountRate() {return this._discountRate}
becomePreferred() {
    this._discountRate += 0.03
    // codes
}
applyDiscount(amount) {
    return amount.subtract(amount.multiply(this._discountRate))
}

// CustomerContract class
construtor(startDate) {
    this._startDate = startDate
}
```

- 할인율을 뜻하는 `dicsountRate`필드를 `Customer`에서 `CustoemrContract`로 옮기고 싶음

```js
// Customer class
constructor(name, discountRate) {
    this._name = name
    this._setDiscountRate(discountRate)
    this._contract = new CustomerContract(dateToday())
}
get discountRate() {return this._discountRate}
_setDiscountRate(aNumber) {return this._discountRate = aNumber}
becomePreferred() {
    this._setDiscountRate += 0.03
    // codes
}
applyDiscount(amount) {
    return amount.subtract(amount.multiply(this._discountRate))
}
```

- 필드 캡슐화 (6.6 변수 캡슐화하기)

```js
// CustomerContract class
construtor(startDate, discountRate) {
    this._startDate = startDate
    this._discountRate = discountRate
}

get discountRate() {return this._discountRate}
set discountRate(arg) {this._discountRate = arg}
```

- `CustomerContract` 클래스에 필드 하나와 접근자 추가

```js
// Customer class
constructor(name, discountRate) {
    this._name = name
    this._contract = new CustomerContract(dateToday())
    this._setDiscountRate(discountRate)
}
```

- `Customer`의 접근자들이 새로운 필드를 사용하도록 수정
    - 수정하면, 생성자에서 `Contract`객체를 생성하기 전에 `_setDiscountRate()`를 호출하기 때문에 오류 발생
    - 오류 해결을 위해 기존 상태로 돌린 다음, 문장 슬라이드(8.6)을 적용, `_setDiscountRate()`호출을 계약 생성 뒤로 옮김

```js
// Customer class
get discountRate() {return this._contract.discountRate}
_setDiscountRate(aNumber) {return this._contract.discountRate = aNumber}
```

### 예시 : 공유 객체로 이동하기

```js
// Account class
constructor(number, type, interestRate) {
    this._number = number
    this._type = type
    this._interestRate = interestRate
}

get interestRate() {return this._interestRate}

// AccountType class
construtor(nameString) {
    this._name = nameString
}
```

- 이자율을 계좌별로 별도로 설정하고 있는 코드를, 계좌 종류에 따라 정해지도록 하려고 함

```js
// AccountType class
constructor(nameString, interestRate) {
    this._name = nameString
    this._interestRate = interestRate
}

get interestRate() {retrun this._interestRate}
```

- 이자율 필드가 캡슐화 되어 있으니, 타깃인 `AccountType`에 이자율 필드와 필요한 접근자 메서드 생성

```js
// Account class
construtor(number, type, interestRate) {
    this._number = number
    this._type = type
    assert(interestRate === this._type.interestRate)
    this._interestRate = interestRate
}

get interestRate() {return this._interestRate}
```

- `Account`가 `AccountType`의 이자율을 가져오도록 수정하면 문제가 생길 수 있음
    - 리팩터링 전에는 각 계좌가 자신만의 이자율을 가지고 있었지만,
    - 지금은 같은 종류의 모든 계좌가 이자율을 공유하기를 원함
    - 만약 수정 전에도 이자율이 계좌 종류별로 같게 설정되어 있다면 그대로 진행해도 되지만, 이자율이 다른 계좌가 하나라도 있다면, 
    - 이런 경우 계좌 클래스에 어서션을 추가(10.6)도 도움이 됨

```js
// Account class
construtor(number, type, interestRate) {
    this._number = number
    this._type = type
}

get interestRate() {return this._type.interestRate}
```

- 시스템 동작이 달라지지 않음에 확신이 서면, 이자를 가져오는 부분을 변경, 직접 설정하던 코드를 완전히 제거

### 8.3 문장을 함수로 옮기기

```js
//before
result.push(`<p>제목: ${person.photo.title}</p>`)
result.concat(photoData(person.photo))

function photoData(aPhoto) {
    return [
        `<p>위치: ${aPhoto.location}</p>`,
        `<p>날짜: ${aPhoto.date.toDateString}</p>`
    ]
}

//after
result.concat(photoData(person.photo))

function photoData(aPhoto) {
    return [
        `<p>제목: ${person.photo.title}</p>`
        `<p>위치: ${aPhoto.location}</p>`,
        `<p>날짜: ${aPhoto.date.toDateString}</p>`
    ]
}
```

### 배경

- 중복 제거는 코드를 건강하게 관리하는가장 효과적인 방법 중 하나
- 특정 함수를 호출하는 코드가 나올 때마다 앞위나 뒤에서 똑같은 코드가 추가로 실행되는 모습을 보면, 반복되는 부분을 피함수로 합치는 방법을 궁리
- 나중에 이 코드의 동작을 여러 변형들로 나눠야 하는 순간이 오면 (반대 리팩터링인) 문장을 호출한 곳으로 옮기기(8.4)를 적용해 뽑아낼 수 있음
- 여전히 함께 호출해야 하는 경우라면, 해당 문장들과 피호출 함수를 통째로 또 하나의 함수로 추출(6.1)

### 절차

1. 반복 코드가 함수 호출 부분과 멀리 떨어져있다면 문장 슬라이드하기(8.6)을 적용, 근처로 옮김
2. 타깃 함수를 호출하는 곳이 한 곳뿐이면, 소스 위치에서 해당 코드를 잘라내어 피함수 호출로 복사, 테스트, 아래의 단계 무시
3. 호출자가 둘 이상이면, 호출자 중 하나에서 ‘타깃 함수 호출 부분과 그 함수로 옮기려는 문장을 함께’ 다른 함수로 추출(6.1), 추출한 함수에 임시 변수
4. 다른 호출자 모두가 방금 추출한 함수를 사용하도록 수정
5. 모든 호출자가 새로운 함수를 사용하게 되면, 원래 함수를 새로운 함수 안으로 인라인(6.2)
6. 새로운 함수의 이름을 원래 함수의 이름으로 바꿈(6.5)

### 예시

```js
function renderPerson(outStream, person) {
    const result = []
    result.push(`<p>${person.name}</p>`)
    result.push(renderPhoto(person.photo))
    result.push(`<p>제목: ${person.photo.title}</p>`)
    result.push(emitPhotoData(person.photo))
    return result.join("\n")
}

function photoDiv(p) {
    return [
        "<div>",
        `<p>제목: ${p.title}</p>`,
        emitPhotoData(p)
        "</div>"
    ].join("\n")
}

function emitPhotoData(aPHoto) {
    const result = []
    result.push(`<p>위치: ${aPhoto.location}</p>`)
    result.push(`<p>날짜: ${aPhoto.date.toDateString}</p>`)
    return result.join("\n")
}
```

- 사진 관련 데이터를 HTML로 내보내는 코드
    - 총 두 곳에서 `emitPhotoData()`호출, 두 곳 모두 바로 앞에서 제목 출력
    - 제목 출력하는 코드를  `emitPhotoData()` 안으로 옮겨 중복 제거할 수 있음

```js
function photoDiv(p) {
    return [
        "<div>",
        zznew(p),
        "</div>"
    ].join("\n")
}

function zzenw(p) {
    return [
        `<p>제목: ${p.title}</p>`,
        emitPhotoData(p)
    ].join("\n")
}
```

- 호출자 중 하나에 함수 추출하기(6.1) 적용, 임시 변수로 함수 선언

```js
function renderPerson(outStream, person) {
    const result = []
    result.push(`<p>${person.name}</p>`)
    result.push(renderPhoto(person.photo))
    result.push(zznew(person.phtoto))
    return result.join("\n")
}
```

- 다른 호출차로 눈을 돌려,하나씩 새로운 함수 호출로 수정

```js
function emitPhotoData(aPHoto) {
    const result = []
    result.push(`<p>제목: ${aPhtoo.title}</p>`)
    result.push(`<p>위치: ${aPhoto.location}</p>`)
    result.push(`<p>날짜: ${aPhoto.date.toDateString}</p>`)
    return result.join("\n")
}
```

- 호출자를 모두 수정하면, `emitPhotoData()` 함수 인라인(6.2)
```js
function renderPerson(outStream, person) {
    const result = []
    result.push(`<p>${person.name}</p>`)
    result.push(renderPhoto(person.photo))
    result.push(emitPhotoData(person.phtoto))
    return result.join("\n")
}

function photoDiv(p) {
    return [
        "<div>",
        emitPhotoData(p),
        "</div>"
    ].join("\n")
}

function emitPhotoData(aPHoto) {
    const result = []
    result.push(`<p>제목: ${aPhoto.title}</p>`)
    result.push(`<p>위치: ${aPhoto.location}</p>`)
    result.push(`<p>날짜: ${aPhoto.date.toDateString}</p>`)
    return result.join("\n")
}
```

- 함수 이름 바꾸기(6.5)를 하여 마무리, 적합하지 않은 이름이라면 적절하도록 수정

## 8.4 문장을 호출한 곳으로 옮기기

```js
//before
emitPhotoData(outStream, person.photo)

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${phtoo.title}</p>`)
    outStream.write(`<p>위치: ${photo.location}</p>`)
}

//after
emitPhotoData(outStream, person.photo)
outStream.write(`<p>위치: ${person.photo.location}</p>`)

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${phtoo.title}</p>`)
}
```

### 배경

- 함수는 프로그래머가 쌓아 올리는 추상화의 기본 빌딩 블록
    - 추상화 경계를 항상 올바르게 긋는것이 쉽지 않음
- 우선 문장 슬라이드하기(8.6)을 적용, 달라지는 동작의 함수를 시작 혹은 끝으로 옮긴 다음, 문장을 호출한 곳으로 리팩터링을 적용
- 작은 변경이라면 문장을 호출한 곳으로 옮기는 것으로 충분, 호출자와 호출 대상의 경계를 완전히 다시 그어야 하는 경우도 있음
    - 후자의 경우, 함수 인라인(6.2)부터 적용, 문장 슬라이드(8.6)와 함수 추출하기(6.1)로 더 적합한 경계 설정

### 절차

1. 호출자가 한두 개뿐이고, 피호출자도 간단한 상황이면,
   피호출 함수의 처음(혹은 마지막) 줄들을 잘라내어 호출자들로 복사해 넣음
2. 더 복잡한 상황에서는, 이동하지 않길 원하는 모든 문장을 함수로 추출(6.1), 쉬운 임시 이름
3. 원래 함수 인라인(6.2)
4. 추출된 함수의 이름을 원래 함수로 변경(6.5)

### 예시

```js
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>`)
    renderPhoto(outStream, person.photo)
    emitPhotoData(outStream, person.photo)
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(
            p => {
                outStream.write("<div>\n")
                emitPhotoData(outStream, p)
                outStream.write("</div>\n")
            }
        )
}

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>`)
    outStream.write(`<p>날짜: ${photo.date.toDateString}</p>`)
    outStream.write(`<p>위치: ${photo.location}</p>\n`)
}
```

- 호출자가 둘인 상황
- `renderPerson()`은 그대로 둔 채 `listRecentPhotos()`가 위치 정보를 다르게 렌더링하도록 만들어야됨
- 이런 단순한 상황에서는, `renderPerson()`의 마지막 줄을 잘라내어 붙여 넣어도 됨

```js
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>`)
    renderPhoto(outStream, person.photo)
    emitPhotoData(outStream, person.photo)
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(
            p => {
                outStream.write("<div>\n")
                emitPhotoData(outStream, p)
                outStream.write("</div>\n")
            }
        )
}

function emitPhotoData(outStream, photo) {
    zztmp(outStream, photo)
    outStream.write(`<p>위치: ${photo.location}</p>\n`)
}

function zztmp(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>`)
    outStream.write(`<p>날짜: ${photo.date.toDateString}</p>`)
}
```

- 첫 단계로, `emitPhotoData()`에 남길 코드를 함수로 추출(6.1)

```js
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>`)
    renderPhoto(outStream, person.photo)
    zztmp(outStream, person.photo)
    outStream.write(`<p>위치: ${photo.location}</p>\n`)
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(
            p => {
                outStream.write("<div>\n")
                zztmp(outStream, person.photo)
                outStream.write(`<p>위치: ${photo.location}</p>\n`)
                outStream.write("</div>\n")
            }
        )
}

function emitPhotoData(outStream, photo) {
    zztmp(outStream, photo)
    outStream.write(`<p>위치: ${photo.location}</p>\n`)
}

function zztmp(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>`)
    outStream.write(`<p>날짜: ${photo.date.toDateString}</p>`)
}
```

- 피호풀 함수를 호출자들로 한번에 하나씩 인라인(6.2)

```js
function renderPerson(outStream, person) {
    outStream.write(`<p>${person.name}</p>`)
    renderPhoto(outStream, person.photo)
    emitPhotoData(outStream, person.photo)
    outStream.write(`<p>위치: ${photo.location}</p>\n`)
}

function listRecentPhotos(outStream, photos) {
    photos
        .filter(p => p.date > recentDateCutoff())
        .forEach(
            p => {
                outStream.write("<div>\n")
                emitPhotoData(outStream, person.photo)
                outStream.write(`<p>위치: ${photo.location}</p>\n`)
                outStream.write("</div>\n")
            }
        )
}

function emitPhotoData(outStream, photo) {
    outStream.write(`<p>제목: ${photo.title}</p>`)
    outStream.write(`<p>날짜: ${photo.date.toDateString}</p>`)
}
```

- 원래 함수를 지워 함수 인라인(6.2)를 마무리, 함수 이름을 원래로 되돌리기

## 8.5 인라인 코드를 함수 호출로 바꾸기

```js
// before
let appliesToMass = fasle
for (const s of states) {
    if (s === "MA") appliesToMass = true
}

// after
appliesToMass = states.inclueds("MA")
```

### 배경

- 함수는 여러 동작을 하나로 묶어줌
    - 함수 이름이 코드의 동작 방식을 목적을 말해주기 때문에 함수를 활용하면 코드를 이해하기 쉬워짐
- 이매 존재하는 함수와 똑같은 일을 하는 인라인 코드를 발견하면 보통 해당 코드를 함수 호출로 대체하길 원함
    - 예외가 있다면, 우연히 비슷한 코드가 만들어졌을 때 뿐
    - 기존 함수의 코드를 수정하더라도, 인라인 코드의 동작은 바뀌지 않아야 할 때뿐
- 특히, 라이브러리가 제공하는 함수로 대체할 수 있다면 더 좋음

<br>

## 8.6 문장 슬라이드하기

```js
const pricingPlan = retrievePricingPlan();
const order = retrieveOrder();
let charge;
const chargePerUnit = pricingPlan.unit;
```

```js
const pricingPlan = retrievePricingPlan();
const chargePerUnit = pricingPlan.unit;
const order = retrieveOrder();
let charge;
```

### 배경

- <u>관련된 코드들을 가깝게 모으면</u> 이해하기 더 쉽고, 다른 리팩터링(주로 **6.1 함수 추출하기**)의 준비 단계로 자주 행해짐
- **변수 선언**의 경우 함수 첫머리에 모두 모아두기 보다, <u>처음 사용하는 곳에 선언</u>하여 모아두는 것도 좋음

### 절차

1. 코드 조각(문장들)을 이동할 목표 위치를 찾기. 코드 조각의 원래 위치와 목표 위치 사이의 코드들을 훑어보면서, 조각을 모으고 나면 동작이 달라지는 코드가 있는지 살피기. 다음과 같은 간섭이 있다면 이 리팩터링을 포기
   → 코드 조각에서 참조하는 요소를 선언하는 문장 앞으로는 이동할 수 없음
   → 코드 조각을 참조하는 요소의 뒤로는 이동할 수 없음
   → 코드 조각에서 참조하는 요소를 수정하는 문장을 건너뛰어 이동할 수 없음
   → 코드 조각이 수정하는 요소를 참조하는 요소를 건너뛰어 이동할 수 없음
2. 코드 조각을 원래 위치에서 잘라내어 목표 위치에 붙여 넣기

### 예시

```js
1 const pricingPlan = retrievePricingPlan();
2 const order = retrieveOrder();
3 const baseCharge = pricingPlan.base;
4 let charge;
5 const chargePerUnit = pricingPlan.unit;
6 const units = order.units;
7 let discount;
8 charge = baseCharge + units * chargePerUnit;
9 let discountableUnits = Math.max(units - pricingPlan.discountThreshold, 0);
10 discount = discountableUnits * pricingPlan.discountFactor;
11 if (order.isRepeat) discount += 20;
12 charge = charge - discount;
13 chargeOrder(charge);
```

- <u>부수효과가 **없는** 코드</u>끼리는 마음 가는대로 재배치 가능 (단, **명령-질의 원칙**을 지켜가며 코딩했다는 전제 하에 2번 줄이 부수효과가 없다고 판단할 수 있음)
- <u>부수효과가 **있는** 코드</u>를 슬라이드하거나 건너뛰어야 한다면 훨씬 신중해야 함
  - **11번 줄(if (order.isRepeat) ...)**의 경우 **12번 줄(charge = charge - discount;)** 때문에 뒤로 이동할 수 없음
  - **13번 줄(chargeOrder(charge);)** 또한 **12번 줄** 앞으로 이동할 수 없음
  - **8번 줄(charge = baseCharge + ...)**은 **9~11번** 줄을 건너뛸 수 있음 (공통된 상태를 수정하는 일이 전혀 없기 때문)
  - 상태를 갱신하는 코드들 자체를 최대한 제거하는 것이 좋음
- 슬라이드 후 테스트를 통해 깨지는 것이 없는지 파악하고, 테스트가 실패했을 경우 좋은 대처는 <u>더 작게 슬라이드</u> 해보는 것

### 예시 : 조건문이 있을 때의 슬라이드

- <u>조건문 밖으로</u> 슬라이드할 때는 중복 로직이 제거되고, <u>조건문 안으로</u> 슬라이드할 때는 반대로 중복 로직이 추가됨

```js
let result;
if (availableResources.length === 0) {
    result = createResource();
    allocatedResources.push(result); // 중복 로직
} else {
    result = availableResources.pop();
    allocatedResources.push(result); // 중복 로직
}
return result;
```

- 중복된 문장들을 <u>조건문 밖으로</u> 슬라이드하면 한 문장으로 합쳐짐 (반대의 상황이면 로직이 복제되어 중복이 생김)

```js
let result;
if (availableResources.length === 0) {
    result = createResource();
} else {
    result = availableResources.pop();
}
allocatedResources.push(result); // 조건문 밖으로 슬라이드
return result;
```

#### 더 읽을거리

- **문장 교환하기(Swap Statement)** 라는 이름의 거의 똑같은 리팩터링도 있음
  - 인접한 코드 조각을 이동하지만, 문장 하나짜리 조각만 취급 (이동할 조각과 건너뛸 조각 모두 **단일 문장**으로 구성된 문장 슬라이드)

<br>

## 8.7 반복문 쪼개기

```js
let averageAge = 0;
let totalSalary = 0;
for (const p of people) {
    averageAge += p.age;
    totalSalary += p.salary;
}
averageAge = averageAge / people.length;
```

```js
let totalSalary = 0;
for (const p of people) {
    totalSalary += p.salary;
}

let averageAge = 0;
for (const p of people) {
    averageAge += p.age;
}
averageAge = averageAge / people.length;
```

### 배경

- 반복문 하나에서 <u>두 가지 일을 수행</u>하는 경우가 많은데, 이 경우 반복문을 수정해야 할 때마다 두 가지 일 모두를 잘 이해하고 진행해야 함
- 반대로 각각의 반복문으로 분리해두면 <u>수정할 동작 하나</u>만 이해하면 됨
  - 한 가지 값만 계산하는 반복문이라면 그 값만 곧바로 반환할 수 있음
- 반복문을 두 번 실행해야 하므로 **최적화**와 거리가 멀 수 있지만, **리팩터링**과의 구분이 필요
  - 병목이 생기는 경우 추후에 합치기는 매우 쉽고, 다른 <u>더 강력한 최적화</u>를 적용할 수 있는 길을 열어주기도 함

### 절차

1. 반복문을 복제해 두 개로 만들기
2. 반복문이 중복되어 생기는 부수효과를 파악해서 제거
3. 각 반복문을 **함수로 추출(6.1)**할지 고민해보기

### 예시

> 전체 급여와 가장 어린 나이를 계산하는 코드

```js
let youngest = people[0] ? people[0].age : Infinity;
let totalSalary = 0;
for (const p of people) {
    if (p.age < youngest) youngest = p.age;
    totalSalary += p.salary;
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`;
```

- 반복문 쪼개기의 첫 단계로 **1.** 단순히 반복문 복제

```js
let youngest = people[0] ? people[0].age : Infinity;
let totalSalary = 0;
for (const p of people) {
    if (p.age < youngest) youngest = p.age;
    totalSalary += p.salary;
}
// 반복문 복제
for (const p of people) {
    if (p.age < youngest) youngest = p.age;
    totalSalary += p.salary;
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`;
```

- 잘못된 결과를 초래할 수 있는 중복 제거 (부수효과가 없는 코드라면 그대로 둬도 괜찮음)

```js
let youngest = people[0] ? people[0].age : Infinity;
let totalSalary = 0;
for (const p of people) {
    // if (p.age < youngest) youngest = p.age; // 부수효과가 있는 코드는 한쪽만 남기고 제거
    totalSalary += p.salary;
}
// 반복문 복제
for (const p of people) {
    if (p.age < youngest) youngest = p.age;
    // totalSalary += p.salary; // 부수효과가 있는 코드는 한쪽만 남기고 제거
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`;
```

#### 더 가다듬기

- 이 리팩터링을 할 때는 나뉜 각 반복문을 각각의 함수로 추출하면 어떨지까지 고민하기
  - 지금의 경우에서는 **문장 슬라이드하기(8.6)**부터 적용

```js
let totalSalary = 0;
for (const p of people) {
    totalSalary += p.salary;
}
let youngest = people[0] ? people[0].age : Infinity; // 문장 슬라이드
for (const p of people) {
    if (p.age < youngest) youngest = p.age;
}

return `최연소: ${youngest}, 총 급여: ${totalSalary}`;
```

- 각 반복문을 **함수로 추출(6.1)**

```js
return `최연소: ${youngestAge()}, 총 급여: ${totalSalary()}`;

function totalSalary() {
    let totalSalary = 0;
    for (const p of people) {
        totalSalary += p.salary;
    }
    return totalSalary;
}

function youngestAge() {
    let youngest = people[0] ? people[0].age : Infinity;
    for (const p of people) {
        if (p.age < youngest) youngest = p.age;
    }
    return youngest;
}
```

- 총 급여 계산 함수(`totalSalary()`)의 코드는 반복문을 **파이프라인으로 바꾸기(8.8)** 적용
- 최연소 계산 코드(`youngestAge()`)에는 **알고리즘 교체하기(7.9)** 적용

```js
return `최연소: ${youngestAge()}, 총 급여: ${totalSalary()}`;

function totalSalary() {
    return people.reduce((total, p) => total + p.salary, 0); // 파이프라인으로 바꾸기
}

function youngestAge() {
    return Math.min(...people.map(p => p.age)); // 알고리즘 교체하기
}
```

<br>

## 8.8 반복문을 파이프라인으로 바꾸기

```js
const names = [];
for (const i of input) {
    if (i.job === "programmer") {
        names.push(i.name);
    }
}
```

```js
const names = input.filter(i => i.job === "programmer").map(i => i.name);
```

### 배경

- **컬렉션 파이프라인**을 이용하면 **순회**와 같은 처리 과정을 <u>일련의 연산</u>으로 표현할 수 있음 (각 연산은 컬렉션을 입력받아 다른 컬렉션을 내뱉음)
- 대표적인 연산은 `map` 과 `filter` 이며, 논리를 파이프라인으로 표현하면 이해하기 훨씬 쉬워짐

### 절차

1. 반복문에서 사용하는 컬렉션을 가리키는 변수를 하나 만들기
   → 기존 변수를 단순히 복사한 것일 수도 있음
2. 반복문의 첫 줄부터 시작해서, 각각의 단위 행위를 적절한 컬렉션 파이프라인 연산으로 대체. 이때 컬렉션 파이프라인 연산은 1. 에서 만든 반복문 컬렉션 변수에서 시작하여, 이전 연산의 결과를 기초로 연쇄적으로 수행됨
3. 반복문의 모든 동작을 대체했다면 반복문 자체를 지우기
   → 반복문이 결과를 누적 변수에 대입했다면 파이프라인의 결과를 그 누적 변수에 대입

### 예시

> 회사의 지점 사무실 정보를 CSV 형태로 정리한 것

```js
office, country, telephone
Chicago, USA, +1 312 373 1000
Beijing, China, +86 4008 900 505
Bangalore, India, +91 80 4064 9570
Porto Alegre, Brazil, +55 51 3079 3550
Chennai, India, +91 44 660 44766

... (더 많은 데이터)
```

- 다음 함수는 인도에 자리한 사무실을 찾아서 도시명과 전화번호를 반환

```js
function acquireData(input) {
    const lines = input.split("\n"); // 컬렉션
    let firstLine = true;
    const result = [];
    for (const line of lines) { // 반복문
        if (firstLine) {
            firstLine = false;
            continue;
        }
        if (line.trim() === "") continue;
        const record = line.split(",");
        if (record[1].trim() === "India") {
            result.push({city: record[0].trim(), phone: record[2].trim()});
        }
    }
    return result;
}
```

- 우선 **1.** 반복문에서 사용하는 컬렉션을 가리키는 별도 변수(루프 변수)를 새로 만들기
- 코드의 반복문에서 첫 if문은 CSV 데이터의 첫 줄을 건너뛰는 역할로, `silce()` 연산을 루프 변수에서 수행하고 반복문의 if문 제거
  - 제어용 변수인 `firstLine` 도 제거

```js
function acquireData(input) {
    const lines = input.split("\n");
    // let firstLine = true; // 제어용 변수 제거
    const result = [];
    const loopItems = lines.slice(1); // 루프 변수 만들기, slice() 연산 적용
    for (const line of loopItems) {
        // slice() 연산으로 대체
        // if (firstLine) {
        //     firstLine = false;
        //     continue;
        // }
        if (line.trim() === "") continue;
        const record = line.split(",");
        if (record[1].trim() === "India") {
            result.push({city: record[0].trim(), phone: record[2].trim()});
        }
    }
    return result;
}
```

- 빈 줄 지우기(`trim`)는 `filter()` 연산으로 대체

```js
function acquireData(input) {
    const lines = input.split("\n");
    const result = [];
    const loopItems = lines.slice(1).filter(line => line.trim() !== ""); // 빈 줄 지우기에 filter() 연산 적용
    for (const line of loopItems) {
        // if (line.trim() === "") continue; // filter() 연산으로 대체
        const record = line.split(",");
        if (record[1].trim() === "India") {
            result.push({city: record[0].trim(), phone: record[2].trim()});
        }
    }
    return result;
}
```

- `map()` 연산을 사용해 여러 줄짜리 CSV 데이터를 문자열 배열로 변환 (`record` 라는 변수 이름은 나중에 수정)
- `filter()` 연산으로 인도에 위치한 사무실 레코드 추출

```js
function acquireData(input) {
    const lines = input.split("\n");
    const result = [];
    const loopItems = lines
    	  .slice(1)
    	  .filter(line => line.trim() !== "")
    	  .map(line => line.split(",")) // 문자열 배열 변환에 map() 연산 적용
    	  .filter(record => record[1].trim() === "India") // 인도에 위치한 사무실 filter()
    	  ; // 파이프라인의 문장 종료 세미콜론(;)을 별도 줄에 적어주면 편함
    for (const line of loopItems) {
        const record = line; // split(",") 연산 map() 연산으로 대체
        // if (record[1].trim() === "India") { // if문 filter() 연산으로 대체
            result.push({city: record[0].trim(), phone: record[2].trim()});
        // }
    }
    return result;
}
```

- `map()` 을 사용해 결과 레코드를 생성

```js
function acquireData(input) {
    const lines = input.split("\n");
    const result = [];
    const loopItems = lines
    	  .slice(1)
    	  .filter(line => line.trim() !== "")
    	  .map(line => line.split(","))
    	  .filter(record => record[1].trim() === "India")
    	  .map(record => ({city: record[0].trim(), phone: record[2].trim()})) // 결과 레코드 생성
    	  ;
    for (const line of loopItems) {
        const record = line;
        result.push(line); // 결과 레코드 생성하는 로직 map() 으로 대체 
    }
    return result;
}
```

- 파이프라인의 결과를 누적 변수에 대입하고, 반복문 코드 삭제

```js
function acquireData(input) {
    const lines = input.split("\n");
    const result = [];
    const result = lines // 누적 변수에 대입
    	  .slice(1)
    	  .filter(line => line.trim() !== "")
    	  .map(line => line.split(","))
    	  .filter(record => record[1].trim() === "India")
    	  .map(record => ({city: record[0].trim(), phone: record[2].trim()}))
    	  ;
    return result;
}
```

#### 더 가다듬기

- `result` 변수를 인라인하고, 람다 변수 중 일부의 이름을 바꾸기 (레이아웃 정돈 적용도 가능)

```js
function acquireData(input) {
    const lines = input.split("\n");
    return lines
    	  .slice  (1)
    	  .filter (line   => line.trim() !== "")
    	  .map    (line   => line.split(","))
    	  .filter (fields => fields[1].trim() === "India")
    	  .map    (fields => ({city: fields[0].trim(), phone: fields[2].trim()}))
    	  ;
}
```

<br>

## 8.9 죽은 코드 제거하기

```js
if (false) {
    doSomethingThatUsedToMatter();
}
```

```js

```

### 배경

- **쓰이지 않는 코드**의 동작을 이해하고, 코드를 수정 했는데도 기대한 결과가 나오지 않는 이유를 파악하기 위해 <u>시간을 허비</u>하는 경우가 많음
- 코드가 더 이상 사용되지 않게 되었다면 지우고, 혹시 다시 필요해지더라도 **버전 관리 시스템**을 통해 살려낼 수 있음
  - 버전 관리 시스템이 보편화되지 않았을 때는 **주석 처리**하는 방법을 사용했으나, 현재는 더 이상 필요하지 않음

### 절차

1. 죽은 코드를 외부에서 참조할 수 있는 경우라면(예컨데 함수 하나가 통째로 죽었을 때) 혹시라도 호출하는 곳이 있는지 확인
2. 없다면 죽은 코드를 제거
