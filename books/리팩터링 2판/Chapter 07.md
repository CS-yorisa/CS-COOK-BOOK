[TOC]

# Chapter 07. 캡슐화

<br>

## 7.1 레코드 캡슐화하기

```js
organization = {name: "애크미 구스베리", country: "GB"};
```

```js
class Organization {
    constructor(data) {
        this._name = data.name;
        this._country = data.country;
    }
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    get country() {return this._country;}
    set country(arg) {this._country = arg;}
}
```

### 배경

- 단순한 데이터 레코드는 <u>계산해서 얻을 수 있는 값</u>과 <u>그렇지 않은 값</u>을 명확히 구분해야 한다는 단점 존재
- 캡슐화를 하면 **필드 이름**을 바꿔도 기존 이름과 새 이름 모두를 각각의 메서드로 제공하여 점진적 수정 가능
- <u>필드를 외부로부터 숨긴 레코드</u>는 해시맵으로 표현되는 경우, 필드가 명확하지 않은게 단점이 될 수 있음
- 중첩된 리스트나 해시맵을 받아서 <u>JSON 이나 XML 같은 포맷으로 직렬화한 구조</u>를 캡슐화하는 경우 포맷 변경과 데이터 추적에 용이

### 절차

1. 레코드를 담은 변수를 캡슐화(8.8)
   → 레코드를 캡슐화하는 함수의 이름은 검색하기 쉽게 지어줌
2. 레코드를 감싼 단순한 클래스로 해당 변수의 내용을 교체. 이 클래스에 원본 레코드를 반환하는 접근자도 정의하고, 변수를 캡슐화하는 함수들이 이 접근자를 사용하도록 수정
3. 테스트
4. 원본 레코드 대신 새로 정의한 클래스 타입의 객체를 반환하는 함수들을 새로 생성
5. 레코드를 반환하는 예전 함수를 사용하는 코드를 4. 에서 만든 새 함수를 사용하도록 변경. 필드에 접근할 때는 객체의 접근자를 사용. 적절한 접근자가 없다면 추가. 한 부분을 바꿀 때마다 테스트
   → 중첩된 구조처럼 복잡한 레코드라면, 먼저 데이터를 갱신하는 클라이언트들에 주의해서 살펴보고, 클라이언트가 데이터를 읽기만 한다면 데이터의 복제본이나 읽기전용 프락시를 반환할지 고려
6. 클래스에서 원본 데이터를 반환하는 접근자와 (1. 에서 검색하기 쉬운 이름을 붙여둔) 원본 레코드를 반환하는 함수들을 제거
7. 테스트
8. 레코드의 필드도 데이터 구조인 중첩 구조라면 레코드 캡슐화하기와 컬렉션 캡슐화하기(7.2)를 재귀적으로 적용

### 예시: 간단한 레코드 캡슐화하기

```js
const organization = {name: "애크미 구스베리", country: "GB"};

result += `<h1>${organization.name}</h1>`; // 읽기 예
organization.name = newName; // 쓰기 예
```

- 위와 같이 사용되는 상수에 변수 캡슐화하기(6.6) 적용

```js
const organization = {name: "애크미 구스베리", country: "GB"};
// 변수 캡슐화(이름은 임시로 작성)
function getRawDataOfOrganization() {return organization;}

result += `<h1>${getRawDataOfOrganization().name}</h1>`; // 읽기 예
getRawDataOfOrganization().name = newName; // 쓰기 예
```

- 레코드를 클래스로 바꾸고, 새 클래스의 인스턴스를 반환하는 함수를 생성

```js
class Organization {
    constructor(data) {
        this._data = data;
    }
}

const organization = new Organization({name: "애크미 구스베리", country: "GB"}); // 클래스로 변경
function getRawDataOfOrganization() {return organization._data;}
function getOrganization() {return organization;} // 인스턴스를 반환하는 함수

result += `<h1>${getRawDataOfOrganization().name}</h1>`; // 읽기 예
getRawDataOfOrganization().name = newName; // 쓰기 예
```

