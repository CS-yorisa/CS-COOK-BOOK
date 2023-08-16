[TOC]

# Chapter 16. 타임라인 사이에 자원 공유하기

> 자원을 안전하게 공유하기 위한 **동시성 기본형**이라는 재사용 가능한 코드를 만드는 방법

- **좋은 타임라인의 원칙**
  1. 타임라인은 적을수록 이해하기 쉬움
  2. 타임라인은 짧을수록 이해하기 쉬움
  3. 공유하는 자원이 적을수록 이해하기 쉬움
  4. <u>자원을 공유한다면 서로 조율해야 함</u> → 이번 장에서 다룰 내용
  5. 시간을 일급으로 다룸

<br>

## DOM 의 업데이트 순서 보장

> 장바구니 기능은 **DOM 자원의 업데이트를 공유**하기 때문에 버그가 남아있음

- 타임라인으로 순서를 보장할 방법은 없음 → <u>업데이트 순서를 제한</u>해야 함 (클릭한 순서대로 DOM 업데이트)
  - **큐(queue)** 를 만들어 공유되는 자원을 안전하게 관리할 수 있음
  - 자바스크립트의 스레드 모델에서는 <u>큐에 동시에 추가하는 것이 불가능</u>하기 때문에 순서가 안전하게 보장됨

### 자바스크립트에서 큐 만들기

> 큐는 자료 구조지만 타임라인 조율에 사용한다면 **동시성 기본형**이라 부름
>
> **동시성 기본형(concurrency primitive)** : 자원을 안전하게 공유할 수 있는 재사용 가능한 코드

- 자바스크립트에는 큐 자료 구조가 없기 때문에 직접 만들어야 함

```js
// 현재 코드
function add_item_to_cart(item) {
    cart = add_item(cart, item);
    calc_cart_total(cart, update_total_dom);
}
function calc_cart_total(cart, callback) {
    var total = 0;
    cost_ajax(cart, function(cost) {
        total += cost;
        shipping_ajax(cart, function(shipping) {
            total += shipping;
            callback(total);
        });
    });
}

// 새로운 코드
function add_item_to_cart(item) {
    cart = add_item(cart, item);
    update_total_queue(cart);  // 큐에 항목을 추가
}
function calc_cart_total(cart, callback) {
    var total = 0;
    cost_ajax(cart, function(cost) {
        total += cost;
        shipping_ajax(cart, function(shipping) {
            total += shipping;
            callback(total);
        });
    });
}

// 큐의 기본적인 구현
var queue_items = [];

function update_total_queue(cart) {
    queue_items.push(cart);
}
```

- 큐에 있는 첫 번째 항목을 실행

```js
var queue_items = [];

// 배열의 첫 번째 항목을 꺼내 cart 에 넣음
function runNext() {
    var cart = queue_items.shift();
    calc_cart_total(cart, update_total_dom);
}
function update_total_queue(cart) {
    queue_items.push(cart);
    setTimeout(runNext, 0);  // setTimeout()은 자바스크립트 이벤트 루프에 작업을 추가함
}
```

> 아직 동시에 두 항목이 처리되는 것을 막는 코드가 없음

- 두 번째 타임라인이 첫 번째 타임라인과 동시에 실행되는 것을 막기

```js
var queue_items = [];
var working = false;  // 동작하고 있는 다른 작업이 있는지 여부

function runNext() {
    // 동시에 두 개가 동작하는 것을 막음
    if (working) {
        return;
    }
    working = true;
    var cart = queue_items.shift();
    calc_cart_total(cart, function(total) {
        update_total_dom(total);
        // 작업 완료 후 다음 작업 시작
        working = false;
        runNext();
    });
}
function update_total_queue(cart) {
    queue_items.push(cart);
    setTimeout(runNext, 0);
}
```

- 항목이 없을 때 멈추게 하기

```js
var queue_items = [];
var working = false;

function runNext() {
    if (working) {
        return;
    }
    // 큐에 항목이 없을 경우 실행을 멈춤
    if (queue_items.length === 0) {
        return;
    }
    working = true;
    var cart = queue_items.shift();
    calc_cart_total(cart, function(total) {
        update_total_dom(total);
        working = false;
        runNext();
    });
}
function update_total_queue(cart) {
    queue_items.push(cart);
    setTimeout(runNext, 0);
}
```

- 변수와 함수를 함수 범위로 넣기 (두 개의 전역변수 변경)

