# Chapter 10. 조건부 로직 간소화

## 10. 1 조건문 분해하기

``` js
if (!aData.isBefore(plan.summerStart) && !aData.isAfter(plan.summerEnd))
  charge = quantity * plan.summerRate;
else
  charge = quantity * plan.regularRate + plan.regularServiceCharge;
```

``` js
if (summer())
  charge = summerCharge();
else
  charge = regularCharge();
```

### 배경

- 복잡한 조건부 코드 블록 대신, 코드를 분해하여 각 덩어리의 의도를 살린 이름의 함수 호출로 변경
- 전체적인 의도가 더 확실히 드러나고, 해당 조건이 무엇이고 무엇을 분기했는지 명백해짐
- 함수 추출하기를 적용한 사례로 볼 수도 있음



### 절차

- 조건식과 그 조건식에 딸린 조건절을 각각 함수로 추출



### 예시

- 여름이면 할인율이 달라지는 어떤 서비스의 요금을 계산

``` js
if (!aData.isBefore(plan.summerStart) && !aData.isAfter(plan.summerEnd))
  charge = quantity * plan.summerRate;
else
  charge = quantity * plan.regularRate + plan.regularServiceCharge;
```

1. 조건 부분(조건식)을 별도 함수로 추출

``` js
if (summer())
  charge = quantity * plan.summerRate;
else
  charge = quantity * plan.regularRate + plan.regularServiceCharge;

function summer(){
  return !aData.isBefore(plan.summerStart) && !aData.isAfter(plan.summerEnd);
}
```

- 조건이 만족했을 때의 로직과 else절도 또 다른 함수로 추출

``` js
if (summer())
  charge = summerCharge();
else
  charge = regularCharge();

function summer(){
  return !aData.isBefore(plan.summerStart) && !aData.isAfter(plan.summerEnd);
}

function summerCharge() {
  return quantity * plan.summerRate;
}

function regularCharge() {
  return quantity * plan.regularRate + plan.regularServiceCharge;
}
```

- 모두 끝났다면 전체 조건문을 3항 연산자로 바꿔줄 수도 있음



## 10.2 조건식 통합하기

``` js
if (anEmployee.seniority < 2) return 0;
if (anEmployee.monthsDisabled > 12) return 0;
if (anEmployee.isPartTime) return 0;
```

``` js
if (isNotEligibleForDisability()) return 0;

function isNotEligibleForDisability() {
  return ((anEmployee.seniority < 2) 
          || (anEmployee.monthsDisabled > 12)
          || (anEmployee.isPartTime));
}
```



### 배경

- 여러 조각으로 나뉜 조건들을 하나로 통합함으로써 코드가 더 명확해짐
- 통합 작업이 함수 추출하기까지 이어질 가능성이 높으며, 함수 추출 시 코드의 의도가 분명히 드러나는 경우가 많음
  - 함수 추출하기는 '무엇'을 하는지 기술하던 코드를 '왜'하는지 말해주는 코드로 바꿔주는 효과적인 도구



### 절차

1. 해당 조건식들 모두에 부수효과가 없는지 확인
   - 부수효과가 있는 조건식들에는 질의 함수와 변경함수 분리하기(11.1)를 먼저 적용
2. 조건문 두 개를 선택하여 두 조건문의 조건식들을 논리 연산자로 결합
   - 순차적으로 이뤄지는 (레벨이 같은) 조건문은 or로 결합하고, 중첩된 조건문은 and로 결합
3. 테스트
4. 조건이 하나만 남을 때까지 2~3과정 반복
5. 하나로 합쳐진 조건식을 함수로 추출할지 고려



### 예시: or 사용하기

``` js
function disabilityAmount(anEmployee){
  if (anEmployee.seniority < 2) return 0;
	if (anEmployee.monthsDisabled > 12) return 0;
	if (anEmployee.isPartTime) return 0;
}
```

- 똑같은 결과로 이어지는 조건 검사가 순차적으로 진행되고 있으므로 하나의 식으로 통합
- 순차적인 경우엔 or 연산자를 이용하면 됨 (테스트와 통합하기를 반복하면 아래와 같아짐)

``` js
function disabilityAmount(anEmployee){
  if (anEmployee.seniority < 2
      || anEmployee.monthsDisabled > 12
      || anEmployee.isPartTime) return 0;
}
```

