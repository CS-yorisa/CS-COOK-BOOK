# Redis

![Redis 기본 개념 (기초, Collection 타입, Expire, Persistence)](https://blog.kakaocdn.net/dn/b3iuvA/btqE7APXMs0/rdhWOhFeezJyk7bjOK2x6K/img.png)

- **REmote DIrectory Server**
  - key-value 구조의 비정형 데이터를 저장하고 관리하기 위한 오픈소스 기반 nosql DBMS
  - 원격 저장소, 메시지 브로커, 공유 메모리 등으로 사용



### 특징

- **인-메모리 데이터베이스**
  - 디스크가 아닌 주 메모리에 모든 데이터를 저장
  - 메모리와 디스크 간 병목 현상이 없기 때문에 Disk-based DB보다 훨씬 **속도가 빠름**



- **Memcached와 비슷한 캐시 시스템으로 동일한 기능 제공**

  - Memcached(멤캐시디, 멤캐시트) : 범용 분산 캐시 시스템, 외부데이터 소스(데이터베이스나 API)의 읽기 횟수를 줄이기 위해 데이터와 객체들을 RAM에 캐시 처리함으로 동적 데이터베이스 드리븐 웹사이트의 속도를 높이기 위해 종종 사용
  - LookAsideCache, Writeback 의 캐싱 방식을 사용
  - Memcached와 Redis의 가장 큰 차이는 Collection(자료구조) 제공 여부

  

- **영속성(persistence) 보장**

  - 인메모리 DB는 기본적으로 영속성이 보장되지 않음 (프로세스 종료 시 데이터 유실 가능)
  - Redis는 일반적 DB와 다르게 영속성 보장을 위한 보관과 백업 기능 존재
    - SnapShot, AOF 같은 방식으로 일정 주기와 명령어를 통해 보존 가능
    - SnapShot : 기존 RDMS에서도 사용하고 있으며, 어떤 특정 시점의 데이터를 Disk에 옮겨담는 방식
    - AOF : Redis의 모든 Write/Update 연산 자체를 모두 Log 파일에 기록하여, 서버가 재 시작 시 순차적으로 재실행, 복구

  

- **다양한 자료구조 지원**

  - String, Bitmap, Hash, List, Set, Sorted Set, Geospatial Index, Hyperloglog, Stream
  - 개발의 편의성이 좋아지고 난이도가 낮아짐
  - 상황에 따라 이들을 캐시로 사용할 수도 있고, Persistence Data Storage로 사용할 수도 있음

  

- **메인스레드(이벤트 루프)는 싱글 스레드로 운용**

  - 장점 : Atomic 보장, Race condition 회피
  - 단점 : 오래 걸리는 명령을 실행하면 다른 명령에 영향을 줌
  - 이를 보완하기 위해 멀티 스레드 도입 부분 존재
    - 클라이언트에서 전송한 명령을 읽고 파싱하는 부분
    - 명령어 처리 결과를 클라이언트에게 전송하는 부분

  

- **읽기 성능 증대를 위한 서버 측 복제 지원**
  - 마스터/슬레이브 복제를 지원
  - 마스터에서 쓰기가 수행되면 슬레이브 데이터 set을 실시간으로 업데이트 하기 위해 연결된 모든 슬레이브로 전송



- **쓰기 성능 증대를 위한 클라이언트 측 샤딩(Sharding) 지원**
  - 같은 테이블 스키마(Index)를 가진 데이터를 다수의 데이터베이스에 부산하여 저장



### 장점

- 리스트, 배열과 같은 데이터를 처리하는데 유용
- 여러 프로세스에서 동시에 같은 Key 갱신 요청 시, 데이터 부정합 방지 Atomic 처리 함수 제공
- 명령어로 명시적으로 삭제를 설정하지 않으면 데이터가 삭제되지 않음
- 기억 장치 기능을 제공하며, 메모리의 내용을 .rdb 파일로 저장하여 해당 시점으로 복구 가능





### 참고

https://dev-baek.tistory.com/15

https://sjh836.tistory.com/178

https://newtoner.tistory.com/23

https://devlog-wjdrbs96.tistory.com/374