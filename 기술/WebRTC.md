[TOC]



# WebRTC(Web Real-Time Communication)

## 정의

- 웹 애플리케이션과 사이트가 중간자 없이 브라우저 간에 오디오나 영상 미디어를 포착하고 마음대로 스트림 할 뿐 아니라, 임의의 데이터도 교환할 수 있도록 하는 기술이다.

- 즉, 웹 브라우저 상에서는 어떠한 플러그인도 필요 없이 음성 채팅과 화상채팅, 데이터 교환까지도 가능하게 하는 기술이다.

  > P2P (peer to peer) : 인터넷으로 다른 사용자의 컴퓨터에 접속하여 각종 정보나 파일을 교환ㆍ공유할 수 있게 해주는 서비스



##  기술

- 일반적인 통신
  - 서버를 거쳐서 클라이언트에게 전송하는 방식

![img](https://blog.kakaocdn.net/dn/bxqtuw/btqQZxG4nwE/NVAaGFRD4TOf039jhG8DAK/img.png)

- WebRTC의 기본적인 과정

| ![img](https://blog.kakaocdn.net/dn/KqLMN/btqQ3gLpVyZ/xMad7EAqWU6ZeKYREgeVZk/img.png) | ![img](https://blog.kakaocdn.net/dn/PXayX/btqQZwnRfQc/qXEdveeN33Punf2keGQJXK/img.png) | ![img](https://blog.kakaocdn.net/dn/d6KnO6/btqQZxUC5MA/anekQtqUmv8WCbkKujpcYK/img.png) |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|                            단계1                             |                            단계2                             |                            단계3                             |

WebRTC는 여전히 다음과 같은 서버를 필요로 한다.

- 시그널링(Signaling)이라 불리는, 클라이언트들의 통신을 조정하기 위한 메타데이터의 교환 서버

- 네트워크 주소 변환기(NAT) 및 방화벽 대응을 위한 서버

  > private IP주소를 public IP주소로 바꿔주는데 사용하는 통신망의 주소 변환기이다.

![img](https://blog.kakaocdn.net/dn/bYDPRl/btqRxZQ4xL3/ieO7U9CkjtBcvI6eWlUC1k/img.png)





# STUN 서버(Session Traversal Uilities for NAT)

- 클라이언트는 자신의 Public IP를 확인하기 위해 STUN 서버로 요청을 보내고 서버로 부터 자신의 Public IP를 받는다.
- 그래서 이때부터 클라이언트는 자신이 받은 Public IP를 이용하여 시그널링을 할때 받은 그 정보를 이용해서 시그널링을 하게 한다.
  - 쉽게 말해, 다른 사람이 우리 집에 쉽게 찾아올 수 있도록 사전에 우리 집 주소를 조회해서 알아내는 것과 같다. 두 개의 장치가 성공적으로 STUN 서버에서 자기 자신의 주소를 알아냈을 경우에는 P2P 연결을 시도할 두 개의 고유한 주소가 생긴 셈이다.

- 하지만 STUN 서버를 이용하더라도 항상 자신의 정보를 알아낼 수 있는 것은 아니다.
  -  STUN 서버를 통해 자기 자신의 주소를 찾아내지 못했을 경우, **TURN** 서버를 대안으로 이용한다.

![stun](https://wormwlrm.github.io/img/posts/2021-01-24/1.png)

## TURN  서버(Traversal Using Relay NAT)

- 클라이언트들이 통신할 때 Public 망에 존재하는 TURN 서버를 경유하여 통신하게 된다.
- 클라이언트는 자신의 Private IP가 포함된 TURN 메세지를 턴서버로 보낸다. 그러면 TURN 서버는 메세지에 포함된 Network Layer IP 주소와 Transport Layer의 UDP 포트 넘버와의 차이를 확인하고 클라이언트의 Public IP로 응답하게 된다. 이때 NAT는 NAT 매핑테이블에 기록되어 있는 정보에 따라서 내부 네트워크에 있는 클라이언트의 Private IP 로 메세지를 전송한다.
- **네트워크 미디어를 중개하는 서버**를 이용하는 것이다. 
- 중간에 서버를 한 번 거치기 때문에, 엄밀히 이야기하자면 P2P 통신이 아니게 되며 그 구조상 지연이 필연적으로 발생한다.
-  하지만 보안 정책이 엄격한 개인 NAT 내부에 위치한 브라우저와 P2P 통신을 할 수 있는 유일한 방법이기 때문에, TURN 방식은 최후의 수단으로 선택되어야 한다.  



### Candidate(후보)

- STUN, TURN 서버를 이용해서 획득했던 IP 주소와 프로토콜, 포트의 조합으로 구성된 연결 가능한 네트워크 주소들을 후보라고 부른다. 
- 그리고 이 과정을 후보 찾기(Finding Candidate)라고 부른다. 이렇게 후보들을 수집하면 일반적으로 3개의 주소를 얻게 된다. 
  - 자신의 사설 IP와 포트 넘버
  - 자신의 공인 IP와 포트 넘버 (STUN, TURN 서버로부터 획득 가능)
  - TURN 서버의 IP와 포트 넘버 (TURN 서버로부터 획득 가능)
- 이 모든 과정은 **ICE(Interactive Connectivity Establishment)**라는 프레임워크 위에서 이루어진다.



## ICE(Interactive Connectivity Establishment)

- **두 개의 단말이 P2P 연결을 가능하게 하도록 최적의 경로를 찾아주는 프레임워크**
- ICE 프레임워크가 STUN, 또는 TURN 서버를 이용해 상대방과 연결 가능한 후보들을 갖고 있다는 것



## MCU와 SFU 방식

- 1:N 통신으로 스트리밍하는 서비스라면 중간에 Media 서버를 두어 중계하지 않으면 모든 peer가 매쉬 구조로 연결되게 되어 각 Peer에 엄청난 부담을 주게 되고 네트워크 자원도 너 무 많이 사용하게 된다. 이것을 해결하는 MCU와 SFU 방식이 있다. 



## 한계

- 브라우저 간 호환성
  - adapter.js 같은 라이브러리 없이는 다양한 브라우저의 호환성을 장담할 수 없다.
- 시그널링 서버에 대한 명시적인 표준이 없다
  - 개발자의 능력과 자율성에 맡겨둔 부분이 오히려 처음 WebRTC를 입문하는 사람들에게 혼란을 일으키기도 한다.
- WebRTC는 기본적으로 실시간성이 매우 중요하기 때문에 **UDP 위에서 동작**합니다
  - 즉 데이터를 빠르게 전송할 수는 있지만, 이 과정에서 발생한 데이터 손실이 발생할 수도 있다.
  - TCP 방식을 사용할 수도 있지만 UDP를 사용할 수 없거나 미디어 스트리밍에 적합하지 않은 방식으로 제한되는 경우에만 사용되고, 모든 브라우저가 TCP 방식을 지원하는 것도 아니다. 



## 참고

https://wormwlrm.github.io/2021/01/24/Introducing-WebRTC.html

https://medium.com/@hyun.sang/webrtc-webrtc%EB%9E%80-43df68cbe511

https://andonekwon.tistory.com/53?category=447798