- 모든 조건을 통합했다면 최종 조건식을 함수로 추출해볼 수 있음



### 예시: and 사용하기

- if 문이 중첩되어 나오면 and 사용

``` js
if (amEmployee.onVacation)
  if (anEmployee.seniority > 10)
    return 1;
return 0.5;
```

``` js
if ((anEmployee.onVacation)
    && (anEmployee.seniority > 10)) return 1;
return 0.5;
```



## 10.3 중첩 조건문을 보호 구문으로 바꾸기

``` js
function getPayAmount(){
  let result;
  if (isDead)
    result = deadAmount();
  else {
    if (isSeparated)
      result = separatedAmount();
    else {
      if (isRetired)
        result = retiredAmount();
      else
        result = normalPayAmount();
    }
  }
  return result;
}
```

``` js
function getPayAmount(){
  if(isDead) return deadAmount();
  if(isSeparated) return separatedAmount();
  if(isRetired) return retiredAmount();
  return normalPayAmount();
}
```



### 배경

- 조건문은 참인 경로와 거짓인 경로 모두 정상 동작으로 이어지는 형태와, 한쪽만 정상인 형태 두 가지 형태로 쓰임
  - 두 경로 모두 정상 동작이라면 if와 else 절 사용
  - 한쪽만 정상이라면 비정상 조건을 if에서 검사한 다음, 조건이 참이면(비정상이면) 함수에서 빠져나옴. 이 형태를 흔히 **보호 구문(guard clause)**이라고 함

- 중첩 조건문을 보호 구문으로 바꾸기의 핵심은 **의도 부각**
  - if-then-else 는 if절과 else절에 똑같은 무게를 두어 양갈래가 똑같이 중요하다는 뜻 전달
  - 보호 구문은 "이건 이 함수의 핵심이 아니다. 이 일이 일어나면 무언가 조치를 취한 후 함수에서 빠져나온다."는 뜻



### 절차

1. 교체해야 할 조건 중 가장 바깥 것을 선택하여 보호 구문으로 바꾸기
2. 테스트
3. 1~2 과정을 필요한 만큼 반복
4. 모든 보호 구문이 같은 결과를 반환한다면 보호 구문들의 조건식을 통합(10.2)



### 예시

- 직원 급여를 계산하는 코드

``` js
function payAmount(employee) {
  let result;
  if(employee.isSeparated) { // 퇴사한 직원인가?
    result = {amount: 0, reasonCode: "SEP"};
  }
  else {
    if (employee.isRetired){ // 은퇴한 직원인가?
      result = {amount: 0, reasonCode: "RET"};
    }
    else {
      // 급여 계산 로직
      lorem.ipsum(dolor.sitAmet);
      consecteture(adipiscing).elit();
      sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
      ut.enim.ad(minim.veniam);
      result = someFinalComputation();
    }
  }
  return result;
}
```

- 이 코드가 진짜 의도한 일은 모든 조건이 거짓일때만 실행되기 때문에 중요한 일들이 중첩된 조건에 가려서 잘 보이지 않음

1. 최상위 조건부터 보호 구문으로 바꾸기

``` js
function payAmount(employee) {
  let result;
  if(employee.isSeparated) return {amount: 0, reasonCode: "SEP"};

  if (employee.isRetired){ // 은퇴한 직원인가?
    result = {amount: 0, reasonCode: "RET"};

  else {
    // 급여 계산 로직
    lorem.ipsum(dolor.sitAmet);
    consecteture(adipiscing).elit();
    sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
    ut.enim.ad(minim.veniam);
    result = someFinalComputation();
  }
      
  return result;
}
```

2. 변경 후 테스트 하고, 3. 다음 조건으로 넘어가기

``` js
function payAmount(employee) {
  let result;
  if(employee.isSeparated) return {amount: 0, reasonCode: "SEP"};
  if(employee.isRetired) return {amount: 0, reasonCode: "RET"};
  
  // 급여 계산 로직
  lorem.ipsum(dolor.sitAmet);
  consecteture(adipiscing).elit();
  sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
  ut.enim.ad(minim.veniam);
  result = someFinalComputation();
  return result;
}
```

- result는 아무 일도 하지 않으므로 제거

