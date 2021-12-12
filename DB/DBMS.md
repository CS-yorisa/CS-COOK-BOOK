## DBMS(Database Management System)
다수의 사용자들이 DB내의 데이터를 접근할 수 있도록 해주는 소프트웨어 도구의 집합
DB 형태에 따라 RDMBS, NoSQL DBMS, IMDBMS(인 메모리 DBMS), CDBMS(기둥형 DBMS)

#### 파일 시스템
- 데이터를 파일로 관리할 수 있도록 파일을 생성, 삭제, 수정, 검색 기능 제공
- 운영체제와 함께 설치
- 다음과 같은 단점을 가짐
    - 같은 내용의 데이터가 여러 파일에 중복 저장됨
    - 응용 프로그램이 데이터 파일에 종속적
    - 데이터 파일에 대한 동시 공유, 보안, 회복 기능 부족
    - 응요 프로그램 개발 쉽지 않음
- 파일시스템의 단점을 해결하기 위해 DBMS를 사용

#### 기능
- 정의 : 데이터에 대한 형식, 구조, 제약조건 명세
- 구축 : DBMS가 관리하는 기억 장치에 데이터 저장
- 조작 : 특정 데이터를 검색하기 위한 질의 DB 갱신, 보고서 생성 기능
- 공유 : 여러 사용자와 프로그램이 DBㄹ에 동시에 접근하도록 하는 기능
- 보호 : HW, SW 오동작 또는 권한이 없는 악의적 접근으로부터 서비스 보호
- 유지보수 : 시간이 지남에 따라 변경하는 요구사항 반영

#### 장점과 단점
- 장점
    - 데이터 중복 최소화
    - 데이터 일관성 및 무결성 유지
    - 데이터 보안 보장
- 단점
    - 운영 비용 발생
    - 백업 및 복구에 대한 관리의 어려움
    - 부분적 DB 손실이 시스템 전체를 정지할 수 있음

#### DBMS 종류
1. 네트워크 DBMS

- 데이터를 노드와 간선을 이용한 그래프 형태로 구성하는 네트워크 구조
- 구조가 복잡하고 변경하기 어려움

2. 계층형 DBMS

- 데이터 계층 구조를 트리구조로 관리하는 DBMS
- 네트워크형보다 구조가 단순하지만, 구조 변경 어려움

3. 관계형 DBMS

- 데이터를 단순한 2차원 표 형식으로 저장하는 관계형 DB를 관리하는 DBMS

4. 객체지향 DBMS

- 데이터를 객체 형식으로 관리
- 관계형과 객체지향을 통합한 객체관계 DBMS도 존재

5. NoSQL

- 비정형 데이터를 저리하기 위해 저장
- 대량 데이터를 처리하는 웹 서비스에 적합

6. NewSQL

- 관계형의 안정성과 일관성, NoSQL의 확장성과 유연성을 가짐
- 구글 Spanner, VoltDB, NuoDB

## SQL vs NoSQL
- SQL : RDBMS에서 데이터를 관리하기 위해 설계된 특수 목적 프로그래밍 언어
    - RDBMS : 관계형 데이터베이스 관리 시스템
    - Oracle, DB2 , SQL Server, PostgreSQL, MySQL, SQLite
- NoSQL : Not Only SQL, 기존 관계형 DBMS가 갖고 있는 특성뿐만 아니라 다른 특성들을 부가적으로 지원
    - 저장되는 데이터 구조에 따라 다양한 NoSQL로 나뉘어짐
    - Key-Value DB : 데이터가 Key, Value 쌍으로 이루어짐
        - Redis, Riak, Amazon Dynamo DB
    - Document DB : 데이터가 Key, Document 형태로 저장, Key-Value와 달리 객체지향에서 객체와 유사, 질의의 결과가 JSON, XML등으로 출력
        - MongoDB, CouthDB
    - Wide Column DB : 키에서 필드를 결정, 키는 키값 Row와 Column-family, Coulmn-name을 가짐
        - HBase, Hypertable, Cassandra
    - Graph DB : 데이터를 Node, Edge, Property와 함께 그래프 구조를ㅈ 사용하여 표현 및 저장, 소셜 네트워크에서 친구 찾거나, 패턴 인식 등에 적합
        - Neo4J

## ORM(Object Relational Mapping)
OOP의 객체 개념을 RDB에서 쓰이는 테이블에 자동 매핑
- 장점
객체 지향적 코드
재사용, 유지보수, 리팩토링 용이
DBMS 종속성 하락
- 단점
ORM으로 모든 것을 해결할 수 없다
객체-관계 불일치

## 참조
- DBMS Ranking : https://db-engines.com/en/ranking
- SQL : https://injun379.tistory.com/13
- NoSQL : https://www.samsungsds.com/kr/insights/1232564_4627.html