# Chapter 14. 중첩된 데이터에 함수형 도구 사용하기

## 필드명을 명시적으로 만들기

```js
function incrementQuantity(itme) {
    var quantity = item("quantity")
    var newQuantity = quantity + 1
    var newItem = objectSet(itme, "quantity", newQuantity)
    return newItem
}

function incrementSize(itme) {
    var size = item("size")
    var newSize = size + 1
    var newItem = objectSet(itme, "size", newSize)
    return newItem
}

// 리팩터링
function incrementField(itme, field) {
    var value = item[field] // 앞부분
    var newValue = value + 1 // 본문
    var newItem = objectSet(itme, field, newValue) // 뒷부분
    return newItem
}
```

- 10장 내용에 따라 리팩터링한 함수
- 함수 이름에 있는 필드명 
    - → 함수 이름에 있는 암묵적 인자에 의한 냄새, 함수 이름에 있는 일부분을 함수 본문에서 사용
    - 냄새를 제거하기 위해 암묵적 인자를 드러내는 방법 적용 가능
- 하지만 여전히 `increment`라는 행동을 함수 이름에서 드러내고 있고, 그 행동을 함수 본문에서 사용

## `update()` 도출하기

- 예를 들어 `incrementField()`, `decrementField()`, `doubleField()` 등의 함수가 있을 때,
    - 앞부분, 뒷부분은 변경 없이 본문에서만 서로 다른 동작을 하게 됨

```js
function incrementField(item, field) {
    ruturn update(itme, field, function(value) {return value + 1})
}

function update(object, key, modify) {
    var value = object[key]
    var newValue = modify(value)
    var newObject = objectSet(object, key, newValue)
    return newObject
}
```

- 기존 함수를 새로운 함수로 추출하고, 해당 함수를 호출하는 방식으로 변경

## 리패터링: 조회, 변경, 설정을 `update()`로 교채하기

- 앞서 리팩터링 두가지를 적용 : 암묵적 인자 드러내기, 함수 본문을 콜백으로 바꾸기
    - 이전 코드의 동작은, 객체에서 값을 조회, 값 변경, 객체에서 값 설정
    - 위의 동작은 `update()` 함수 하나로 변경 가능

- 조회, 변경, 설정 하는 것을 `update()`로 교체하는 단계
    - 리팩터링은 두가지 단계로 구성 : 조회・변경・설정 할 것을 찾고, 바꾸는 동작을 콜백으로 전달 및 교체

## 객체에 있는 값 시각화 하기

```js
var shoes = {
    name: "shoes",
    quantity: 3,
    price: 7
}
```

- 장바구니에 상품이 있는 경우

```js
update(shoes, "quantity", function(value) {return value * 2})

var shoes = {
    name: "shoes",
    quantity: 3, // → 3 * 2 = 6
    price: 7
}
```

- 객체를 전달, 특정 값을 수정한 복사본을 반환

```js
var shirt = {
    name: "shrit",
    price: 13,
    options: {
        color: "blue",
        size: 3
    } // 객체안에 객체가 중첩
}

function incrmentSize(itme) {
    var options = item.options
    var size = options.size
    var newSize = size + 1
    var newOptions = objectSet(options, "size", newSize)
    var newItem = objectSet(item, "options", newOptions)
    return newItem
}
```

- 그런데 중첩된 데이터가 주어진다면, 중첩된 데이터를 꺼내서 변경하는 과정이 필요함

## 중첩된 `update` 시각화 하기

- 기존 코드는 중첩된 객체를 조작하기 위해 두 번의 조회, 변경, 두 번의 설정을 한 뒤 변경된 객체를 반환

```js
shirt = {
    name: "shrit",
    price: 13,
    options: {
        color: "blue",
        size: 3
    } 
}

// 객체 추출
options= {
    color: "blue",
    size: 3 //값 변경 : 3 + 1 = 4
} 

// 새로운 객체 저장
options= {
    color: "blue",
    size: 4
} 

// 중첩된 객체 저장
shirt = {
    name: "shrit",
    price: 13,
    options: {
        color: "blue",
        size: 4
    } 
}
```

## 중첩된 데이터에 `update()` 사용하기

```js
// 1차 리팩터링
function incrmentSize(itme) {
    var options = item.options
    // var size = options.size
    // var newSize = size + 1
    // var newOptions = objectSet(options, "size", newSize)
    var newOptions = update(options, "size", increment) // 리팩터링 적용
    var newItem = objectSet(item, "options", newOptions)
    return newItem
}

// 2차 리팩터링
function incrmentSize(itme) {
    // var options = item.options
    // var newOptions = update(options, "size", increment)
    // var newItem = objectSet(item, "options", newOptions)
    // return newItem
    return update(itme, "options", function(options) {
        return upate(options, "size", increment)
    })
}
```

- 중첩된 객체를 변경하는 부분에서 우선 적용한 후,
- 해당 `update` 함수를 호출하는 부분을 또다시 중첩하여, 중첩된 객체에도 적용할 수 있도록 함

