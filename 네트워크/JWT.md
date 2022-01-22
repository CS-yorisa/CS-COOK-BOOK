## JWT(JSON Web Token)
- 선택적 서명 및 선택적 암호화를 사용하여 데이터를 만들기 위한 인터넷 표준
- JSON 포멧을 이용하여 사용자에 대한 속성을 저장하는 웹 토큰
- 일반적으로 HTTP 헤더에 `Authorization: <type> <credentials>` 형태로 전송
    - type은 Basic, Bearer, Digest, HOBA, MUTUAL, AWS4-HMAC-SHA256등이 있고, JWT는 Bearer 방식에 속함
    - 인증 방식 ⊃ 토큰 인증 방식 ⊃ Bearer type ⊃ JWT

## 인증 방식(토큰 vs 세션)
- 웹 서버는 stateless이므로 인증 관리 방법 필요

#### Session 기반 인증
- 유저가 로그인하고 세션이 서버에 저장, session id로 관리
- 브라우저 쿠키로 session id 저장
- 브라우저의 모든 request에 쿠키로 저장된 session id를 담아서 저장
- 서버는 클라이언트가 보낸 session id와 서버에 저장된 session id를 비교하여 인증 수행

##### 장점
- 구현이 명확
- 상대적으로 안전

##### 단점
- 모든 유저 정보를 관리하므로 서버에 부담
- scale out, scale in이 어려울 수 있음

#### Token 기반 인증
- 로그인 기록에 토큰을 클라이언트가 발급받아, 일반적으로 local storage에 저장
- 클라이언트는 request header에 토큰을 포함하여 보냄
- 서버는 받은 토큰을 확인(인증)한 후 유저의 권한 인가

##### 장점
- 서버 메모리 부담이 없고, DB scale의 대비책이 필요 없음

##### 단점
- 상대적으로 손상의 위험이 있음
- 구현에 따라 token blacklist 관리에 서버 메모리 소모 발생 가능
- 일반적으로 토큰이 session id보다 더 큰 메모리 사용

## JWT구조
- Header, Payload, Signature 3부분으로 이루어짐
- JSON형태인 각 부분은 Base64로 인코딩 되어 표현
- 각 부분을 이어주기 위해 . 구분자를 사용

#### Header
```JSON
{
    "alg": "HS256",
    "typ": "JWT"
}
```

- JWT검증에 필요한 정보를 가진 JSON객체
- alg에서 알고리즘 방식을, typ에서 토큰 타입을 지정

#### Payload
- 토큰 정보를 표현하기 위해 이미 정해진 종류의 데이터
- Payload에 속하는 속성은 Clain Set이라고 부름
- 간결한 JWT를 위해 key는 3자로 사용하고 다음과 같은 키가 있음
    - iss(issuer) : 토큰 발급자
    - sub(subject) : 토큰 제목, unique한 값을 사용
    - aud(audience) : 토큰 대상자
    - exp(expiration) : 만료시간
    - nbf(not before) : 활성 시작 날짜
    - iat(issued at) : 토큰 발급 날짜
    - jti(JWT ID) : JWT 토큰 식별자, 일회용 토큰에서 사용

#### Signature
- 토큰을 인코딩하거나 유효성 검증할 때 사용하는 고유한 암호화 코드

## Django
- drf에서 TokenAuthenticaion이 존재하여 토큰 기반 인증을 할 수 있지만, 만료시간이 없고 인증을 위해 DB에 접근해야 함
- DRF Simpole JWT는 대칭키를 활용하여 JWT 사용
    - 대칭키 : 키 하나로 복호화 암호화 진행
    - 비대칭키 : 복호화와 암호화에 서로 다른 키를 활용
    - 결과적으로 암호화하는 시크릿 키의 보안이 중요

#### 블랙 리스트
- access token과 refresh token으로 구분하는 경우(Simple JWT), refresh token의 만료시간이 길다며 보안에 위험이 있을 수 있다
- 블랙리스트를 통하여 사용한 refresh token을 사용하지 못하도록 할 수 있음


## 참조
- https://ko.wikipedia.org/wiki/JSON_%EC%9B%B9_%ED%86%A0%ED%81%B0
- https://datatracker.ietf.org/doc/html/rfc6750
- https://velog.io/@cada/%ED%86%A0%EA%B7%BC-%EA%B8%B0%EB%B0%98-%EC%9D%B8%EC%A6%9D%EC%97%90%EC%84%9C-bearer%EB%8A%94-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C
- https://www.ssemi.net/what-is-the-bearer-authentication/
- https://mangkyu.tistory.com/56
- https://gpalektzja.medium.com/jwt%EB%A5%BC-%EC%B0%8D%EB%A8%B9%ED%95%B4%EB%B3%B4%EC%9E%90-2bf26656aa42