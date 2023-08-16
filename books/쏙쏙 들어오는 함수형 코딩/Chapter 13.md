# 13. 함수형 도구 체이닝

- 여러 단계를 하나로 엮은 체인(chain)으로 복합적인 계산을 표현하는 방법



# 함수 체이닝

- 데이터 요청 : 우수 고객들(3개 이상 구매)의 가장 비싼 구매
  - 단계를 조합해 하나의 쿼리로 만드는 것이 필요함
  - 여러 단계를 하나로 조합하는 것을 체이닝(chainning)이라고 함
- 방법
  1. 우수 고객(3개 이상 구매)을 거르기 `filter()`
  2. 우수 고객을 가장 비싼 구매로 바꾸기 `map()`

``` js
function biggestPurchasesBestCustomers(customers){
  // 우수 고객 거르기
  var bestCustomers = filter(customers, function(customers){
    return customer.purchases.length >= 3;
  });
  // 가장 비싼 구매를 가져와 배열에 담기
  var biggestPurchases = map(bestCustomers, function(customer){
    // 여기에서 무엇을 리턴 해야 할까?
  })
}
```

``` js
// 가장 큰 수를 찾는 코드로 가장 비싼 구매를 찾는 코드를 만들 수 있다 > reduce() 사용
function biggestPurchasesBestCustomers(customers){
  var bestCustomers = filter(customers, function(customers){
    return customer.purchases.length >= 3;
  });

  var biggestPurchases = map(bestCustomers, function(customer){
    // reduce의 초깃값으로 빈 구매 객체 사용
    return reduce(customer.purchases, {total: 0}, function(biggestSoFar, purchase){ // 중첩된 콜백은 이해하기 어려움
      if(biggestSoFar.total > purchase.total)
        return biggestSoFar; // 가장 비싼 구매를 찾기 위해 reduce() 사용
      else
        return purchase
    });
  });
  
  return biggestPurchases;
}
```

- reduce()를 maxKey()로 빼냄

``` js
maxKey(customer.purchases, {total:0}, function(purchase){
  return purchase.total;
})

function maxKey(array, init, f){
  return reduce(array, init, function(biggestSoFar, element){
    if(f(biggestSoFar) > f(element))
      return biggestSoFar;
    else
      return element;
  })
}
```

- reduce()는 일반적이기 때문에 낮은 수준의 함수로 배열의 값을 조합한다는 의미말고 특별한 의미가 없음
- maxKey()는 더 구체적인 함수



## 연습 문제

- max()와 maxKey()는 비슷한 함수로 코드도 비슷할 것. 둘 중 하나로 나머지 하나를 만들 수 있다고 가정하고 질문에 대답하기

1. 어떤 것으로 다른 하나를 만들 수 있는가?

   - maxKey()가 더 일반적이므로 maxKey()로 max()를 만들 수 있음
   - maxKey()는 비교하는 값을 자유롭게 선택해서 최댓값을 구할 수 있지만, max()는 값을 직접 비교해야 함

2. 코드 작성

   - 인자로 받은 값을 그대로 리턴하는 항등 함수와 maxKey()를 사용해 max()를 만들 수 있음

   ``` js
   function maxKey(array, init, f){
     return reduce(array, init, function(biggestSoFar, element){
       if(f(biggestSoFar) > f(element))
         return biggestSoFar;
       else
         return element;
     });
   }
   
   function max(array, init){
     return maxKey(array, init, function(x){
       return x;
     });
   }
   ```

3. 두 함수를 호출 그래프로 표현

   ``` mermaid
   flowchart TD;
    A[max] --> B[maxKey] --> C[reduce] --> D[forEach] --> E[for loop]
   
   ```

   

4. 어떤 함수가 더 일반적인 함수?

- maxKey()가 max()보다 더 일반적인 함수

## 체인을 명확하게 만들기

### 1. 단계에 이름 붙이기

``` js
function biggestPurchasesBestCustomers(customers){
  var bestCustomers = filter(customers, function(customer){
    return customer.purchases.length >= 3;
  });
  
  var biggestPurchases = map(bestCustomers, function(customer){
    return maxKey(customer.purchases, {total : 0}, function(purchases){
      return purchase.total;
    });
  });
  return biggestPurchases;
}
```

``` js
function biggestPurchasesBestCustomers(customers){
  // 단계가 더 짧아졌고 코드가 모여있어 의미를 이해하기 쉬움
  var bestCustomers = selectBestCustomers(customers); 
  var biggestPurchases = getBiggestPurchases(bestCustomers);
  return biggestPurchases;
}

// 고차 함수에 이름을 붙여 현재 문맥에 추가
function selectBestCustomers(customers){
  return filter(customers, function(customer){
    return customer.purchases.length >= 3;
  });
}

function getBiggestPurchases(customers){
  return map(customers, getBiggestPurchase); // 고차함수를 함수로 빼내서 명확해짐
}

function getBiggestPurchase(customer){
  return maxKey(customer.purchases, {total : 0}, function(purchase){
    return purchase.total;
  });
}
```

