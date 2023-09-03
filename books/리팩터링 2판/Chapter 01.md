# Chapter 01. 리팩터링: 첫 번째 예시

## 1.1

- 다양한 연극을 외주로 받아서 공연하는 극단, 공연 요청이 들어오면 연극 장르와 규모를 기초로 비용 책정
    - 장르는 비극과 희극
    - 공연료와 별개로 포인트를 지급해서 다음번 의뢰시 공연료 할인 가능

```json
// play.json
{
    "hamlet": {"name": "Hamlet", "type": "tragedey"},
    "as-list": {"name": "as-list", "type": "comedy"},
}

// invoices.json
[
    {
        "customer": "BigCo",
        "performances": [
            {
                "playId": "hamlet",
                "audience": 55
            },
            {
                "playId": "as-like",
                "audience": 35
            }
        ]
    }
]
```

- 공연할 연극 정보와 청구서에 들어갈 데이터

```js
function (invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    const format = new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }
        ).format;

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = 0;

        switch (play.type) {
            case "tragedy":
                thisAmount = 40000;
                if (perf.audience > 30) {
                    thisAmount += 1000 * (perf.audience - 30);
                }
                break;
            case "comedy":
                thisAmount = 30000;
                if (perf.audience > 20) {
                    thisAmount += 10000 + 500 * (perf.audience - 20);
                }
                thisAmount += 300 * perf.audience;
                break;
            default:
                throw new Error(`알 수 없는 장르: ${play.type}`);
        }

        // 포인트 적립
        volumeCredits += Math.max(perf.audience - 30, 0);
        // 희극 관객 5명당 추가 포인트 제공
        if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

        // 청구 내역 출력
        result += `  ${play.name}: ${format(thisAmount / 100)} (${perf.audience} 석)\n`;
        totalAmount += thisAmount;
    }
    result += `총액: ${format(totalAmount / 100)}\n`;
    result += `적립 포인트: ${volumeCredits} 점\n`;
    return result;
}

// 출력
// 청구내역 (고객명: BigCo)
//   Hamlet: $650.00 (55석))
//   ...
// 총액: $1,730.00
// 적립 포인트: 47점
```

- 공연료 청구서를 출력하는 함수

## 1.2 예시를 본 소감

- 책에서는 한계로 인해 위와 같이 짧은 예시를 위주로 다룰 것
- 프로그램이 잘 동작할 때는 코드가 ‘지저분하다’는 것은 컴파일러 입장에서는 불필요한 부분
- 하지만, 설계가 나쁜 코드는 수정하기 어려움

> 프로그램이 새로운 기능을 추가하기에 편한 구조가 아니라면,
> 먼저 기능을 추가하기 쉬운 형태로 리팩터링하고 나서 원하는 기능을 추가

- 위의 코드에서 추가 수정할 부분을 발견
    - 출력 청구 내역을 HTML로 출력하는 기능
    - 더 많은 장르를 추가하고 싶음, 지금의 구조에서는 단순하게 추가하는것이 쉽지 않음

## 1.3 리팩터링의 첫 단계

- 리팩터링의 첫 단계는, 리팩터링할 코드 영역을 꼼꼼하게 검사해줄 테스트 코드 마련하는 것
    - 리팩터링에서 테스트의 역할은 매우 중요
    - 프로그램이 클수록 수정 과정에서 예상치 못한 문제 발생 가능성이 큼
- `statement()`함수의 테스트
    - 함수가 문자열을 반환하므로, 다양한 장르의 청구서를 준비한 뒤, 반환하는 문자열과 비교

## 1.4 statement() 함수 쪼개기

- `statement()`처럼 긴 함수를 리팩터링 할 때 전체 동작에서 나눌 수 있는 지점을 찾아야 함
    - 우선 중간의 `switch`문을 고려할 수 있음 → `amountFor(aPerformance)`와 같은 이름으로 사용 가능 할 것
    - `switch`문은 공연 요금에 대한 계산을 하는데, 휘발성 높은 정보를 빠르게 반영한 결과
    - **함수 추출하기(6.1)**: 코드 조각을 별도 함수로 추출하여 코드에 반영
- 함수를 추출했을 때, 새 함수에 바로 사용할 수 있는 변수, 바로 사용할 수 없는 변수를 확인
    - `perf`, `play` : 새 함수에서도 필요하지만, 값을 변경하지 않기 때문에 매개변수로 전달 가능
    - `thisAmount` : 함수 안에서 값이 바뀌는데, 이런 변수는 조심해야 함