## `updateOption()`도출하기

- 리팩토링을 진행했지만, `update()`함수를 여러번 호출하게 되고, 코드 냄새가 남아있게 됨
    - 또한 함수에서 암묵적 인자를 사용(“size”, increment)
    - 만약 조작을 다양하게 한다면, 처음 마주했던 문제처럼 암묵적 인자를 가진 함수들을 활용하게 됨 (지금의 경우 “options” 인자)

## `update2()` (두 번 중첩된 객체 수정 ) 도출하기

- 기존 함수는 필드명이 함수 이름에 있는데, 이를 함수 인자로 추출할 수 있음

```js
// 암묵적 인자가 있는 코드
function incrmentOption(itme) {
    return update(itme, "options", function(options) {
        return upate(options, "size", increment)
    })
}

// 명시적 인자가 있는 코드
function update2(object, key1, key2, modify) {
    return update(object, key1, function(value1) {
        return update(value1, key2, modify)
    })
}

// 리팩토링한 코드
function incrementSize(itme) {
    return update2(item, "options", "size", function(size) {return size + 1})
}
```

- 함수에서 암묵적 인자를 제거, 일반화할 수 있도록 하여 적용

## `incrementSizeByName()`을 만드는 네 가지 방법

- 옵션 1: `update()`, `incrementSize()`로 만들기
- 옵션 2: `update()`, `update2()`로 만들기
- 옵션 3: `update()`로 만들기
- 옵션 4: 조회, 변경, 설정을 직접 만들기

## `update3()` 도출하기

- `update2()`를 생성한 것 처럼, 중첩이 세 단계 인 경우에도 중첩이 두 단계와 유사하게 해결할 수 있음
- 하지만, 점점 더 많은 키를 인자로 입력해야 하고, 더 깊은 중첩의 경우에 새로운 함수를 만들어야 함

## `nestedUpdate()` 도출하기

- 패턴을 찾아보면, 내부에 있는 `updateX()`를 실행하면, `update()`함수 안에서 `updateX-1()`을 호출함
- 그리고 함수에 있는 `X`와 같은 중첩 단계를 나타내는 숫자는 암묵적 인자로 작동하기 때문에 이를 제거하면 좋음

```js
function updateX(object, depth, key1, key2, key3, modify) {
    return update(obejct, key1, function(value) {
        return updateX(object, depth - 1, key2, k3, modify)
    }) 
}
```

- 위의 패턴을 적용하여 함수를 수정
    - 재귀의 깊이 `depth`를 입력하여 더 깊은 객체를 순회 탐색할 수 있음
- 하지만, 위의 방식으로 적용하면, key의 목록이 달라지게 되어 버그가 발생함

```js
function updateX(object, keys, modify) {
    if (keys.length) === 0{
        return modify(object)
    }
    var key1 = keys[0]
    var restOfKeys = drop_first(keys)
    return update(obejct, key1, function(value) {
        return updateX(object, resOfKeys, modify)
    }) 
}
```

- 키를 함수의 인자로 입력하는 대신, 배열로 입력하도록 변경
- 깊이을 인자를 주어 판단하는 대신, 배열의 길이를 활용하도록 변경
- 그리고 위와 같은 함수를 `nestedUpdate()`와 같은 이름을 활용하여 일반적으로 활용할 수 있도록 변경

## 안전한 재귀 사용번

- 종료 조건
    - 재귀를 먼추기 위해서는 종료조건이 필요함
- 재귀 호출
    - 재귀를 실행하려면 최소한 한번의 재귀호출이 있어야하고,
    - 필요한 곳에서 실행할 수 있어야 함
- 종료 조건에 다가가기
    - 재귀를 실행한다면 함수를 실행하는 인자가 하나씩 줄어들게 되는 것이고,
    - 그럴 때 마다 종료조건에 가까워 지므로, 종료 조건이 잘 실행될 수 있도록 해야 함

## 깊이 중첩된 구조를 설계할 때 생각할 점

- `nestedUpdate()`와 같은 함수를 실행한다면 깊이가 긴 키의 목록이 필요하고,
    - 직접 만든 함수가 아닌 API를 통해 실행한다면 어려움이 더 커짐
- 예를 들어 API를 통하여 JSON을 가져온 후 콜백으로 처리하는 코드를 구현한다면,
    - 각 구조의 중첩된 키가 있는지 확인하는 등 구조를 명확하게 알기 어려움

## 깊이 중첩된 데이터에 추상화 벽 사용하기

- 깊이 중첩된 데이터를 사용할 때 너무 많은 것을 기억해야 하는 어려움이 있음
    - 따라서 추상화 벽을 이용해 의미 있는 이름을 붙인 함수를 생성
    - `updatePostById()`, `updateAuthor()`, `capitalizeName()`과 같이 중첩 배열을 수정하는 함수를 추상화 벽 너머에 생성 및 활용
    - 그렇게 된다면, 기억해야 할 부분이 죽어 들었고, 이름에 기반하여 명확한 동작을 알 수 있게됨
