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


## 12.3 생성자 본문 올리기

```js
// before
class Party {...}
class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super()
        this._id = id
        this._name = name
        this._monthlyCost = monthlyCost
    }
}

// after
class Party {
    construcotr(name) {
        this._name = name
    }
}
class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super(name)
        this._id = id
        this._monthlyCost = monthlyCost
    }
}
```

### 배경

- 생성자 다루기는 까다로움
    - 일반 메서드와 다르기 때문에, 저자는 제약을 두는 편
    - 서브클래스들에서 기능이 같은 메서드들을 발견하면, 함수 추출하기(6.1), 메서드 올리기(12.1)을 차례로 적용, 말끔히 슈퍼클래스로 옮김
    - 그 메서드가 생성자이면, 생성자가 할 수 있는 일과 호출 순서에 제약이 있기 때문에 다른 방식의 접근 필요


### 절차

- 1️⃣ 슈퍼클래스에 생성자가 없다면, 하나 정의
- 2️⃣ 문장 슬라이드하기(8.6)로 공통 문장 모두를 super() 호출 직후로 이동
- 3️⃣ 공통 코드를 슈퍼클래스에 추가, 서브클래스에서 제거
- 4️⃣ 테스트
- 5️⃣ 생성자 시작 부분으로 옮길 수없는 공통코드에는 함수 추출하기(6.1), 메서드 올리기(12.1)을 차례로 적용


### 예시

```js
class Party{}

class Employee extends Party {
    constructor(name, id, monthlyCost) {
        this._id = id
        this._name = name
        this._monthlyCost = monthlyCost
    }
}

class Department extends Party {
    constructor(name, staff) {
        this._name = name
        this._staff = staff
    }
}
```

- 공통 코드 `this._name=name` 부분이 있음

```js
class Party{
    constructor(name) {
        this._name = name
    }
}

class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super(name)
        this._id = id
        this._monthlyCost = monthlyCost
    }
}

class Department extends Party {
    constructor(name, staff) {
        super(name)
        this._staff = staff
    }
}
```

- 문장 슬라이드하기(8.6)을 적용하여 super() 호출 아래로 다른 코드들을 이동
- 슈퍼클래스 생성자로 코등를 옮긴 후, 슈퍼클래스 생성자에 매개변수로 건내도록 변경

### 예시: 공통 코드가 나중에 올 때

```js
class Employee{
    constructor(name) {...}
    get isPrivileged() {...}
    assignCar() {...}
}

class Manager extends Employee {
    construtor(name, grade) {
        super(name)
        this._grade = grade
        is (this.isPrivileged) this.assignCar() // 모든 서브클래스가 수행
    }
    get isPrivileged() {
        return this._grade > 4
    }
}
```

- 생성자는 배부분 super()를 호출, 공통 작업 처리한 다음, 서브 클래스에 필요한 작업을 추가로 함
    - 공통 작업이 생성자의 뒷부분에 오는 경우도 있음
    - `isPrivileged()`가 호출되기 위해서는 `grade`값이 있어야 함

```js
class Employee {
    finishConstruction() {
        if (this.isPrivileged) this.assignCar()
    }
}

class Manager extends Employee {
    construtor(name, grade) {
        super(name)
        this._grade = grade
        this.finishConstruction()
    }
    finishConstruction() {
        if (this.isPrivileged) this.assignCar()
    }
}
```

- 공통 작업을 함수로 추출(6.1), 메서드를 슈퍼클래스로 올리기(12.1)


## 12.4 메서드 내리기

```js
// before
class Employee {
    get quota {...}
}

class Engineer extends Employee {...}
class Salesperson extends Employee {...}

// after
class Employee {...}

class Engineer extends Employee {...}
class Salesperson extends Employee {
    get quota {...}
}
```


### 배경

- 특정 서브클래스 하나 또는 소수와만 관련된 메서드는 슈퍼클래스에서 제거하고 서브클래스들에 추가하는 편이 깔끔
- 이 경우, 서브클래스가 저오학히 무엇을 호출하는지 호출자가 알고 있어야 함
    - 그렇지 않다면, 슈퍼클래스의 기만적인 조건부 로직을 다형성으로 바꿈(10.4)


### 절차

- 1️⃣ 대상 메서드를 모든 서브클래스에 복사
- 2️⃣ 슈퍼클래스에서 메서드 제거
- 3️⃣ 테스트
- 4️⃣ 이 메서드를 사용하지 않는 모든 서브클래스에서 제거
- 5️⃣ 테스트


## 12.5 필드 내리기