- 레코드를 읽는 코드는 모두 게터를 사용하도록 수정
- 레코드를 갱신하던 코드는 모두 세터를 사용하도록 수정

```js
class Organization {
    constructor(data) {
        this._data = data;
    }
    get name() {return this._data.name;}
    set name(aString) {this._data.name = aString}
}

const organization = new Organization({name: "애크미 구스베리", country: "GB"});
// function getRawDataOfOrganization() {return organization._data;} // 임시 함수는 제거
function getOrganization() {return organization;}

result += `<h1>${getOrganization().name}</h1>`; // 읽기
getOrganization().name = newName; // 쓰기
```

- `_data` 의 필드들을 객체 안에 바로 펼쳐두기
  - <u>입력 데이터 레코드와의 연결</u>을 끊어준다는 이점이 생김 (이 레코드를 **참조**하여 캡슐화를 깰 우려가 있는 경우 좋음)
  - 데이터를 개별 필드로 펼치지 않았다면 `_data` 를 대입할 때 **복제**하는 식으로 처리했을 것

```js
class Organization {
    constructor(data) {
        // 필드 펼치기
        this._name = data.name;
        this._country = data.country;
    }
    get name() {return this._name;}
    set name(aString) {this._name = aString;}
    get country() {return this._country;}
    set country(aCountryCode) {this._country = aCountryCode;}
}

const organization = new Organization({name: "애크미 구스베리", country: "GB"});
function getOrganization() {return organization;}

result += `<h1>${getOrganization().name}</h1>`; // 읽기
getOrganization().name = newName; // 쓰기
```

### 예시: 중첩된 레코드 캡슐화하기

> JSON 문서처럼 여러 겹 중첩된 레코드 캡슐화

- 고객 정보를 저장한 해시맵으로, 고객 ID를 키로 사용

```json
"1920": {
    name: "마틴 파울터",
    id: "1920",
    usages: {
        "2016": {
            "1": 50,
            "2": 55,
            // 나머지 달(month)은 생략
        },
        "2015": {
            "1": 70,
            "2": 63,
            // 나머지 달은 생략
        }
    }
},
"38673": {
    name: "닐 포드",
    id: "38673",
    // 다른 고객 정보도 같은 형식으로 저장됨
}
```

```js
// 쓰기 예
customerData[customerID].usages[year][month] = amount;
// 읽기 예
function compareUsage(customerID, laterYear, month) {
    const later = customerData[customerID].usages[laterYear][month];
    const earlier = customerData[customerID].usages[laterYear - 1][month];
    return {laterAmount: later, change: later - earlier};
}
```

- 변수 캡슐화(6.6)부터 진행

```js
// 변수 캡슐화
function getRawDataOfCustomers() {return customerData;}
function setRawDataOfCustomers(arg) {customerData = arg;}

// 쓰기 예
getRawDataOfCustomers()[customerID].usages[year][month] = amount;
// 읽기 예
function compareUsage(customerID, laterYear, month) {
    const later = getRawDataOfCustomers()[customerID].usages[laterYear][month];
    const earlier = getRawDataOfCustomers()[customerID].usages[laterYear - 1][month];
    return {laterAmount: later, change: later - earlier};
}
```

- 전체 데이터 구조를 표현하는 클래스를 정의하고, 이를 반환하는 함수 생성

```js
class CustomerData {
    constructor(data) {
        this._data = data;
    }
}

function getCustomerData() {return customerData;} // 인스턴스 반환
function getRawDataOfCustomers() {return customerData._data;}
function setRawDataOfCustomers(arg) {customerData = new CustomerData(arg);}

// 쓰기 예
getRawDataOfCustomers()[customerID].usages[year][month] = amount;
// 읽기 예
function compareUsage(customerID, laterYear, month) {
    const later = getRawDataOfCustomers()[customerID].usages[laterYear][month];
    const earlier = getRawDataOfCustomers()[customerID].usages[laterYear - 1][month];
    return {laterAmount: later, change: later - earlier};
}
```