``` js
function payAmount(employee) {
  if(employee.isSeparated) return {amount: 0, reasonCode: "SEP"};
  if(employee.isRetired) return {amount: 0, reasonCode: "RET"};
  
  // 급여 계산 로직
  lorem.ipsum(dolor.sitAmet);
  consecteture(adipiscing).elit();
  sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
  ut.enim.ad(minim.veniam);
  return someFinalComputation();
}
```



### 예시: 조건 반대로 만들기

- 이 리팩터링을 수행할 때 조건식을 반대로 만들어 적용하는 경우도 많음

``` js
function adjustedCapital(anInstrument) {
  let result = 0;
  if (anInstrument.capital > 0){
    if (anInstrument.interestRate > 0 && anInstrument.duration > 0) {
      result = (anInstruemnt.income / anInstrument.duration) * anInstrument.adjustmentFactor;
    }
  }
  return result;
}
```

- 보호 구문을 추가하며 조건을 역으로 변경

``` js
function adjustedCapital(anInstrument) {
  let result = 0;
  if (anInstrument.capital <= 0) return result;
  if (anInstrument.interestRate > 0 && anInstrument.duration > 0) {
    result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
  }
  return result;
}
```

- 다음 조건은 먼저 not 연산자를 추가함

``` js
function adjustedCapital(anInstrument) {
  let result = 0;
  if (anInstrument.capital <= 0) return result;
  if (!(anInstrument.interestRate > 0 && anInstrument.duration > 0)) return result;
  result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
  return result;
}
```

- 조건식 간소화

``` js
function adjustedCapital(anInstrument) {
  let result = 0;
  if (anInstrument.capital <= 0) return result;
  if (anInstrument.interestRate <= 0 || anInstrument.duration <= 0) return result;
  result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
  return result;
}
```

- 조건식 통합

``` js
function adjustedCapital(anInstrument) {
  let result = 0;
  if (anInstrument.capital <= 0
       || anInstrument.interestRate <= 0
       || anInstrument.duration <= 0) return result;
  result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
  return result;
}
```

- result 제거

``` js
function adjustedCapital(anInstrument) {
  
  if (anInstrument.capital <= 0
       || anInstrument.interestRate <= 0
       || anInstrument.duration <= 0) return 0;
  
  return (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
  
}
```



## 10.4 조건부 로직을 다형성으로 바꾸기

``` js
switch (bird.type) {
  case '유럽 제비':
    return "보통이다";
  case '아프리카 제비':
    return (bird.numberOfCoconuts > 2) ? "지쳤다" : "보통이다";
  case '노르웨이 파랑 앵무':
    return (bird.voltage > 100) ? "그을렸다" : "예쁘다";
  default:
    return "알 수 없다";
}
```

``` js
class EuropeanSwallow{
  get plugme(){
    return "보통이다";
  }
  ...
class AfricanSwallow{
  get plumage() {
    return (this.numberOfCoconuts > 2) ? "지쳤다" : "보통이다";
  }
  ...
class NorwegianBlueParrot {
  get plumage() {
    return (this.voltage > 100) ? "그을렸다" : "예쁘다";
  }
  ...
```



### 배경

- 더 높은 수준의 개념인 클래스와 다형성을 도입하여 조건문을 분리할 수 있음
- 타입을 기준으로 분리하는 switch 문의 경우 case 별로 클래스를 하나씩 만들어 공통 switch 로직의 중복을 없앨 수 있음 (타입을 여러 개 만들고 각 타입이 조건부 로직을 자신만의 방식으로 처리하도록 구성)
- 기본 동작을 위한 case문과 그 변형 동작으로 구성된 로직의 경우, 기본 동작을 슈퍼클래스로 넣어서 변형 동작에 신경쓰지 않고 기본에 집중하게 함. 그 뒤, 변형 동작을 뜻하는 case들을 각각의 서브클래스로 만듦



### 절차

