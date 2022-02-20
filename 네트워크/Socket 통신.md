[TOC]

# Socket 통신

<br>

## Http 와 Socket 프로그래밍

### 1. Http 프로그래밍

![img](https://t1.daumcdn.net/cfile/tistory/99926F335C6939EA38)

> Client의 요청(Request)이 있을 때만 서버가 응답(Response)하여 해당 정보를 전송하고 곧바로 연결을 종료하는 방식

- Server가 Client로 요청을 보낼 수 없는 **단방향 통신**
- 실시간 연결이 아닌, **필요한 경우에만 Server로 접근하는 컨텐츠 위주**의 데이터를 사용할 때 용이
- 요청을 보내 Server의 응답을 기다리는 **어플리케이션(Android or iOS)의 개발에 주로 사용**

### 2. 소켓(Socket) 프로그래밍

![img](https://t1.daumcdn.net/cfile/tistory/9939C6385C6939FD26)

> Server와 Client가 특정 Port를 통해 **실시간으로 양방향 통신**을 하는 방식

- Server 역시 Client로 요청을 보낼 수 있음
- **실시간 Streaming 중계**나 **실시간 채팅**과 같이 즉각적으로 정보를 주고받는 경우에 사용

<br>

## WebSocket

![WebsocketSo1](https://d2.naver.com/content/images/2015/06/helloworld-1336-1-1.png)

> 웹 페이지의 한계에서 벗어나 **실시간으로 상호작용**하는 웹 서비스를 만드는 표준 기술

- WebSocket 이전에는 Http 에서 Polling, Streaming 방식의 AJAX 코드를 이용하여 이를 구현함
- 최초 접속은 일반 Http request를 통해 handshaking 과정을 통해 이루어짐
  - 기존의 80 포트로 접속하므로 추가로 방화벽을 열지 않아도 되고, CORS 적용이나 인증 등의 과정 동일

<br>

### WebSocket을 지원하는 브라우저와 웹 서버

> 클라이언트인 브라우저 중에서 Chrome, Safari, Firefox, Opera에서 사용할 수 있으며, 각종 모바일 브라우저에서도 사용할 수 있음

![image-20220220180327753](https://user-images.githubusercontent.com/87461594/154837618-1693e669-25de-4400-902d-fe974f2ffe37.png)

- 웹 서버 중에서는 Apache 에서 별도의 모듈을 설치하여 WebSocket을 사용할 수 있음
- JEE 환경의 WAS 에서는 Jetty, GlassFish 에서 WebSocket을 사용할 수 있음
- 또한, Node.js에서도 WebSocket을 사용할 수 있음

<br>

### WebSocket API 사용

> WebSocket 프로토콜을 나타내는 ws://는 URI Scheme를 사용하고, 암호화 소켓은 https:// 처럼 wss:// 사용

```js
if ('WebSocket' in window) {
    // 웹서버와 연결
    var oSocket = new Websocket("ws://localhost:80");
    
    // 메시지를 받았을 때 (onmessage)
    oSocket.onmessage = function (e) {
        console.log(e.data);
    };
    
    // 소켓에 연결할 때 (onopen)
    oSocket.onopen = function (e) {
        console.log("open");
    };
    
    // 소켓 연결을 종료할 때 (onclose)
    oSocket.onclose = function (e) {
        console.log("close");
    };
    
    // 서버에 메시지 보내기
    oSocket.send("message");
    oSocket.close();
}
```

<br>

### Socket.io

> WebSocket, FlashSocket, AJAX Long Polling, AJAX Multi part Streaming, IFrame, JSONP Polling을 하나의 API로 추상화한 것

- 브라우저와 웹 서버의 **종류와 버전을 파악하여 가장 적합한 기술을 선택**하여 사용하는 방식

  - WebSocket이 적용되지 않는 경우를 고려하여 알맞은 기술을 적용

- Node.js 에서 활용되는 모듈 형태 (LearnBoost 라는 회사의 저작물이며 MIT 라이센스를 가진 오픈소스)

- 브라우저에서 JavaScript를 사용하여 구현

  - NPM 을 이용하여 Socket.io를 웹 서버에 설치 후 서버 스크립트 작성

  ```bash
  npm install socket.io
  ```

  ```js
  // 80 포트로 소켓을 open
  var io = require('socket.io').listen(80);
  
  // connection이 발생할 때 핸들러를 실행
  io.sockets.on('connection', function (socket) {
      // 클라이언트로 news 이벤트를 보냄
      socket.emit('news', { hello: 'world' });
      
      // 클라이언트에서 my other event가 발생하면 데이터를 받음
      socket.on('my other event', function (data) {
          console.log(data);
      });
  });
  ```

  - 작성한 스크립트를 nohup 등을 이용하여 백그라운드로 실행

  ```bash
  nohup node ./server.js &
  ```

  - 클라이언트는 Socket.io 패키지에 있는 클라이언트 스크립트 작성

  ```html
  <script src="/socket.io/socket.io.js"></script>
  <script>
  	// localhost로 연결
      var socket = io.connect('http://localhost');
      
      // 서버에서 news 이벤트가 일어날 때 데이터를 받음
      socket.on('news',
      	function (data) {
          	console.log(data);
          	
          	// 서버에 my other event 이벤트를 보냄
          	socket.emit('my other event', { my: 'data' });
      });
  </script>
  ```

  > 브라우저에서 클라이언트 페이지를 열면 클라이언트 콘솔에는 "{ hello: 'world' }"가, 서버 콘솔에는 "{ my: 'data' }"가 출력됨

<br>

### SockJS

> Socket.io 와 동일하게 WebSocket을 먼저 사용하려고 시도하고, 실패할 경우 다양한 브라우저별 전송 프로토콜을 사용

- SpringFramework 를 활용하여 적용할 수 있으며, 서버 개발 시 Spring 설정에서 어떤 방식으로 통신할지 결정할 수 있음

- 클라이언트 쪽은 SockJS Client를 통해 서버와 통신

- JavaScript를 활용한 SockJS 구현

  - SockJS JavaScript 라이브러리 불러오기

  ```html
  <script src="https://cdn.jsdeliver.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
  ```

  - SockJS 서버와의 연결을 설정

  ```js
  var sock = new SockJS('https://mydomain.com/my_prefix');
  sock.onopen = function() {
      console.log('open');
      sock.send('test');
  };
  
  sock.onmessage = function(e) {
      console.log('message', e.data);
      sock.close();
  };
  
  sock.onclose = function() {
      console.log('close');
  };
  ```

<br>

## [참고자료]

- Http와 Socket 의 차이
  - https://mangkyu.tistory.com/48
- WebSocket 이전의 양방향 통신, Socket.io와 SockJS
  - https://adrenal.tistory.com/20
  - https://github.com/sockjs/sockjs-client
- WebSocket과 Socket.io
  - https://github.com/WeareSoft/tech-interview/blob/master/contents/network.md#%EC%86%8C%EC%BC%93%EC%9D%B4%EB%9E%80
  - https://d2.naver.com/helloworld/1336

