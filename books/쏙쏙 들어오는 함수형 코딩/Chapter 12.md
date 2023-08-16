# 12. 함수형 반복

# 용어 정리

## ✅ 코드 스멜 : 함수 이름에 있는 암묵적 인자

- 함수 본문에서 사용하는 어떤 값이 함수 이름에 나타남

### 특징

- 거의 똑같이 구현된 함수가 있음
- 함수 이름이 구현에 있는 다른 부분을 가리킴

## ✅ 리팩터링 : 암묵적 인자를 드러내기

- 암묵적 인자가 일급 값이 되도록 함수에 인자를 추가
  - 잠재적 중복을 없애고 코드의 목적을 더 잘 표현할 수 있음

### 단계

1. 함수 이름에 있는 암묵적 인자 확인
2. 명시적 인자 추가
3. 함수 본문에 하드 코딩된 값을 새로운 인자로 변경
4. 함수를 호출하는 곳을 고침



## ✅ 리팩터링 : 함수 본문을 콜백으로 바꾸기

- 함수 본문에 어떤 부분을 콜백으로 바꾸면 일급 함수로 어떤 함수에 동작을 전달할 수 있음
  - 원래 있던 코드를 고차 함수로 만드는 강력한 방법

### 단계

1. 함수 본문에서 바꿀 부분의 앞부분과 뒷부분을 확인
2. 리팩터링 할 코드를 함수로 빼냄
3. 빼낸 함수의 인자로 넘길 부분을 또 다른 함수로 빼냄

# map()

- 데이터 요청: 쿠폰 이메일 처리

``` js
function emailsForCustomers(customers, goods, bests){
  var emails = [];
  for(var i = 0; i < customers.length; i++){ // for 반복문 개선 가능
    var customer = customers[i];
    var email = emailForCustomer(customer, goods, bests);
    emails.push(email);
  }
  return emails;
}
```

- forEach() 로 바꾸기

``` js
function emailsForCustomers(customers, goods, bests){
  var emails = [];
  forEach(customers, function(customer{
    var email = emailForCustomer(customer, goods, bests);
    emails.push(email);
  });
  reuturn emails;
}
```

- map() 사용 하기 > 함수 본문을 콜백으로 바꾸기

  - 고차 함수로 배열을 반복하는 forEach() 처럼 map() 도 고차함수로 배열을 반복

  - map()은 새로운 배열을 리턴

``` js
function emailsForCustomers(customers, goods, bests){
  return map(customers, function(customer){ // 본문은 콜백으로 전달
    return emailForCustomer(customer, goods, bests);
  })
}

function map(array, f){ // forEach()를 map()으로 빼냄
  var newArray = [];
  forEach(array, function(element){
    newArray.push(f(element));
  });
  return newArray;
}
```



## 함수형 도구 map()

``` js
function map(array, f){ // 배열과 함수를 인자로 받음
  var newArray = []; // 빈 배열을 만듦
  forEach(array, function(element){
    // 원래 배열 항목에 해당하는 새로운 항목 추가
    newArray.push(f(element)); // 원래 배열 항목으로 새로운 항목을 만들기 위해 f() 함수를 부름
  });
  return newArray; // 새로운 배열 리턴
}
```

- x(어떤 값의 집합) 값이 있는 배열을 y(또 다른 값의 집합) 값이 있는 배열로 변환
- x를 y로 바꾸는 함수는 x를 인자로 받아 y를 리턴 해야 함
- map() 에 넘기는 함수가 계산일 때 가장 사용하기 쉬움

``` js
function emailsForCustomers(customers, goods, bests){
  // customer가 넘어올 거라고 확신할 수 있는가?
  // -> 타입 검사를 하는 언어와 달리 자바스크립트는 코드를 믿고 원하는 배열이 들어 있을 거라고 생각해야 함
  return map(customers, function(customer){
    return emailForCustomer(customer, goods, bests);
  })
}
```

- 전달 하는 함수는 익명 함수(anonymous function)를 사용해 인라인(inline)으로 정의
- 문맥에서 한 번만 쓰이는 짧은 함수이므로 인라인으로 정의
- 배열에 들어있는 항목을 확인하지 않기 때문에, null 값이 들어갈 수 있음 > filter() 사용

> ### 함수를 전달하는 방법
>
> - 전역으로 정의하기
> - 지역적으로 정의하기
> - 인라인으로 정의하기



### 연습 문제

- 모든 고객에게 엽서를 보낼 때, map()을 이용해 각 고객의 성, 이름, 주소가 있는 배열을 만들기