- 현재 고객 객체에서는 데이터 구조 안으로 깊이 들어가서 값을 바꾸고 있는데, 이를 세터로 뽑아내기
  - 해당 함수를 고객 데이터 클래스로 옮기기(8.1)

```js
class CustomerData {
    constructor(data) {
        this._data = data;
    }
    setUsage(customerID, year, month, amount) { // 이동된 세터
        this._data[customerID].usages[year][month] = amount;
    }
}

function getCustomerData() {return customerData;}
function getRawDataOfCustomers() {return customerData._data;}
function setRawDataOfCustomers(arg) {customerData = new CustomerData(arg);}

/** 뽑아낸 세터 → CustomerData 로 이동
function setUsage(customerID, year, month, amount) {
    getRawDataOfCustomers()[customerID].usages[year][month] = amount;
} **/
// 쓰기 예
getCustomerData().setUsage(customerID, year, month, amount);
// 읽기 예
function compareUsage(customerID, laterYear, month) {
    const later = getRawDataOfCustomers()[customerID].usages[laterYear][month];
    const earlier = getRawDataOfCustomers()[customerID].usages[laterYear - 1][month];
    return {laterAmount: later, change: later - earlier};
}
```

- 읽는 코드를 모두 독립 함수로 추출하여 고객 데이터 클래스로 옮기기

```js
class CustomerData {
    constructor(data) {
        this._data = data;
    }
    setUsage(customerID, year, month, amount) {
        this._data[customerID].usages[year][month] = amount;
    }
    usage(customerID, year, month) { // 읽는 코드 추출
        return this._data[customerID].usages[year][month];
    }
}

function getCustomerData() {return customerData;}
function getRawDataOfCustomers() {return customerData._data;}
function setRawDataOfCustomers(arg) {customerData = new CustomerData(arg);}

// 쓰기 예
getCustomerData().setUsage(customerID, year, month, amount);
// 읽기 예
function compareUsage(customerID, laterYear, month) {
    const later = getCustomerData().usage(customerID, laterYear, month);
    const earlier = getCustomerData().usage(customerID, laterYear - 1, month);
    return {laterAmount: later, change: later - earlier};
}
```

- `customerData` 의 모든 쓰임을 명시적인 API 로 제공할 수 있음

<br>

## 7.2 컬렉션 캡슐화하기

```js
class Person {
    get courses() {return this._courses;}
    set courses(aList) {this._courses = aList;}
}
```

```js
class Person {
    get courses() {return this._courses.slice();}
    addCourse(aCourse) {...}
    removeCourse(aCourse) {...}
}
```

### 배경

- 가변 데이터를 캡슐화하면 데이터 구조가 언제 어떻게 수정되는지 파악하기 쉽고, 변경하기도 쉬워짐
- <u>컬렉션을 소유한 클래스를 통해서만</u> 원소를 변경하도록 하면 프로그램을 개선하면서 컬렉션 변경 방식도 원하는 대로 수정 가능
  - 자바에서는 컬렉션의 **읽기전용 프락시**를 반환하게 만들기 쉬움 (읽는 연산은 그대로 전달, 쓰기는 모두 막기)
  - 컬렉션 게터를 제공하되 **내부 컬렉션의 복제본**을 반환하는 방식이 흔히 사용됨

### 절차

1. 아직 컬렉션을 캡슐화하지 않았다면 변수 캡슐화하기(6.6)부터 진행
2. 컬렉션에 원소를 추가/제거하는 함수를 추가
   → 컬렉션 자체를 통째로 바꾸는 세터는 제거(11.7). 세터를 제거할 수 없다면 인수로 받은 컬렉션을 복제해 저장하도록 만들기
