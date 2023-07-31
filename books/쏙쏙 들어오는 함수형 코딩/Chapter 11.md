[TOC]

# Chapter 11. 일급 함수 Ⅱ

> 고차 함수를 통해 **카피-온-라이트**와 **로그 시스템** 개선

<br>

### 배열에 대한 카피-온-라이트 리팩터링

> **함수 본문을 콜백으로 바꾸기 리팩터링** 적용

##### 1. 본문과 앞부분, 뒷부분을 확인하기

```js
// 리팩터링 전
function arraySet(array, idx, value) {
    var copy = array.slice();
    copy[idx] = value;
    return copy;
}
function push(array, elem) { // 동일한 카피-온-라이트 구조
    var copy = array.slice();
    copy.push(elem);
    return copy;
}
```

##### 2. 함수 빼내기

```js
// 함수로 빼낸 코드
function arraySet(array, idx, value) { // 카피-온-라이트 동작
    return withArrayCopy(array);
}

function withArrayCopy(array) {
    var copy = array.slice(); // 앞부분
    copy[idx] = value; // 본문 (아직 정의되지 않은 변수 idx, value)
    return copy; // 뒷부분
}
```

- `withArrayCopy()` 함수 범위에 `idx` 와 `value` 정의가 필요

##### 3. 콜백 빼내기

```js
// 리팩터링 후
function arraySet(array, idx, value) {
    return withArrayCopy(array, function(copy) { // 본문을 인자로 전달
        copy[idx] = value;
    });
}

function withArrayCopy(array, modify) {
    var copy = array.slice();
    modify(copy);
    return copy;
}
```

- **리팩터링으로 얻은 것**

  1. 표준화된 원칙

  2. 새로운 동작에 원칙을 적용할 수 있음

     ```js
     var sortedArray = withArrayCopy(array, function(copy) {
         SuperSorter.sort(copy); // 배열을 직접 변경하는 고성능 정렬 함수를 적용
     })
     ```

  3. 여러 개를 변경할 때 최적화

     ```js
     // 중간 복사본을 만드는 경우 (배열을 네 번 복사)
     var a1 = drop_first(array);
     var a2 = push(a1, 10);
     var a3 = push(a2, 11);
     var a4 = arraySet(a3, 0, 42);
     
     // 복사본을 하나만 만듬 (하나의 복사본을 네 번 변경)
     var a4 = withArrayCopy(array, function(copy) {
         copy.shift();
         copy.push(10);
         copy.push(11);
         copy[0] = 42;
     })
     ```

#### 객체에 사용할 수 있는 버전

```js
function withObjectCopy(object, modify) {
    var copy = Object.assign({}, object); // {} 에 object 속성을 복사해서 붙여넣기
    modify(copy);
    return copy;
}

function objectSet(object, key, value) {
    return withObjectCopy(object, function(copy) {
        copy[key] = value;
    })
}

function objectDelete(object, key) {
    return withObjectCopy(object, function(copy) {
        delete copy[key];
    })
}
```

<br>

### 함수를 리턴하는 함수

> <u>에러를 잡아 로그를 남길 수 있는 기능이 추가된 함수</u>를 리턴하는 함수 작성

```js
// 앞에서 다룬 withLogging 함수
function withLogging(f) {
    try {
        f();
    } catch (error) {
        logToSnapErrors(error);
    }
}

withLogging(function() { // 해당 방식으로 항상 코드를 감싸서 호출해야 함
    saveUserData(user);
})
```

```js
// 로그를 남기는 함수의 형태
function saveUserDataWithLogging(user) {
    try {
        saveUserDataNoLogging(user);
    } catch (error) {
        logToSnapErrors(error);
    }
}
function fetchProductWithLogging(productId) {
    try {
        fetchProductNoLogging(productId);
    } catch (error) {
        logToSnapErrors(error);
    }
}
```

- 해당 함수를 바로 호출하여 사용할 수 있지만, <u>중복이 다수 존재</u>함

```js
// 함수를 리턴하는 함수 적용
function wrapLogging(f) { // f 함수를 받아서 try/catch 구문으로 감싼 함수를 리턴
    return function(arg) {
        try {
            f(arg);
        } catch (error) {
            logToSnapErrors(error);
        }
    }
}

var saveUserDataWithLogging = wrapLogging(saveUserDataNoLogging);
var fetchProductWithLogging = wrapLogging(fetchProductNoLogging);

saveUserDataWithLogging(user1);
saveUserDataWithLogging(user2);
fetchProductWithLogging(productId1);
fetchProductWithLogging(productId2);
```

> 고차 함수는 강력한 기능이지만, 비용이 따르기 때문에 상황에 맞게 사용하는 것이 중요