# Chapter 11. API 리팩터링

## 11.1 질의 함수와 변경 함수 분리하기

```js
// before
function getTotalOutstandingAndSendBill() {
    const result = customer.invoices.reduce(
        (total, each) => each.aamount + total,0
    )
    sendBill()
    return result
}

// after
function totalOudstanding(){
    return customer.invoices.reduce(
        (total, each) => each.aamount + total,0
    )
}
function sendBill() {
    emailGetaway.send(formatBill(customer))
}
```

### 배경

- 외부에서 관찰할 수 있는 겉보기 부수효과가 전혀 없이 값을 반환해주는 함수 추구
    - 이런 함수는 어느 때건 원하는 만큼 호출해도 문제 없음
- 겉보기 부수효과가 있는 함수는 없는 함수와 명확하게 분리하는 것이 좋음
    - 이를 위해 명령-질의 분리를 할 수 있음

### 절차

- 1️⃣ 대상 함수를 복제하고 질의 목적에 충실한 이름 지음
- 2️⃣ 새 질의 함수에서 부수효과 모두 제거
- 3️⃣ 정적 검사 수행
- 4️⃣ 원래 함수를 호출하는 곳을 모두 찾아내여 추가
- 5️⃣ 원래 함수에서 질의 관련 코드 제거
- 6️⃣ 테스트

### 예시

```js
function alertForMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            sendOffAlarms()
            return "조커"
        }
        if (p === "사루만") {
            sendOffAlarms()
            return "사루만"
        }
    }
    return ""
}
```

- 이름 목록에서 악당을 찾고, 
    - 악당을 찾으면 알람을 울리고, 악당 이름 반환

```js
function findMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            sendOffAlarms()
            return "조커"
        }
        if (p === "사루만") {
            sendOffAlarms()
            return "사루만"
        }
    }
    return ""
}
```

- 1️⃣ 함수 복제, 적당한 이름 짓기

```js
function findMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            return "조커"
        }
        if (p === "사루만") {
            return "사루만"
        }
    }
    return ""
}
```

- 2️⃣ 부수 효과를 낳는 부분 제거

```js
// before
const found = alertForMiscreant(people)

// after
const found = findMiscreant(people)
```

- 4️⃣ 원래 함수를 이용하던 곳에서 새로운 함수를 호출하도록 바꿈

```js
function alertForMiscreant(people) {
    for (const p of people) {
        if (p === "조커") {
            sendOffAlarms()
            return
        }
        if (p === "사루만") {
            sendOffAlarms()
            return
        }
    }
    return
}
```

- 5️⃣ 원래의 함수에서 질의 관련 코드 제거