``` js
map(customers, function(customer){
  return{
    firstName : customer.firstName,
    lastName : customer.lastName,
    address : customer.address
  };
});
```



# filter()

- 데이터 요청 : 우수 고객 목록 (3개 이상 제품을 구매한 고객)
  - map()은 주어진 배열과 길이가 같은 배열을 리턴하지만, 이 경우는 전체 고객 중 우수고객만 가져 와야 함

- forEach()로 먼저 구현

``` js
function selectBestCustomers(customers){
  var newArray = [];
  forEach(customers, function(customer){
    if(customer.purchases.length >= 3)
      newArray.push(customer);
  });
  return newArray;
}
```

- filter() 사용하기 > 함수 본문을 콜백으로 바꾸기
  - 원래 배열을 가지고 새로운 배열을 만드는 고차 함수
  - 새로운 배열에 담을 항목과 건너뛸 항목을 결정

``` js
function selectBestCustomers(customers) {
  return filter(customers, function(customer){
    // 표현식을 함수로 빼서 인자로 전달
    return customer.purchases.length >= 3;
  })
}

function filter(array, f){
  var newArray = [];
  forEach(array, function(element){
    if(f(element))/// 조건식을 콜백으로 부름
      newArray.push(element);
  });
  ruturn newArray;
}
```



## 함수형 도구 filter()

``` js
function filter(array, f){ // 배열과 함수를 인자로 받음
  var newArray = []; // 빈 배열을 만듦
  forEach(array, function(element){
    if(f(element)) // f()를 호출해 항목을 결과 배열에 넣을지 확인
      newArray.push(element); // 조건에 맞으면 원래 항목을 결과 배열에 넣음
  });
  return newArray; // 결과 배열을 리턴
}
```

- 배열에서 일부 항목을 선택하는 함수로, 항목이 x인 배열에 filter()를 사용해도 결과는 여전히 항목이 x인 배열
- x를 받아 **불리언 타입을 리턴하는 함수**를 전달해야 하며, 이를 술어(predicate)라고 부름
- 전달하는 함수가 계산일 때 가장 사용하기 쉬움

### null 처리

``` js
// 아무것도 구입하지 않은 고객
filter(customers, function(customer){
  return customer.purchases.length == 0;
})
```



``` js
var emailsWithoutNull = filter(emailsWithNulls, function(email){
  return email != null;
})
```



### 연습문제

- 1/3 의 고객에게 나머지 고객과 다른 테스트 메일을 전송 예정
- 고객 아이디가 3으로 나누어 떨어지는 고객을 테스트 그룹으로 생성 시, 테스트 그룹을 나누는 코드 작성

``` js
var testGroup = filter(customers, function(customer){
  return customer.id % 3 === 0;
})

var nonTestGroup = filter(customers, function(customer){
  return customer.id % 3 !== 0;
})
```



# reduce()

- 데이터 요청: 모든 고객의 전체 구매 수
  - map(), filter()와 달리 결과 값이 숫자

- forEach()로 먼저 구현

``` js
function countAllPurchases(customers){
  var total = 0
  forEach(customers, function(customer){
    total = total + customer.purchases.length;
  })
  return total;
}
```

- reduce 사용하기
  - 배열을 순회하면서 값을 누적해가는 고차 함수
  - 값을 누적하는 형태는 여러가지가 될 수 있으며 reduce()에 넘기는 함수가 누적 하는 방법 결정

``` js
function countAllPurchases(customers){
  // 초기값과 콜백 함수 전달
  return reduce(customers, 0, function(total, customer) {
    return total + customer.purchases.length;
  });
}

function reduce(array, init, f){
  var accum = init;
  forEach(array, function(element){
    accum = f(accum, element); // 콜백에 전달하는 인자 두개
  });
  return accum;
}

```



## 함수형 도구 reduce()

``` js
function reduce(array, init, f){
  var accum = init; // 누적된 값을 초기화
  forEach(array, function(element){
    accum = f(accum, element); // 누적 값을 계산하기 위해 현재 값과 배열 항목으로 f() 함수 호출
  });
  return accum; // 누적된 값을 리턴
}
```

- 값을 누적하는 것은 추상적 개념으로, 더하거나 해시 맵이나 문자열을 합치는 것도 가능
- 함수는 누적하고 있는 현재 값과 반복하고 있는 현재 배열의 항목을 인자로 받아서 새로운 누적값을 리턴

### 문자열 합치기

``` js
reduce(strings, "", function(accum, string){
  return accum + string;
});
```



### 주의점