```js
function (invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    const format = new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }
        ).format;

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = amountFor(perf, play); // ← 추출한 함수 이용
        // 포인트 적립
        volumeCredits += Math.max(perf.audience - 30, 0);
        // 희극 관객 5명당 추가 포인트 제공
        if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

        // 청구 내역 출력
        result += `  ${play.name}: ${format(thisAmount / 100)} (${perf.audience} 석)\n`;
        totalAmount += thisAmount;
    }
    result += `총액: ${format(totalAmount / 100)}\n`;
    result += `적립 포인트: ${volumeCredits} 점\n`;
    return result;
}

function amountFor(perf, play) {
    let thisAmount = 0
    switch (play.type) {
        case "tragedy":
            thisAmount = 40000;
            if (perf.audience > 30) {
                thisAmount += 1000 * (perf.audience - 30);
            }
            break;
        case "comedy":
            thisAmount = 30000;
            if (perf.audience > 20) {
                thisAmount += 10000 + 500 * (perf.audience - 20);
            }
            thisAmount += 300 * perf.audience;
            break;
        default:
            throw new Error(`알 수 없는 장르: ${play.type}`);
    }
    return thisAmount
}
```

- 위와 같이 수정하면, 테스트를 실행해 실수한 게 없는지 확인
    - 아무리 같단한 수정이라도, 리팩토링 후에는 테스트하는 습관을 가지는 것이 중요함
    - 리팩터링은 작은 단위로 나누어 진행해야, 실수하더라도 버그를 쉽게 찾을 수 있음
    - 수정을 진행하면, 테스트한 후 git commit 등을 활용해 기록해가는 것이 좋다
- 위와 같은 **함수 추출하기(6.1)** 은 IDE에서 자동으로 수행해주는 경우가 많음

```js
function amountFor(aPerformance, play) {
    let result = 0
    switch (play.type) {
    case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
            result += 1000 * (aPerformance.audience - 30);
        }
        break;
    case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
            result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * perf.audience;
        break;
    default:
        throw new Error(`알 수 없는 장르: ${play.type}`);
    }
    return result
}
```

- 위와같은 수정을 한 후, 변수 이름을 더 명확하게 변경하는 작업을 수행해 줄 수 있음
    - 가령 `thisAmount`와 같은 변수를 사용하여 반환했는데, `result`와 같이 반환하는 값이라는 의미를 담고 있는게 더 좋을 수 있음
    - 또한, 매개변수의 이름도 명확한 이름을 가지는 것이 좋음
        - `perf`와 같은 이름 대신, `aPerformance`와 같은 이름을 줄 수 있음
        - 특정 이름의 약어 대신, 명확한 이름을 사용하고
        - 매개변수의 역할이나 의미에 따라 명확하게 표현, 때로는 부정관사를 활용하여 표현할 수 있음

```js
function (invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    const format = new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }
        ).format;

    for (let perf of invoice.performances) {
        // const play = playFor(perf) // ← 1. 우변을 함수로 추출
        // let thisAmount = amountFor(perf, play);
        // let thisAmount = amountFor(perf, playFor(perf)) // ← 2. 변수 인라인
        // let thisAmount = amountFor(perf) // ← 3. 변수 인라인으로 매개변수 제거

        // 포인트 적립
        volumeCredits += Math.max(perf.audience - 30, 0);
        // 희극 관객 5명당 추가 포인트 제공
        if ("comedy" === playFor(perf).type) volumeCredits += Math.floor(perf.audience / 5);

        // 청구 내역 출력
        // result += `  ${playFor(perf).name}: ${format(thisAmount / 100)} (${perf.audience} 석)\n`;
        result += `  ${playFor(perf).name}: ${format(amountFor(perf) / 100)} (${perf.audience} 석)\n`; // ← 4. 추가적으로 변수 인라인
        totalAmount += thisAmount;
    }
    result += `총액: ${format(totalAmount / 100)}\n`;
    result += `적립 포인트: ${volumeCredits} 점\n`;
    return result;
}

function playFor(aPerformance) {
    return plays[aPerformance.playId]
}

// function amountFor(aPerformance, play) {
function amountFor(aPerformance) { // ← 3. 변수 인라인으로 매개변수 제거
    let result = 0
    switch (playFor(aPerformance).type) {
        case "tragedy":
            result = 40000;
            if (aPerformance.audience > 30) {
                result += 1000 * (aPerformance.audience - 30);
            }
            break;
        case "comedy":
            result = 30000;
            if (aPerformance.audience > 20) {
                result += 10000 + 500 * (aPerformance.audience - 20);
            }
            result += 300 * perf.audience;
            break;
        default:
            throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }
    return result
}
```

