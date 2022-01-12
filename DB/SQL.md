## SQL
- Structured Query Language
- NoSQL에서 사용하지 않음
    - [SQL vs NoSQL](./SQL%20&%20NoSQL.md)

![MongoDB](https://docs.mongodb.com/images/mdb-vs-sql.png)

- DBMS마다 SQL에 차이가 있을 수 있음
    - ANSI(American National Standards Institute) 에서 표준 SQL을 정의
    - ANSI 표준으로 작성된 SQL은 모든 DBMS에서 호환
    - ORACLE, MySQL에서도 표준을 지키지 않기도 한다고 함, PostgreSQL은 비교적 표준을 잘 지킨다고 함

```SQL
-- ANSI
SELECT Test1.*, Test2.name
FROM Test1 LEFT OUTER JOIN Test2
ON Test1.num = Test2.num
-- ORACLE
SELECT Test1.*, Test2.name
FROM Test1 , Test2
WHERE Test1.num = Test2.num(+)
-- MySQL
SELECT Test1.*, Test2.name
FROM Test1 , Test2
WHERE Test1.num *= Test2.num
```

- SQL은 대소문자를 구분하지 않음
    - 일반적으로 대문자는 키워드, 소문자는 이름, 값, 변수 등을 의미
- PL/SQL : ORACLE이 SQL을 절차적 프로그래밍적으로 확장시킨 언어
    - if, for, 변수 사용 등 가능
    - 검색어 순위는 높아졌지만, 불안정

## 자료형
#### 정수
1. bigint : $-2^63 \sim 2^63-1$, 8바이트
2. int : $-2^31 \sim 2^31-1$, 4바이트
3. smallint : $-2^15 \sim 2^15-1$, 2바이트
4. tinyint : $0 \sim 255$ 

#### 실수
- numeric(=deciaml), float, real

#### 날짜 및 시간
1. date : 0000-01-01 ~ 9999-12-31, 3바이트
2. datetime : 1753-01-01 ~ 9999-12-31, 00:00:00 ~ 23:59:59.997, 8바이트
3. datetime2 : 0000-01-01 ~ 9999-12-31, 00:00:00 ~ 23:59:59.9999999, 7~8바이트
4. datetimeoffset : 표준 시간대를 인식한 24시간 기준 시간과 결합된 날짜, datetime2 + 시간대, 10바이트
5. time : 표준 시간대를 인식하지 않는 24시간 기준 시간, 5바이트

#### 문자열
1. char[n] : 고정길이 문자열 데이터
2. varchar[n|max] : 가변길이 문자열 데이터
3. ntext, text, image

#### 유니코드 문자열
- nchar, nvarchar

#### 이진 문자열
- binary, varbinary, image

## CREATE, ALTER
```SQL
-- 테이블 생성
CREATE TABLE My_table(
    my_field1 INT,
    my_field2 VARCHAR(50),
    my_field3 DATE NOT NULL,
    PRIMARY KEY (my_field1, my_field2)
);
-- 테이블 수정
ALTER TABLE My_table ADD my_field4 NUMBER(3) NOT NULL;
```

- primary key, 기본키 : RDB에서 식별자로 사용하는 키
- alter는 테이블, 컬럼 이름 변경, 컬럼 추가 등 가능, 테이블 이름 변경은 주로 rename사용

## SQL 문법

- 처리 순서 : FROM > ON > JOIN > WHERE > GROUP BY > WITH CUBE/ROLLUP > HAVING > SELECT > DISTINCE > ORDERED BY > TOP

#### SELECT
- 기본 구조

```SQL
SELECT [ALL | DISTINCT] 컬럼명 [,컬럼명...]
FROM 테이블명 [,테이블명...]
[WHERE 조건식]
[GROUP BY 컬럼명 [HAVING 조건식]]
[ORDER BY 컬럼명]
GROUP BY 컬럼명[,컬럼명...]
ORDER BY 컬럼명[,컬럼명...]
```


#### WHERE 조건
| 조건     | 연산자               | 예                                        |
| -------- | -------------------- | ----------------------------------------- |
| 비교     | =, <, >, <=, >=      | price < 20000                             |
| 범위     | BETWEEN              | price BETWEEN 10000 AND 20000             |
| 집합     | IN, NOT IN           | price IN (10000, 20000, 30000)            |
| 패턴     | LIKE                 | bookname LIKE '야구'                      |
| NULL     | IS NULL, IS NOT NULL | price IS NULL                             |
| 복합조건 | AND, OR, NOT         | (price < 20000) AND (bookname LIKE '야구) |

#### LIKE 와일드 문자
| 와일드 문자 | 의미                        | 예                                               |
| ----------- | --------------------------- | ------------------------------------------------ |
| +           | 문자 연결                   | 'python' + 'Django'                              |
| %           | 0개 이상 문자와 일치        | '%야구%'                                         |
| []          | 1개의 문자와 일치           | '[0-5]%'<br>0-5 사이 숫자로 시작하는 문자열      |
| [^]         | 1개의 문자와 불일치         | '[0-5]%'<br>0-5 사이 숫자로 시작하지 않는 문자열 |
| _-_         | 특정 위치의 1개 문자와 일치 | '_구%'                                           |

#### 집계 함수
- SUM, AVG, COUNT, MAX, MIN
<br>
- SQL 예시

```SQL
-- WHERE 사용
SELECT * FROM documnet where author='김싸피';
SELECT * FROM document where nom BETWEEN 1 AND 10;
-- 집합 연산
SELECT name FROM customer
EXCEPT
SELECT name FROM customer WHERE custid IN (SELECT custid FROM Orders)
```

#### JOIN
- FROM절에서 여러 테이블을 지정하면, JOIN을 통하여 사용

```SQL
SELECT * FROM table1, table2;
SELECT * FROM table1, table2 WHERE table1.field1 = table1.field2;
```

![SQL join](https://media.vlpt.us/images/codepark_kr/post/2ef0f9bd-64c2-4ab4-aab7-8c6619dec9e6/dyqnzpuddxk21.png)

- INNER JOIN : 두 테이블을 조인할 때, 두 테이블에 모두 지정한 열의 데이터가 있음
- OUTER JOIN : 두 테이블을 조인할 때, 1개의 테이블에만 데이터가 있어도 결과가 나옴
- CROSS JOIN : 한 쪽 테이블의 모든 행과 다른 쪽 테이블의 모든 행을 조인하는 기능
- SELF JOIN : 자신과 조인, 1개의 테이블 사용 할 때

#### INSERT, UPDATE, DELETE
```SQL
INSERT INTO table(field1, field2, ...) VALUES(value1, value2, ...);
UPDATE table SET field1=value1, field2=value2, {WHERE 조건};
DELETE FROM table {WHERE 조건};
```
- INSERT는 모든 테이블 값을 입력하면 table항목이 없어도 됨
- UPDATE는 WHERE이 없으면 모든 항목 값이 변경됨
- DELETE의 WHERE조건이 없으면 모든 데이터 삭제
    - 모든 데이터 삭제를 할 때, TRUNCATE를 사용하면 해당 테이블 초기화
    - DELETE는 데이터만 삭제함

## 참조
- https://developerking.tistory.com/6
- https://ko.wikipedia.org/wiki/SQL
- https://namu.wiki/w/SQL/%EB%AC%B8%EB%B2%95
- https://dev.mysql.com/doc/refman/8.0/en/preface.html
- https://docs.oracle.com/cd/B14117_01/index.htm
- http://www.mysqlkorea.com/sub.html?mcode=manual&scode=01&lang=k
- https://velog.io/@codepark_kr/Oracle-%EC%9E%85%EB%AC%B8-%EC%8B%A4%EC%A0%846-Join1-ANSI-Standard-%EC%9E%91%EC%84%B1%EC%A4%91-%EC%9E%84%EC%8B%9C%EC%A0%80%EC%9E%A5
- https://hongong.hanbit.co.kr/sql-%EA%B8%B0%EB%B3%B8-%EB%AC%B8%EB%B2%95-joininner-outer-cross-self-join/