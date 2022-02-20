[TOC]

# TCP handshake

<br>

## 3-way handshake (연결 성립)

- Client, Server 두 종단 간 **정확한 데이터 전송을 보장**하기 위해 **논리적인 연결을 성립(establish)**하는 과정
- 양쪽 모두 데이터를 전송할 준비가 되었다는 것을 보장, 데이터 전달이 시작되기전에 **서로가 준비되었다는 것을 알 수 있도록 함**

![img](https://t1.daumcdn.net/cfile/tistory/225A964D52F1BB6917)

> SYN (Synchronize Sequence Number) : 연결이 이루어지도록 요청. 초기에 Sequence Number를 전송
> ACK (Acknowledgement) : 응답 확인. 패킷을 받았다는 것을 의미

### [STEP 1]

- Client 는 Server 에 접속을 요청하는 **SYN 패킷**을 전송
- Client 는 SYN 을 보내고 SYN/ACK 응답을 기다리는 **SYN_SENT 상태**가 됨

### [STEP 2]

- Server 는 SYN 요청을 받고 Client 에게 요청을 수락한다는 **ACK 와 SYN flag 가 설정된 패킷(SYN+ACK)**을 전송
- Server 는 ACK 응답을 기다리는 **SYN_RECEIVED 상태**가 됨
- Client 는 Server 에게 **SYN+ACK 패킷**을 받고 **ESTABLISHED** 상태가 됨

### [STEP 3]

- Client 는 Server 에게 **ACK 패킷**을 전송
- Client 는 **ACK 패킷**을 보내고 Server 에서 받으면서 Server는 **ESTABLISHED** 상태가 됨
- 논리적인 연결이 이루어지고 나면 데이터가 오가게 됨

### [Sequence Number 설정]

![스크린샷 2021-05-08 오후 10.59.51](https://t1.daumcdn.net/cfile/tistory/99AE67425B32FEE81B)

- **처음 Client 에서 SYN 패킷을 보낼 때 Sequence Number에는 랜덤한 숫자가 담겨짐**
  - 연결을 시도할 때 **포트(port)는 유한한 범위 내에서 사용**하고 시간이 지남에 따라 재사용하기 때문에, 이전에 사용한 포트를 **재사용할 가능성이 있음**
  - Sequence Number가 순차적인 숫자로 전송된다면 서버는 이전의 연결으로부터 전송되는 패킷으로 인식할 수 있기 때문에 **Sequence Number를 난수로 설정**
- SYN 패킷에 대한 응답 ACK 패킷에는 **SYN 패킷의 Sequence Number에 1을 더한 수**를 전송

### [상태 정보]

| 상태         | 설명                                                    |
| ------------ | ------------------------------------------------------- |
| CLOSED       | 연결 수립을 시작하기 전의 기본 상태 (연결 없음)         |
| LISTEN       | 포트가 열린 상태로 연결 요청 대기 중                    |
| SYN-SENT     | SYN 요청을 한 상태                                      |
| SYN-RECEIVED | SYN 요청을 받고 상대방의 응답을 기다리는 중             |
| ESTABLISHED  | 연결의 수립이 완료된 상태, 서로 데이터를 교환할 수 있음 |

<br>

## 4-way handshake (연결 해제)

- Client, Server 의 **연결을 해제**하는 과정
- **Half-Close 기법**을 사용하여 Client 가 연결 해제를 요청하고, **남은 데이터를 모두 처리**한 뒤 해제
  - Client 는 **연결을 반만 종료**한 뒤 Server 에서 보내는 데이터를 받음

![img](https://t1.daumcdn.net/cfile/tistory/2152353F52F1C02835)

> FIN (Finish) : 연결 해제를 요청하는 패킷

### [STEP 1]

- Client 는 Server 로 연결을 해제하겠다는 **FIN 패킷**을 전송
- Client 는 ACK 응답을 기다리는 **FIN-WAIT-1 상태**가 됨

### [STEP 2]

- Server 는 Client 에 FIN 패킷에 대한 응답으로 **ACK 패킷**을 전송
- Server 는 **CLOSE-WAIT 상태**가 됨
- Client 는 **ACK 패킷**을 받고 FIN 응답을 기다리는 **FIN-WAIT-2 상태**가 됨

### [STEP 3]

- Server 에서 모든 데이터를 처리한 뒤 Client 로 **FIN 패킷**을 전송
- Server 는 ACK 응답을 기다리는 **LAST-ACK 상태**가 됨

### [STEP 4]

- Client 는 **FIN 패킷** 을 받고 Server 로 **ACK 패킷**을 전송
- Client 는 잉여 패킷을 기다리는 **TIME-WAIT 상태**가 됨
- Server 는 **ACK 패킷**을 받고 **CLOSED 상태**가 되며 연결을 해제
- Client 는 **TIME-WAIT** 이 끝난 뒤 **CLOSED 상태**가 되며 연결을 해제

### [TIME-WAIT]

- Client에서 세션을 종료시킨 후 **뒤늦게 도착하는 패킷**이 있다면 **이 패킷은 Drop되고 데이터는 유실될 수 있음**
- 이러한 현상에 대비하여 Client 는 Server 로 부터 FIN 패킷을 수신하더라도 **일정시간(디폴트 : 240초) 동안 세션을 남겨놓고 잉여 패킷을 기다리는 과정**

### [상태 정보]

| 상태        | 설명                                                         |
| ----------- | ------------------------------------------------------------ |
| ESTABLISHED | 연결의 수립이 완료된 상태. 서로 데이터를 교환할 수 있음      |
| CLOSE-WAIT  | 상대방의 FIN 요청을 받은 상태. 상대방 FIN에 대한 ACK를 보내고 애플리케이션에 종료를 알림 |
| LAST-ACK    | CLOSE-WAIT 상태를 처리한 뒤 자신의 FIN 요청을 보낸 후 응답 ACK를 기다리는 상태 |
| FIN-WAIT-1  | 자신이 보낸 FIN에 대한 ACK를 기다리거나 상대방의 FIN을 기다리는 상태 |
| FIN-WAIT-2  | 자신이 보낸 FIN에 대한 ACK를 받았고, 상대방의 FIN을 기다리는 상태 |
| TIME-WAIT   | 모든 FIN에 대한 ACK를 받고 연결 종료가 완료된 상태. 잉여 데이터를 처리하기 위해 일정 시간 동안 기다린 후 CLOSED로 전이 |
| CLOSED      | 연결 해제가 완료된 상태                                      |

<br>

## [참고자료]

- https://seongonion.tistory.com/74
- https://velog.io/@arielgv829/CS-network-TCP-3-way-handshake-4-way-handshake

- https://mindnet.tistory.com/entry/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%89%BD%EA%B2%8C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-22%ED%8E%B8-TCP-3-WayHandshake-4-WayHandshake

- https://beenii.tistory.com/127
- https://gmlwjd9405.github.io/2018/09/19/tcp-connection.html
- https://github.com/WooVictory/Ready-For-Tech-Interview/blob/master/Network/3%20way%20handshake.md