- `play`라는 변수는 매개변수로 전달할 필요가 없는 변수
    - **임시 변수를 질의 함수로 바꾸기(7.4)** : 대임문의 우변을 함수로 추출
- **변수 인라인(6.4)** : 추출한 변수를 인라인에서 바로 적용할 수 있도록 함
    - 변수 인라인을 통해 `amountFor()` 함수 선언 바꾸기에서 play 매개변수를 제거할 수 있음
- 리팩토링 한 후,
    - 이전에는 루프를 돌 때마다 공연을 조회하는데, 변경후에는 세 번이나 조회하게 됨
    - 이러한 변화는 성능에 큰 영향이 없고, 느려진다 하더라도 리팩터링된 코드는 이전의 코드보다 성능 개선이 쉬워짐
    - 지역 변수를 제거해서 얻는 가장 큰 장점은 추출작업이 쉬워짐

```js
function (invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    const format = new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }
        ).format;

    for (let perf of invoice.performances) {
        volumeCredits += volumeCreditsFor(perf) // ← 새롭게 추출한 함수를 사용하여 값을 누적

        // 청구 내역 출력
        result += `${playFor(perf).name}: ${format(amountFor(perf) / 100)} (${perf.audience} 석)\n`;
        totalAmount += thisAmount;
    }
    result += `총액: ${format(totalAmount / 100)}\n`;
    result += `적립 포인트: ${volumeCredits} 점\n`;
    return result;
}

function volumeCreditsFor(aPerformance) { // ← 새롭게 추출한 함수
    let volumeCredits = 0
    volumeCredits += Math.max(aPerformance.audience - 30, 0)
    if ("comedy" === playFor(aPerformance).type) {
        volumeCredits += Math.floor(aPerformance.audience / 5)
    }
    return volumeCredits
}

function playFor(aPerformance) {
    return plays[aPerformance.playId]
}

function amountFor(aPerformance) {
    let result = 0
    switch (playFor(aPerformance).type) {
    case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
            result += 1000 * (aPerformance.audience - 30);
        }
        break;
    case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
            result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * perf.audience;
        break;
    default:
        throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }
    return result
}
```

- 적립 포인트 계산 코드 추출
    - `perf`는 간단히 전달만 하면 되지만,
    - `volumeCredits`는 반복문을 돌 때마다 값을 누적해야해서 조금 더 까다로움

```js
function (invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    for (let perf of invoice.performances) {
        volumeCredits += volumeCreditsFor(perf)

        // 청구 내역 출력
        // result += `${playFor(perf).name}: ${usd(amountFor(perf) / 100)} (${perf.audience} 석)\n`;
        result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience} 석)\n`; // ← 2. 함수 이름 변경
        totalAmount += thisAmount;
    }
    // result += `총액: ${format(totalAmount / 100)}\n`; // ← 1. 임시 변수였던 format을 함수 호출로 대체
    result += `총액: ${usd(totalAmount)}\n`; // ← 2. 함수 이름 변경
    result += `적립 포인트: ${volumeCredits} 점\n`;
    return result;
}

//function format(aNumber) { // ← 1. 새롭게 추출한 함수
function usd(aNumber) { // ← 2. 함수 이름 변경
    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }.format(aNumber/100) // ← 2. 단위 로직도 함수 안으로 이동
    )
}

function volumeCreditsFor(aPerformance) { 
    let volumeCredits = 0
    volumeCredits += Math.max(aPerformance.audience - 30, 0)
    if ("comedy" === playFor(aPerformance).type) {
        volumeCredits += Math.floor(aPerformance.audience / 5)
    }
    return volumeCredits
}

function playFor(aPerformance) {
    return plays[aPerformance.playId]
}

