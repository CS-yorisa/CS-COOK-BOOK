# SQL (관계형 데이터베이스)

구조화 된 쿼리 언어(Structured Query Language)

데이터베이스 자체가 아니라 데이터베이스와 상호작용할 때 사용하는 쿼리 언어

SQL을 사용하면 관계형 데이터베이스 관리 시스템(RDBMS)에서 데이터를 수정, 저장, 삭제 및 검색 할 수 있음



데이터는 정해진 스키마를 따라 데이터베이스 테이블에 저장되고, **관계를 통해서 여러 개의 테이블에 분산**



## 1. 스키마

데이터는 테이블에 레코드로 저장되며, 각 테이블에는 **명확하게 정의된 구조**가 있음

구조는 필드의 이름과 데이터 유형으로 정의

![img](https://postfiles.pstatic.net/MjAyMDExMTBfMjQw/MDAxNjA1MDA5MzgyMjc5.q54AZnvEM2JtMckjv_kPwiEuEd4v8Z6B2N-l84cxy9wg.P9wuWQnpRVr97vZDGldqvmfHBr60qnyxEJEqG05uLHAg.JPEG.je_un/random_54D18602-21EB-4C3E-BEBE-319272C66A97.jpeg?type=w773)

스키마에 맞지 않는 레코드는 관계형 데이터베이스 테이블에 추가할 수 없음

(일부 필드가 누락되거나, 더 추가되었을 경우)



## 2. 관계

SQL 기반의 데이터베이스의 또다른 중요한 부분은 관계

데이터들을 여러 개의 테이블에 나누어서 데이터들의 중복을 피할 수 있음

![img](https://postfiles.pstatic.net/MjAyMDExMTBfMzgg/MDAxNjA1MDA5NzAyMjU4.HP-H_jq82jSKH_AvcU6lD4LR7UGp9FheRu2kWShzcG0g.Hw1ZoMkzorW_lD52I7G4lQfEq2Wf4WcgCoZklltRtJYg.JPEG.je_un/random_BF550936-7D0A-401B-88AC-4A0C96666CB0.jpeg?type=w773)

사용자가 구입한 상품을 나타내기 위해서는 User, Products, Order과 같은 여러 테이블이 있어야 하지만, 각각의 테이블은 다른 테이블에서 저장되지 않은 데이터만 가지고 있음

이와 같은 구조는 하나의 테이블에서 하나의 데이터만 관리하여 다른 테이블에서 부정확한 데이터를 다룰 위험이 없음.



# NoSQL (비관계형 데이터베이스)

SQL과는 반대되는 접근 방식을 따르기 때문에 지어진 이름

스키마와 관계가 모두 없는 데이터베이스로 레코드를 문서(Documents)라고 부름



NoSQL은 스키마가 없기 때문에 SQL과 다르게 서로 다른 구조의 데이터를 같은 컬렉션(=SQL에서의 테이블)에 추가할 수 있음

![img](https://postfiles.pstatic.net/MjAyMDExMTBfNTMg/MDAxNjA1MDEwMzc2NjU4.qgMglwADpZl52RKoc5sC4XrsECDoA3-a7ezlM0SflRQg.pEJWbfQRcYd91QLfUskSIrqTbbDSCToM95FMUVQ-8yQg.JPEG.je_un/random_D21EE0FA-E433-4885-9704-CE7D3DC8BE94.jpeg?type=w773)

문서들은 JSON 데이터와 비슷한 형태를 가지고 있기에 스키마를 신경쓸 필요가 없음

관계형 데이터처럼 여러 테이블에 나눠담지 않고, 관련 데이터를 동일한 컬렉션에 넣음.

사용자가 구입한 상품을 나타내는 데이터들을 SQL과 달리 모두 Order 컬렉션에 저장하고, 여러 테이블/컬렉션에 조인(JOIN)할 필요 없이 이미 필요한 것을 갖춘 문서를 작성하게 됨



실제로 NoSQL에는 조인이라는 개념이 없으며 컬렉션을 통해 데이터를 복제하여, 각 컬렉션 일부분에서 찾을 수 있는 데이터를 정확하게 산출하도록 함.



![img](https://postfiles.pstatic.net/MjAyMDExMTBfMTcx/MDAxNjA1MDEwNTQ5MjE5.84ze0jZx6NGr5bq_uIKN4Nfdpbpna2GacJhVQZiTf3kg.RY3azp2FwFnitLHvZm6O0hvyPb73Ef1xnIOAgPJkJhYg.JPEG.je_un/random_9967D3A8-CA2F-4B20-871D-E4A54E0C0294.jpeg?type=w773)

이러한 데이터 복제는 컬렉션 A의 데이터와 컬렉션 B의 데이터가 중복될 경우 B를 조정하지 않고 A의 데이터를 업데이터 하게 될 위험이 생김. 특정 중복 데이터를 사용하는 모든 컬렉션에서 데이터 업데이트가 수행되도록 해야함.



# 수직적 & 수평적 확장(Scaling)

SQL과 NoSQL을 비교할 때 살펴 보아야할 또 다른 중요한 개념은 확장(Scaling)

확장이란 데이터베이스가 처리할 수 있는 읽기 및 쓰기 요청의 수, 즉 실행시킬 수 있는 데이터의 양을 확장하는 것을 뜻함 (서버의 확장)



### 수직적 확장

단순히 데이터베이스 서버의 성능을 향상시키는 것으로 CPU를 업그레이드 하는 방식



### 수평적 확장

더 많은 서버를 추가하고, 데이터베이스를 전체적으로 분산시키는 것. 하나의 데이터베이스지만 여러 개의 서버가 호스트 해주는 것.



![img](https://postfiles.pstatic.net/MjAyMDExMTBfMiAg/MDAxNjA1MDE2MTQyMDY0.KYRFIFZs1Aws4ycGkzv2VgPCLMtKGxHvskYZ9zOpkFIg.-N7Dbv7T6jUat_Q31ZnOQm4UwJo6Gv7rWqPPP4WSGfQg.JPEG.je_un/random_189C10AA-8780-4457-A139-CEA32173B05E.jpeg?type=w773)

데이터가 저장되는 방법에 따라 SQL은 보통 수직적 확장만 지원, NoSQL 데이터베이스에서는 수평적 확장만 가능하다.



SQL 데이터베이스는 샤딩(Sharding)의 개념을 알고 있지만 특정 제한이 있으며, 구현이 어려움.

NoSQL은 이를 기본적으로 지원하므로 여러 서버에서 데이터베이스를 쉽게 분리할 수 있음.



# 어떤 데이터베이스를 선택해야할까?

명확한 정답은 없으나, 어떤 데이터를 다루는 지, 어떤 애플리케이션에서 사용되는지를 고려



## SQL

### 장점

명확한 스키마가 정해져 있고, 데이터 무결성 보장

관계는 각 데이터가 중복없이 저장되도록 함



### 단점

데이터 스키마가 사전에 계획되어야 하기 때문에 상대적으로 덜 유연

관계를 맺고 있기 때문에 JOIN문을 많이 사용한 복잡한 쿼리가 만들어질 수 있음

수평적 확장이 어려워서 어떠한 시점에서 처리량의 한계를 만날 수 있음



## NoSQL

### 장점

스키마가 없기 때문에 유연함, 언제나 저장된 데이터를 조정하고 새로운 필드를 추가할 수 있음

데이터는 애플리케이션이 필요로 하는 형식으로 저장되고, 데이터를 읽는 속도를 증가

수평 확장이 가능하므로, 애플리케이션에서 발생하는 모든 읽기/쓰기 요청 처리 가능



### 단점

유연성으로 인해, 데이터 구조를 제대로 결정하지 못할 수 있음

데이터 중복의 경우 데이터가 변경되었을 때 여러 컬렉션과 문서를 모두 업데이트 해주어야 함





## SQL vs NoSQL 

SQL은 관계를 맺고 있는 데이터가 자주 변경될 경우, 데이터 스키마가 변경되지 않을 경우 (명확한 스키마가 중요한 작업)

NoSQL은 정확한 데이터 구조를 알 수 없거나, 변경/확장 될 가능성이 있는 경우, 읽기 처리를 자주 하지만 데이터의 변경이 적을 경우, 데이터를 수평으로 확장해야 할 경우 (막대한 양의 데이터를 다뤄야할 경우)

