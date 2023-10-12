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

