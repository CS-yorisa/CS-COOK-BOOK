# HTTP Header
- 클라이언트와 서버가 요청 또는 응답으로 부가적인 정보를 전송할 수 있도록 함
- 대소문자를 구분하지 않는 이믈, 콜론 다음에 오는 줄 바꿈 없는 값으로 이루어짐
- 커스텀 헤더는 `X-`를 붙여서 추가할 수 있지만 폐기되었음
- 헤더는 다음과 같은 네 가지로 구분할 수 있음
	- General header : 요청과 응답 모두에 적용되지만, 바디에서 최종적으로 전송되는 데이터와 관련 없는 헤더
	- Request header : 페치될 리소스나 클라이언트 자체에 대한 자세한 정보를 포함하는 헤더
	- Response header : 위치ㅣ 또는 서버 자체에 대한 정보와 같이 응답에 대한 부가적인 정보를 갖는 헤더
	- Entity header : 컨텐츠 길이나 MIME 타입과 같이 엔티티 바디에 대한 자세한 정보를 포함하는 헤더 
- 많이 사용되는 헤더 위주로 정리

## General header
- 요청과 응답 모두에 적용되는 (필수적인) 헤더, 바디에서 최종적으로 전송되는 데이터와 관련 없는 헤더
- Date : 날짜와 시간
	- `Date: Mon, 1, Jan, 2022, 00:00:00 GMT`
- Connection : 현재 전송이 완료된 수 네트워크 접속 유지할지 말지 제어
	- keep-alive : 지속 연결
	- close : 연결 종료
- Cache-Control : 캐싱을 허용할지 정함
	- 캐시 능력(언제 가능할지), 만료, 재검증과 리로딩 등으로 구분
```
Cache-Control: max-age=<seconds>
Cache-Control: max-stale[=<seconds>]
Cache-Control: min-fresh=<seconds>
Cache-control: no-cache
Cache-control: no-store
Cache-control: no-transform
Cache-control: only-if-cached
```

## Request header
- 페치될 리소스나 클라이언트 자체에 대한 자세한 정보를 포함하는 헤더
- Host : 서버의 도메인 네임과 현재 듣고 있는 TCP 포트
- User-Agent : 현재 사용자가 어떤 클라이언트를 이용해 요청을 보냈는지
- Accept : 요청을 보낼 때 서버에게 어떤 타입으로 응답을 원하는지 보냄
- Authorization : 인가된 사용자인지 인증
- Origin : POST 등 요청에서 어느 주소에서 시작되었는지
	- CORS문제가 발생하는 이유가 되는 헤더
- Referer : 이 페이지에 대한 주소

## Response header
- 위치 또는 서버 자체에 대한 정보와 같이 응답에 대한 부가적인 정보를 갖는 헤더
- Access-Control-Allow-origin : CORS정책과 관련하여, 허용하는 origin
- Allow : 허용하는 메서드
- Content-Disposition : 응답 본문을 브라우저가 어떻게 표시해야 할지
	- inline인 경우 웹 페이지에, attachment인 경우 다운로드
	- 보통 FTP서버, 파일 전용 서버에서 많이 사용
- Location : 리다이렉트 헤더, 300번대 응답, 201응답일 때 어느 페이지로 이동할지

## Entity header
- 컨텐츠 길이나 MIME 타입과 같이 엔티티 바디에 대한 자세한 정보를 포함하는 헤더
- Content-Length : Header + Body의 크기
- Content-Type : 개체의 미디어 타입(MIME) 와 문자열 인코딩(UTF-8)
- Content-Language : 사용자 언어, text 뿐만 아니라 미디어 타입에도 적용

### MIME 타입
- 미디어 타입, MIME 타입, 콘텐츠 타입
- 인터넷에 전달되는 파일 포맷, 포맷 컨텐츠
	- `type/subtype` 형태로 구성
- `text` : 텍스트를 포함한 모든 문서
	- `text/plain` `text/html` `text/css` `text/javascript`
- `image` : 모든 종류의 이미지
	- `image/gif` `image/png` `image/jpeg` `image/webp`
- `audio` `video`  : 모든 종류의 오디오, 비디오
- `application` : 모든 종류의 이진 데이터
	- `application/xml` `application/json`
- `multipart` 

### 문자 인코딩
- 문자나 기호들을 컴퓨터가 이용할 수 있는 신호로 만듬
- 모든 문자를 문자집합을 활용하여 숫자로 치환할 수 있게 함
- ASCII
- KSC 5061-1987 : 한글 한 글자당 2byte 고정 길이를 가지는 한국 표준 문자집합
	- 한국어를 2350자만 활용가능해서 제약 발생(전체 한국어의 21%만 가능)
- 유니코드
	- 전체 65536가지 표현 가능, 한국어 11184자(17%)
	- UTF-8 : 1~4바이트 가변길이 인코딩
	- UTF-16 : 2바이트 또는 4바이트 고정 길이
	- UTF-32 : 4바이트 고정길이

# 참조
- [MDN](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers)
- [MDN MIME](https://developer.mozilla.org/ko/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
- [Wikipedia 미디어 타입](https://ko.wikipedia.org/wiki/%EB%AF%B8%EB%94%94%EC%96%B4_%ED%83%80%EC%9E%85)
- [문자열 인코딩](https://redisle.tistory.com/14)
- https://wonit.tistory.com/308
- https://velog.io/@cham/HTTP-Header%EC%97%90%EB%8A%94-%EC%96%B4%EB%96%A4-%EC%A0%95%EB%B3%B4%EB%93%A4%EC%9D%B4-%EB%8B%B4%EA%B2%A8%EC%9E%88%EC%9D%84%EA%B9%8C