function amountFor(aPerformance) {
    let result = 0
    switch (playFor(aPerformance).type) {
    case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
            result += 1000 * (aPerformance.audience - 30);
        }
        break;
    case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
            result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * perf.audience;
        break;
    default:
        throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }
    return result
}
```

- 임시 변수를 제거하는 리팩토링
    - `format`과 같은 임시변수는 문제를 일으킬 수 있음
    - `format`은 임시 변수에 함수를 대입한 형태로, 함수 직접 선언으로 변경할 수 있음
- 하지만 `format`이라는 이름은 함수의 역할을 충분히 설명하기 어려움
    - 함수의 핵심 역할은 화폐 단위를 맞추는 것
    - **함수 선언 바꾸기(6.5)** 를 적용

```js
function (invoice, plays) {
    // let totalAmount = 0; // ← 5
    // let volumeCredits = 0; // ← 2. 변수 선언을 반복문 앞으로 이동
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    for (let perf of invoice.performances) {
        // volumeCredits += volumeCreditsFor(perf) // ← 1. 값을 누적하는 부분을 별도 for문으로 분리

        // 청구 내역 출력
        result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience} 석)\n`;
        // totalAmount += thisAmount; // ← 5
    }
    // let volumeCredits = 0; // ← 2. 변수 선언을 반복문 앞으로 이동
    // for (let perf of invoice.performances) { // ← 1. 값을 누적하는 부분을 별도 for문으로 분리
    //     volumeCredits += volumeCreditsFor(perf)
    // }
    // let volumeCredits = totalVolumeCredits() // ← 3. 함수로 추출

    // let totalAmount = appleSauce() // ← 5. 함수로 추출

    //result += `총액: ${usd(totalAmount)}\n`;
    result += `총액: ${usd(totalAmount())}\n`; // ← 6. 변수 인라인 하기

    // result += `적립 포인트: ${volumeCredits} 점\n`;
    result += `적립 포인트: ${totalVolumeCredits()} 점\n`; // ← 4. 변수 인라인
    
    return result;
}

// function appleSauce() { // ← 5. 함수로 추출
function totalAmount() { // ← 6. 함수 이름 바꾸기
    // let totalAmount = 0
    let result = 0 // ← 7. 적절한 변수 이름 바꾸기
    for (ler perf of invoice.performances) {
        // totalAmount += amountFor(perf)
        result += amountFor(perf)
    }
    // return totalAmount
    return result
}

function totalVolumeCredits() { // ← 3. 함수로 추출
    // let volumeCredits = 0
    let result = 0
    for (ler perf of invoice.performances) {
        // volumeCredits += volumeCreditsFor(perf)
        result += volumeCreditsFor(perf)
    }
    // return volumeCredits
    return result
}

function usd(aNumber) {
    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }.format(aNumber/100)
    )
}

function volumeCreditsFor(aPerformance) { 
    let volumeCredits = 0
    volumeCredits += Math.max(aPerformance.audience - 30, 0)
    if ("comedy" === playFor(aPerformance).type) {
        volumeCredits += Math.floor(aPerformance.audience / 5)
    }
    return volumeCredits
}

function playFor(aPerformance) {
    return plays[aPerformance.playId]
}

function amountFor(aPerformance) {
    let result = 0
    switch (playFor(aPerformance).type) {
    case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
            result += 1000 * (aPerformance.audience - 30);
        }
        break;
    case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
            result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * perf.audience;
        break;
    default:
        throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }
    return result
}
```

- 다음 살펴볼 변수는 `volumeCredits`
    - 반복문을 실행할 때마다 값을 누적하기 때문에 리팩터링이 까다로움
    - **반복문 쪼개기(8.7)** 을 적용하여 값이 누적되는 부분을 추출
- **문장 슬라이드하기(8.6)** 을 적용하여 `volumeCredits`변수를 선언하는 문장을 반복문 앞으로 이동
- `volumeCredits`값 갱신과 관련한 문장을 한 데 모아두면 **임시 변수를 질의 함수로 바꾸기(7.4)** 가 수월해짐
    - 이 후, **함수로 추출(6.1)** 진행
- 위의 작업을 진행하고, 작업 과정을 한 번 더 생각해보면
    - 추가적인 반복문들이 생겨 성능이 느려지는 고민이 생길 수 있음
    - 하지만, 
        - 이정도 중복은 영향이 미미할 때가 많고, 
        - 경험 많은 프로그래머도 실제 성능을 정확히 예측하기 힘들며,
        - 똑똑한 컴파일러들은 최신 캐싱 기법 등으로 직관을 초월하는 결과를 만들어냄
    - “대체로 그렇다”와 “항상 그렇다”는 다르지만 (성능 영향이 미미할지, 아닐지)
        - 잘 다듬어진 코드여야 성능 개선 작업도 수월함
- `volumeCredits`와 같은 과정으로 `totalAmount`도 제거
    - 함수 이름도 `totalAmount`가 적절하지만, 이미 있기 대문에 임시 이름인 `appleSauce` 사용
    - 이후 변수를 인라인하여 중복 이름을 제거한다면, 함수 이름으로 `totalAmount` 사용 가능