```java
// before
class Employee {
    private String quota;
}

class Engineer extends Employee {...}
class Salesperson extends Employee {...}

// after
class Employee {...}

class Engineer extends Employee {...}
class Salesperson extends Employee {
    private String quota;
}
```


### 배경

- 서브클래스에서 하나 또는 소수에서만 사용하는 필드는 해당 서브클래스들로 옮김


### 절차

- 1️⃣ 대상 필드를 모든 서브클래스에 정의
- 2️⃣ 슈퍼클래스에서 필드 제거
- 3️⃣ 테스트
- 4️⃣ 이 필드를 사용하지 않는 모든 서브클래스에서 제거
- 5️⃣ 테스트


## 12.6 타입 코드를 서브클래스로 바꾸기

```js
// before
function createEmployee(name, type) {
    return new Employee(name, type)
}

// after
function createEmployee(name, type) {
    switch (type) {
        case "engineer": return new Engineer(name);
        case "salesperson": return new Salesperson(name);
        case "manager": return new Manager(name);
    }
}
```


### 배경

- 소프트웨어 시스템에서는 비슷한 대상들을 특정 특성에 따라 구분해야할 대가 자주 있음
    - 이런 일을 다루는 타입 코드 필드
- 타입 코드만으로 특별히 불편한 상황은 없지만, 그 이상의 작업(서브클래스)가 필요할 때가 있음
    - 서브클래스틑 조건에 따라 다형성을 제공, 서브클래스만의 필드를 갖도록 할 수 있음
- 이 리팩터링은 대상 클래스에 직접 적용할지, 타입 코드 자체에 적용할지 고민
    - 전자라면, 직원의 하위 타입인 엔지니어 만들 것
    - 후자라면, 직원에게 직원 유형 ‘속성’ 부여, 이 속성을 클래스로 정의해 엔지니어 속성과 관리자 속성 같은 서브클래스 만듬
    - 대상 클래스를 직접 서브클래싱 하는게 간단하지만, 다른 용도로 사용하기 어려움
    - 서브클래싱 대상을 직원 유형 속성에 적용하고자 한다면, 타입 코드에 기본형을 객체로 바꾸기(7.3) 적용 후, 이번 리팩터링 적용하면 됨


### 절차

- 1️⃣ 타입 코드 필드를 자가 캡슐화
- 2️⃣ 타입 코드 값 하나를 선택, 그 값에 해당하는 서브클래스 생성 
  타입 코드 게터 메서드를 오버라이드하여, 해당 타입 코도의 리터럴 값을 반환하게 함
- 3️⃣ 매개변수로 받은 타입 코드와 방금 만든 서브클래스를 매핑하는 선택 로직 만듬
    - 직접 상속일 때는 생성자를 팩터리 함수로 바꾸기(11.8)
    - 간접 상속일 때는 선택 로직을 생성자에 두면 됨
- 4️⃣ 테스트
- 5️⃣ 타입 코드 값 각각에 대해 서브클래스 생성과 선택 로직 추가를 반복
- 6️⃣ 타입 코드 필드 제거
- 7️⃣ 테스트
- 8️⃣ 타입 코드 접근자를 이용하는 메서드 모두에 메서드 내리기(12.4), 조건부 로직을 다형성으로 바꾸기(10.4) 적용


### 예시: 직접 상속

```js
class Employee {
    constructor(name, type) {
        this.validateType(type)
        this._name = name
        this._type = type
    }
    validateType(arg) {
        if (!["engineer", "manager", "salesperson"].includes(arg))
            throw new Error (`${arg}하는 직원 유형은 없습니다`)
    }
    toString() {return `${this._name} (${this._type})`}
}
```

- 직원 코드 예시

```js
class Employee {
    ...
    get type() {return this._type}
    toString() {return `${this._name} (${this.type})`}
}
```

- 1️⃣ 타입 코드 변수를 자가 캡슐화(6.6)

```js
class Engineer extends Employee {
    get type() {return "engineer"}
}
```

- 2️⃣ 타입 코드 중 하나를 선택, 직접 상속 방식으로 구현
- 타입 코드 게터를 오버라이드하여 적절한 리터럴 값을 반한하도록 변경

```js
function createEnployee(name, type) {
    return new Employee(name, type)
}
```

- 3️⃣ 생성자를 팩터리 함수로 바꿔서(11.8) 선택 로직을 담을 별도 장소 마련

```js
function createEmployee(name, type) {
    switch (type) {
        case "engineer": return new Engineer(name, type)
    }
    return new Employee(name, type)
}
```

- 새로 만든 서브클래스를 사용하기 위한 로직을 팩터리에 추가