1. 다형적 동작을 표현하는 클래스들이 아직 없다면 생성. 이왕이면 적합한 인스턴스를 알아서 만들어 반환하는 팩터리 함수도 함께 생성.
2. 호출하는 코드에서 팩터리 함수를 사용하게 함
3. 조건부 로직을 슈퍼클래스로 옮김
4. 서브클래스 중하나를 선택하여 서브클래스에서 슈퍼클래스의 조건부 로직 메서드를 오버라이드 함. 조건부 문장 중 선택된 서브클래스에 해당하는 조건절을 서브클래스 메서드로 복사한 다음 적절히 수정
5. 같은 방식으로 각 조건절을 해당 서브클래스에서 메서드로 구현
6. 슈퍼클래스 메서드에는 기본 동작 부분만 남김. 혹은 슈퍼클래스가 추상 클래스여야 한다면, 이 메서드를 추상으로 선언하거나 서브클래스에서 처리해야 함을 알리는 에러를 던짐



### 예시

- 새의 종에 따른 비행속도와 깃털 상태를 알려주는 프로그램

``` js
function plumages(birds) {
  return new Map(birds.map((b) => [b.name, plumage(b)]));
}

function speeds(birds) {
  return new Map(birds.map((b) => [b.name, airSpeedVelocity(b)]));
}

function plumage(bird) {
  switch (bird.type) {
    case '유럽 제비':
      return '보통이다';
    case '아프리카 제비':
      return bird.numberOfCoconuts > 2 ? '지쳤다' : '보통이다';
    case '노르웨이 파랑 앵무':
      return bird.voltage > 100 ? '그을렸다' : '예쁘다';
    default:
      return '알 수 없다';
  }
}

function airSpeedVelocity(bird) {
  switch (bird.type) {
    case '유럽 제비':
      return 35;
    case '아프리카 제비':
      return 40 - 2 * bird.numberOfCoconuts;
    case '노르웨이 파랑 앵무':
      return bird.isNailed ? 0 : 10 + bird.voltage / 10;
    default:
      return null;
  }
}
```

- 새 종류에 따라 다르게 동작하는 함수가 있으니, 종류별 클래스를 만들어 각각에 맞는 동작 표현

3. 가장 먼저 airSpeedVelocity()와 plumage()를 Bird라는 클래스로 묶기 (6.9 여러 함수를 클래스로 묶기)

``` js
function plumage(bird){
  return new Bird(bird).plumage;
}

function airSppedVelocity(bird){
  return new Bird(bird).airSpeedVelocity;
}

class Bird {
  constructor(birdObject){
    Object.assign(this.birdObject);
  }
  
  get plumage() {
    switch (this.type) {
      case '유럽 제비':
        return '보통이다';
      case '아프리카 제비':
        return this.numberOfCoconuts > 2 ? '지쳤다' : '보통이다';
      case '노르웨이 파랑 앵무':
        return this.voltage > 100 ? '그을렸다' : '예쁘다';
      default:
        return '알 수 없다';
    }
  }

  get airSpeedVelocity() {
    switch (this.type) {
      case '유럽 제비':
        return 35;
      case '아프리카 제비':
        return 40 - 2 * this.numberOfCoconuts;
      case '노르웨이 파랑 앵무':
        return this.isNailed ? 0 : 10 + this.voltage / 10;
      default:
        return null;
    }
  }
}
```

1. 이제 종별 서브클래스를 만들고, 적합한 서브클래스의 인스턴스를 만들어준 팩터리 함수 생성
2. 이후, 객체를 얻을 때 팩터리 함수를 사용하도록 수정

``` js
function plumage(bird){
  return createBird(bird).plumage;
}

function airSppedVelocity(bird){
  return createBird(bird).airSpeedVelocity;
}

function createBird(bird){
  switch(bird.type){
    case '유럽 제비':
      return new EuropeanSwallow(bird);
    case '아프리카 제비':
      return new AfricanSwallow(bird);
    case '노르웨이 파랑 앵무':
      return new NorwegianBlueParrot(bird);
    default:
      return new Bird(bird);
  }
}

class EuropeanSwallow extends Bird{
}

class AfricanSwallow extends Bird{
}
  
class NorwegianBlueParrot extends Bird{
}
```

- 필요한 클래스 구조가 준비되었으니 두 조건부 메서드 처리

4. switch문의 절 하나를 선택해 해당 서브클래스에서 오버라이드

