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

1. 다형적 동작을 표현하는 클래스들이 아직 없다면 생성. 이왕이면 적합한 인스턴스를 알아서 만들어 반환하는 팩토리 함수도 함께 생성.
2. 호출하는 코드에서 팩토리 함수를 사용하게 함
3. 조건부 로직을 슈퍼클래스로 옮김
4. 서브클래스 중 하나를 선택하여 서브클래스에서 슈퍼클래스의 조건부 로직 메서드를 오버라이드 함. 조건부 문장 중 선택된 서브클래스에 해당하는 조건절을 서브클래스 메서드로 복사한 다음 적절히 수정
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

1. 이제 종별 서브클래스를 만들고, 적합한 서브클래스의 인스턴스를 만들어주는 팩터리 함수 생성
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


## 10.5 특이 케이스 추가하기

```js
// before
if (aCustomer === "미확인 고객") customerName = "거주자"

// after
class UnknownCusotmer {
    get name() {return "거주자"}
}
```

### 배경

- 데이터 구조의 특정 값을 확인한 후 동작을 수행하는 코드가 곳곳에 있는 경우, 중복 코드의 흔한 케이스 중 하나
    - 똑같은 코드가 곳곳에 있으면 한 데로 모으는 게 효율적
- 특수한 경우의 공통 동작 요소를 모아서 사용하는 특이 케이스 패턴
    - 단순히 데이터를 읽기만 하면, 반환할 값들을 담은 리터를 객체 형태로 준비하면 됨
    - 그 이상의 동작을 수행해야 하면, 필요한 메서드를 담은 객체를 생성하면 됨
    - 특이 케이스 객체는 캡슐화한 클래스를 반환하도록 해도 되고, 변환을 거쳐 데이터 구조에 추가시키는 형태도 가능
- null은 특이 케이스로 처리해야할 때가 많음

### 절차

1. 컨테이너에 특이 케이스인지를 검사하는 속성 추가, false 반환하게 함
2. 특이 케이스 객체 만듬
   특이 케이스인지를 검사하는 속성만 포함, ture를 반환하게 함
3. 클라이언트에서 특이 케이스인지를 검사 코드로 함수를 추출(6.1)
4. 코드에 새로운 특이 케이스 대상 추가, 함수의 반환 값으로 받거나 변환 함수 적용
5. 특이 케이스를 검사하는 함수 본문을 수정, 특이 케이스 객체의 솔성을 사용하도록 함
6. 테스트
7. 여러 함수를 클래스로 묶기(6.9) 또는 함수를 변환 함수로 묶기(6.10) 적용
8. 특이 케이스 검사 함수를 이용하는 곳이 남아 있다면 검사 함수 인라인(6.2)

### 예시

```js
class Site {
    get customer() {return this._customer}
}
```

- 전력 회사는 전력이 필요한 현장에 인프라를 설치해 서비스 제공

```js
class Customer {
    get name() {...} // 고객 이름
    get billingPlan() {...} // 요금제
    get billingPlan(arg) {...}
    get paymentHistory() {...} // 납부 이력
}
```

- 고객 클래스는 많은 속성이 있지만, 위의 속성만 고려
- 일반적으로 현장에는 고객이 거주하지만, 항상 그렇지는 않음
    - 누군가 이사를 나가거나, 이사를 들어오는 경우
    - 이럴 때 레코드의 고객 필드를 “미확인 고객” 문자열로 채움
- 위의 상황을 고려하여, 클라이언트 코드는 알려지지 않은 고객의 경우에도 처리할 수 있어야 함

```js
// 클라이언트 1
const aCustomer = site.customer
// ...
let customerName
if (aCusotmer === "미확인 고객") customerName = "거주자"
else customerName = aCusotmer.name

// 클라이언트 2
const plan = (aCusotmer === "미확인 고객")
    ? registry.billingPlans.basic
    : aCusotmer.billingPlan

// 클라이언트 3
if (aCustomer !== "미확인 고객") aCustomer.billingPlan = newPlane

// 클라이언트 4
const weeksDeliquent = (aCusotmer === "미확인 고객")
    ? 0
    : aCusotmer.paymentHistory.weeksDelinquentInLastYear
```