```js
class Salesperson extends Employee {
    get type() {return "salesperson"}
}
class Manager extends Employee {
    get type() {return "manager"}
}
function createEmployee(name, type) {
    switch (type) {
        case "engineer": return new Engineer(name, type);
        case "salesperson": return new Salesperson(name);
        case "manager": return new Manager(name);
    }
    return new Employee(name, type)
}
```

- 4️⃣ 테스트
- 5️⃣ 남은 유형들에도 같은 작업 반복

```js
class Employee {
    constructor(name, type) {
        this._name = name
    }
    toString() {return `${this._name} (${this._type})`}
}
function createEmployee(name, type) {
    switch (type) {
        case "engineer": return new Engineer(name, type);
        case "salesperson": return new Salesperson(name);
        case "manager": return new Manager(name);
    }
}
```

- 6️⃣ 모든 유형에 적용했다면, 타입 코드 필드와 슈퍼클래스의 게터를 제거
- 7️⃣ 테스트 후 검증로직 제거
- 8️⃣ 서브클래스에는 타입 코드 게터가 남아 있음
    - 로직을 다형성으로 바꾸기(10.4), 메서드 내리기(12.4)로 문제 해결


### 예시: 간접 상속

```js
class Employee {
    constructor(name, type) {
        this.validateType(type)
        this._name = name
        this._type = type
    }
    validateType(arg) {
        if (!["engineer", "manager", "salesperson"].includes(arg))
            throw new Error (`${arg}하는 직원 유형은 없습니다`)
    }
    get type() {return this._type}
    set type(arg) {this._type = arg}

    get capitalizedType() {
        return this._type.charAt(0).toUpperCase() + this._type.substr(1).toLowerCase()
    }
    toString() {
        return `${this._name} (${this.capializedType})`
    }
}
```

- 직원의 서브클래스로 아르바이트, 정직원이라는 클래스가  이미 있어서, 직접 상속 방식으로 대처할 수 없다고 가정

```js
class EmployeeType{
    constructor(aString) {
        this._value = aString
    }
    toString() {return this._value}
}

class Employee {
    constructor(name, type) {
        this.validateType(type)
        this._name = name
        this._type = type
    }
    validateType(arg) {
        if (!["engineer", "manager", "salesperson"].includes(arg))
            throw new Error(`${arg}하는 직원 유형은 없습니다`)
    }
    get typeString() {return this._type.toString()}
    get type() {return this._type}
    set type(arg) {this._type = new EmployeeType(arg)}

    get capitalizedType() {
        return this.typeString.charAt(0).toUpperCase()
             + this.typeString.substr(1).toLowerCase()
    }
    toString() {
        return `${this._name} (${this.capializedType})`
    }
} 
```

- 1️⃣ 타입 코드를 객체로 바꾸기(7.3)

```js
class Employee {
    // ...
    set type(arg) {this._type = new createEmployyType(arg)}
    static createEmployyType(aString) {
        switch(aString) {
            case "engineer": return new Engineer(name, type);
            case "salesperson": return new Salesperson(name);
            case "manager": return new Manager(name);
            default: throw new Error(`${arg}하는 직원 유형은 없습니다`)
        }
    }
    // ...
} 
```

- 앞 예시와 같은 방식으로 직원 유형 리팩터링


## 12.7 서브클래스 제거하기

```js
// before
class Persone {
    get genderCode() {return "X"}
}
class Male extends Person {
    get genderCode() {return "M"}
}
class Female extends Persone {
    get genderCode() {return "F"}
}

// after
class Persone {
    get genderCode() {
        return this._genderCode
    }
}
```


### 배경

- 서브클래싱은 원래 데이터 구조와는 다른 변종을 만들거나, 종류에 따라 동작이 달라지게 할 수 있는 유용한 매커니즘
- 하지만, 서브클래스는 한 번도 활용되지 않기도 함
    - 그럴 때, 낭비를 제거하는게 최선


### 절차

- 1️⃣ 서브클래스의 생성자를 팩터리 함수로 바꿈(11.6)
- 2️⃣ 서브클래스의 타입을 검사하는 코드가 있다면, 그 검사 코드에 함수 추출하기(6.1), 함수 옮기기(8.1) 적용
- 3️⃣ 서브클래스의 타입을 나타내는 필드를 슈퍼클래스에 만듬
- 4️⃣ 서브클래스를 참조하는 메서드가 방금 만든 타입 필드를 이용하도록 수정
- 5️⃣ 서브클래스 삭제
- 6️⃣ 테스트


### 예시