- 각 단계에 이름을 붙여 명확하게 만듦
- 콜백 함수는 여전히 인라인으로 사용하고 있고, 인라인으로 정의된 콜백 함수는 재사용할 수 없음
  - 호출 그래프에서 아래쪽에 있는 작은 함수들이 재사용하기 좋으므로 더 작은 함수로 쪼개는 것이 좋음

### 2. 콜백에 이름 붙이기

- 단계를 빼내는 대신 콜백을 빼내 이름을 붙임

``` js
function biggestPurchasesBestCustomers(customers){
  var bestCustomers = filter(customers, isGoodCustomer);
  var biggestPurchases = map(bestCustomers, getBiggestPurchase);
  return biggestPurchases;
}

function isGoodCustomer(customer){
  return customer.purchases.length >= 3;
}

function getBiggestPurchase(customer){
  return maxKey(customer.purchases, {total : 0}, getPurchaseTotal);
}

function getPurchaseTotal(pruchase){
  return purchase.total;
}
```

- 콜백을 빼내고 이름을 붙여 재사용할 수 있는 함수로 만듦
- 직관적으로 더 재사용하기 좋은 코드

### 3. 두 방법을 비교

- 일반적으로 두 번째 방법이 더 명확하며, 재사용하기도 좋음
- 인라인 대신 이름을 붙여 콜백을 사용하면 단계가 중첩되는 것도 막을 수 있음
- 사용하는 언어의 문법과 문맥에 따라 달라짐



### 예제 : 한번만 구매한 고객의 이메일 목록

- 처음 구매한 고객을 지속적인 고객으로 만들기 위해 혜택이 담긴 메일 발송

- 가진 것 : 전체 고객 배열
- 필요한 것 : 한 번만 구매한 고객들의 이메일 목록

``` js
var firstTimers = filter(customers, function(customer){
  return customer.purchases.length === 1;
});

var firstTimerEmails = map(firstTimers, function(customer){
  return customer.email;
});

// 짧고 명확하게 만들기
var firstTimers = filter(customer, isFirstTimer);
var firstTimerEmails = map(firstTimers, getCustomerEmail);

function isFirstTimer(customer){
  return customer.purchases.length === 1;
}

function getCustomerEmail(customer){
  return customer.email;
}
```



### 연습 문제

- 구매 금액이 100달러가 넘고, 두번 이상 구매한 큰 손 고객 찾기

``` js
function bigSpenders(customers){
  var withBigPurchases = filter(customers, hasBigPurchases);
  var with2OrMorePurchases = filter(withBigPurchases, has2OrMorePurchases);
  return with2OrMorePurchases;
}

function hasBigPurchase(customer){
  return filter(customer.purchase, isBigPurchase).length > 0;
}

function isBigPurchase(purchase){
  return purchase.total > 100;
}

function has2OrMorePurchases(customer){
  return customer.purchases.length >= 2;
}
```



- 평균을 계산 하는 함수

``` js
function average(numbers){
  return reduce(numbers, 0, plus)/numbers.length;
}

function plus(a, b){
  return a + b;
}
```



### 체인 최적화 - 스트림 결합(stream fusion)

- filter() 와 map() 모두 새로운 배열을 만들어서 비효율적인 경우가 있음 (웬만하면 가비지콜렉터가 해결해 주지만 아닌 경우도 있음) 이를 최적화 하는 것이 **스트림 결합**

``` js
// 값 하나에 map() 두 번 사용
var names = map(customers, getFullName);
var nameLength = map(names, stringLength);

// 두 동작을 하나로 조합해서 한 번만 사용
var nameLength = map(customers, function(customer){
  return stringLength(getFullName(customer));
})
```

``` js
// 값 하나에 filter() 두 번 사용
var goodCustomers = filter(customers, isGoodCustomer);
var withAddresses = filter(goodCustomers, hasAddress);

// 값 하나에 두 번 filter()를 적용하는 것은 두 값에 AND 불리언 연산을 적용하는 것
var withAddresses = filter(customers, function(customer){
  return isGoodCustomer(customer) && hasAddress(customer);
})
```

``` js
// map() 다음에 reduce()를 사용
var purchaseTotals = map(purchases, getPurchaseTotal);
var purchaseSum = reduce(purchaseTotals, 0, plus);

// reduce()를 한 번만 사용해도 같음
var purchaseSum = reduce(purchases, 0, function(total, purchase){
  return total + getPurchaseTotal(purchase);
})
```