- 알려지지 않은 고객일때 이루어지는 코드들
    - 미확인 고객인 경우, 고객 이름을 거주자로, 기본 요금제를 청구, 연체 기간을 0주로 분류

```js
class Cusotmer {
    get isUnknown() {return false}
}

class UnknownCusotmer {
    get isUnknown() {return true}
}
```

- 1️⃣ 먼저 미확인 고객인지를 나타내는 메서드를 고객 클래스에 추가
- 2️⃣ 미확인 고객 전용 클래스 생성

```js
function isUnknown(arg) {
    if ( !( (arg instanceof Customer) || (arg == "미확인 고객") ) )
        throw new Error(`잘못된 값과 비교: <${arg}>`)
    return (arg === "미확인 고객")
}
```

- 3️⃣ 미확인 고객을 기대하는 곳 모두에 특이 케이스 객체를 반환하도록 하고,
  값이 “미확인 고객”인지를 검사하는 모든 곳에 새로운 `isunknown()`메서드를 사용하도록 수정
- Customer 클래스를 수정하여 “미확인 고객” 대신 UnknownCustomer 객체를 반환하게 한다면,
  “미확인 고객”인지르 확인하는 코드 모두를 `isUnknown()` 호출로 바꾸는 작업을 한 번에 해야만 함
    - → 매력적이지 않은 코드
- 그러한 경우, 코드를 별도 함수로 추출(6.1), 한 곳으로 모아서 특이 케이스인지 확인할 수 있음

```js
// 클라이언트 1
let customerName
if (isUnknown(aCustomer)) customerName = "거주자"
else customerName = aCustomer.name

// 클라이언트 2
const plan = (isUnknown(aCustoemr))
    ? registry.billingPlans.basic
    : aCusotmer.billingPlan

// 클라이언트 3
if (!isUnknown(aCusotmer)) aCustomer.billingPlan = newPlane

// 클라이언트 4
const weeksDeliquent = (isUnknown(aCusotmer))
    ? 0
    : aCusotmer.paymentHistory.weeksDelinquentInLastYear
```

- `isUnknown()` 함수를 이용해 미확인 고객인지를 확인가능하므로, 이를 클라이언트 코드에 적용

```js
// Site 클래스
getCusotmer() {
    return (this._customer === "미확인 고객")
        ? new UnknownCustomer()
        : this._customer
}
```

- 4️⃣ 특이 케이스일 때, Site 클래스가 UnknownCusotmer 객체를 반환하도록 수정

```js
function isUnknown(arg) {
    if ( !( (arg instanceof Customer) || arg instanceof UnknownCustomer ) )
        throw new Error(`잘못된 값과 비교: <${arg}>`)
    return arg.isUnknown
}
```

- 5️⃣ `isUnknown()`함수를 수정, “미확인 고객”만 반환하는 방식의 코드는 사라짐
- 6️⃣ 테스트

```js
// UnknownCustomer 클래스
get name() {return "거주자"}
// 클라이언트 1
const customerName = aCustomer.name

// UnknownCustomer 클래스
get billingPlan() {return registry.billingPlans.basic}
set billingPlan() { /* 무시 */}

// UnknownCustomer 클래스
get paymentHistory() {reutnr new NullPaymentHistory()}
// NullPaymentHistory 클래스
get weeksDeliquentInLastYear() {return 0}
```

- 7️⃣ 각 클라이언트에서 수행하는 특이 케이스 검사를 일반적인 기본값으로 대체할 수 있다면,
  이 검사 코드에 여러 함수를 클래스로 묶기(6.9) 적용 가능
    - 클라이언트 1의 경우는 조건문을 제거할 수 있음, 그리고 변수 인라인(6.4) 적용 가능
    - 클라이언트 2, 3에서의 요금제 속성은 일반적인 기본값을 반환하는 형태이므로, 게터로 만들 수 있음
    - 클라이언트 4는 자신만의 속성을 갖는 또 다른 객체(지불 이력)을 반환해야 됨,
        - 특이 케이스 객체가 다른 객체를 반환해야 한다면, 그 객체 역시 특이 케이스 인 것이 일반적
        - 이를 위해 NullPaymentHistory 생성