```js
class Person {
    constructor(name) {
        this._name = name
    }
    get name() {return this._name}
    get genderCode() {return "X"}
    // ...
}
class Male extends Person {
    get genderCode() {return "M"}
}
class Female extends Persone {
    get genderCode() {return "F"}
}

// client
const numberOfMales = people.filter(p => p instanceof Male).length
```

- 서브 클래스의 작업이 크지 않지만, 그 때문에 클라이언트에서는 더 복잡하게 동작하는 코드가 있을 수 있음

```js
function createPerson(name) {
    return new Persone(name)
}
function createMale(name) {
    return new Male(name)
}
function createFemale(name) {
    return new Female(name)
}
```

- 1️⃣ 서브클래스 만들기를 캡슐화 하기 위해 함수로 바꾸기(11.8) 적용
    - 현재의 표현을 캡슐화하되, 클라이언트 코드에 최소의 영향을 주기 위함
    - 직관적으로 각 팩터리 메서드를 생성자 하나당 하나씩 만듬

```js
function loadFromInput(data) {
    const result = []
    data.forEach(aRecord => {
        let p
        switch (aRecord.gender) {
            case "M": p = new Male(aRecord.name); break;
            case "F": p = new Female(aRecord.name); break;
            default: p = new Person(aRecord.name);
        }
        result.push(p)
    })
    return result
}
```

- 직관적이긴 하지만, 이런 류의 객체는 성별 코드를 사용하는 곳에서 직접 생성될 가능성이 큼

```js
function createPerson(data) {
    let p
    switch (aRecord.gender) {
        case "M": p = new Male(aRecord.name); break;
        case "F": p = new Female(aRecord.name); break;
        default: p = new Person(aRecord.name);
    }
    return p
}

function loadFromInput(data) {
    const result = []
    data.forEach(aRecord => {
        result.push(createPerson(aRecord))
    })
    return result
}
```

- 생성할 클래스를 생성하는 로직을 함수로 추출(6.1), 그 함수를 팩터리 함수로 삼는 편이 나음

```js
function createPerson(data) {
    switch (aRecord.gender) {
        case "M": return new Male(aRecord.name);
        case "F": return new Female(aRecord.name);
        default: return new Person(aRecord.name);
    }
}

function loadFromInput(data) {
    return data.map(aRecord => createPerson(aRecord))
}
```

- 두 함수를 정리,
    - createPerson에서 인라인(6.4)
    - loadFromInput의 반복문을 파이프라인(8.8)

```js
// 클라이언트
const numberOfMales = people.filter(p => isMale(p)).length
function isMale(aPerson) {return aPerson insteadof Male}
```

- 2️⃣ 팩터리가 서브클래스 생성을 캡슐화하지만, 다른 부분에서 `instanceof`를 사용함
    - 이 타입 검사 코르를 함수로 추출(6.1)

```js
// person class
get isMale() {return this instanceof Male}

// client
const numberOfMales = people.filter(p => p.isMale).length
```

- 추출한 함수를 Person으로 옮기(8.1)

```js
// person class
constructor(name, genderCode) {
    this._name = name
    this._genderCode = genderCode || "X"
}
get genderCode() {return this._genderCode}
```

- 3️⃣ 서브클래스들의 차이를 나타내는 필드 추가

```js
function createPerson(data) {
    switch (aRecord.gender) {
        case "M": return new Male(aRecord.name, "M");
        case "F": return new Female(aRecord.name, "F");
        default: return new Person(aRecord.name, "X");
    }
}
```

- 4️⃣ 남성인 경우의 로직을 슈퍼클래스로 옮기고 서브클래스 제거, 같은 방식으로 여성 서브클래스도 옮긴 후 제거
- 기본값을 사용하지만, 값을 건내지 않으면 나중에 확인했을 때 코드를 읽기 어려워 질 수 있으므로, “X” 값을 건내도록 수정


## 12.8 슈퍼클래스 추출하기

```js
// before
class Department {
    get totalAnnualCost() {...}
    get name() {...}
    get headCount() {...}
}
class Employee {
    get annualCost() {...}
    get name() {...}
    get id() {...}
}

// after
class Party {
    get name() {...}
    get annualCost() {...}
}
class Department extends Party {
    get annualCost() {...}
    get headCount() {...}
}
class Employee extends Party {
    get annualCost() {...}
    get id() {...}
}
```

### 배경

- 비슷한 일을 수행하는 두 클래스가 보이면, 상속 매커니즘을 이용해 비슷한 부분을 공통의 슈퍼클래스로 옮겨 닮을 수 있음
    - 곧통된 부분이 데이터라면 필드 올리기(12.2), 동작이라면 메서드 올리기(12.1)
