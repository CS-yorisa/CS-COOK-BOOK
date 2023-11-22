# Chapter 12. 상속 다루기

## 12.1 메서드 올리기

``` js
class Employee { ... }

class Salesperson extends Employee {
  get name() {...}
}
  
class Engineer extends Employee {
  get name() {...}
}
```

``` js
class Employee {
  get name() {...}
}
  
class Salesperson extends Employee {...}
class Engineer extends Employee {...}
```



### 배경

- 중복된 메서드가 당장은 문제없이 동작하더라도, 한쪽의 변경이 다른 쪽에는 반영되지 않을 수 있다는 위험을 항상 수반하므로 중복 코드 제거가 중요
- 서로 다른 두 클래스의 두 메서드를 각각 매개변수화하면 궁극적으로 같은 메서드가 되기도 함 > 각각의 함수를 매개변수화한 다음 메서드를 상속 계층의 위로 이동
- 메서드의 본문에서 참조하는 필드들이 서브클래스에만 있는 경우, 필드들을 먼저 슈퍼클래스로 올린 후에 메서드를 올려야 함



### 절차

1. 똑같이 동작하는 메서드인지 확인
   - 실질적으로 하는 일은 같지만 코드가 다르다면 본문 코드가 똑같아질 때까지 리팩터링
2. 메서드 안에서 호출하는 다른 메서드와 참조하는 필드들을 슈퍼클래스에서도 호출하고  참조할 수 있는지 확인
3. 메서드 시그니처가 다르다면 함수 선언 바꾸기로 슈퍼클래스에서 사용하고 싶은 형태로 통일
4. 슈퍼클래스에 새로운 메서드를 생성하고, 대상 메서드의 코드를 복사
5. 정적 검사 수행
6. 모든 서브클래스의 메서드가 없어질 때까지 다른 서브클래스의 메서드를 하나씩 제거



### 예시

- 두 서브클래스에서 같은 일을 수행하는 메서드

``` js
// Employee 클래스 (Party를 상속)
get annualCost(){
  return this.monthlyCost * 12;
}

// Department 클래스 (Party를 상속)
get totalAnnualCost(){
  return this.monthlyCost * 12;
}
```

- 두 메서드에서 참조하는 monthlyCost() 속성은 슈퍼클래스에는 정의되어 있지 않지만 두 서브 클래스 모두에 존재. 정적 언어였다면 슈퍼클래스인 Party에 추상메서드 정의가 필요함
- 두 메서드의 이름이 다르므로 함수 선언 바꾸기로 이름을 통일

``` js
// Department 클래스
get annualCost(){
  return this.monthlyCost * 12;
}
```

- 서브클래스 중 하나의 메서드를 복사해 슈퍼클래스에 붙여넣음

``` js
// Party 클래스
get annualCost(){
  return this.monthlyCost * 12;
}
```

- 정적 언어였다면 모든 참조가 올바른지 먼저 확인해야 하지만, 동적 언어에서는 해당되지 않으므로 서브 클래스 메서드들을 바로 제거



## 12.2 필드 올리기

``` java
class Employee { ... }

class Salesperson extends Employee {
  private String name;
}
  
class Engineer extends Employee {
  private String name;
}
```

``` java
class Employee { 
  protected String name;
}

class Salesperson extends Employee {...}
  
class Engineer extends Employee {...}
```



### 배경

- 서브클래스들이 독립적으로 개발되었거나 뒤늦게 하나의 계층구조로 리팩터링된 경우라면 일부 기능이 중복될 때가 있는데, 분석 결과 필드들이 비슷한 방식으로 쓰인다고 판단되면 슈퍼클래스로 이동
- 필드 올리기로 데이터 중복 선언을 없앨 수 있고, 해당 필드를 사용하는 동작을 서브클래스에서 슈퍼클래스로 옮길 수 있음



### 절차

1. 후보 필드들을 사용하는 곳 모두가 그 필드들을 똑같은 방식으로 사용하는지 확인
2. 필드들의 이름이 각기 다르다면 똑같은 이름으로 변경(필드 이름 바꾸기)
3. 슈퍼클래스에 새로운 필드 생성
   - 서브클래스에서 이 필드에 접근할 수 있어야 함 (protected로 선언)
4. 서브 클래스 필드 제거