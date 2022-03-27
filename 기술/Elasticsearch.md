# Elasticsearch

## Elasticsearch란?

- Apache Lucene (아파치 루씬) 기반의 **Java 오픈 소스 분산 검색 엔진**
- 텍스트, 숫자, 위치 기반 정보, 정형 및 비정형 데이터 등 모든 유형의 데이터를 위함
- 방대한 양의 데이터를 신속하게, 거의 실시간(NTR, Near Real Time)으로 저장, 검색, 분석할 수 있음
  - 문서를 색인화하는 시점부터 검색 가능해지는 시점까지 약간의 대기 시간(1초)이 있음

- 검색을 위해 단독으로 사용되기도 하며, Logstash, Kibana와 함께 사용되며 ELK 스택으로 널리 알려지게 됨



### Elasticsearch 사용처

- 애플리케이션 / 웹사이트 / 엔터프라이즈 등의 검색
- 로깅과 로그 분석
- 인프라 메트릭과 컨테이너 / 애플리케이션 성능 등의 모니터링
- 위치 기반 정보 데이터 분석 및 시각화
- 보안 / 비즈니스 분석



### Elasticsearch 특징

- **오픈소스 (Open source)**
  - 핵심 기능은 Apache 2.0 라이센스로 배포되는 중이며, 깃헙 리파지토리에서 소스들을 찾을 수 있음
- **실시간 분석 시스템**
  - 배치 기반의 분석인 하둡과 달리 클러스터가 실행되는 동안 계속해서 데이터가 입력(색인-indexing)되고 실시간에 가까운 속도로 색인 데이터 검색, 집계 가능
- **전문(full text) 검색 엔진**
  - JSON 문서 기반으로, 역파일 색인(inverted file index) 구조로 데이터 저장
  - 질의에 사용되는 쿼리문이나 쿼리에 대한 결과도 모두 JSON 형식으로 전달되고 리턴됨
  - JSON이 유일한 지원 형식이지만, Logstash에서 변환 가능
- **RESTful API**
  - 데이터 조회, 입력, 삭제를 HTTP 프로토콜을 통해 Rest API로 처리
- **멀티테넌시(multitenancy)**
  - 데이터들은 인덱스(index)라는 논리적인 집합 단위로 구성되며 서로 다른 저장소에 분산되어 저장
  - 서로 다른 인덱스를 별도의 커넥션 없이 하나의 질의로 묶어서 검색하고, 하나의 출력으로 도출할 수있는 것을 멀티테넌시라고 함



### ELK 스택 (Elasticsearch/Logstash/Kibana)

- 데이터 수집, 보강, 저장, 분석, 시각화를 위한 도구 모음
- Elastic Stack이라는 명칭으로 바뀜
- **Logstash**
  - 다양한 소스(DB, csv 파일 등)의 로그 또는 트랜잭션 데이터를 수집, 집계, 파싱하여 Elasticsearch로 전달
  - 입력 → 필터 → 출력 과정을 거쳐 **데이터 처리**
    - 입력 : 다양한 데이터 저장소로부터 데이터 입력
    - 필터 : 데이터를 확장, 변경, 필터링 및 삭제 등의 처리로 가공
    - 출력 : 다양한 데이터 저장소로 데이터 전송 (Elasticsearch에 색인하는 동시에 로컬/aws s3 저장소 등으로 송출 가능)
- **Elasticsearch**
  - Logstash로부터 받은 데이터를 검색 및 집계하여 필요한 정보를 획득
- **Kibana**
  - Elasticsearch의 빠른 검색을 통해 데이터를 **시각화** 및 모니터링
  - Discover, Visualize, Dashboard 3개의 기본 메뉴 구성
- 전체 작동 과정
  - 다양한 소스로부터 원시 데이터가 Elasticsearch로 흘러 들어가고, 이것이 색인되기 전에 구문분석, 정규화 됨
  - Elasticsearch에서 색인되면 사용자는 복잡한 쿼리를 실행하고 집계를 사용해 데이터의 복잡한 요약 검색 가능
  - Kibana에서 사용자는 데이터를 시각화하고, 대시보드를 공유하며 Elastic stack 관리 가능




### Elasticsearch 용어 정리

- **클러스터**
  - 하나 이상의 노드(서버)가 모인 것이며, 이를 통해 전체 데이터 저장
  - 통합 색인화 및 검색 기능 제공
  - 클러스터는 고유한 이름으로 식별되며, 기본은 elasticsearch임
- **노드**
  - 클러스터에 포함된 단일 서버로 데이터를 저장하고, 클러스터의 색인화 및 검색 기능에 참여
  - 클러스터처럼 이름으로 식별되는데, 기본 이름대신 특정 이름으로 지정 가능

- **색인(Indexing)**
  - 검색될 수 있는 구조로 변경하기 위해 원본 문서를 **검색어 토큰들로 변환하여 저장하는 일련의 과정**
- **인덱스(index)**
  - 색인 과정을 거친 결과물
  - 색인된 데이터가 저장되는 저장소
  - Elasticsaerch에서 도큐먼트들의 논리적인 집합을 표현하는 단위
- **도큐먼트**
  - 색인화 할 수 있는 기본 정보 단위로 JSON 형식
- **샤드 & 리플리카**
  - 색인된 데이터가 너무 클 경우를 대비하여 샤드라는 조각으로 분할 가능
  - 샤드/노드 오류가 발생하더라도 사용할 수 있도록 리플리카 존재

- **검색(search)**
  - 인덱스에 들어있는 검색어 토큰들을 포함하고 있는 문서를 찾는 과정
- **질의(query)**
  - 사용자가 원하는 문서를 찾거나 집계 결과를 출력하기 위해 검색 시 입력하는 검색 조건 또는 검색어

- **관계형 DB(RDBMS)와의 비교**

| RDBMS    | Elasticsearch |
| -------- | ------------- |
| schema   | mapping       |
| database | index         |
| table    | type          |
| row      | document      |
| column   | field         |

- Elasticsearch와 REST API, RDB의 비교

| Elasticsearch | Relation DB | CRUD    |
| ------------- | ----------- | ------- |
| GET           | SELECT      | READ    |
| PUT           | UPDATE      | UPDATED |
| POST          | INSERT      | CREATE  |
| DELETE        | DELETE      | DELETE  |





### 출처

https://choseongho93.tistory.com/231

https://victorydntmd.tistory.com/308

https://www.elastic.co/kr/what-is/elasticsearch

https://esbook.kimjmin.net/