3. 정적 검사를 수행
4. 컬렉션을 참조하는 부분을 모두 찾기. 컬렉션의 변경자를 호출하는 코드가 모두 앞에서 추가한 추가/제거 함수를 호출하도록 수정. 하나씩 수정할 때마다 테스트
5. 컬렉션 게터를 수정해서 원본 내용을 수정할 수 없는 읽기전용 프락시나 복제본을 반환
6. 테스트

### 예시

> 수업(course) 목록을 피드로 지니고 있는 Person 클래스

```js
class Person {
    constructor(name) {
        this._name = name;
        this._courses = [];
    }
    get name() {return this._name;}
    get courses() {return this._courses;}
    set courses(aList) {this._courses = aList;}
}

class Course {
    constructor(name, isAdvanced) {
        this._name = name;
        this._isAdvanced = isAdvanced;
    }
    get name() {return this._name;}
    get isAdvanced() {return this._isAdvanced;}
}

numAdvancedCourses = aPerson.courses.filter(c => c.isAdvanced).length;
```

- 세터를 이용해 수업 컬렉션을 통째로 설정한 클라이언트는 누구든 마음대로 수정할 수 있음

  ```js
  // 수업 컬렉션을 임의로 수정하는 예시
  const basicCourseNames = readBasicCourseNames(filename);
  aPerson.courses = basicCourseNames.map(name => new Course(name, false));
  ```

  - 다음처럼 수업 목록을 직접 수정할 수 있음 (캡슐화가 깨지게 됨)

  ```js
  for (const name of readBasicCourseNames(filename)) {
      aPerson.courses.push(new Course(name, false));
  }

- 제대로 캡슐화하기 위해 수업을 하나씩 추가하고 제거하는 메서드를 `Person` 에 추가
  - 컬렉션의 변경자를 **직접 호출**하던 코드를 찾아서 방금 추가한 메서드를 사용하도록 변경
  - 사용할 일이 없어진 `set courses(aList)` 세터 제거(11.7)
    - 세터를 제공해야 할 특별한 이유가 있다면 인수로 받은 컬렉션의 복제본을 필드에 저장
  - `get courses()` 에서 복제본을 제공하여 메서드로만 변경이 가능하도록 수정

```js
class Person {
    constructor(name) {
        this._name = name;
        this._courses = [];
    }
    get name() {return this._name;}
    get courses() {return this._courses.slice();} // 복제본을 제공
    // set courses(aList) {this._courses = aList;} // 기존 세터 제거
    set courses(aList) {this._courses = aList.slice();} // 복제본을 저장하는 세터 제공 가능
    addCourse(aCourse) { // 수업 추가
        this._courses.push(aCourse);
    }
    removeCourse(aCourse, fnIfAbsent = () => {throw new RangeError();}) { // 수업 제거
        const index = this._courses.indexOf(aCourse);
        if (index == -1) fnIfAbsent(); // 컬렉션에 없는 원소를 제거하려 할 때 에러 던지기
        else this._courses.splice(index, 1);
    }
}

class Course {
    constructor(name, isAdvanced) {
        this._name = name;
        this._isAdvanced = isAdvanced;
    }
    get name() {return this._name;}
    get isAdvanced() {return this._isAdvanced;}
}