``` js
// EuropeanSwallow 클래스
class EuropeanSwallow extends Bird{
  get plugme(){
    return "보통이다";
  }
}

// Bird 클래스
class Bird{
  get plugme(){
    siwtch(this.type){
      case '유럽 제비':
      	throw "오류 발생";
      case '아프리카 제비':
      	return new AfricanSwallow(bird);
    	case '노르웨이 파랑 앵무':
     	 return new NorwegianBlueParrot(bird);
  	  default:
      	return new Bird(bird);
    }
  }
}
```

5. 다른 조건절들도 처리

6. 슈퍼클래스의 메서드는 기본 동작용으로 남겨둠

``` js
// Bird 클래스
get plugme(){
  return "알 수 없다";
}
```

- 똑같은 과정을 airSpeedVelocity() 에도 수행하고, 최상위 함수인 airSpeedVelocity(), plugme()를 인라인 시키면 아래 코드가 됨

``` js
function plumages(birds) {
  return new Map(birds
                 			.map(b => createBird(b))
                 			.map(bird => [bird.name, bird.plumage]));
}

function speeds(birds) {
  return new Map(birds
                 			.map(b => createBird(b))
                 			.map(bird => [bird.name, bird.airSpeedVelocity(b)]));
}

function createBird(bird){
  switch(bird.type){
    case '유럽 제비':
      return new EuropeanSwallow(bird);
    case '아프리카 제비':
      return new AfricanSwallow(bird);
    case '노르웨이 파랑 앵무':
      return new NorwegianBlueParrot(bird);
    default:
      return new Bird(bird);
  }
}

class Bird {
  constructor(birdObject) {
    Object.assign(this, birdObject);
  }

  get plumage() {
    return "알 수 없다";
  }

  get airSpeedVelocity() {
    return null;
  }
}

class EuropeanSwallow extends Bird {
  get plumage() {
    return "보통이다";
  }

  get airSpeedVelocity() {
    return 35;
  }
}

class AfricanSwallow extends Bird {
  get plumage() {
    return this.numberOfCoconuts > 2 ? "지쳤다" : "보통이다";
  }

  get airSpeedVelocity() {
    return 40 - 2 * this.numberOfCoconuts;
  }
}

class NorwegianBlueParrot extends Bird {
  get plumage() {
    return this.voltage > 100 ? "그을렸다" : "예쁘다";
  }

  get airSpeedVelocity() {
    return this.isNailed ? 0 : 10 + this.voltage / 10;
  }
}
```



### 예시 : 변형 동작을 다형성으로 표현하기

- 거의 똑같은 객체지만 다른 부분도 있음을 표현할 때 상속 사용
- 신용 평가 기관에서 선박의 항해 투자 등급을 계산하는 코드
  - 위험요소와 잠재 수익에 영향을 주는 다양한 요인을 기초로 항해 등급을 A, B로 나눔

``` js
function rating(voyage, history) { //투자등급
  const vpf = voyageProfitFactor(voyage, history);
  const vr = voyageRisk(voyage);
  const chr = captainHistoryRisk(voyage, history);
  if (vpf * 3 > (vr + chr + 2)) return "A";
  else return "B";
}

function voyageRisk(voyage) { //항해 경로 위험요소
  let result = 1;
  if (voyage.length > 4) result += 2;
  if (voyage.length > 8) result += voyage.length - 8;
  if (["중국", "동인도"].includes(voyage.zone)) result += 4;
  return Math.max(result, 0);
}

function captainHistoryRisk(voyage, history) { // 선장의 항해 이력 위험요소
  let result = 1;
  if (history.length < 5) result += 4;
  result += history.filter(v => v.profit < 0).length;
  if (voyage.zone === "중국" && hasChina(history)) result -= 2; //먼저 고쳐볼 부분
  return Math.max(result, 0);
}

function hasChina(history) { // 중국을 경유하는가?
  return history.some(v => "중국" === v.zone);
}

function voyageProfitFactor(voyage, history) { // 수익 요인
  let result = 2;
  if (voyage.zone === "중국") result += 1;
  if (voyage.zone === "동인도") result += 1;
  if (voyage.zone === "중국" && hasChina(history)) { // 먼저 고쳐볼 부분
      result += 3;
      if (history.length > 10) result += 1;
      if (history.length > 12) result += 1;
      if (history.length > 18) result -= 1;
  }
  else {
      if (history.length > 8) result += 1;
      if (voyage.length > 14) result -= 1;
  }
  return result;
}
```

