# Chapter 18. 반응형 아키텍처와 어니언 아키텍처



![img](https://kooku0.github.io/assets/images/18.1-db64cefa58f76a678cf48a21b257774a.jpg)

- 반응형 아키텍처는 순차적 액션 단계에서 사용
- 어니언 아키텍처는 서비스의 모든 단계에 사용
- 두 패턴은 함께 사용할 수 있지만 따로 사용할 수도 있음



### 반응형 아키텍처

- 코드에 나타난 순차적 액션의 순서를 뒤집음

- 효과와 그 효과에 대한 원인을 분리해서 코드에 복잡하게 꼬인 부분을 풀 수 있음



### 어니언 아키텍처

- 웹 서비스나 온도 조절 장치 같은 현실 세계와 상호작용 하기 위한 서비스 구조를 만듦
- 함수형 사고를 적용한다면 자연스럽게 쓸 수 있는 아키텍처



---



## 반응형 아키텍처

- 한 쪽에 뭔가를 추가하면 다른 쪽에 있는 모든 것을 변경하거나 복제해야 함 (n ✕ m 문제)
- 이를 반응형 아키텍처로 해결 가능



### 반응형 아키텍처란?

- 애플리케이션을 구조화하는 방법
- 반응형 아키텍처의 핵심 원칙은 **이벤트에 대한 반응으로 일어날 일을 지정하는 것**
  - 웹 서비스와 UI에 어울림
  - 웹 서비스는 웹 요청 응답에 일어날 일을 지정하고, UI는 버튼 클릭과 같은 이벤트 응답에 일어날 일을 지정
  - 일반적으로 이를 **이벤트 핸들러** 라고 함



### 반응형 아키텍처의 절충점

- 반응형 아키텍처는 코드에 나타난 순차적 액션의 순서를 뒤집음
  - X를 하고 Y를 하는 대신, X가 일어나면 언제나 Y를 함
  - 코드를 읽기 쉽고 유지보수 하기도 좋음 (언제, 어떻게 사용할 지에 따라 달라짐)

#### 원인과 효과가 결합한 것을 분리한다

- 어떤 경우는 원인과 효과를 분리하면 읽기 어려워짐
- 하지만 코드가 더 유연하고, 하려고 하는 것을 정확히 표현 가능

#### 여러 단계를 파이프라인으로 처리한다

- 함수형 도구를 이용한 파이프라인처럼 반응형 아키텍처로 액션과 계산을 조합할 수 있음

#### 타임라인이 유연해진다

- 순서를 표현하는 방법을 뒤집으면 타임라인이 유연해짐
- 기대하지 않은 실행 순서로 이어질 수도 있으나, 익숙해지면 짧은 타임라인 생성 가능



### 일급 상태의 셀

- 장바구니 예제 돌아보기
  - 전역 상태는 장바구니 뿐
  - 필요한 것은 장바구니가 변경될 때 Y를 하는 것
- 언제 바뀔지 모르는 장바구니의 상태(변경 가능한 값)를 일급 함수로 만들기

``` js
function ValueCell(initialValue){
  var currentValue = initialValue; // 변경 불가능한 값(컬렉션이 될 수 있음)을 하나 담아두기
  return {
    val : function(){ // 현재 값을 가져오기
      return currentValue;
    },
    update : function(f){ // 현재 값에 함수를 적용해 값을 바꾸기(교체 패턴)
      val oldValue = currentValue;
      var newValue = f(oldValue);
      currentValue = newValue;
    }
  };
}
```

- ValueCell에는 값 하나와 두 개의 동작(값 읽기/값 바꾸기)이 있음

``` js
// 원래 코드
var shopping_cart = {};

function add_item_to_cart(name, price){
  var item = make_cart_item(name, price);
  // 읽고 바꾸고 쓰는(교체) 패턴
  shopping_cart = add_item(shopping_cart, item);
  
  var total = calc_total(shopping_cart);
  set_cart_total_dom(total);
  update_shipping_icons(shopping_cart);
  update_tax_dom(total);
}

// 셀을 적용한 코드
var shopping_cart = ValueCell({});

function add_item_to_cart(name, price){
  var item = make_cart_item(name, price);
  // 값을 변경하기 위해 값을 직접 사용하지 않고, 메서드를 호출
  shopping_cart.update(function(cart){
    return add_item(cart, item);
  });
  
  var total = calc_total(shopping_cart.val());
  set_cart_total_dom(total);
  update_shipping_icons(shopping_cart.val());
  update_tax_dom(total);
}
```



### ValueCell을 반응형으로 만들기

- 상태가 바뀔 때 Y를 하도록 감시자(watcher) 개념 추가하기 (* 본문에는 X라고 되어 있음)
- 감시자는 상태가 바뀔 때마다 실행되는 핸들러 함수

``` js
function ValueCell(initialValue){
  var currentValue = initialValue;
  // 감시자 목록을 저장
  var watchers = [];
  return{
    val : function(){
      return currentValue;
    },
    update: function(f){
      var oldValue = currentValue;
      var newValue = f(oldValue);
      // 값이 바뀔 때 모든 감시자를 실행
      if(oldValue !== newValue){
        currentValue = newValue;
        forEach(watchers, function(watcher){
          watcher(newValue);
        });
      }
    },
    // 새로운 감시자를 추가
    addWatcher : function(f){
      watchers.push(f);
    }
  }
}
```

- 감시자로 장바구니가 바뀔 때 할 일을 지정할 수 있음 (장바구니가 바뀔 때 배송 아이콘을 갱신하도록 만들 수 있음)
- 감시자(watcher) = 이벤트 핸들러(event handler) = 옵저버(observer) = 콜백(callback) = 리스너(listner)



### 셀이 바뀔 때 배송 아이콘 갱신하기

``` js
var shopping_cart = ValueCell({});

function add_item_to_cart(name, price){
  var item = make_cart_item(name, price);
  shopping_cart.update(function(cart){
    return add_item(cart, item);
  })
  var total = calc_total(shopping_cart.val());
  set_cart_total_dom(total);
  
  update_tax_dom(total);
}

// 코드를 한 번만 써주면 장바구니가 바뀔 때마다 실행
shopping_cart.addWatcher(update_shpping_icons);
```

- 핸들러 함수가 더 작아짐
- 장바구니를 바꾸는 모든 핸들러에서 `update_shipping_icons()`를 부르지 않아도 장바구니가 바뀌면 항상 실행됨



### FormulaCell로 파생된 값 갱신하기

- total 값은 장바구니에 따라 변하는 값
- 어떤 값이 바뀌면 따라서 바뀌는 파생된 값을 관리하는 기본형 만들기

``` js
function FormulaCell(upstreamCell, f){
  // ValueCell을 재사용
  var myCell = ValueCell(f(upstreamCell.val()));
  // 셀 값을 다시 계산하기 위해서 감시자를 추가
  upstreamCell.addWatcher(function(newUpstreamValue){
    myCell.update(function(currentValue){
      return f(newUpstreamValue);
    });
  });
  return { // val() 과 addWatcher()를 myCell에 위임
    val : myCell.val,
    addWatcher: myCell.addWatcher // FormularCell 값은 직접 바꿀 수 없음
  };
}
```

- FormulaCell은 값을 직접 바꿀 수 없고, 감시하던 상위 셀 값이 바뀌면 이를 바탕으로 FormulaCell 값이 다시 계산되어 바뀜
- 값을 바꾸는 기능은 없으나 감시 가능

``` js
var shopping_cart = ValueCell({});
// shopping_cart 가 바뀔 때 cart_total도 바뀜
var cart_total = FormulaCell(shopping_cart, calc_total);

function add_item_to_cart(name, price){ // 클릭 핸들러는 더 간단해짐
  var item = make_cart_item(name, price);
  shopping_cart.update(function(cart){
    return add_item(cart, item);
  });
}

shopping_cart.addWatcher(update_shipping_icons);
// cart_total 이 바뀌면 DOM이 업데이트 됨
cart_total.addWatcher(set_cart_total_dom);
cart_total.addWatcher(update_tax_dom);
```



### 함수형 프로그래밍과 변경 가능한 상태

- 변경 가능한 상태를 안전하게 관리해야 함
- `update()` 메서드로 현재 값을 항상 올바르게 유지할 수 있음
  - `update()`를 사용할 때 계산을 넘기기 때문
  - 계산은 현재 값을 받아 새로운 값을 리턴
    - 현재 값이 도메인 상에서 올바른 값이고 계산이 항상 올바른 값을 리턴한다면, `update()`도 계속 올바른 값을 유지할 것
    - 다른 타임라인에서 읽거나 쓰는 순서를 보장하지는 않지만 저장되는 값이 올바른 값이라는 것은 보장

- ValueCell을 일관되게 유지하기 위한 안내
  - 올바른 값으로 초기화
  - `update()`에는 계산만을 전달(액션 X)
  - 계산은 올바른 값이 주어졌다면 올바른 값을 리턴해야함



### 반응형 아키텍처가 주는 영향

- **원인과 효과가 결합한 것을 분리**

  - 이전에는 장바구니를 바꾸는 모든 UI 이벤트 핸들러에 같은 코드(배송 아이콘 갱신)를 넣어줘야 함
  - 반응형 아키텍처를 사용하면 어떤 원인에 의해 장바구니가 변경되더라도 배송아이콘 갱신 가능
    - 전역 장바구니 변경 > 배송 아이콘 업데이트 (하나의 함수만 만들면 됨)

- **결합의 분리는 원인과 효과의 중심을 관리**

  - 이전에는 장바구니가 바뀔때 해야할 일을 추가하기 위해 장바구니를 바꾸는 코드를 모두 고쳐야 했음
  - 원인과 효과를 분리하여 관리해야할 것이 늘어나는 문제를 곱셈에서 덧셈으로 바꿀 수 있음
  - 그러나 코드에 액션을 순서대로 표현하는 것이 더 명확할 수 있으므로, 장바구니처럼 원인과 효과의 중심이 없다면 분리하지 않는 게 나음

- **유연해진 타임라인**

  - 반응형 아키텍처도 간단한 액션과 계산을 조합해 복잡한 동작을 만들 수 있고, 이 조합된 액션은 파이프라인과 같음
    - 자바스크립트를 사용한다면 `Promise`로 액션과 계산을 조합해 파이프라인을 구현할 수 있음
  - 여러 단계가 있지만 데이터를 전달하지 않는다면 파이프라인을 사용하지 않는 것이 좋음

  ![img](https://kooku0.github.io/assets/images/18.5-56c4e2d6e39951dba512109f657a35f8.jpg)

  - 순서를 정의하는 방법을 뒤집기 때문에 자연스럽게 타임라인이 작은 부분으로 분리

  ![img](https://kooku0.github.io/assets/images/18.6-f1a21e9bba172fc1bd67cd9aaf265c68.jpg)

  - 타임라인이 서로 다른 자원을 사용하기 때문에 안전함
    - 장바구니 `ValueCell`은 감시자를 호출할 때 현재 값을 넘겨주기 때문에 감시자가 직접 장바구니 값을 읽지 않아도 됨
    - 합계 `FormulaCell` 도 감시자를 호출할 때 현재 값을 넘겨주기 때문에 DOM 갱신 시 직접 값을 읽지 않아도 됨



## 연습문제

- 반응형 아키텍처를 사용할만한 상황인지 판단하기

> 고객에게 변경 사항을 알려주는 알림 시스템 설계
> 약관이 변경되거나 새로운 할인 정보가 있을 때 알려주려고 하며, 추후 다른 정보도 제공 예정
>
> 고객에게 알림을 보낼 때 고객마다 서로 다른 방법으로 알려주어야 함
> 이메일/웹사이트 배너/채팅 메시지 등 다양한 알림 방식 존재
>
> ► 반응형 아키텍처를 사용하기 좋은 상황. 여러 원인(알림 종류)이 있고, 그에 따른 여러 효과(알림 전달 방법)이 있음. 원인과 효과를 분리하기 때문에 할 일을 독립적으로 처리할 수 있다.



> 새로 만든 문서 전송 시스템은 반복적으로 실행하는 매우 직관적인 순차적 단계로 되어 있음.
> 문서를 검증하고, 암호화된 서명을 하고 보관함에 저장한 후 로그를 남김
>
> ► 반응형 아키텍처에 맞지 않음. 원인과 효과의 중심이 없고, 순차적인 단계가 있으며 항상 원인은 하나.
> 직관적인 순차적 액션이 좋음





---



## 어니언 아키텍처

- 반응형 아키텍처보다 더 넓은 범위에 사용
- 서비스 전체를 구성하는데 사용하기 때문에 바깥 세계와 상호작용을 하는 부분을 다룸
- 반응형 아키텍처와 함께 사용하면 반응형 아키텍처가 어니언 아키텍처 안에 들어 있는 것을 볼 수 있지만 서로 의존하지는 않음
- 프랙털로 액션의 모든 추상화 수준에서 찾을 수 있음

<img src="https://private-user-images.githubusercontent.com/37922134/266822273-afff2fd1-75ca-4eae-a718-2f7c9259606f.jpeg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE2OTQzMzIyNzcsIm5iZiI6MTY5NDMzMTk3NywicGF0aCI6Ii8zNzkyMjEzNC8yNjY4MjIyNzMtYWZmZjJmZDEtNzVjYS00ZWFlLWE3MTgtMmY3YzkyNTk2MDZmLmpwZWc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBSVdOSllBWDRDU1ZFSDUzQSUyRjIwMjMwOTEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDIzMDkxMFQwNzQ2MTdaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1iZmIzZjEyNWQ4ZTM1MjRjOTZiMGJiYjk1NzIzMDIwOGRlN2ZjZDgxNDg4ZjIxNTA3OTgzOGQ0ODQ5ZjJlZDU1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9.fWXkh1ngfCYOLJIvD9W9vT3YyPKamd6x319zzkwQxcw" alt="IMG_6026" style="zoom:33%;" />

#### 인터랙션 계층

- 바깥 세상에 영향을 주거나 받는 액션

#### 도메인 계층

- 비즈니스 규칙을 정의하는 계산

#### 언어 계층

- 언어 유틸리티와 라이브러리

#### 함수형 시스템이 잘 동작할 수 있는 중요한 규칙

- 현실 세계와 상호작용은 인터랙션 계층에서 해야 한다
- 계층에서 호출하는 방향은 중심 방향이다
- 계층은 외부에 어떤 계층이 있는지 모른다

> 어니언 아키텍처는 액션과 계산의 분리, 계층형 설계 방식과 잘 맞음
> 액션에서 계산을 빼내면 의도하지 않아도 어니언 아키텍처 구조가 됨



### 전통적 계층형 아키텍처

- 전통적인 아키텍처로 웹 API를 만들 때 계층이라고 하는 개념 사용 (어니언 아키텍처의 계층과는 다름)

#### 웹 인터페이스 계층

- 웹 요청을 도메인으로 바꾸고 도메인을 웹 응답으로 바꿈

#### 도메인 계층

- 애플리케이션 핵심 로직으로 도메인 개념에 DB 쿼리나 명령이 들어감

#### 데이터베이스 계층

- 시간에 따라 바뀌는 정보를 저장



### 함수형 아키텍처

- 함수형 아키텍처는 도메인 계층이 데이터베이스 계층에 의존하지 않음 (데이터베이스 동작은 액션)
- 액션과 계산을 구분하는 선을 그리고, 라이브러리나 언어 기능과 계산을 구분하는 선을 그려 함수형 아키텍처를 표현할 수 있음

![img](https://private-user-images.githubusercontent.com/37922134/266822276-121bf896-2bf5-4be3-921b-dab5411499a9.jpeg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE2OTQzMzIyNzcsIm5iZiI6MTY5NDMzMTk3NywicGF0aCI6Ii8zNzkyMjEzNC8yNjY4MjIyNzYtMTIxYmY4OTYtMmJmNS00YmUzLTkyMWItZGFiNTQxMTQ5OWE5LmpwZWc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBSVdOSllBWDRDU1ZFSDUzQSUyRjIwMjMwOTEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDIzMDkxMFQwNzQ2MTdaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1kYWEwN2FhOTFlZTY5NmY3MjI1NDMwYzAzYjE5YjZlZWFkNmI3Yzk0YWQzYjQwODNlNTg0MjA4MjA5OGZjOWUyJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9.b28xyU8RH9IK7IWIjC4Zl6YdRPEDZQjEY_4HMRUutHo)

- 데이터베이스를 도메인과 분리하는 것이 중요하며, 각 점선 끝을 연결하면 어니언 아키텍처와 같은 모양이 됨
- 데이터베이스는 변경 가능하고, 접근하는 모든 것을 액션으로 만듦
  - 도메인 동작을 포함해 그래프 가장 위에 있는 것까지 모두 액션이 됨

- 어니언 아키텍처는 가장 위에 있는 인터랙션 계층을 쉽게 바꿀 수 있음
  - 도메인이 데이터베이스나 웹 요청 등 외부 서비스에 의존하지 않기 때문
  - 좋은 인프라보다 좋은 도메인

![img](https://private-user-images.githubusercontent.com/37922134/266822283-7ccce885-268e-4b57-840e-f872e2316c9c.jpeg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE2OTQzMzIyNzcsIm5iZiI6MTY5NDMzMTk3NywicGF0aCI6Ii8zNzkyMjEzNC8yNjY4MjIyODMtN2NjY2U4ODUtMjY4ZS00YjU3LTg0MGUtZjg3MmUyMzE2YzljLmpwZWc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBSVdOSllBWDRDU1ZFSDUzQSUyRjIwMjMwOTEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDIzMDkxMFQwNzQ2MTdaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT01ZDY2OWNmNzAzMzIyNDYzYzFkYzJjYWI0NGFmM2JiYjllNzVkZWM1YzMyMjc1ZjJhNDE2ZGVkMDkzZjQ4ZDQwJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9.k_YlLIE7OeSSJvASpdCzBi8i_ASeAtAWX2Udn-YqtKA)

> 전형적인 아키텍처에서 도메인 규칙은 데이터베이스를 부르지만,
> 어니언 아키텍처는 다른 방식으로 처리
>
> 장바구니의 합계를 계산하는 웹 서비스가 있을 때 장바구니 아이디가 123인 경우 /cart/cost/123 주소로 웹 요청을 할 수 있음. 장바구니 아이디로 데이터베이스에서 장바구니를 가져와야 함

![img](https://private-user-images.githubusercontent.com/37922134/266822277-760126b5-59e7-4161-a1b9-ee5e7e582adf.jpeg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE2OTQzMzIyNzcsIm5iZiI6MTY5NDMzMTk3NywicGF0aCI6Ii8zNzkyMjEzNC8yNjY4MjIyNzctNzYwMTI2YjUtNTllNy00MTYxLWExYjktZWU1ZTdlNTgyYWRmLmpwZWc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBSVdOSllBWDRDU1ZFSDUzQSUyRjIwMjMwOTEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDIzMDkxMFQwNzQ2MTdaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02OTJlMTg1ZThlZjBkMGRlOTc5ZWRkNjI0ODA1MTMyYmFjODNjNzJmMDRmNjFiMGMyODkwZjQ0ZDEyZDk2OGZkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9.q--pRHdvYd6-MdhxxoGD2YlBBQwvxu2r0JaMXgnZsds)

- 전통적인 아키텍처
  - 전형적인 아키텍처에서 계층은 순서대로 쌓여있고 웹 요청은 핸들러가 처리
  - 핸들러는 데이터베이스에 접속하고 클라이언트에게 응답하기 위해 가장 높은 웹 계층으로 결과를 리턴
  - 장바구니 합계를 계산하는 도메인 규칙은 데이터베이스에서 합계를 가져와 처리
  - 도메인은 데이터베이스에 접근하기 때문에 계산이 아님

- 어니언 아키텍처
  - 웹서버, 핸들러, 데이터베이스는 인터랙션 계층
  - `cart_total()` 은 제품 가격을 가지고 장바구니 합계를 만드는 계산
  - 핸들러가 데이터베이스에서 장바구니를 가져와 도메인에 전달하는 역할을 해서 계층 구조가 다르지만 같은 일을 할 수 있음
  - 인터랙션 계층에서 값을 가져오고 도메인 계층에서 합산을 함



### 도메인 규칙

- 프로그램의 핵심 로직을 **도메인 규칙** 또는 **비즈니스 규칙**이라고 함
- 어떤 로직이 도메인 규칙인지 판단하기 위해서는 **코드에서 사용하는 용어**를 보면 됨
- 도메인을 항상 계산으로 만들기보다 문맥에 따라 결정
  - 가독성 (사용하는 언어, 코드 스타일, 라이브러리 등), 개발 속도, 시스템 성능 등을 확인



## 연습문제

> 사용자가 책을 대여할 수 있는 공공 도서관 소프트웨어 기능을 보고 어떤 계층인지 답하기
>
> I : 인터랙션 계층, D : 도메인 계층, L : 언어 계층

1. 문자열을 처리하기 위해 불러온 라이브러리 : L
2. 데이터베이스에서 사용자 레코드를 질의하는 루틴 : I
3. 국회 도서관 API를 사용 : I
4. 주제에 따라 책 분류를 결정하는 루틴 : D
5. 주어진 대출 목록에 대한 벌금을 계산하는 루틴 : D
6. 고객의 새로운 주소를 저장하는 루틴 : I
7. Lodash 자바스크립트 라이브러리 : L
8. 도서관 고객에게 대출 화면을 표시하는 루틴 : I
