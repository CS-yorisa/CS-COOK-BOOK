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

