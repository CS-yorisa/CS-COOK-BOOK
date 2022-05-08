# URL을 입력했을 때 발생하는 일들

# 1. 브라우저 URL 파싱
- URL을 입력 받으면, 구조를 해석
	- 프로토콜, URL, 포트 등
	- 포트는 입력하지 않으면 HTTP에서 80번, HTTPS에서 443번 포트로 요청

# 2. HSTS 목록 조회
- HSTS(HTTP Strict transport security)
	- HTTP를 허용하지 않고, HTTPS연결만 허용하는 기능
- 만약 해당 도메인이 HSTS목록에 있다면, HTTPS 통신만 가능하므로, HTTP 프로토콜을 HTTPS로 변경
- HTTP요청이 왔다면, HTTP 응답 헤더에 `Strict Transport Security` 필드를 포함, 해당 서버에 요청할 때 HTTPS만을 통하여 통신

# 3. URL을 IP주소로 변환
- 일반적인 URL주소를 활용하여 통신을 할 수 없음
- DNS서버에 요청을 하여 도메인 주소를 IP주소로 변환
- 만약 해당 도메인의 IP주소를 알고 싶으면 터미널에서 `nslookup <도메인>` 으로 IP주소를 알아낼 수 있음

## DNS 검색
- DNS기록을 찾 기 위해 4개의 캐시 확인
	- 브라우저 캐시 확인, 이전에 방문한 기록이 있는지
	- OS캐시 확인
	- 라우터 캐시 확인
	- ISP(Internet Service Provider) 캐시 확인, ISP는 DNS서버를 가지고 있음
- DNS에서는 top-level domain, second-level domain 등 탐색
	- top-level domain은 국가코드 kr, jp, cn등과 일반 도메인 com, net 등이 있음

# 4. 라우터를 통해 서버 게이트웨이까지 이동
- 서버의 IP주소에 따라, 라우터를 통하여 서버까지 경로를 알아냄
- 라우팅 하는 방법은 경로 지정, 브로드캐스트 컨트롤, 프로토콜 변환으로 나누어짐

## 경로 지정
- 다이렉트 커텍티디 : IP 주소를 입력할 때 자연스럽게 인접 네트워크 정보를 자동으로 얻는 방법
- 스태틱 라우팅 : 관리자가 직접 정보를 입력하는 방법
- 다이나믹 라우팅 : 라우터끼리 정보를 교환하는 방법
- 위와 같은 방법으로 정보를 얻고, 패킷을 연결

## 브로드캐스트 컨트롤
- 라우터의 특징중 하나는 분명한 목적지가 있을 때만 통신을 허락
	- 목적지가 있음은 2계층 스위치(모든 패킷에 전송)와 가장 큰 차이점
- 멀티캐스트 정보를 습득하지 않고, 브로드캐스트 패킷을 전달하지 않음
	- 브로트캐스트 : 1-모든 통신, 동일 네트워크에 존재하는 모든 호스트가 목적지
	- 멀티캐스트 : 1-그룹 통신, 하나의 출발지에서 다수의 지정된 목적지

## 프로토콜 변환
- 2계층까지 헤더 정보를 벗겨내고, 3계층 주소 확인
- 2계층 헤더 정보를 새로 입혀 외부로 내보냄
- LAN, WAN에서 사용하는 프로토콜이 다른데, 이를 연결해주는데 사용

# 5. ARP를 통해 IP주소를 MAC주소로 변환
- 실질적 통신을 위하여 IP주소를 물리 주소인 MAC주소로 변환
	- 해당 네트워크에서 ARP를 브로드 캐스팅
- ARP(Address Resolution Protocol) : IP 주소를 MAC 주소와 매칭 시키기 위한 프로토콜
- MAC 주소 : 네트워크 장비 또는 컴퓨터는 유일한 MAC주소를 가짐
- IP주소와 MAC주소를 일대일 매칭시킨 ARP table을 활용

# 6. 대상 서버와 TCP 소켓 연결
- 3 way-handshake를 통해 TCP 연결
	- [TCP handshake](TCP%20handshake.md)
	- SYN(연결 요청), ACK(승인) 메시지를 통하여 3단계를 거쳐 연결
- [HTTPS](HTTPS.md)인 경우, TLS handshake 추가
	- TLS(transport layer socket) : SSL의 표준
	- SSL(secure socket layer) : 네트워크 통신을 위한 보안 암호 규약

# 7. HTTP or HTTPS 프로토콜 요청 & 응답
- TCP가 연결되면 실제로 요청이 발생
- 자격 증명이 필요한 경우 등 header, method등을 활용
- 서버는 요청을 수신, 응답을 보냄

# 8. 브라우저에서 응답 해석
- 브라우저가 HTML 컨텐츠를 보여줌

# 참조
- [브라우저에 map.google.com을 입력하면 어떤 일이 벌어지나요?](https://velog.io/@khy226/%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80%EC%97%90-url%EC%9D%84-%EC%9E%85%EB%A0%A5%ED%95%98%EB%A9%B4-%EC%96%B4%EB%96%A4%EC%9D%BC%EC%9D%B4-%EB%B2%8C%EC%96%B4%EC%A7%88%EA%B9%8C)
- [라우터 동작 방식](https://haeunyah.tistory.com/98)
- [ARP & MAC address](https://aws-hyoh.tistory.com/entry/ARP-%EC%89%BD%EA%B2%8C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0)