## 1.5 중간 점검: 난무하는 중첩함수

```js
function (invoice, plays) {
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    for (let perf of invoice.performances) {
        result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience} 석)\n`;
    }
    result += `총액: ${usd(totalAmount())}\n`;
    result += `적립 포인트: ${totalVolumeCredits()} 점\n`;
    return result;

    function totalAmount() {
        let result = 0
        for (ler perf of invoice.performances) {
            result += amountFor(perf)
        }
        return result
    }
    
    function totalVolumeCredits() {
        let result = 0
        for (ler perf of invoice.performances) {
            result += volumeCreditsFor(perf)
        }
        return result
    }
    
    function usd(aNumber) {
        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }.format(aNumber/100)
        )
    }
    
    function volumeCreditsFor(aPerformance) { 
        let volumeCredits = 0
        volumeCredits += Math.max(aPerformance.audience - 30, 0)
        if ("comedy" === playFor(aPerformance).type) {
            volumeCredits += Math.floor(aPerformance.audience / 5)
        }
        return volumeCredits
    }
    
    function playFor(aPerformance) {
        return plays[aPerformance.playId]
    }
    
    function amountFor(aPerformance) {
        let result = 0
        switch (playFor(aPerformance).type) {
        case "tragedy":
            result = 40000;
            if (aPerformance.audience > 30) {
                result += 1000 * (aPerformance.audience - 30);
            }
            break;
        case "comedy":
            result = 30000;
            if (aPerformance.audience > 20) {
                result += 10000 + 500 * (aPerformance.audience - 20);
            }
            result += 300 * perf.audience;
            break;
        default:
            throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
        }
        return result
    }
}
```

- 위의 과정을 통해 최상위 `statement()`함수는 일곱 줄이며, 계산 로직은 여러 개의 보조 함수로 추출함

## 1.6 계산 단계와 포맷팅 단계 분리

```js
function statement(invoice, plays) {
    return renderPlainText(invoice, plays)
}

function renderPlainText(invoice, plays) {
    let result = `청구 내역 (고객명: ${invoice.customer})\n`;
    for (let perf of invoice.performances) {
        result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience} 석)\n`;
    }
    result += `총액: ${usd(totalAmount())}\n`;
    result += `적립 포인트: ${totalVolumeCredits()} 점\n`;
    return result;

    function totalAmount() {...}
    function totalVolumeCredits() {...}
    function usd(aNumber) {...}
    function volumeCreditsFor(aPerformance) {...}
    function playFor(aPerformance) {...}
    function amountFor(aPerformance) {...}
}
```

- 코드 개선이 되었으니, HTML을 만드는 작업을 수행해야 함
- HTML을 만드는 코드도 위에서 추출한 함수들을 그대로 사용할 것으로 보임
- **단계 쪼개기(6.11)** : `statement()`의 로직을 두 단계로 분리
    - statement에서 필요한 테이터 처리, HTML 표현
    - 단계 쪼개기를 하기 위해서 **함수 추출하기(6.1)** 적용

```js
function statement(invoice, plays) {
    const statementData = {}
    statementData.customer = invoice.customer // ← 고객 데이터
    statementData.performances = invoice.performances.map(enrichPerformance) // ← 공연 데이터
    statementData.totalAmount = totalAmount(statementData)
    statementData.totalVolumeCredits = totalVolumeCredits(statementData)
    return renderPlainText(statementData)

    function enrichPerformace(aPerformance) { // renderPlainText에 있던 함수들을 statement 함수로 옮김
        const result = Object.assign({}, aPerformance) // 얕은 복사
        result.play = playFor(result) // 중간 데이터 연극 정보 저장
        result.amount = amountFor(result)
        result.volumeCredits = volumeCreditsFor(result)
        return result
    }

    function playFor(aPerformance) { // renderPalinText에 있던 함수를 이동
        return plays[aPerformance.playID]
    }

    function amountFor(aPerformance) { // PlayFor 분리로 인하여 수정
        let result = 0
        switch (aPerformance.play.type) {
            case "tragedy":
                result = 40000
                if (aPerformance.audience > 30) {
                    result += 1000 * (aPerformance.audience - 30)
                }
                break
            case "comedy":
                result = 30000
                if (aPerformance.audience > 20) {
                    result += 10000 + 500 * (aPerformance.audience - 20)
                }
                result += 300 * aPerformance.audience
                break
            default:
                throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`)
        }
        return result
    }

    function volumeCreditsFor(aPerformance) { // PlayFor 분리로 인하여 수정
        let result = 0
        result += Math.max(aPerformance.audience - 30, 0)
        if ("comedy" === aPerformance.play.type) {
            result += Math.floor(aPerformance.audience / 5)
        }
        return result
    }

    function totalAmount() { // 입력 data 변경으로 수정
        // let result = 0
        // for (let perf of data.performance) {
        //     result += perf.amount
        // }
        // return result
        return data.performances.reduce(
            (total, p) => total + p.amount, 0
        ) // ← 파이프라인 적용
    }

    function totalVolumeCredits() { // 입력 data 변경으로 수정
        // let result = 0
        // for (let perf of data.performace) {
        //     result += perf.volumeCredits
        // }
        // return result
        return data.performances.reduce(
            (total, p) => total + p.volumeCredits, 0
        ) // ← 파이프라인 적용
    }
}

