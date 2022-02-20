[TOC]

# CORS(Cross-Origin Resource Sharing)

## SOP(Same Origin Policy)란?

- 다른 출처의 리소스를 사용하는 것에 제한하는 보안 방식
- 즉, 같은 출처에서만 리소스를 공유할 수 있다.
- 잠재적으로 해로울 수 있는 문서를 분리하여 공격받을 수 있는 경로 감소

### 출처(origin)

![image](https://user-images.githubusercontent.com/87461672/153697405-168b51f1-2828-4fac-b1aa-169965b146cb.png)

- URL의 Protocol, Host, Port 를 통해 같은 출처인지 다른 출처인지 판단할 수 있다. 

  - 이 세가지가 모두 같아야 같은 출처라고 이야기 한다.

  >인터넷 익스플로러는 두 가지 예외사항이 있다. 
  >
  >- Port가 출처를 판단 안한다. 즉, Port가 달라도 같은 출처라고 판단한다.
  >
  >- 신뢰할 수 있는 사이트, 즉 양쪽 도메인 모두가 **높음** 단계의 보안 수준을 가지고 있는 경우 SOP을 적용하지 않는다.

* 출처 비교 예시

> `http://localhost`와 동일 출처?!

|             URL             | 동일 출처 |                             이유                             |
| :-------------------------: | :-------: | :----------------------------------------------------------: |
|    `http://localhost:80`    |     O     | http 기본 Port가 80port이므로 `http://localhost`는 port가 생략된 것 |
|     `http://127.0.0.1`      |     X     | `127.0.0.1`의 IP는 `localhost` 가 맞지만 브라우저는 String value를 서로 비교 |
| `http://localhost/api/cors` |     O     | `/api/cors`는 추가적으로 붙는 로케이션이다. `/api` 앞까지 비교 |



## CORS(Cross-Origin Resource Sharing)란?

- 다른 출처의 자원을 공유
- 추가 HTTP 헤더를 사용하여, 한 **출처**에서 실행 중인 웹 애플리케이션이 다른 출처의 선택한 자원에 접근할 수 있는 권한을 부여하도록 **브라우저**에 알려주는 체제이다.

### CORS는 브라우저의 구현 스펙에 포함되는 정책

- CORS 정책을 위반하는 리소를 요청하더라도 서버는 정상적으로 응답을 하고, 이후에 브라우저에서 이 응답을 분석하여 CORS 정책 위반이라고 판단되면 버린다.

![image-20220212165414070](../../../../AppData/Roaming/Typora/typora-user-images/image-20220212165414070.png)

- 즉, 브라우저를 통하지 않고 서버 간 통신을 할 떄는 CORS 정책이 적용되지 않는다. 또한 CORS 정책을 위반하는 리소스 요청 때문에 에러가 발생했다고 해도 서버 쪽 로그에는 정상적으로 응답을 했다는 로그만 남는다. 

## CORS 기본 동작

- 기본적으로 웹 클라이언트 어플리케이션이 다른 출처의 리소스를 요청할 때
  -  HTTP 프로토콜을 사용하여 요청을 보냄
  - 이 때 브라우저는 요청 헤더에 `Origin`이라는 필드에 요청을 보내는 출처를 함께 담아보냄.
- 이후 서버가 요청에 대한 응답을 할 때
  - 응답 헤더의 `Access-Control-Allow-Origin`이라는 값에 "이 리소스를 접근하는 것이 허용된 출처"를 내려줌
- 이후 응답을 브라우저는 자신이 보냈던 요청의 `Origin`과 서버가 보내준 응답의 `Access-Control-Allow-Origin`을 비교해본 후 이 응답이 유효한 응답인지 아닌지를 결정한다.



## CORS 접근제어 시나리오

### 프리플라이트 요청 (Preflight Request)

- 일반적으로 웹 어플리케이션을 개발할 때 가장 마주치는 시나리오이다.

- OPTIONS 메서드를 통해 다른 도메인의 리소스에 요청이 가능한지 확인 작업(예비요청) 
  - 본 요청을 보내기 전에 브라우저 스스로 이 요청을 보내는 것이 안전한지 확인
- 요청이 가능하다면 실제 요청(Actual Request)을 보낸다.

![image](https://user-images.githubusercontent.com/87461672/153706083-c611cc6e-8f52-49f9-bfdd-c39d320d7cf6.png)

- 자바스크립트의 `fetch` API를 사용하여 브라우저에게 리소를 받아오라는 명령을 내림.

  -> 브라우저는 서버에게 예비 요청(preflight)을 먼저 보냄

  -> 서버는 예비 요청에 대한 응답으로 현재 어떤 것들을 허용하고, 금지하고 있는지에 대한 정보를 응답 헤더에 담아서 브라우저에게 다시 보내줌.

  -> 브라우저는 자신이 보낸 예비 요청과 서버가 응답에 담아준 허용 정책을 비교한 후, 요청을 보내는 것이 안전하다고 판단되면 같은 엔드포인트로 다시 본 요청을 보냄.

  -> 이후 서버가 본 요청에 대한 응답을 하면 브라우저는 최종적으로 응답 데이터를 자바스크립트에게 넘겨줌.

> 예비 요청 성공/실패 여부 != CORS 정책 위반 여부 
>
> 중요! 응답 헤더에 유효한 `Access-Contro-Allow-Origin` 값이 존재하는가!! `200`이 아니더라도 헤더에 저 값이 제대로 들어가있다면 CORS 정책 위반 아님.



### 단순 요청 (Simple Request)

- Preflight 요청 없이 바로 요청을 날리면서 즉시 이것이 cross origin인지 확인하는 절차
- 다음 조건을 만족해야 요청할 수 있다. (만족시키기 어려움. 사용자 인증에 사용되는 `Authorization`헤더도 이 조건에 포함되지 않음.)
  - 메서드 : GET, HEAD, POST
  - 헤더는 Accept, Accept-Language, Content-Language, Content-Type만 허용
  - Content-Type의 헤더에 허용된 값: application/x-www-form-urlencoded, multipart/form-data, text/plain

![image](https://user-images.githubusercontent.com/87461672/153702517-fc27e97d-2581-4bc2-80a4-9c4b0b9fb9a5.png)

### 인증정보 포함 요청 (Credentialed Request)

- 다른 출처 간 통신에서 좀 더 보안을 강화하고 싶을 때 사용하는 방법.
- 인증 관련 헤더를 포함할 때 사용하는 요청
- 기본적으로 브라우저가 제공하는 비동기 리소스 요청 API인 `XMLHttpRequest`객체나 `fetch` API는 별도의 옵션 없이 브라우저의 쿠키 정보나 인증과 관련된 헤더를 함부로 요청에 담지 않는다. 이때 인증과 관련된 정보를 담을 수 있게 해주는 옵션이 바로 `credentials` 옵션이다.

- `credentials` 옵션 총 3가지의 값

| 옵션 값               | 설명                                            |
| --------------------- | ----------------------------------------------- |
| same-origin (기본 값) | 같은 출처 간 요청에만 인증 정보를 담을 수 있다. |
| include               | 모든 요청에 인증 정보를 담을 수 있다.           |
| omit                  | 모든 요청에 인증 정보를 담지 않는다.            |

- jwt 토큰을 클라이언트에서 자동으로 담아서 보내고 싶을 때 `credentials`를 `include `하게 되면 서브 측 까지 전달된다. 
  - 응답 헤더에는 반드시 `Access-Control-Allow-Credentials: true`가 존재해야한다.
  - `Access-Control-Allow-Origin`에는 `*`를 사용할 수 없으며, 명시적인 URL이어야한다.



## CORS 해결하기

### Access-Control-Allow-Origin 세팅하기

- 서버에서 `Access-Control-Allow-Origin` 헤더에 알맞은 값을 세팅해주는 것이다.
- 와일드카드인 `*`을 사용하여 이 헤더를 세팅하게 되면 모든 출처에서 오는 요청을 받으므로 편할 수 있지만, 보안적으로 심각한 이슈가 발생할 수도 있다.
- 이 헤더는 Nginx나 Apache와 같은 서버 엔진의 설정에서 추가할 수도 있지만, 소스 코드 내에서 응답 미들웨어 등을 사용하여 세팅하는 것을 추천한다. Spring, Express, Django 등 백엔드 프레임워크의 경우에는 모두 CORS 관련 설정을 위한 세팅이나 미들웨어 라이브러리를 제공하고 있다.





# 참조

- [[10분 테코톡\] 🌳 나봄의 CORS - YouTube](https://www.youtube.com/watch?v=-2TgkKYmJt4&list=PLgXGHBqgT2TvpJ_p9L_yZKPifgdBOzdVH&index=55)
- [CORS는 왜 이렇게 우리를 힘들게 하는걸까? | Evans Library (evan-moon.github.io)](https://evan-moon.github.io/2020/05/21/about-cors/)

- [동일 출처 정책 - 웹 보안 | MDN (mozilla.org)](https://developer.mozilla.org/ko/docs/Web/Security/Same-origin_policy)