- 슈퍼클래스 추출하기의 대안으로 클래스 추출하기(7.5)
    - 어느것을 하느냐는 중복 동작을 상속으로 해결하느냐 위임하느냐 차이
    - 나중에라도 필요하면 슈퍼클래스를 위임으로 바꾸기(12.11)은 어렵지 않음


### 절차

- 1️⃣ 빈 슈퍼 클래스 생성, 원래 클래스들이 새 클래스를 상속하도록 함
- 2️⃣ 테스트
- 3️⃣ 생성자 본문 올리기(12.3), 메서드 올리기(12.1), 필드 올리기(12.2)를 차례로 적용하여 공통 원소를 슈퍼클래스로 옮김
- 4️⃣ 서브클래스에 남은 메서드들을 검토, 공통되는 부분이 있다면 추출(6.1), 메서드 올리기(12.1)
- 5️⃣ 원래 클래스들을 사용하는 코드를 검토하여 슈퍼클래스의 인터페이르를 사용하게 할지 고민


### 예시

```js
class Employee {
    constructor(name, id, monthlyCost) {
        this._id = id
        this._name = name
        this._monthlyCost = monthlyCost
    }
    get monthlyCost() {return this._monthlyCost}
    get name() {return this._name}
    get id() {return this._id}

    get annualCost() {
        return this.monthlyCost * 12
    }
}

class Department {
    constructor(name, staff) {
        this._name = name
        this._staff = staff
    }
    get staff() {return this._staff.slice()}
    get name() {return this._name}

    get totalMonthlyCost() {
        return this.staff
            .map(e => e.monthlyCost)
            .reduce((sum, cost) => sum + cost)
    }
    get headCount() {
        return this.staff.length
    }
    get totalAnnualCost() {
        return this.totalMonthlyCost * 12
    }
}
```

- 두 클래스를 사용하고 있는데, 공통 기능이 있음 (연간 비용, 월간 비용, 이름)

```js
class Party {}
class Employee extends Party {
    constructor(name, id, monthlyCost) {
        super()
        ...
    }
    ...
}
class Department extends Party {
    constructor(name, staff) {
        super()
        ...
    }
    ...
}
```

- 1️⃣ 빈 슈퍼클래스를 만들고, 두 클래스가 이를 확장하도록 함

```js
// Party class
constructor(name) {
    this._name = name
}
get name() = {return this._name}

// Employee class
constructor(name, id, monthlyCost) {
    super(name)
    this._id = id
    this._monthlyCost = monthlyCost
}

// Department class
constructor(name, staff) {
    super(name)
    this._staff = staff
}
```

- 3️⃣ 필드 올리기(12.2), 2️⃣메서드 올리기(12.1) 적용

```js
// Party class
get totalAnnualCost() {
    return this.monthlyCost * 12
}
get monthlyCost() {...}

// Department class
get annualCost() {
    return this.monthlyCost * 12
}
```

- 이름은 다르지만 같은 동작을 하는 메서드 (`Employee.annualCost()`, `Department.totalAnnualCost()`)
    - 하지만 두 메서드가 하려는 의도가 같기 때문에, 함수 선언 바꾸기(6.5)
- 이후 연간 비용 계산을 위한 메서드에 메서드 올리기(12.1) 적용 가능

## 12.9 계층 합치기

```js
// before
class Employee {...}
class Salesperson extends Employee {...}

// after
class Employee {...}
```


### 배경

- 클래스 계층구로를 리팩터링하다 보면 기능들을 위로 올리거나 내리는 일은 다반소로 벌어짐
- 계층구조도 진화하면서 클래스가 부모와 너무 비슷해져 독립적으로 존재해야할 이유가 사라지는 경우, 하나로 합칠 수 있음


### 절차

- 1️⃣ 두 클래스 중 제거할 것을 고름
- 2️⃣ 필드 올리기(12.2), 메서드 올리기(12.1) 또는 필드 내리기(12.5), 메서드 내리기(12.4)를 적용, 모든 요소를 하나의 클래스로 옮김
- 3️⃣ 제거할 클래스를 참조하던 모든 코드가 남겨질 클래스를 참조하도록 고침
- 4️⃣ 빈 클래스 제거


## 12.10 서브클래스를 위임으로 바꾸기