numAdvancedCourses = aPerson.courses.filter(c => c.isAdvanced).length;
for (const name of readBasicCourseNames(filename)) {
    aPerson.addCourse(new Course(name, false)); // 추가한 메서드로 변경
}
```

<br>

## 7.3 기본형을 객체로 바꾸기

```js
orders.filter(o => "high" === o.priority || "rush" === o.priority);
```

```js
orders.filter(o => o.priority.higherThan(new Priority("normal")));
```

### 배경

- 단순한 정보를 숫자나 문자열 같은 <u>간단한 데이터 항목</u>으로 표현하는 경우가 많음
  - 개발이 진행되면서 로직이 복잡해지고, 포매팅 등으로 금세 중복 코드가 늘어나게 됨
- 단순한 출력 이상의 기능이 필요해지는 순간 그 데이터를 표현하는 **전용 클래스**를 정의하는 것이 좋음

### 절차

1. 아직 변수를 캡슐화하지 않았다면 캡슐화(6.6) 진행
2. 단순한 값 클래스(value class) 만들기. 생성자는 기존 값을 인수로 받아서 저장하고, 이 값을 반환하는 게터를 추가
3. 정적 검사를 수행
4. 값 클래스의 인스턴스를 새로 만들어 필드에 저장하도록 세터를 수정. 이미 있다면 필드의 타입을 적절히 변경
5. 새로 만든 클래스의 게터를 호출한 결과를 반환하도록 게터를 수정
6. 테스트
7. 함수 이름을 바꾸면(6.5) 원본 접근자의 동작을 더 잘 드러낼 수 있는지 검토
   → 참조를 값으로 바꾸거나(9.4) 값을 참조로 바꾸면(9.5) 새로 만든 객체의 역할(값 또는 참조 객체)이 더 잘 드러나는지 검토

### 예시

> 레코드 구조에서 데이터를 읽어 들이는 단순한 **주문(order)** 클래스
>
> 이 클래스의 **우선순위(priority)** 속성은 값을 간단히 문자열로 표현함

```js
class Order {
    constructor(data) {
        this.priority = data.priority;
        // 나머지 초기화 코드 생략
    }
}

highPriorityCount = orders.filter(o => "high" === o.priority || "rush" === o.priority).length;
```

- 데이터 값을 다루기 전에 변수 캡슐화(6.6) 진행
  - 우선순위 속성을 초기화하는 생성자에서 방금 정의한 세터를 사용 (필드 자가캡슐화)
- 우선순위 속성을 표현하는 값 클래스 `Priority` 를 생성

```js
class Order {
    constructor(data) {
        this.priority = data.priority; // 캡슐화를 하면서 정의한 세터(priority(aString))로 초기화
        // 나머지 초기화 코드 생략
    }
    // 변수 캡슐화
    get priority() {return this._priority;}
    set priority(aString) {this._priority = aString;}
}

class Priority {
    constructor(value) {this._value = value;} // 생성자
    toString() {return this._value;} // 변환 함수 (속성 자체를 받는 것이 아니기 때문)
}

highPriorityCount = orders.filter(o => "high" === o.priority || "rush" === o.priority).length;
```

- `Priority` 클래스를 사용하도록 `Order` 클래스의 접근자들을 수정
  - `get priority()` 의 함수 이름(선언) 바꾸기(6.5)

```js
class Order {
    constructor(data) {
        this.priority = data.priority;
        // 나머지 초기화 코드 생략
    }
    get priorityString() {return this._priority.toString();} // 접근자, 함수 이름 변경
    set priority(aString) {this._priority = new Priority(aString);} // 접근자 변경
}

class Priority {
    constructor(value) {this._value = value;}
    toString() {return this._value;}
}

// 함수 이름 변경 반영
highPriorityCount = orders.filter(o => "high" === o.priorityString || "rush" === o.priorityString).length;
```

> 지금처럼 매개변수 이름만으로 <u>세터가 받는 데이터의 유형</u>을 쉽게 알 수 있다면 이름을 그대로 둬도 좋음

#### 더 가다듬기

> `Priority` 클래스는 다른 곳에서도 유용할 수 있음

- `Order` 클래스에 `Priority` 객체를 제공하는 게터 작성
- `Order` 의 세터가 `Priority` 인스턴스를 받도록 해주기
  - `Priority` 클래스를 **새로운 동작**을 담는 장소로 활용하기 위해 (새로 구현하거나 다른 곳에서 옮겨온 것)

```js
class Order {
    constructor(data) {
        this.priority = data.priority;
        // 나머지 초기화 코드 생략
    }
    get priority() {return this._priority;} // Priority 객체를 제공하는 게터 작성
    get priorityString() {return this._priority.toString();}
    set priority(aString) {this._priority = new Priority(aString);}
}