- 병목 현상이 생겼을 때만 쓰는 것이 좋고, 대부분의 경우 여러 단계를 사용하는 것이 더 명확하고 읽기 쉬움



## 반복문을 함수형 도구로 리팩터링 하기

- 기존에 있던 반복문을 함수형 도구로 리팩터링 해야할 때 어떻게 할 수 있을까?

  1. 반복문 코드를 이해하고 다시 만들기

  2. 단서를 찾아 리팩터링 - 반복문을 하나씩 선택한 다음 함수형 도구 체인으로 변경

  ``` js
  // 중첩된 반복문이 있는 코드
  
  var answer = [];// 반복문 안에서 결과가 완성되는 배열
  var window = 5;
  
  // 바깥쪽 배열은 배열 개수만큼 반복
  for(var i = 0; i < array.length; i++){
    var sum = 0;
    var count = 0;
    // 안쪽 배열은 0에서 4까지 작은 구간을 반복
    for(var w = 0; w < window; w++){
      var idx = i + w; // 새로운 인덱스를 계산
      if(idx < array.length){ // 어떤 값을 누적
        sum += array[idx];
        count += 1;
      }
    }
    answer.push(sum/count); // answer 배열에 값을 추가
  }
  ```

  - 원래 배열 크기 만큼 answer에 항목을 추가 => `map()` 사용 가능
  - 배열을 돌면서 항목을 값 하나로 만듦 => `reduce()` 사용 가능
  - 안 쪽 반복문이 리팩터링을 시작하기 좋은 위치



### 데이터 만들기

- `map()` 과`filter()`를 단계적으로 사용하면 중간에 배열이 생기고 없어짐
- for 반복문을 사용할 때는 처리할 모든 값이 배열이 들어 있지 않아도 됨
- 데이터를 배열에 넣으면 함수형 도구를 쓸 수 있음

``` js
var answer = [];
var window = 5;

for(var i = 0; i < array.length; i++){
  var sum = 0;
  var count = 0;
  // w는 0부터 window-1까지 바뀌지만 배열에 들어 있는 값이 아님
  for(var w = 0; w < window; w++){
    var idx = i + w; // idx는 i로 부터 i + window -1 까지 바뀌지만 배열로 만들지는 않음
    if(idx < array.length){
      sum += array[idx]; // 배열에 있는 작은 범위의 값이지만 배열로 따로 만들지 않음
      count += 1;
    }
  }
  answer.push(sum/count);
}
```

- array에 있는 값 중 어떤 범위의 값을 반복하므로 이를 배열로 만든다면?

``` js
var answer = [];
var windonw = 5;

for(var i = 0; i < array.length; i++){
  var sum = 0;
  var count = 0;
  var subarray = array.slice(i, i + window); // 하위 배열로 만듦
  for (var w = 0; w < subarray.length; w++){ // 반복문으로 배열을 반복
    sum += subarray[w];
    count += 1;
  }
  answer.push(sum/count);
}
```



### 한 번에 전체 배열을 조작하기

- 하위 배열을 만들었기 때문에 일부 배열이 아닌 전체 배열을 반복할 수 있음

``` js
var answer = [];
var windonw = 5;

for(var i = 0; i < array.length; i++){
  var sum = 0;
  var count = 0;
  var subarray = array.slice(i, i + window);
  for (var w = 0; w < subarray.length; w++){ // 하위 배열을 반복하는 반복문
    sum += subarray[w]; // 하위 배열의 합과 개수를 구함
    count += 1;
  }
  answer.push(sum/count); // 평균을 구하기 위해 나눔
}
```

- 전에 만들었던 average 함수를 재사용 하기

``` js
var answer = [];
var window = 5;
for(var i = 0; i < array.length; i++){
  // 안쪽 반복문 전체를 .slice()와 average()를 호출하는 코드로 변경
  var subarray = array.slice(i, i+ window);
  answer.push(average(subarray));
}
```



### 작은 단계로 나누기

- 배열 항목 전체를 반복하면서 같은 크기의 배열을 새로 만들고 있어 `map()` 활용 가능

``` js
var answer = [];
var window = 5;
for(var i = 0; i < array.length; i++){
  var subarray = array.slice(i, i+ window); // 하위 배열을 만들기 위해 반복문의 인덱스 사용
  answer.push(average(subarray));
}
```

- 인덱스가 들어있는 배열을 만들고 인덱스 배열 전체에 함수형 도구를 사용