```js
// before
const name = !isUnknown(aCustomer) ? aCusotmer.name: "미확인 거주자"

// after
const name = aCustomer.isUnknown ? "미확인 거주자" : aCusotmer.name
```

- 8️⃣ 모든 클라인트 코드를 이 다형적 행위(타입에 따라 동작이 달라짐)를 적요할 수 있는지 살펴봄
    - 특이 케이스로부터 다른 것을 원하는 독특한 클라이언트가 있을 수 있음
    - 이러한 경우 기존의 값을 똑같이 반환할 수 있되, 함수 인라인(6.2)를 적용할 수 있음

### 예시: 객체 리터럴 이용하기

```js
class Site {
    get customer() {return this._customer}
}

class Customer {
    get name() {...}
    get billingPlan() {...}
    get billingPlan(arg) {...}
    get paymentHistory() {...}
}

// 클라이언트 1
const aCustomer = site.customer
// ...
let customerName
if (aCustomer === "미확인 고객") customerName = "거주자"
else customerName = aCusotmer.name

// 클라이언트 2
const plan = (aCustomer === "미확인 고객")
    ? registry.billingPlans.basic
    : aCustomer.billingPlan

// 클라이언트 3
const weeksDeliquent = (aCusotmer === "미확인 고객")
    ? 0
    : aCusotmer.paymentHistory.weeksDelinquentInLastYear
```

- 고객 정보를 갱신하는 클라이언트가 없는 경우

```js
function createUnknownCustomer() {
    return {
        isUnknown: true
    }
}

class Customer {
    get isUnknown() {return false}
}
```

- 1️⃣ 고객에 `isUnknown()` 속성 추가,
- 2️⃣ 이 필드를 포함하는 특이 케이스 객체를 생성, 이전과의 차이점은 리터럴이라는 점

```js
function isUnknown(arg) {
    return (arg === "미확인 고객")
}

// 클라이언트 1
let customerName
if (isUnknown(aCustomer)) customerName = "거주자"
else customerName = aCusotmer.name

// 클라이언트 2
const plan = isUnknown(aCustomer)
    ? registry.billingPlans.basic
    : aCustomer.billingPlan

// 클라이언트 3
const weeksDeliquent = (isUnknown(aCusotmer))
    ? 0
    : aCusotmer.paymentHistory.weeksDelinquentInLastYear
```

- 3️⃣ 특이 케이스 조건 검사 부분을 함수로 추출(6.1)

```js
function isUnknown(arg) {
    return arg.isUnknown
}

class Site {
    get customer() {
        return (this._customer === "미확인 고객")
            ? createUnknownCusotmer()
            : this._customer
    }
}
```

- 4️⃣ 조건을 검사하는 코드와 Site클래스에서 이 특이 케이스를 사용하도록 수정

```js
// 클라이언트 1
function createUnknownCustomer() {
    return {
        isUnknown: true,
        name: "거주자"
    }
}

const customerName = aCusotmer.name

// 클라이언트 2
function createUnknownCustomer() {
    return {
        isUnknown: true,
        name: "거주자",
        billingPlan: registry.billingPlans.basic
    }
}

const plan = aCustomer.billingPlan

// 클라이언트 3
function createUnknownCustomer() {
    return {
        isUnknown: true,
        name: "거주자",
        billingPlan: registry.billingPlans.basic,
        paymentHistory: {
            weeksDelinquentInLastYear: 0
        }
    }
}

const weekDeliquent = aCustomer.paymentHistory.weeksDelinquentInLastYear
```

- 7️⃣ 각각의 표준 응답을 적절한 리터럴 값으로 대체