class Priority {
    constructor(value) {
        // 이미 우선순위의 인스턴스인 경우 인스턴스를 반환
        if (value instanceof Priority) return value;
        this._value = value;
    }
    toString() {return this._value;}
}
```

- 우선순위 값을 검증하고 비교하는 로직을 추가

```js
class Order {
    constructor(data) {
        this.priority = data.priority;
        // 나머지 초기화 코드 생략
    }
    get priority() {return this._priority;}
    get priorityString() {return this._priority.toString();}
    set priority(aString) {this._priority = new Priority(aString);}
}

class Priority {
    constructor(value) {
        if (value instanceof Priority) return value;
        // 우선순위 값 검증
        if (Priority.legalValues().includes(value)) {
            this._value = value;
        } else {
            throw new Error(`<${value}>는 유효하지 않은 우선순위입니다.`)
        }
    }
    toString() {return this._value;}
    get _index() {return Priority.legalValues().findIndex(s => s === this._value);}
    static legalValues() {return ['low', 'normal', 'high', 'rush'];}
    // 우선순위 값 비교
    equals(other) {return this._index === other._index;}
    higherThan(other) {return this._index > other._index;}
    lowerThan(other) {return this._index < other._index;}
}

highPriorityCount = orders.filter(o => o.priority.higherThan(new Priority("normal"))).length;
```

<br>

## 7.4 임시 변수를 질의 함수로 바꾸기

```js
const basePrice = this._quantity * this._itemPrice;
if (basePrice > 1000) {
    return basePrice * 0.95;
} else {
    return basePrice * 0.98;
}
```

```js
get basePrice() {this._quantity * this._itemPrice;}
(...)
if (this.basePrice > 1000) {
    return this.basePrice * 0.95;
} else {
    return this.basePrice * 0.98;
}
```

### 배경

- 임시 변수를 사용하면 값을 계산하는 코드의 반복을 줄이고, 변수 이름으로 값의 의미를 설명할 수 있음
  - 더 나아가 아예 임시 변수를 **함수**로 만들어 사용하는 편이 나을 때가 많음
- 함수로 만들어두면 비슷한 계산을 수행하는 다른 함수에서도 사용할 수 있음
- 클래스는 추출할 메서드들에 **공유 컨텍스트**를 제공하기 때문에, 클래스 안에서 적용할 때 효과가 가장 큼
- '옛날 주소'처럼 <u>스냅숏 용도로 쓰이는 변수</u>에는 이 리팩터링을 적용하지 않는 것이 좋음
  - 변수가 다음번에 사용될 때 수행해도 똑같은 결과를 내야 하기 때문에

### 절차

1. 변수가 사용되기 전에 값이 확실히 결정되는지, 변수를 사용할 때마다 계산 로직이 매번 다른 결과를 내지 않는지 확인
2. 읽기전용으로 만들 수 있는 변수는 읽기전용으로 만들기
3. 테스트
4. 변수 대입문을 함수로 추출
   → 변수와 함수가 같은 이름을 가질 수 없다면 함수 이름을 임시로 짓기. 또한, 추출한 함수가 부수효과를 일으키지는 않는지 확인. 부수효과가 있다면 질의 함수의 변경 함수 분리하기(11.1)로 대처
5. 테스트
6. 변수 인라인하기(6.4)로 임시 변수를 제거

### 예시

> 간단한 주문(order) 클래스

```js
class Order {
    constructor(quantity, item) {
        this._quantity = quantity;
        this._item = item;
    }
    get price() {
        var basePrice = this._quantity * this._item.price;
        var discountFactor = 0.98;
        
        if (basePrice > 1000) {discountFactor -= 0.03;}
        return basePrice * discountFactor;
    }
}
```

- 임시 변수인 `basePrice` 와 `discountFactor` 를 메서드로 변경
  - `basePrice` 에 `const` 를 붙여 <u>읽기전용</u>으로 변경하고 테스트하면 못 보고 지나친 **재대입 코드**를 찾을 수 있음
  - 대입문의 우변을 게터로 추출

```js
class Order {
    constructor(quantity, item) {
        this._quantity = quantity;
        this._item = item;
    }
    get price() {
        const basePrice = this.basePrice; // 읽기전용으로 변경, 게터로 추출
        var discountFactor = 0.98;
        if (basePrice > 1000) {discountFactor -= 0.03;}
        return basePrice * discountFactor;
    }
    get basePrice() { // 게터 작성
        return this._quantity * this._item.price;
    }
}
```

- 테스트 후 변수를 인라인(6.4)
  - `discountFactor` 도 함수 추출하기(6.1), 읽기전용 변경 적용

```js
class Order {
    constructor(quantity, item) {
        this._quantity = quantity;
        this._item = item;
    }
    get price() {
        const discountFactor = this.discountFactor; // 읽기전용으로 변경, 게터로 추출
        return this.basePrice * discountFactor;
    }
    get basePrice() {
        return this._quantity * this._item.price;
    }
    get discountFactor() { // 게터 작성
        var discountFactor = 0.98;
        if (this.basePrice > 1000) {discountFactor -= 0.03;}
        return discountFactor;
    }
}
```

- 마지막으로 `discountFactor` 변수를 인라인

```js
class Order {
    constructor(quantity, item) {
        this._quantity = quantity;
        this._item = item;
    }
    get price() {
        return this.basePrice * this.discountFactor; // 변수 인라인
    }
    get basePrice() {
        return this._quantity * this._item.price;
    }
    get discountFactor() {
        var discountFactor = 0.98;
        if (this.basePrice > 1000) {discountFactor -= 0.03;}
        return discountFactor;
    }
}
```

<br>

## 7.5 클래스 추출하기

```js
class Person {
    get officeAreaCode() {return this._officeAreaCode;}
    get officeNumber() {return this._officeNumber;}
}
```

```js
class Person {
    get officeAreaCode() {return this._telephoneNumber.areaCode;}
    get officeNumber() {return this._telephoneNumber.number;}
}
class TelephoneNumber {
    get areaCode() {return this._areaCode;}
    get number() {return this._number;}
}
```

### 배경

- 메서드와 데이터가 너무 많은 클래스는 이해하기가 쉽지 않으니 적절히 분리하는 것이 좋음
  - 특히 일부 데이터와 메서드를 따로 묶을 수 있다면 어서 분리하라는 신호
  - 함께 변경되는 일이 많거나 서로 의존하는 데이터들도 분리
- 일부의 기능만을 위해 서브클래스를 만들거나, 확장해야 할 기능이 무엇이냐에 따라 서브클래스를 만드는 방식도 달라진다면 분리

### 절차

1. 클래스의 역할을 분리할 방법 정하기
2. 분리될 역할을 담당할 클래스 새로 만들기
   → 원래 클래스에 남은 역할과 클래스 이름이 어울리지 않는다면 적절히 바꾸기
3. 원래 클래스의 생성자에서 새로운 클래스의 인스턴스를 생성하여 필드에 저장
4. 분리될 역할에 필요한 필드들을 새 클래스로 옮기기(필드 옮기기(8.2)). 하나씩 옮길 때마다 테스트
5. 메서드들도 새 클래스로 옮기기(함수 옮기기(8.1)). 이때 저수준 메서드, 즉 다른 메서드를 호출하기보다는 호출을 당하는 일이 많은 메서드부터 옮기기. 하나씩 옮길 때마다 테스트
6. 양쪽 클래스의 인터페이스를 살펴보면서 불필요한 메서드를 제거하고, 이름도 새로운 환경에 맞게 변경
7. 새 클래스를 외부로 노출될지 정하기. 노출하려거든 새 클래스에 참조를 값으로 바꾸기(9.4)를 적용할지 고민

### 예시

> 단순한 `Person` 클래스

```js
class Person {
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    get telephoneNumber() {return `(${this.officeAreaCode}) ${this.officeNumber}`;}
    get officeAreaCode() {return this.officeAreaCode;}
    set officeAreaCode(arg) {this._officeAreaCode = arg;}
    get officeNumber() {return this._officeNumber;}
    set officeNumber(arg) {this._officeNumber = arg;}
}
```

- 전화번호 관련 동작을 별도 클래스로 뽑기
  - 빈 전화번호를 표현하는 `TelephoneNumber` 클래스 정의
  - `Person` 클래스의 인스턴스를 생성할 때 전화번호 인스턴스도 함께 생성해 저장

```js
class Person {
    constructor() {
        this._telephoneNumber = new TelephoneNumber(); // 전화번호 인스턴스 생성 및 저장
    }
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    get telephoneNumber() {return `(${this.officeAreaCode}) ${this.officeNumber}`;}
    get officeAreaCode() {return this.officeAreaCode;}
    set officeAreaCode(arg) {this._officeAreaCode = arg;}
    get officeNumber() {return this._officeNumber;}
    set officeNumber(arg) {this._officeNumber = arg;}
}
class TelephoneNumber { // 전화번호를 표현하는 클래스 정의
    get officeAreaCode() {return this._officeAreaCode;}
    set officeAreaCode(arg) {this._officeAreaCode = arg;}
}
```

- 필드들을 하나씩 새 클래스로 옮기고 테스트
- `telephoneNumber()` 메서드 옮기기

```js
class Person {
    constructor() {
        this._telephoneNumber = new TelephoneNumber();
    }
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    get telephoneNumber() {return this._telephoneNumber.telephoneNumber;} // 메서드 옮기기
    // 필드 옮기기
    get officeAreaCode() {return this._telephoneNumber.officeAreaCode;}
    set officeAreaCode(arg) {this._telephoneNumber.officeAreaCode = arg;}
    get officeNumber() {return this._telephoneNumber.officeNumber;}
    set officeNumber(arg) {this._telephoneNumber.officeNumber = arg;}
}
class TelephoneNumber {
    get telephoneNumber() {return `(${this.officeAreaCode}) ${this.officeNumber}`;} // 메서드 옮기기
    get officeAreaCode() {return this._officeAreaCode;}
    set officeAreaCode(arg) {this._officeAreaCode = arg;}
    get officeNumber() {return this._officeNumber;}
    set officeNumber(arg) {this._officeNumber = arg;}
}
```

- 메서드들의 이름을 적절히 바꾸기(함수 선언 바꾸기(6.5))
- 전화번호 포맷팅 역할도 `TelephoneNumber` 클래스에 맡기기

```js
class Person {
    constructor() {
        this._telephoneNumber = new TelephoneNumber();
    }
    get name() {return this._name;}
    set name(arg) {this._name = arg;}
    get telephoneNumber() {return this._telephoneNumber.toString();} // 포맷팅 메서드 반영
    // 함수 선언 바꾸기
    get officeAreaCode() {return this._telephoneNumber.areaCode;}
    set officeAreaCode(arg) {this._telephoneNumber.areaCode = arg;}
    get officeNumber() {return this._telephoneNumber.number;}
    set officeNumber(arg) {this._telephoneNumber.number = arg;}
}
class TelephoneNumber {
    toString() {return `(${this.areaCode}) ${this.number}`;} // 포맷팅 메서드
    // 함수 선언 바꾸기
    get areaCode() {return this._areaCode;}
    set areaCode(arg) {this._areaCode = arg;}
    get number() {return this._number;}
    set number(arg) {this._number = arg;}
}
```

<br>

## 7.6 클래스 인라인하기

<br>

## 7.7 위임 숨기기

<br>

## 7.8 중개자 제거하기

<br>

## 7.9 알고리즘 교체하기

