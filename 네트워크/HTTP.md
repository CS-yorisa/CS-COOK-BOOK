## HTTP(HyperText Transfer Protocol)
- W3상에서 정보를 주고 받을 수 있는 프로토콜
    - client-server 프로토콜로, 다음과 같이, 요청, 응답이 일어남
![요청](https://mdn.mozillademos.org/files/13687/HTTP_Request.png)
![응답](https://mdn.mozillademos.org/files/13691/HTTP_Response.png)
- 주로 TCP를 사용, HTTP/3부터 UDP를 사용
- Stateless, Connectionless
- OSI 7 Layers의 Application Layer

## URI(Uniform Resource Identifier)
- 인터넷에 있는 자원을 나타내는 유일한 주소, 인테넛 프로토콜에 항상 붙어 다님

![URI, URL, URN](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FAkL2o%2FbtqJptEQJmu%2FomyDDiWIRr99BFKeVIpTt0%2Fimg.png)

#### Resource
- 모든 웹 컨텐츠의 source

#### URL(Uniform Resource Locator)
- 프로토콜을 포함하여, 자원의 위치를 의미

#### URN(Uniform Resource Name)
- 프로토콜을 포함하지 않고, 독립적인 자원 지시

## Transaction
- HTTP Transcation은 요청과 응답으로 구성

#### Method
- HTTP는 method라는 명령어를 지원하며, 모든 HTTP요청은 method를 가짐

|HTTP mehod|Description|
|---|---|
|GET|특정 리소스 요청|
|HEAD|특정 리소스 요청에 대한 헤더 요청|
|POST|서버로 데이터 전송|
|PUT|기존 리소스의 데이터 대체|
|DELETE|특정 리소스 삭제|

#### Status Codes
- 클라이언트의 요청에 대해, 세자리 수로 된 응답코드를 전송

|Code|Descriptions|
|---|---|
|1XX|정보 교환|
|2XX|전송이 성공적으로 이루어지거나, 이해, 수락|
|3XX|자료의 위치 변환|
|4XX|클라이언트 측의 오류|
|5XX|서버 층의 오류|

## Protocol Version

#### HTTP/0.9
- 초기버전
- GET method만 존재
- HTML로만 응답

#### HTTP/1.0
- 버전 정보가 각 요청과 함께 전송
- 상태 코드가 응답과 함께 전송
- 추가적인 헤더가 생겨서, HTML외의 문서 전송 가능

#### HTTP/1.1
- 파이프라이닝기능 추가

![파이프라이닝](https://mdn.mozillademos.org/files/13727/HTTP1_x_Connections.png)

#### HTTP/2
- 헤더 필드 압축, 동일 연결에서 다중 동시 교환 허용으로 효율적 리소스 사용, 지연 시간 감소
- 기존 HTTP표준의 확장으로 체계, 기능, 개념의 유지

#### HTTP/3
- QUIC 사용
    - 범용 목적의 전송 계층 통신 프로토콜
    - TCP를 사용하는 연결 지향 웹 어플리케이션 성능 개선, UDP를 경유하여 2개의 종단점 간 수많은 다중화 연경을 확립함으로써 달성
    - 혼잡 회피를 위해 각 방향에서 발생할 수 있는 연결 및 전송 레이턴시, 대역폭 감소

## [HTTPS(HTTP Secure)](HTTPS.md)
- HTTP 암호화 버전

## 참조
- https://ko.wikipedia.org/wiki/HTTP
- https://developer.mozilla.org/ko/docs/Web/HTTP
- https://kyun2da.dev/CS/http%EB%9E%80/
- https://programming119.tistory.com/194
- https://velog.io/@zzzz465/HTTP1.1-2-3-%EC%9D%98-%EC%B0%A8%EC%9D%B4%EC%A0%90