### 예시: 변환 함수 이용하기

- 위의 두 예시는 클래스와 관련있지만, 변환 단계를 추가하면 같은 아이디어를 레코드에도 적용 가능

```json
{
    name: "애크미 보스턴",
    location: "Malden MA",
    // 더 많은 현장 정보
    customer: {
        name: "애크미 산업",
        billingPlan: "plan-451",
        paymentHistory: {
            weeksDeliquentInLastYear: 7
            // ...
        },
        // ...
    }
}

{
    name: "물류창고 15",
    location: "Malden MA",
    customer: "미확인 고객",
}
```

- 일반적인 JSON 데이터 구조를 가지고, 위와 같이 “미확인 고객”이 있는 경우

```js
// 클라이언트 1
const site = acquireSiteDate()
const aCustomer = site.customer
// ...
let customerName
if (aCustoemr === "미확인 고객") customerName = "거주자"
else customerName = aCustomer.name

// 클라이언트 2
const plane = (aCustomer === "미확인 고객")
    ? registry.billingPlan.basic
    : aCustomer.billingPlan

// 클라이언트 3
const weeksDeliquent = (aCusotmer === "미확인 고객")
    ? 0
    : aCusotmer.paymentHistory.weeksDelinquentInLastYear
```

- 앞선 예시와 같이 미확인 고객인지 확인하는 클라이언트 코드들

```js
function enrichSite(inputSite) {
    return _.cloneDeep(inputSite)
}

// 클라이언트 1
const rawSite = acquireSiteDate()
const site = enrichSite(rawSite)
const aCustomer = site.customer
// ...
let customerName
if (aCustoemr === "미확인 고객") customerName = "거주자"
else customerName = aCustomer.name
```

- 우선 `enrichSite()`함수를 통과시켜 깊은 복사 수행

```js
function isUnknown(aCustomer) {
    return (aCustomer === "미확인 고객")
}

// 클라이언트 1
const rawSite = acquireSiteDate()
const site = enrichSite(rawSite)
const aCustomer = site.customer
// ...
let customerName
if isUnknown(aCustoemr) customerName = "거주자"
else customerName = aCustomer.name

// 클라이언트 2
const plane = isUnknown(aCustomer)
    ? registry.billingPlan.basic
    : aCustomer.billingPlan

// 클라이언트 3
const weeksDeliquent = isUnknown(aCusotmerisUnknown)
    ? 0
    : aCusotmer.paymentHistory.weeksDelinquentInLastYear
```

- 3️⃣ 알려지지 않은 고객인지 검사하는 로직을 함수로 추출(6.1)

```js
function enrichSite(aSite) {
    const result = _.cloneDeep(aSite)
    const unknownCusotmer = {
        isUnknown: true
    }

    if isUnknown(aCustoemr) result.customer = unknownCusotmer
    else result.customer.isUnknown = false
    reutnr result
}
```

- 1️⃣, 2️⃣ 고객 레코드에 `isUnknown()`속성을 추가하여 현장 정보 보강

```js
function isUnknown(aCustomer) {
    if (aCustomer === "미확인 고객") return true
    else return aCustomer.isUnknown
}
```

- 5️⃣ 특이 케이스 검사 시 새로운 속성을 이용하도록 수정
- 6️⃣ 모든 기능이 잘 동작하는지 테스트
- 7️⃣ 특이 케이스에 여러 함수를 변환 함수로 묶기 적용(6.10)

## 10.6 어서션 추가하기

```js
// before
if (this.discountRate)
    base = base - (this.discountRate * base)

// after
assert(this.discountRate >= 0)
if (this.discountRate)
    base = base - (this.discountRate * base)
```

### 배경

- 특정 조건이 참일 때만 동작하는 코드 영역이 있을 수 있음
    - 이런 코드는 명시적으로 기술되어 있지 않은 경우가 있어서 스스로 알아내야 하는데,
    - 어서션을 이용할 수 있음