- voyageRisk와 captainHistoryRisk 함수의 점수는 위험요소에, voyageProfitFactor() 점수는 잠재 수익에 반영. rating() 은 두 값을 종합하여 요청한 항해의 최종 등급 계산
- 호출하는 쪽 코드

``` js
const voyage = {zone: "서인도", length: 10};
const history = [
    {zone: "동인도", profit: 5},
    {zone: "서인도", profit: 15},
    {zone: "중국", profit: -2},
    {zone: "서아프리카", profit: 7},
];
const myRating = rating(voyage, history);
```

- voyage.zone이 중국이면서 hasChina(history)를 검사하는 부분을 먼저 고침
- 먼저 rating 함수에 있는 내용을 Rating 클래스로 묶어 줌

``` js
function rating(voyage, history){
  return new Rating(voyage, history).value;
}

class Rating {
  constructor(voyage, history) {
    this.voyage = voyage;
    this.history = history;
  }
  get value() {
    const vpf = voyageProfitFactor(voyage, history);
    const vr = voyageRisk(voyage);
    const chr = captainHistoryRisk(voyage, history);
    if (vpf * 3 > (vr + chr + 2)) return "A";
    else return "B";
  }
  
  // ... 나머지 함수들도 함께 묶어줌
}
```

- 변형 동작을 담을 빈 서브클래스를 만들고, 적절한 변형 클래스를 반환해줄 팩터리 함수 생성

``` js
class ExperiencedChinaRating extends Rating{
  
}

function createRating(voyage, history) {
  if (voyage.zone === "중국" && history.some(v => "중국" === v.zone))
    return new ExperiencedChinaRating(voyage, history);
  else return new Rating(voyage, history);
}
```

- 이제 생성자를 호출하는 코드를 모두 찾아서 팩터리 함수를 대신 사용하도록 수정하고, ExperiencedChinaRating 클래스에서 이 메서드를 오버라이드

``` js
function rating(voyage, history){
  return createRating(voyage, history).value;
}

class ExperiencedChinaRating extends Rating{
  get captainHistoryRisk() {
    const result = super.captainHistoryRisk - 2;
    return Math.max(result, 0);
  }
}

// rating 클래스에서 해당 로직 삭제
function captainHistoryRisk() { // 선장의 항해 이력 위험요소
  let result = 1;
  if (history.length < 5) result += 4;
  result += history.filter(v => v.profit < 0).length;
  return Math.max(result, 0);
}
```

- voyageProfitFactor() 에서 변형 동작을 분리하는 작업은 조금더 복잡함. 함수에 다른 경로가 존재하므로 단순히 변형 동작을 제거하고 슈퍼 클래스의 메서드를 호출하는 방식은 적용할 수 없음
- 따라서 해당 조건부 블록 전체를 함수로 추출 (6.1)

``` js
// Rating 클래스
get voyageProfitFactor() {
  let result = 2;
  if (this.voyage.zone === "중국") result += 1;
  if (this.voyage.zone === "동인도") result += 1;
  result += this.voyageAndHistoryLengthFactor;
  return result;
}

get voyageAndHistoryLengthFactor(){
  let result = 0;
  if (this.voyage.zone === "중국" && this.hasChina(history)) {
    result += 3;
    if (this.history.length > 10) result += 1;
    if (this.history.length > 12) result += 1;
    if (this.history.length > 18) result -= 1;
  }
  else {
    if (this.history.length > 8) result += 1;
    if (this.voyage.length > 14) result -= 1;
  }
  return result;
}
```

- 서브 클래스 구성

``` js
// Rating 클래스
get voyageAndHistoryLengthFactor(){
  let result = 0;
  if (this.history.length > 8) result += 1;
  if (this.voyage.length > 14) result -= 1;
  return result;
}

// ExperiencedChinaRating 클래스
get voyageAndHistoryLengthFactor(){
  let result = 0;
  result += 3;
  if (this.history.length > 10) result += 1;
  if (this.history.length > 12) result += 1;
  if (this.history.length > 18) result -= 1;
  return result;
}
```

- 추가로 And로 네이밍된 두 가지 일을 하는 메서드를 분리하고 다른 리팩터링 기법을 적용하여 간소화할 수 있음
