# 정규화(Normalization)

### 정규화란

- 데이터베이스의 테이블 설계를 재구성하는 것이다.

- 불필요한 데이터나 중복 데이터를 제거하여 무결성(Integrity)을 유지하고 DB의 저장공간을 관리
- 삽입/갱신/삭제 시 발생할 수 있는 각종 이상현상들을 방지할 수 있다.



### 정규화의 필요성

| S_id | S_Name | S_Address | Subject_opted |
| ---- | ------ | --------- | ------------- |
| 401  | Adam   | Noida     | Bio           |
| 402  | Alex   | Panipat   | Maths         |
| 403  | Stuart | Jammu     | Maths         |
| 404  | Adam   | Noida     | Physics       |

위와 같이 정규화 되지 않은 구조의 테이블의 경우, 데이터 핸들링 시 다앙한 이상 현상 발생

1. Update : Adam의 주소가 변경되었을 경우 여러 줄의 데이터 갱신 필요 → 데이터의 불일치 발생 가능
2. Insert : 만약 아무과목도 수강하지 않는 학생이 있다면 NULL 값이 들어감
3. Delete : Alex가 과목 수강 신청을 취소하면 Alex의 레코드가 테이블에서 아예 지워짐



정규화를 통해 **테이블의 구성을 논리적으로 변경**하여 해결할 수 있음



어떻게 테이블을 분해하는 지에 따라 정규화 단계가 달라지며, 제 1정규화, 제 2정규화, 제 3정규화, BCNF, 4차 정규화, 5차 정규화로 나뉘나 4, 5차까지 하는 경우는 많지 않음



## 1차 정규화 (1NF)

- 각 row 마다 column의 값이 1개씩만 존재해야함
- 즉, 컬럼이 **원자값(Atomic Value)**을 가짐

| Student | Age  | Subject        |
| ------- | ---- | -------------- |
| Adam    | 15   | Biology, Maths |
| Alex    | 14   | Maths          |
| Stuart  | 17   | Maths          |

Adam의 Subject가 두 개의 값을 가지기 때문에 1차 정규형을 만족하지 못함

| Student | Age  | Subject |
| ------- | ---- | ------- |
| Adam    | 15   | Biology |
| Adam    | 15   | Maths   |
| Alex    | 14   | Maths   |
| Stuart  | 17   | Maths   |

1차 정규화를 진행한 테이블의 모습

데이터가 중복되었지만, 논리적 구성을 위해 희생



## 2차 정규화 (2NF)

- 본격적인 정규화의 시작
- 기본키중에 특정 컬럼에만 종속된 컬럼(부분적 종속)이 없어야 함
- 테이블의 모든 컬럼이 **완전 함수적 종속** 

| Student | Age  | Subject |
| ------- | ---- | ------- |
| Adam    | 15   | Biology |
| Adam    | 15   | Maths   |
| Alex    | 14   | Maths   |
| Stuart  | 17   | Maths   |

위의 표에서 기본키는 (Student, Subject)로 볼 수 있음 (이 두 개가 합쳐져야 한 row를 구분 가능)

그러나 Age의 경우 이 기본키에서 Student에만 종속 (부분적 종속)  → Age가 두번 들어가는 것은 불필요

#### Student Table

| Student | Age  |
| ------- | ---- |
| Adam    | 15   |
| Alex    | 14   |
| Stuart  | 17   |

#### Subject Table

| Student | Subject |
| ------- | ------- |
| Adam    | Biology |
| Adam    | Math    |
| Alex    | Math    |
| Stuart  | Math    |

이를 해결하기 위해 테이블을 쪼개면 두 테이블 모두 2차 정규형을 만족하게 됨



## 3차 정규화 (3NF)

- 3차 정규형은 **기본키를 제외한 속성들 간의 이행적 함수 종속(A→B, B→C 일때 A→C가 성립)이 없는 것**

| Student_id | Student_name | DOB  | Street | city | State | ZIP  |
| ---------- | ------------ | ---- | ------ | ---- | ----- | ---- |

위와 같은 데이터 구성에서 Student_id가 기본키고, 기본키가 하나이므로 2차 정규형은 만족

그러나 해당 데이터의 Zip 컬럼을 알면 Street, City, State를 결정할 수 있음

기본키 이외의 다른 칼럼이 그 외 다른 칼럼이 결정할 수 없도록 하는 것이 3차 정규화

#### New Student_Detail Table

| Student_id | Student_name | DOB  | ZIP  |
| ---------- | ------------ | ---- | ---- |

#### Address Table

| ZIP  | Street | city | state |
| ---- | ------ | ---- | ----- |

이를 해결하기 위해 역시 테이블을 나눔

데이터가 논리적 단위(학생, 주소)로 분리될 수 있고 데이터의 중복도 줄어듦



## BCNF

- 3차 정규형을 조금더 강화한 버전으로, 모든 결정자가 후보키 집합에 속함

| 학생 | 과목           | 교수   |
| ---- | -------------- | ------ |
| A    | 데이터베이스   | 박교수 |
| B    | 컴퓨터공학개론 | 김교수 |
| C    | 데이터베이스   | 박교수 |
| B    | 가상현실       | 홍교수 |

위에서 후보키는 (학생, 과목)

그러나 한 교수가 하나의 과목만 강의한다고 가정했을 때, 교수가 정해지면 과목이 결정되므로 교수가 결정자가 됨 → 교수가 후보키가 아니므로 BCNF 만족하지 않음 (일반 컬럼이 후보키를 결정)



#### 교수 테이블

| 교수   | 과목           |
| ------ | -------------- |
| 박교수 | 데이터베이스   |
| 김교수 | 컴퓨터공학개론 |
| 홍교수 | 가상현실       |

#### 수강테이블

| 학생 | 과목           |
| ---- | -------------- |
| A    | 데이터베이스   |
| B    | 컴퓨터공학개론 |
| C    | 데이터베이스   |
| B    | 가상현실       |

이를 해결하기 위해 테이블을 나눔



### 제4, 5 정규형

- 제 4 정규형 : 다치 종속 제거
- 제 5 정규형 : 조인 종속성 제거





#### 참고

https://mangkyu.tistory.com/110

https://3months.tistory.com/193