- 어서션은 항상 참이라 가정하는 조건부 문장
    - 어서션 실패는 프로그래머가 잘못했다는 뜻
    - 어서션 실패는 시스템의 다른 부분에서는 절대 검사하지 않아야 하며, 프로그램 기능의 정상동작에 아무런 영향을 주지 않도록 작성
- 어서션을 오류 찾기에 활용하라고 추천하는 경우
    - 어서션은 실행되는 과정이 어떠한 환경을 가정했는지 알려주는 도구

### 절차

- 참이라고 가정하는 조건이 보이면 그 조건을 명시하는 어서션 추가

### 예시

```js
// before
class Customer {
    applyDiscount(aNumber) {
        return (this.discountRate)
            ? aNumber - (this.discountRate * aNumber)
            : aNumber
    }
}

// after
class Customer {
    applyDiscount(aNumber) {
        if (!this.discountRate) return aNumber
        else {
            assert (this.discountRate >= 0)
            return aNumber - (this.discountRate * aNumber)
        }
    }
}
```

- 할인과 관련한 코드, 상품 구입시 할인율 적용 받음
    - 할인율은 항상 양수라는 가정이 깔려 있음
    - 3항 연산자 대신 if-then 구조로 만들고, 어서션 추가 가능

```js
class Customer {
    set discountRate(aNumber) {
        assert (null === aNuber || aNumber >= 0)
        this._discountRate = aNumber
    }
}
```

- 이 예시의 경우 세터 메서트에 추가하여
    - `applyDiscount()`적용 하기 이전부터 발생할 수 있는 문제를 발견하는 게 더 좋을 수 있음

## 10.7 제어 플래그로 탈출문 바꾸기

```js
// before
for (const p of people) {
    if (!found) {
        if (p === "조커") {
            sendAlert()
            found = true
        }
    }
}

// after
for (const p or people) {
    if (p === "조커") {
        sendAlert()
        break
    }
}
```

### 배경

- 제어 플래그는 코드의 동작을 변경하는데 사용되는 변수, 어딘가에서 값을 계산해 다른 어딘가의 조건문으로 검사하는데 사용
- 제어 플래그의 주 서식지는 반복문 안
    - break, continue를 활용하거나, 함수 return을 활용할 수 있음

### 절차

- 1️⃣ 제어 플래그를 사용하는 코드를 함수로 추출(6.1)할지 고려
- 2️⃣ 제어 플래그를 갱신하는 코드 각각을 적절한 제어문으로 변경 (return, break, continue)
- 3️⃣ 제어 플래그 제거

### 예시

```js
let found = false
for (const p of people) {
    if (!found) {
        if (p === "조커") {
            sendAlert()
            found = true
        }
        if (p === "사루만") {
            sendAlert()
            found = true
        }
    }
}
```

- 사람 목록을 훑으며 악당을 찾는 코드

```js
// ...
checkForMiscreants(people)
// ...

function checkForMiscreants(people) {
    let found = false
    for (const p of people) {
        if (!found) {
            if (p === "조커") {
                sendAlert()
                found = true
            }
            if (p === "사루만") {
                sendAlert()
                found = true
            }
        }
    }
}
```

- 1️⃣ 함수 추출하기(6.1)

```js
function checkForMiscreants(people) {
    let found = false
    for (const p of people) {
        if (!found) {
            if (p === "조커") {
                sendAlert()
                return
            }
            if (p === "사루만") {
                sendAlert()
                return
            }
        }
    }
}
```

- 2️⃣ 제어 플래그 대신 return 사용,
    - 함수가 아니거나 상황에 따라 break를 사용할 수 있음

```js
function checkForMiscreants(people) {
    for (const p of people) {
        if (p === "조커") {
            sendAlert()
            return
        }
        if (p === "사루만") {
            sendAlert()
            return
        }
    }
}
```

- 3️⃣ 제어 플래그와 관련한 코드 제거
    - 추가로 여러 악당중 하나를 찾는 코드를 파이프로 간략화 할 수 있음