[TOC]

# Transaction (트랜잭션)

## 트랜잭션이란?

- 더 이상 나눌 수 없는 가장 작은 하나의 단위
- 데이터베이스의 상태를 변화시키기 위해 수행하는 작업 단위
- 여러 쿼리를 논리적으로 하나의 작업으로 묶어주는 것

> 트랜잭션의 예 - 계좌 간의 자금 이체
>
> - 모든 과정이 성공적으로 완료되어야만 '하나의 작업(트랜잭션)'이 완료되는 것

![image](https://user-images.githubusercontent.com/87461672/160243043-5806693f-2862-4fcc-8e31-620857280b5c.png)



- 하나의 트랜잭션은 커밋 혹은 롤백 된다.
  - 커밋 : 일종의 확인 도장으로  트랙잭션으로 묶인 모든 쿼리가 성공되어 트랙잭션 쿼리 결과를 실제 DB에 반영하는 것
  - 롤백 : 쿼리 실행 결과를 취소하고 DB를 트랙잭션 이전 상태로 되돌리는 것



## 트랜잭션 성질 (ACID)

- 트랙잭션이 안전하게 수행된다는 것을 보장하기 위한 성질 4가지
- 원자성 (Atomicity) 
  - 트랙잭션은 DB에 모두 반영되거나, 전혀 반영되지 않아야 한다.
  - 완료되지 않은 트랙잭션의 중간 상태를 DB에 반영해서는 안된다

- 일관성 (Consistency)
  - 트랜잭션 작업처리결과는 항상 일관성 있어야 한다. 데이터 베이스는 항상 일관된 상태로 유지되어야 한다

- 독립성 (Isolation)
  - 둘 이상의 트랜잭션이 동시 실행되고 있을 때, 어떤 트랜잭션도 다른 트랜잭션 연산에 끼어들 수 없다.
  - 각각의 트랜잭션은 서로 간섭 없이 독립적으로 이루어져야 한다.
- 지속성 (Durability)
  - 트랜잭션이 성공적으로 완료되었으면 결과는 영구히 반영되어야 한다.



# 트랜잭션 격리 수준 (Transaction Isolation Level)

- 트랜잭션에서 다른 트랜잭션에 의해 변경된 데이터를 볼수 있게 허용할지 말지에 대한 수준.
- 동시에 DB에 접근할 때 그 접근을 어떻게 제어할지 대한 설정.



## 필요성

- DB는 ACID 특징과 같이 트랜잭션이 독립적인 수행을 하도록 한다.
- 따라서 Locking을 통해, 트랜잭션이 DB를 다루는 동안 다른 트랜잭션이 관여하지 못하도록 막는 것이 필요하다.
- 하지만 무조건 Locking으로 동시에 수행되는 수많은 트랜잭션들을 순서대로 처리하는 방식으로 구현하게 되면 데이터베이스의 성능은 떨어지게 될 것이다.
- 그렇다고 해서, 성능을 높이기 위해 Locking의 범위를 줄인다면, 잘못된 값이 처리될 문제가 발생하게 된다.
  - 따라서 최대한 효율적인 Locking 방법이 필요함!



## Isolation Level 종류

![image](https://user-images.githubusercontent.com/87461672/160270067-75020ab1-6bed-4113-8e8a-f939d729e1a8.png)

### READ-UNCOMMITTED (레벨 0)

> SELECT 문장이 수행되는 동안 해당 데이터에 Shared Lock이 걸리지 않는 계층

- 커밋 전의 트랜잭션의 데이터 변경 내용을 다른 트랜잭션이 읽는 것을 허용

- Dirty Read, Non-Repeatable Read, Phantom Read을 유발하며 데이터 정합성 문제가 많아 RDBMS에선 격리수준으로 인정하지 않을 정도. 일반적으로 거의 사용하지 않는다. 

![image](https://user-images.githubusercontent.com/87461672/160269781-c6e07b89-ce1d-4e9a-9290-5db03894409e.png)

### READ-COMMITTED (레벨 1)

> SELECT 문장이 수행되는 동안 해당 데이터에 Shared Lock이 걸리는 계층

- 커밋이 완료된 트랜잭션의 변경사항만 다른 트랜잭션에서 조회 가능
- 트랜잭션이 이루어지는 동안 다른 사용자는 해당 데이터에 접근이 불가능
- SQL 서버가 Default로 사용하는 Isolation Level임
- Non-Repeatable Read, Phantom Read을 유발

![image](https://user-images.githubusercontent.com/87461672/160269816-9400caa2-6e52-44ba-a320-f8fc4c339423.png)

### REPEATABLE-READ (레벨 2)

> 트랜잭션이 완료될 때까지 SELECT 문장이 사용하는 모든 데이터에 Shared Lock이 걸리는 계층

- 트랜잭션 범위 내에서 조회한 내용이 항상 동일함을 보장
- 다른 사용자는 트랜잭션 영역에 해당되는 데이터에 대한 수정 불가능
- 한번 조회한 데이터는 반복적으로 조회해도 같은 값을 반환
- Phantom Read 유발

![image](https://user-images.githubusercontent.com/87461672/160270437-8bf9de44-95e1-4f0e-85ee-4e244d49b3c8.png)

### SERIALIZABLE (레벨 3)

> 트랜잭션이 완료될 때까지 SELECT 문장이 사용하는 모든 데이터에 Shared Lock이 걸리는 계층

- 한 트랜잭션에서 사용하는 데이터를 다른 트랜잭션에서 접근 불가
- 완벽한 읽기 일관성 모드를 제공함
- 다른 사용자는 트랜잭션 영역에 해당되는 데이터에 대한 수정 및 입력 불가능



|                  | Dirty Read | Non-Repeatable Read | Phantom Read |
| ---------------- | :--------: | :-----------------: | :----------: |
| READ-UNCOMMITTED |     O      |          O          |      O       |
| READ-COMMITTED   |     X      |          O          |      O       |
| REPEATABLE-READ  |     X      |          X          |      O       |
| SERIALIZABLE     |     X      |          X          |      X       |



## 선택 시 고려사항

- Isolation Level에 대한 조정은, 동시성과 데이터 무결성에 연관되어 있음

- 동시성을 증가시키면 데이터 무결성에 문제가 발생하고, 데이터 무결성을 유지하면 동시성이 떨어지게 됨

- 레벨을 높게 조정할 수록 발생하는 비용이 증가함



## 격리 수준이 생긴 이유 (낮은 단계 Isolation Level을 활용할 때 발생하는 현상들)

- Dirty Read
  - 커밋되지 않은 수정중인 데이터를 다른 트랜잭션에서 읽을 수 있도록 허용할 때 발생하는 현상
  - 즉, 어떤 트랜잭션에서 아직 실행이 끝나지 않은 다른 트랜잭션에 의한 변경사항을 보게되는 경우
  - 아래 예시에서 트랜잭션 A가 트랜잭션을 끝마치지 못하고 롤백한다면 트랜잭션 B는 무효가 된 값을 읽고 처리한다.

![image](https://user-images.githubusercontent.com/87461672/160270877-9d2a2d58-2172-4b86-b337-c69396c63323.png)



- Non-Repeatable Read
  - 한 트랜잭션에서 같은 쿼리를 두 번 수행할 때 그 사이에 다른 트랜잭션 값을 수정 또는 삭제하면서 두 쿼리의 결과가 상이하게 나타나는 일관성이 깨진 현상
  - 트랜잭션 중 데이터가 변경되면 문제가 발생할 수 있다.

![image](https://user-images.githubusercontent.com/87461672/160269857-b97dc131-f6da-4cd8-a248-c5933226143b.png)



- Phantom Read
  - Non-Repeatable Read의 한 종류
  - 하나의 트랜잭션에서 일정 범위의 레코드를 두번이상 읽을 때, 똑같은 쿼리임에도 첫번째 쿼리에서 없던 레코드가 두번째 쿼리에서 나타나는 현상
  - 트랜잭션 도중 새로운 레코드 삽입을 허용하기 때문에 나타나는 현상

![image](https://user-images.githubusercontent.com/87461672/160270474-c2344545-f095-4018-94a2-455b9324d472.png)





# 참조

[[10분 테코톡\] 🌼 예지니어스의 트랜잭션 - YouTube](https://www.youtube.com/watch?v=e9PC0sroCzc)

[[10분 테코톡\] 🐤 샐리의 트랜잭션 - YouTube](https://www.youtube.com/watch?v=aX9c7z9l_u8)

[tech-interview-for-developer/Transaction Isolation Level.md at master · gyoogle/tech-interview-for-developer (github.com)](https://github.com/gyoogle/tech-interview-for-developer/blob/master/Computer Science/Database/Transaction Isolation Level.md)