function renderPlainText(data) {
    let result = `청구 내역 (고객명: ${data.customer})\n`
    for (let perf of data.performances) {
        result += `${perf.play.name}: ${usd(perf.amount)} (${perf.audience} 석)\n`;
    }
    result += `총액: ${usd(data.totalAmount)}\n`;
    result += `적립 포인트: ${data.totalVolumeCredits} 점\n`;
    return result;

    function usd(aNumber) {...}
}
```

- `statementData` : 데이터 구조 역할을 할 객체 생성, `renderPlainText()`에 전달
    - 전달할 데이터를 하나씩 추가하여 전달
    - 추가로 생성한 `totalAmount()`, `totalVolumeCredits()` 등의 함수도 데이터 변화에 따라 변경요소가 생길 수 있음
    - 공연 객체를 얕은 복사로 사용, 원본 데이터를 수정하는 대신, 불변 데이터로 다루기 위함
    - 복사를 통한 객체 사용으로 `renderPlainText()`에서 데이터를 불러오고 사용하는 방법이 바뀜
- for문을 추가적으로 **반복문을 파이프라인으로 바꾸기(8.8)** 적용

```js
// statement.js
import createStatementData from "./createStatementData"

function statement(invoice, plays) {
    return renderPlainText(createStatementData(invoice, plays))
}

function renderPlainText(data, plays) {
    let result = `청구 내역 (고객명: ${data.customer})\n`
    for (let perf of data.performances) {
        result += `${perf.play.name}: ${usd(perf.amount)} (${perf.audience} 석)\n`;
    }
    result += `총액: ${usd(totalAmount)}\n`;
    result += `적립 포인트: ${data.totalVolumeCredits} 점\n`;
    return result;
}

function htmlStatment(invoices, plays) {
    return renderHtml(createStatementData(invoice, plays))
}

function renderHtml(data) {
    let result = `<h1>청구 내역 (고객명: ${data.customer}</h1>\n`
    result += "<table>\n"
    result += "<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>"
    for (let pefr of data.performances) {
        result += `<tr><td>${perf.play.name}</td><td>${perf.audience}석</td>`
        result += `<td>${usd(perf.amount)}</td></tr>`
    }
    result += "</table>\n"
    result += `<p>총액: <em>${data.totalAmount}</em></p>` 
    result += `<p>적립 포인트: <em>${data.totalVolumeCredits}점</em></p>`
    return result
}

function usd(aNumber) {...}