``` js
var indices = [];
for(var i = 0; i < array.length; i++) // 인덱스를 생성하는 작은 단계 생성
  indices.push(i);

var window = 5;
var answer = map(indices, function(i){
  var subarray = array.slice(i, i + window);
  return average(subarray);
})
```

- `map()` 콜백 안에서 두 가지 일을 하고 있으므로 두 단계로 나누기

``` js
var indices = [];
for(var i = 0; i < array.length; i++) // 인덱스를 생성하는 작은 단계 생성
  indices.push(i);

var window = 5;
var windows = map(indices, function(i){
  return subarray = array.slice(i, i + window);
})
var answer = map(windows, average);
```

- 인덱스 배열을 만드는 코드를 빼내 유용한 함수로 정의

``` js
function range(start, end){
  var ret = [];
  for(var i = start; i < end; i++) // 인덱스를 생성하는 작은 단계 생성
    ret.push(i);
  return ret;
}

var window = 5;
var indices = range(0, array.length); // range로 인덱스 배열 생성
var windows = map(indices, function(i){ // 하위 배열 만들기
  return subarray = array.slice(i, i + window);
})
var answer = map(windows, average); // 평균 계산하기
```



### 체이닝 팁

1. 데이터 만들기
   - 배열 일부에 대해 동작하는 반복문이 있다면 배열 일부를 새로운 배열로 나누고 함수형 도구 사용하기
2. 배열 전체를 다루기
   - 반복문을 대신해 전체 배열을 한번에 처리하는 방법 생각하기
3. 작은 단계로 나누기
   - 두 개 이상의 단계로 나눠 이해하기
4. 조건문을 filter()로 바꾸기
5. 유용한 함수로 추출하기



### 체이닝 디버깅 팁

1. 구체적인 것을 유지하기
   - 데이터를 처리하는 과정에서 어떤 데이터인지 어떤 과정인지 잊지 않도록 명확한 네이밍
2. 출력해보기
3. 타입을 따라가 보기



### 다양한 함수형 도구

- `pluck()`
  - 객체가 담긴 배열에서 각 객체의 특정 키 값만 가져오는 함수
- `concat()`
  - 중첩된 배열을 결합
- `frequenciesBy()`, `groupBy()`
  - 개수를 세거나 그룹화



## 값을 만들기 위한 reduce()

- reduce()는 값을 요약하기도 하지만 값을 만들기도 함
- 고객의 장바구니 값이 사라졌지만 고객이 장바구니에 추가한 제품들을 배열로 로깅중
  - 해당 정보로 현재 장바구니 상태 만들기
  - 중복 제품은 수량을 증가 시키면 됨

``` js
// 첫 번째 인자는 로그 배열 넘기기
// 두 번째 인자는 초기값
// 콜백 함수의 시그니처는 리턴값과 같은 장바구니고 두 번째 인자는 배열에 들어 있는 제품 이름
var shoppingCart = reduce(itemsAdded, {}, function(cart, item){ 
	// 추가하려는 제품이 장바구니에 없는 경우
  if(!cart[item])
    return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
  else { // 추가 하려는 제품이 장바구니에 있는 경우
    var quantity = cart[item].quantity;
    return setFieldByName(cart, item, 'quantity', quantity + 1);
  }
})
```

- 콜백 빼내서 추상화 벽에 추가하기

``` js
var shoppingCart = reduce(itemsAdded, {}, addOne);

function addOne(cart, item){ 
  if(!cart[item])
    return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
  else {
    var quantity = cart[item].quantity;
    return setFieldByName(cart, item, 'quantity', quantity + 1);
  }
}
```

- 제품을 추가하거나 삭제하는 것을 모두 지원하기
  - 로깅에 제품을 추가 했는지 삭제했는지 알려주는 값을 함께 기록하기

``` js
var shoppingCart = reduce(itemsOps, {}, function(cart, itempOp){
  var op = itemOp[0];
  var item = itemOp[1];
  if(op === 'add') return addOne(cart, item);
  else(op === 'remove') return removeOne(cart, item);
});

function removeOne(cart, item){
  if(!cart[item])
    return cart; // 장바구니에 제품이 없다면 아무것도 하지 않음
  else{
    var quantity = cart[item].quantity;
    if(quantity === 1)
      return remove_item_by_name(cart, item); // 수량이 하나일 때는 제품 삭제
    else
      return setFieldByName(cart, item, 'quantity', quantity - 1); // 수량 줄이기
  }
}

function addOne(cart, item){ 
  if(!cart[item])
    return add_item(cart, {name: item, quantity: 1, price: priceLookup(item)});
  else {
    var quantity = cart[item].quantity;
    return setFieldByName(cart, item, 'quantity', quantity + 1);
  }
}
```