- 인자의 순서 (이 책에서는 배열이 가장 먼저, 콜백이 가장 마지막)
- 초기 값을 결정하는 방법
  - 계산이 어떤 값에서 시작되는가?
    - 더하기를 한다면 0, 곱하기를 한다면 1
  - 배열이 비어 있다면 어떤 값을 리턴할 것인가?



### 연습문제

- 숫자 리스트를 모두 더하거나 곱하는 함수 만들기

``` js
function sum(numbers){
  return reduce(numbers, 0, function(total, number){
    return total + number;
  });
}

function product(numbers){
  return reduce(numbers, 1, function(total, number){
    return total * number;
  });
}
```



- Math.min()과 Math.max()를 사용하지 않고 숫자 배열에 있는 가장 큰 값과 가장 작은 값을 찾는 함수 만들기
  - 자바스크립트에서 가장 큰 숫자인 Number.MAX_VALUE, 가장 작은 숫자인 Number.MIN_VALUE가 주어짐

``` js
function min(numbers){
  return reduce(numbers, Number.MAX_VALUE, function(m, n){
    if (m < n) return m;
    else return n;
  });
}

function max(numbers){
  return reduce(numbers, Number.MIN_VALUE, function(m, n){
    if (m > n) return m;
    else return n;
  });
}
```



- 양극단의 값 사용하기
  - map() 함수에 빈 배열을 넘기면 `map([], xToY)` => []
  - filter() 함수에 빈 배열을 넘기면 `filter([], isGood)` => []
  - reduce() 함수에 빈 배열을 넘기면 `reduce([], init, combine)` => init
  - map() 함수에 인자를 그대로 리턴하는 함수를 넘기면 `map(array, function(x){ return x; })` => 얕은 복사가 된 array
  - filter() 함수에 항상 true를 리턴하는 함수를 넘기면 `filter(array, function(_x){ return true; })` => 얕은 복사가 된 array
  - filter() 함수에 항상 false를 리턴하는 함수를 넘기면 `filter(array, function(_x){ return false; })` => []



## reduce() 로 할 수 있는 것

### 실행 취소/실행 복귀

- 리스트 형태의 사용자 입력에 reduce()를 적용한 것이 현재 상태라고 생각해보면, 실행 취소는 리스트의 마지막 사용자 입력을 없애는 것

### 테스트할 때 사용자 입력을 다시 실행하기

- 시스템의 상태가 초기값이고 사용자 입력이 순서대로 리스트에 있을때, reduce()로 모든 값을 합쳐 현재 상태를 만들 수 있음

### 시간 여행 디버깅

- 뭔가 잘못 동작하는 경우 특정 시점의 상태 값을 보관하고 문제를 고친 뒤 새로운 코드로 다시 실행 가능

### 회계 감사 추적

- 특정 시점에 시스템 상태를 기록할 수 있으며, 어떤 일이 있었는지 뿐만 아니라 어떤 과정을 통해 생긴 일인지도 알 수 있음



## reduce()로 map(), filter() 만들기

- 각 단계에서 리턴하는 누적 값을 바꾸는 방법과 바꾸지 않는 방법 두 가지 사용 (모두 계산)
- 변이가 지역적으로 일어나기 때문에 여전히 계산이라는 규칙을 유지

``` js
function map(array, f){
  return reduce(array, [], function(ret, item){
    // 비효율적이지만 불변 함수 사용
    return ret.concat(f([item]));
  });
}

function map(array, f){
  return reduce(array, [], function(ret, item){
    // 조금 더 효율적인 변이 함수 사용
    ret.push(f(item));
    return ret;
  });
}

function filter(array, f){
  return reduce(array, [], function(ret, item){
    // 비 효율 적이지만 불변 함수 사용
    if(f(item)) return ret.concat([item]);
    else return ret;
  });
}

function filter(array, f){
  return reduce(array, [], function(ret, item){
    // 조금 더 효율적인 변이 함수 사용
    if(f(item))
      ret.push(item);
    return ret;
  });
}
```



# 정리

## map

- 어떤 배열의 모든 항목에 함수를 적용해 새로운 배열로 바꿈
- 각 항목은 지정한 콜백 함수에 의해 변환



## filter

- 어떤 배열의 하위 집합을 선택해 새로운 배열로 만듦
- 술어를 전달해서 특정 항목을 선택할 수 있음



## reduce()

- 어떤 배열의 항목을 조합해 하나의 최종값을 만듦
- 데이터를 요약하거나 시퀀스를 하나의 값으로 만들 때 주로 씀