// createStatementData.js
export default function createStatementData(invoice, plyas) {
    const statementData = {}
    statementData.customer = invoice.customer
    statementData.performances = invoice.performances.map(enrichPerformance)
    statementData.totalAmount = totalAmount(statementData)
    statementData.totalVolumeCredits = totalVolumeCredits(statementData)
    return statementData

    function enrichPerformace(aPerformance) {...}
    function playFor(aPerformance) {...}
    function amountFor(aPerformance) {...}
    function volumeCreditsFor(aPerformance) {...}
    function totalAmount() {...}
    function totalVolumeCredits() {...}
}
```

- `statementData`를 만드는 부분을 별도의 함수로 분리
    - 그리고 결과적으로 생긴 두 함수는 서로 다른 역할을 하는 것이 명확해지므로, 별개의 파일로 저장
- `statementData`라는 유용한 데이터 구조를 활용할 수 있게 되었으니, 이를 활용해 HTML 결과를 출력하는 함수 생성

## 1.7 중간 점검: 두 파일(과 두 단계)로 분리됨

- 원래 44줄 코드가, 새로 생성한 html관련 코드를 제외하고도 70줄이 넘음
- 추가된 코드는 전체 로직을 구성하는 개별 요소가 뚜렷하게 부각되고, 계산하는 부분과 출력하는 부분이 분리됨
- 각 부분이 모듈화하면 전체 과정을 파악하기 위워짐

## 1.8 다형성을 활용해 계산 코드 재구성하기

- 연극 장르를 추가하고, 공연마다 적립 포인트 계산법을 지정하는 기능 수정
    - `amountFor()`함수에서 연극 장르에 따라 계산이 달라진 것을 알 수 있음
- 조건부 로직을 명확한 구조로 보완하는 방법은 다양하지만,
    - 객체지향의 핵심 특성인 다형성(polymorphism)을 활용하는 것이 자연스러움
    - ECMAScript 2015(ES6) 버전부터 객체 지향을 다룰 수 있는 문법과 구조가 지원
- 새로운 목표는
    - 상속 계층을 구성, 희극 서브 클래스, 비극 서브 클래스가 구각각의 구체적 계산 로직을 정의해야 하고
    - 호출하는 쪽에서는 다형성 버전의 공연료 계산 함수 호출
    - 정확한 로직은 언어 차원에서 처리해줌
    - **조건부 로직을 다형성으로 바꾸기(10.4)**

```js
// createStatement.js
export default function createStatementData(invoice, plyas) {
    const statementData = {}
    statementData.customer = invoice.customer
    statementData.performances = invoice.performances.map(enrichPerformance)
    statementData.totalAmount = totalAmount(statementData)
    statementData.totalVolumeCredits = totalVolumeCredits(statementData)
    return statementData

    function enrichPerformace(aPerformance) {...}
    function playFor(aPerformance) {...}
    function amountFor(aPerformance) {...}
    function volumeCreditsFor(aPerformance) {...}
    function totalAmount() {...}
    function totalVolumeCredits() {...}
}
```

- statement 데이터를만드는 구조는 위와 같은 형태였음
- 각 장르에 맞는 공연료를 계산할 수 있는 계산기를 만드는 것이 목표

```js
// createStatement.js
class PerformanceCalculator { // ← 공연료 계산기 클래스
    constructor(aPerformance, aPlay) {
        this.performance = aPerformance
        this.play = aPlay // ← 함수 선언 바꾸기 적용
    }

