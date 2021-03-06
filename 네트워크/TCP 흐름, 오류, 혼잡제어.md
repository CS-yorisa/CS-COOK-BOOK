[TOC]

# TCP 흐름제어, 오류제어, 혼잡제어

TCP는 **흐름 제어, 오류 제어, 혼잡 제어**를 통해 **신뢰성**을 보장함

<br>

## 흐름제어 (Flow Control)

- 송신측과 수신측 사이의 데이터 처리 속도 차이(흐름)을 해결하기 위한 기법
- 만약, **송신측**의 전송량 > **수신측**의 처리량일 경우 전송된 패킷은 수신측의 큐를 넘어서 손실될 수 있기 때문에 송신측의 패킷 전송량을 제어하게 됨

### 1. Stop and Wait (정지 - 대기)

![img](https://camo.githubusercontent.com/cb7f08015fa52f106d69a4cab2c4ad48129e2b71133e368808c51578c01f5437/68747470733a2f2f74312e6461756d63646e2e6e65742f6366696c652f746973746f72792f323633423744344535373135454345423332)

- 매번 전송한 패킷에 대한 **확인 응답**을 받아야만 그 다음 패킷을 전송하는 방법
- **'Give & Take'** 구조로 응답이 지연되는 경우에 비효율적

### 2. Sliding Window (슬라이딩 윈도우)

![img](https://camo.githubusercontent.com/3cf70c635be033188c4f4b945b6a873100ea1edc6c6c43304b54d896a5385441/68747470733a2f2f74312e6461756d63646e2e6e65742f6366696c652f746973746f72792f323533463745343835373135454435463237)

- 수신측에서 **설정한 윈도우 크기**만큼 송신측에서 확인 응답 없이 **세그먼트를 전송**할 수 있게 하여 데이터 흐름을 **동적으로 조절**하는 기법
- 수신측으로부터 **ACK (Acknowledgement)** 라는 프레임을 받게 되면 송신측은 **이전에 보낸 데이터의 크기**만큼 윈도우가 오른쪽으로 슬라이딩 되는 방식
- Stop and Wait의 비효율성을 개선

> 윈도우 (Window)  :  송신, 수신 스테이션 양쪽에서 만들어진 버퍼의 크기

<br>

## 오류제어 (Error Control)

- **ARQ (Automatic Repeat Request) 기법**을 사용해 프레임이 손상되었거나 손실되었을 경우, **재전송을 통해 오류를 복구**
- 오류 검출과 재전송을 포함하며, ARQ 기법은 **흐름 제어 기법과 관련**되어 있음

![image-20220108182751719](https://user-images.githubusercontent.com/87461594/148670935-525da0d5-cf8c-4054-bc03-e79d41ba366e.png)

### 0. 프레임이 재전송 되는 경우

- **NAK 프레임을 받았을 경우**
  
  - 수신측에서 데이터 오류 프레임을 발견하고, **오류가 발생한 프레임 정보를 포함한 NAK** 를 전송측에 보냄
  
- **전송 데이터 프레임의 분실**

  ![image-20220108182904520](https://user-images.githubusercontent.com/87461594/148670936-0956c221-fdbc-48b8-adb0-c2ec48d205e0.png)

  - 송신측에서 전송한 데이터가 **수신측에 도달하지 못하고 분실**되고, **ACK 프레임이 확인되지 않아 타임아웃** 되는 경우 송신측에서 동일한 데이터를 재전송

- **지정된 타임아웃 내의 ACK 프레임 분실 (Lost ACK)**

  ![image-20220108182917044](https://user-images.githubusercontent.com/87461594/148670944-ef430d49-d897-4dfe-9b3d-70fe97f076ad.png)

  - 송신측의 데이터가 수신측에 올바르게 전송되었지만, **응답 ACK 프레임이 분실되어 타임아웃** 되는 경우 송신측에서 동일한 데이터를 재전송

<br>

### 1. Stop and Wait ARQ (정지 - 대기)

![image-20220108180916357](https://user-images.githubusercontent.com/87461594/148670950-54e82580-ebc2-480a-b756-06b065a1d3fe.png)

- 송신측에서 1개의 프레임을 송신하고, 수신측에서 수신된 프레임의 **에러 유무** 판단에 따라 **ACK or NAK (Negative Acknowledgement)** 를 보내는 방식
- 수신측이 데이터를 받지 못했을 경우 NAK 를 보내고, NAK 를 받은 송신측은 데이터를 재전송
- 만약, 데이터나 ACK 가 분실되었을 경우 일정 간격의 시간을 두고 **타임아웃**이 되고, 송신측은 데이터를 재전송

<br>

### 2. Go-Back-n ARQ (슬라이딩 윈도우)

![image-20220108181109159](https://user-images.githubusercontent.com/87461594/148670954-0f1d6a41-af80-4a10-8dad-61f490ffa06f.png)

- 전송된 프레임이 **손상되거나 분실, 타임아웃**이 발생된 경우, **확인된 마지막 프레임 이후로 모든 프레임을 재전송**
- 슬라이딩 윈도우는 연속적인 프레임 전송 기법으로 전송측은 **전송된 프레임의 복사본**을 가지고 있어야 하며, ACK 와 NAK 모두 각각 구별해야 함

<br>

### 3. Selective Repeat ARQ (선택적 재전송)

![image-20220108181135141](https://user-images.githubusercontent.com/87461594/148670959-b4a559e9-8e56-4a80-b0c4-11d3c95c342e.png)

- 손상되거나 손실된 프레임만 재전송하는 방법
- **GBn ARQ**의 확인된 마지막 프레임 이후의 모든 프레임을 재전송하는 단점을 보완하는 기법
- **별도의 데이터 재정렬**을 수행해야 하며, **별도의 버퍼**를 필요로 함 (수신측에 버퍼를 두어 받은 데이터의 정렬이 필요)

![img](https://blog.kakaocdn.net/dn/rQvQS/btqJvN3DCLE/d9ZsQd1sZL673k1gAS0iA1/img.png)

<br>

## 혼잡제어 (Congestion Control)

- 송신측의 **데이터 전달**과 네트워크의 **데이터 처리 속도**를 해결하기 위한 기법
- 한 라우터에게 데이터가 몰려 **모든 데이터를 처리할 수 없는 경우**, 호스트들은 재전송을 하게 되고 결국 혼잡만 가중시켜 **오버플로우**나 **데이터 손실**이 발생
- 이러한 **네트워크의 혼잡을 피하기 위해 송신측에서 보내는 데이터의 전송 속도를 제어**하는 것

### 0. 혼잡제어 정책

- **혼잡 회피 (Congestion Avoidance)**
  - Window Size가 임계 값에 도달한 이후에는 데이터의 손실이 발생할 확률이 높음
  - 이를 회피하기 위해 **윈도우 크기를 선형적으로 1씩 증가시키는 방법**
  - 일정 시간 동안 ACK를 수신하지 못하는 경우 네트워크 혼잡으로 인식하고 **Window Size를 1로 감소**
- **빠른 회복 (Fast Recovery)**
  - 혼잡한 상태가 되면 **Window Size를 1로 줄이는 대신 절반**으로 줄이고 선형 증가시키는 방법
- **빠른 재전송 (Fast Retransmit)**
  - 수신측에서 데이터를 받을 때 먼저 도착해야 할 데이터가 도착하지 않고 다음 데이터가 도착하는 경우 **먼저 도착해야 하는 데이터의 ACK 패킷을 송신측으로 전송**
  - **동일한 데이터의 ACK 패킷을 3개** 받으면 해당 데이터를 재전송 **(3 ACK Duplicated)**
  - 이를 네트워크 혼잡으로 간주하여 **Window Size를 절반**으로 줄임

<br>

### 1. AIMD (Additive Increase Multicative Decrease)

![aimd](https://evan-moon.github.io/static/1f8521aeeab86f9056a053a93f69adb1/17d73/aimd.png)

- 합 증가 / 곱 감소 알고리즘
- 패킷 하나를 보내는 것으로 시작하여 문제 없이 도착할 때마다 **Window Size를 1씩 증가**시키고, 실패하거나 타임아웃이 발생하면 **Window Size를 절반으로 감소**시키는 기법
- 여러 호스트가 한 네트워크를 공유하고 있으면 나중에 진입하는 쪽이 처음에 불리하지만, 시간이 흐를수록 평형 상태로 수렴하게 됨
- 초기 네트워크의 **높은 대역폭을 사용하지 못하고**, 네트워크가 혼잡해지는 것을 미리 감지하지 못하고 **혼잡해지고 나서야 대역폭을 줄이게 된다**는 문제점이 있음

<br>

### 2. Slow Start

![tahoe ssthresh](https://evan-moon.github.io/static/1a6a5314e2aa526f2fa7a406638af3ac/6af66/tahoe-ssthresh.png)

- 패킷을 하나를 보내는 것으로 시작하여 **문제 없이 도착한 ACK 패킷마다 Window Size를 1씩 늘림.** 즉, 한 주기가 지나면 **Window Size는 2배**가 됨 (그래프의 모양은 지수 함수 꼴)
- 혼잡 현상이 발생하였던 **Window Size의 절반까지 적용**하고, 그 이후부터는 완만하게 1씩 증가시킴
- 혼잡 현상이 발생하는 경우 **Window Size를 1로 떨어뜨림**
- AIMD에서 처음 전송 속도를 올리는 데 시간이 걸리는 단점을 보완



## [참고자료]

- https://github.com/gyoogle/tech-interview-for-developer/blob/master/Computer%20Science/Network/TCP%20(%ED%9D%90%EB%A6%84%EC%A0%9C%EC%96%B4%ED%98%BC%EC%9E%A1%EC%A0%9C%EC%96%B4).md#tcp-%ED%9D%90%EB%A6%84%EC%A0%9C%EC%96%B4%ED%98%BC%EC%9E%A1%EC%A0%9C%EC%96%B4
- https://rok93.tistory.com/entry/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-TCP-%ED%9D%90%EB%A6%84%EC%A0%9C%EC%96%B4%ED%98%BC%EC%9E%A1%EC%A0%9C%EC%96%B4
- https://slidesplayer.org/slide/15332844/
- https://evan-moon.github.io/2019/11/26/tcp-congestion-control/