```js
// before
class Order {
    get daysToShip() {
        return this._warehouse.dayToShip
    }
}

class PriorityOrder extends Order {
    get daysToShip() {
        return this._priorityPlan.dasysToShip
    }
}

// after
class Order {
    get daysToShip() {
        return (this._priorityDelegate)
            ? this._priorityDelegate.daysToShip
            : this._warehoue.daysToShip
    }
}

class PriorityOrderDelegate {
    get daysToShip() {
        return this._priorityPlan.dasysToShip
    }
}
```


### 배경

- 속한 갈래에 따라 동작이 달라지는 객체들은 상속으로 표현하는게 자연스러움
    - 공통 데이터와 동작을 모두 슈퍼클래스에 두고, 서브클래스는 자신에 맞게 기능을 추가하거나, 오버라이드 하면 됨
- 상속의 단점이 있음, 한 번만 쓸 수 있는 카드
    - 무언가 달라져야 하는 이유가 여러 개여도 상속에서는 그중 단 하나의 이유만 선택해 기준으로 삼을 수밖에 없음
    - 예를 들어, 사람 객체 동작을 ‘나이대’ 혹은 ‘소득 수준’에 따라 다르게 하고 싶다면, 서브 클래스는 젊은이와 어르신, 혹은 부자와 서민이 되어야지, 둘 다 될수는 없음
- 또 다른 상속의 문제는, 클래스들의 관계를 아주 긴밀하게 결합한다는 점
    - 부모를 수정하면 이미 존재하는 자식들의 기능을 해치기가 쉬움
- 위임(delegate)는 위의 두 문제를 모두 해결
    - 다양한 클래스에 서로 다른 이유로 위임할 수 있음
    - 위임은 객체 사이 일반적인 관계이므로, 상호작용에 필요한 인터페이스를 명확히 정의할 수 있음
    - 상속보다 결합이 약하여, 상속과 관련 문제에 직면하면 서브클래스를 위임으로 바꿀 수 있음
- 유명한 원칙, “(클래스) 상속보다는 (객체) 컴포지션을 사용하라” (컴포지션 = 위임)
    - 상속은 위험하다고 주장하기도 하지만, 필요에 따라서는 언제든 상속을 위임으로 바꿀 수 있음
    - 그래서 상속으로 접근, 문제가 생긴다면 위임으로 변경해도 됨
- 디자인 패턴으로 보자면, 서브클래스를 상태 패턴이나 전략패턴으로 대체 한다고 생각할 수 있음


### 절차

- 1️⃣ 생성자를 호출하는 곳이 많다면 생성자를 팩터리 함수로 바꿈(11.8)
- 2️⃣ 위임으로 활용할 빈 클래스 생성, 클래스의 생성자는 서브클래스에 특화된 데이터를 전부 받아야 하며, 보통은 슈퍼클래스를 가리키는 역참조도 필요
- 3️⃣위임을 저장할 필드를 슈퍼클래스에 추가
- 4️⃣ 서브클래스 생성 코드를 수정하여 위임 인스턴스를 생성, 위임 필드에 대입해 초기화
- 5️⃣ 서브클래스의 메서드 중 위임 클래스로 이동할 것을 선택
- 6️⃣ 함수 옮기기(8.1)를 적용해 위임 클래스로 옮김, 원래 메서드에서는 위임하는 코드를 삭제하지 않음
- 7️⃣ 서브클래스 외부에도 원래 메서드를 호출하는 코드가 있다면, 서브클래스의 위임 코드를 슈퍼클래스로 이동
  이때 위임이 존재하는지 검사하는 보호 코드로 감싸야 함, 호출하는 외부 코드가 없다면 원래 메서드는 죽은 코드가 되어 제거(8.9)
- 8️⃣ 테스트
- 9️⃣ 서브클래스의 모든 메서드가 옮겨질 때까지 5~8 과정을 반복
- 🔟 서브클래스들의 생성자를 호출하는 코드를 찾아서 슈퍼클래스의 생성자를 사용하도록 수정
- 1️⃣1️⃣ 테스트
- 1️⃣2️⃣ 서브클래스 삭제(8.9)


### 예시: 서브클래스가 하나일 때

```js
class Booking {
    constructor(show, date) {
        this._show = show
        this._date = date
    }
}

class PermiumBooking extends Booking {
    constructor(show, date, extras) {
        super(show, date)
        this._extras = extras
    }
}
```

- 공연 예약 클래스와, 이를 상속받은 프리미엄 예약용 클래스

```js
// Booking
get hasTalkback() {
    return this._show.hasOwnProperty('talkback') && !this.isPeakDay
}

get basePrice() {
    let result = this._show.price
    if (this.isPeakDay) result += Math.round(result * 0.15)
    return result
}

// PremiumBooking
get hasTalkback() {
    return this._show.hasOwnProperty('talkback')
}

get basePrice() {
    return Math.round(super.basePrice + this._extras.premiumFee)
}
```