```js
function Queue() {
    // 전역변수를 Queue() 의 지역변수로 변경
    var queue_items = [];
    var working = false;
    
    function runNext() {
        if (working) {
            return;
        }
        if (queue_items.length === 0) {
            return;
        }
        working = true;
        var cart = queue_items.shift();
        calc_cart_total(cart, function(total) {
            update_total_dom(total);
            working = false;
            runNext();
        });
    }
    
    // 큐에 항목을 넣을 수 있는 함수를 리턴
    return function(cart) {
        queue_items.push(cart);
        setTimeout(runNext, 0);
    }
}

var update_total_queue = Queue();
```

### 큐를 재사용할 수 있도록 만들기

- done() 함수 빼내기

```js
function Queue() {
    var queue_items = [];
    var working = false;
    
    function runNext() {
        if (working) {
            return;
        }
        if (queue_items.length === 0) {
            return;
        }
        working = true;
        var cart = queue_items.shift();
        // done() 을 콜백 함수로 전달
        function worker(cart, done) {
            calc_cart_total(cart, function(total) {
                update_total_dom(total);
                done(total);
            });
        }
        // 콜백 함수를 선언하며 호출
        worker(cart, function() {
            working = false;
            runNext();
        })
    }
    
    return function(cart) {
        queue_items.push(cart);
        setTimeout(runNext, 0);
    }
}

var update_total_queue = Queue();
```

- worker 행동을 바꿀 수 있도록 Queue 밖으로 빼기

```js
function Queue(worker) {  // worker 를 인자로 추가
    var queue_items = [];
    var working = false;
    
    function runNext() {
        if (working) {
            return;
        }
        if (queue_items.length === 0) {
            return;
        }
        working = true;
        var cart = queue_items.shift();
        worker(cart, function() {
            working = false;
            runNext();
        })
    }
    
    return function(cart) {
        queue_items.push(cart);
        setTimeout(runNext, 0);
    }
}

// worker 를 밖에서 정의하여 Queue 의 인자로 전달 (원하는 행동을 전달)
function calc_cart_worker(cart, done) {
    calc_cart_total(cart, function(total) {
        update_total_dom(total);
        done(total);
    });
}

var update_total_queue = Queue(calc_cart_worker);
```

- 작업이 완료되었을 때 콜백 실행하기

```js
function Queue(worker) {
    var queue_items = [];
    var working = false;
    
    function runNext() {
        if (working) {
            return;
        }
        if (queue_items.length === 0) {
            return;
        }
        working = true;
        // item, val 등 일반적인 이름으로 변경
        var item = queue_items.shift();
        worker(item.data, function(val) {
            working = false;
            setTimeout(item.callback, 0, val);
            runNext();
        })
    }
    
    // 배열에 데이터와 콜백을 모두 넣기
    return function(data, callback) {
        queue_items.push({
        	data: data,
            callback: callback || function(){}
        });
        setTimeout(runNext, 0);
    }
}

function calc_cart_worker(cart, done) {
    calc_cart_total(cart, function(total) {
        update_total_dom(total);
        done(total);
    });
}

var update_total_queue = Queue(calc_cart_worker);
```

### 큐를 건너뛰도록 만들기

> worker 는 각각의 작업이 끝나야 다음으로 진행되기 때문에 느림 → 마지막 작업 외에 **덮어쓸 항목은 큐에서 제외하기**

- 새로운 작업이 들어오면 건너뛸 수 있도록 DroppingQueue 구현

```js
function DroppingQueue(max, worker) {
    var queue_items = [];
    var working = false;
    
    function runNext() {
        if (working) {
            return;
        }
        if (queue_items.length === 0) {
            return;
        }
        working = true;
        var item = queue_items.shift();
        worker(item.data, function(val) {
            working = false;
            setTimeout(item.callback, 0, val);
            runNext();
        })
    }
    
    return function(data, callback) {
        queue_items.push({
        	data: data,
            callback: callback || function(){}
        });
        // 큐에 추가한 후 항목이 max 를 넘으면 버리기
        while (queue_items.length > max) {
            queue_items.shift();
        }
        setTimeout(runNext, 0);
    }
}

function calc_cart_worker(cart, done) {
    calc_cart_total(cart, function(total) {
        update_total_dom(total);
        done(total);
    });
}

// 한 개 이상은 모두 버리기
var update_total_queue = DroppingQueue(1, calc_cart_worker);
```