    get amount() { // ← amountFor() 함수 코드를 복사
        let result = 0
        switch (aPerformance.play.type) {
            case "tragedy":
                result = 40000
                if (aPerformance.audience > 30) {
                    result += 1000 * (aPerformance.audience - 30)
                }
                break
            case "comedy":
                result = 30000
                if (aPerformance.audience > 20) {
                    result += 10000 + 500 * (aPerformance.audience - 20)
                }
                result += 300 * aPerformance.audience
                break
            default:
                throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`)
        }
        return result
    }

    get volumeCredits() {
        let result = 0
        result += Math.max(this.performance.audience - 30, 0)
        if ("comedy" === this.play.type) {
            result += Math.floor(this.performance.audience / 5)
        }
        return result
    }
}

export default function createStatementData(invoice, plyas) {
    const statementData = {}
    statementData.customer = invoice.customer
    statementData.performances = invoice.performances.map(enrichPerformance)
    statementData.totalAmount = totalAmount(statementData)
    statementData.totalVolumeCredits = totalVolumeCredits(statementData)
    return statementData

    function enrichPerformace(aPerformance) {
        const calculator = new PerformanceCalculator(aPerformance, playFor(aPerformance))
        const result = Object.assign({}, aPerformance)
        result.play = playFor(result)
        // result.amount = amountFor(result)
        result.amount = calculator.amount // ← 계산기의 함수 이용
        // result.volumeCredits = columeCreditsFor(result)
        result.volumeCredits = calculator.volumeCredits
        return result
    }
    function playFor(aPerformance) {...}
    function amountFor(aPerformance) {
        return new PerformanceCalculator(aPerformance, palyFor(aPerformance)).amount
    }
    function volumeCreditsFor(aPerformance) {...}
    function totalAmount() {...}
    function totalVolumeCredits() {...}
}
```

- 공연료 정보를 채우는 `enrichPerformance()`함수를 수정하는게 핵심
- 계산기 역할을 하는 계산기 클래스 `PerformanceCalculator` 생성
    - 클래스 생성자에 **함수 선언 바꾸기(6.5)** 를 적용하여 공연할 연극을 계산기로 전달
- 다음으로 공연료 계산과 관련된 함수를 **함수 옮기기(8.1)** 을 적용하여 단계별로 함수를 옮김

```js
// createStatement.js
function createPerformanceCalculator(aPerformance, aPlay) {
    switch(aPlay.type) {
        case "tragedy": return new TragedyCalculator(aPerformance, aPlay)
        case "comedy": return new ComedyCalculator(aPerformance, aPlay)
        default: throw new Error(`알 수 없는 장르: ${aPlay.type}`)
    }
    return new PerformanceCalculator(aPerformance, aPlay)
}

class PerformanceCalculator {
    get amount() {
        throw new Error("서브클래스에서 처리하도록 설계되었습니다.")
    }
}

class TragedyCalculator extends PerformanceCalculator {
    get amount() {
        let result = 40000
        if (this.performance.audience > 30) {
            result += 1000 * (this.performance.audience - 30)
        }
        return result
    }
}

class ComedyCalculator extends PerformanceCalculator {
    get amount() {
        let result = 30000
        if (this.performance.audience > 20) {
            result += 10000 + 500 * (this.performance.audience - 20)
        }
        result += 300 * this.performance.audience
        return result
    }
}

export default function createStatementData(invoice, plyas) {
    const statementData = {}
    statementData.customer = invoice.customer
    statementData.performances = invoice.performances.map(enrichPerformance)
    statementData.totalAmount = totalAmount(statementData)
    statementData.totalVolumeCredits = totalVolumeCredits(statementData)
    return statementData

    function enrichPerformace(aPerformance) {
        const calculator = createPerformanceCalculator(aPerformance, aPlay) // ← 클래스 생성자 대신 함수 이용
        const result = Object.assign({}, aPerformance)
        result.play = playFor(result)
        result.amount = calculator.amount
        result.volumeCredits = calculator.volumeCredits
        return result
    }
    function playFor(aPerformance) {...}
    function amountFor(aPerformance) {
        return new PerformanceCalculator(aPerformance, palyFor(aPerformance)).amount
    }
    function volumeCreditsFor(aPerformance) {...}
    function totalAmount() {...}
    function totalVolumeCredits() {...}
}
```

- 게산기 클래스에 로직을 담았고, 다형성 지원을 만들어야 됨
    - 타입 코드 대신 서브 클래스를 사용하도록, **타입 코드를 서브 클래스로 바꾸기(12.6)**
    - 딱 맞는 서브클래스를 사용하려면 생성자 대신 함수를 호출하도록 해야하므로, **생성자를 팩터리 함수로 바꾸기(11.8)**
- 클래스를 직접 생성자로 부르는 대신, 함수로 호출하도록 변경
    - 함수에서는 공연 장르에 따라 해당하는 서브클래스를 생성하여 반환하도록 변경
- `amount()` 함수를 각 서브클래스마다 오버라이드 할 수 있음
    - 그 때, 부모 클래스에서는 사용하지 못하도록 에러를 발생시킬 수 있음

## 1.9 상태 점검: 다형성을 이용하여 데이터 생성하기

- 구조를 보강하면서 코드가 늘어남
- 이번 수정에서는, 연극 장르별 코드를 묶어, 새로운 장르를 추가한다면 클래스 생성함수에 추가하는 방식으로 해결할 수 있음

## 1.10

- **함수 추출하기(6.1)**, **변수 인라인하기(6.4)**, **함수 옮기기(8.1)**, **조건부 로직을 다형성으로 바꾸기(10.4)** 등 을 적용했음
- 리팩터링은 크게 세 단계로 진행
    - 원본 함수를 중첩 함수 여러개로 나눔
    - **단계 쪼개개(6.11)** 을 적용, 계산 코드와 출력 코드 분리
    - 계산 로직을 다형성으로 표현
- 리팩터링은 대부분 코드가 하는 일을 파악하는데서 시작
- 이 책은 코드를 개선하는 방법을 다룸
    - 프로그래머 사이에서 좋은 코드에 대한 의견은 분분한데, 저자는 “적절한 이름의 작은 함수들”로 만드는 방식을 선호
    - 또한 취향을 넘어 “수정하기 쉬운 정도”가 좋은 코드를 가능하는 방법이라 생각
- 1장의 예시를 통해 볼 수 있는 점은, 리팩터링하는 리듬
    - 문서에는 생각했지만, 각 과정에서 리팩터링-컴파일-테스트-커밋의 과정을 명시하고 있었음
    - 리팩터링의 핵심은 코드를 개선하면서도 코드가 깨지지 않도록 하는 것