- 프리미엄 예약은 슈퍼클래스를 상속해 많은걸 변경
    - 공연 후 관객과의 대화 시간이나, 요금을 결정하는 부분이 일반 예약과 프리미엄 예약이 다름
- 위의 예시는 상속이 잘 들어맞음
- 위의 예시에서 서브클래스에서 위임으로 바꾸려 하는 이유
    - 상속은 한 번만 사용할 수 있음
    - 상속을 사용해야할 다른 이유가 생긴다면, 프리미엄 예약 서브클래스보다 가치가 크다고 생각된다면 프리미엄 예약을 다른 방식으로 표현해야됨
    - 기본 예약에서 프리미엄 예약으로 전환할 수 있게 하면 유용

```js
// 클라이언트(일반 예약)
aBooking = new Booking(show, date)

// 클라이언트(프리미엄 예약)
aBooking = new PremiumBooking(show, date, extras)
```

- 두 예약 클래스 생성자를 호출하는 클라이언트가 있다고 가정

```js
// 최상위
function createBooking(show, date) {
    return new Booking(show, date)
}
function createPremiumBooking(show, date, extras) {
    return new PremiumBooking(show, date, extras)
}

// 클라이언트(일반 예약)
aBooking = createBooking(show, date)

// 클라이언트(프리미엄 예약)
aBooking = createPremiumBooking(show, date, extras)
```

- 1. 생성자를 먼저 팩터리 함수로 변경(11.8), 생성자 호출 부분을 캡슐화

```js
// PremiumBookingDelegate class
constructor (hostBooking, extras) {
    this._host = hostBooking
    this._extras = extras
}
```

- 위임 클래스 생성
    - 위임 클래스의 생성자는 서브클래스가 사용하던 매개변수와 예약 객체로의 역참조 변수 생성
    - 역참조가 필요한 이유는, 서브 클래스 메서드 중 슈퍼클래스에 저장된 데이터를 사용하는 경우가 있기 때문
    - 상속에서는 쉽게 사용할 수 있지만, 위임에서는 역참조가 있어야 함

```js
// 최상위
function createBooking(show, date) {
    return new Booking(show, date)
}
function createPremiumBooking(show, date, extras) {
    const result = new PremiumBooking(show, date, extras)
    result._bePremium(extras)
    return result
}

// Booking class
_bePremium(extras) {
    this._premiumDelegate = new PremiumBookingDelegate(this, extras)
}
```

- 3, 4. 새로운 위임을 예약 객체와 연결할 차례, 프리미엄 예약을 생성하는 팩터리 함수를 수정하면 됨

```js
// Booking
get hasTalkback() {
    return (this._premiumDelegate)
        ? this._premiumDelegate.hasTalkback
        : this._show.hasOwnProperty('talkback') && !this.isPeakDay
}

get basePrice() {
    let result = this._show.price
    if (this.isPeakDay) result += Math.round(result * 0.15)
    return (this._premiumDelegate)
        ? this._premiumDelegate.extendBasePrice(result)
        : result
}
```

- 5. 구조가 갖춰졌으니, 기능을 옮길 차례
- 6. 함수 옮기기(8.1)을 적용, 서브클래스의 메서드를 위임으로 옮김
- 7. 모든 기능이 잘 동작하는지 확인한 후 서브클래스의 메서드 삭제
- 8. 테스트

```js
// PremiumBooking class
get hasDinner() {
    return this._extra.hasOwnProperty("dinner") && !this._host.isPeakDay
}

// PremiumBookingDelegate class
get hasDinner() {
    return this._extra.hasOwnProperty("dinner") && !this._host.isPeakDay
}

// Booking class
get hasDinner() {
    return (this._premiumDelegate)
        ? this._premiumDelegate.hasDinner
        : undefined
}
```

- 9. 서브클래스에만 존재하는 메서드도 있을 수 있음, 이를 위임으로 이동
    - 메서드를 위임으로 이동,
    - Booking 로직에 추가

```js
// 최상위
function createPremiumBooking(show, date, extras) {
    const result = new Booking(show, date, extras)
    result._bePremium(extras)
    return result
}
```

- 10. 서브클래스의 동작을 모두 옮겼다면 팩터리 메서드가 슈퍼클래스를 반환하도록 수정
- 11. 모든 기능이 잘 동작하는지 테스트
- 12. 서브클래스 삭제

- 위의 리팩터링은 코드를 개선한다고 느껴지지 않음
    - 상속이 오히려 더 잘 다루고 있지만, 이 리팩터링은 가치가 있을 수 있음
- 동적으로 프리미엄 예약으로 바꿀 수 있다는 장점이 생기고, 상속은 다른 목적으로 사용 가능


## 12.11 슈퍼클래스를 위임으로 바꾸기


```js
// before
class List {...}
class Stack extends List {...}

// after
class Stack{
    constructor() {
        this._storage = new List()
    }
}
class List {...}
```


### 배경

- 상속을 잘못 적용한 예로 자바의 스택 클래스가 유명함
    - 자바의 스택은 리스트를 상속하고 있는데, 데이터를 저장하고 조직하는 리스트의 기능을 재활용하겠다는 생각이 초래한 결과
    - 재활용의 관점에서는 좋았지만, 리스트의 연산 중 스택에 적용되는게 많지 않음에도 모두 노출되는 문제
- 제대로 된 상속이라면 슈퍼클래스가 슈퍼클래스의 모든 기능을 사용함은 물론, 서브클래스의 인스턴스도 슈퍼클래스의 인스턴스로 취급할 수 있어야 함
    - 즉, 슈퍼클래스가 사용되는 모든 곳에 서브클래스의 인스턴스를 대신 사용해도 이상없이 동작해야 함
- 서브클래스 방식 모델링이 합리적일 때라도, 슈퍼클래스를 위임으로 바꾸기도 함


### 절차

- 1. 슈퍼클래스 객체를 참조하는 필드를 서브클래스에 만든다. (이 필드를 위임 참조라 부르자) 위임 참조를 새로운 슈퍼클래스 인스턴스로 초기화
- 2. 슈퍼클래스의 동작 각각에 대응하는 전달 함수를 서브클래스에 만듬, 서로 관련되 함수끼리 그룹으로 묶어 진행, 하나씩 만들때마다 테스트
- 3. 슈퍼클래스의 동작 모두가 전달 함수로 오버라이드되었다면 상속 관계를 끊음


### 예시

```js
// CatalogItem class
construtor(id, title, tags) {
    this._id = id
    this._title = title
    this._tags = tags
}
get id() {return this._id}
get title() {return this._title}
hasTag(arg) {return this._tags.includes(arg)}
```

- 고대 스크롤(두루마리 문서)를 보관하고 있는 오래된 도서관 컨설팅
    - 스크롤들의 상세정보는 카탈로그로 분류, id, 제목, 태그들이 붙어 있음

```js
// Scroll class extends CatalogItem
constructor(id, title, tags, dateLastCleaned) {
    super(id, title, tags)
    this._lastCleaned = dateLastCleaned
}
needsCleaning(targetDate) {
    const threshold = this.hasTag("revered") ? 700 : 1500
    return this.daysSinceLastCleaning(targetDate) > threshold
}
daysSinceLastCleaning(targetDate) {
    return this._lastCleaned.until(targetDate, chronoUnit.DAYS)
}
```

- 스크롤은 정기 세척이 필요함, 카탈로그 아이템을 확장하여 세척관련 데이터 추가
- 위는 모델링 실수의 흔한 예시
    - 물리적인 스크롤과 논리적인 카탈로그 아이템에는 차이가 있음
    - 이런 경우, 데이터가 변하지 않는다면 문제가 없지만, 사본 중 하나를 변경해야 한다면 다른 항목의 변겅을 주의해서 확인해야 함
    - 이 문제가 아니더라도, 이 관계를 끊는 편이 더 좋음, 위의 코드는 혼란을 줄 수 있음

```js
// Scroll class
constructor(id, title, tags, dateLastCleaned) {
    super(id, title, tags)
    this._catalogItem = new catalogItem(id, title, tags)
    this._lastCleaned = dateLastCleaned
}
```

- 1. Sroll에 카탈로그 아이템을 참조하는 속성을 만들고, 슈퍼클래스의 인스턴스를 대입해 생성

```js
// Scroll class
get id() {return this._catalogItem.id}
get title() {return this._catalogItem.title}
hasTag(arg) {return this._catalogItem.hasTag(arg)}
```

- 2. 이 서브클래스에서 사용하는 슈퍼클래스의 동작 각각에 대응하는 전달 메서드 생성

```js
class Scroll {
    constructor(id, title, tags, dateLastCleaned) {
        this._catalogItem = new catalogItem(id, title, tags)
        this._lastCleaned = dateLastCleaned
    }
}
```

- 3. 카탈로그와의 상속 관계를 끊음