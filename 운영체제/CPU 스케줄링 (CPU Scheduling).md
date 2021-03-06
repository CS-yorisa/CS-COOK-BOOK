[TOC]

# CPU 스케줄링 (CPU Scheduling)

<br>

## CPU 스케줄링

- 일반적으로 컴퓨터 시스템에서 **프로세서(Processor)는 CPU 를 나타냄**
- 다수의 프로세스가 준비 상태에 있을 때, **CPU 가 어느 프로세스를 먼저 처리**하도록 할 것인가를 결정하는 것

<br>

## CPU 스케줄링 전략의 목표 및 기준

> CPU 스케줄링의 기본 목표 중 하나는 프로세스들의 기다리는 시간을 줄여, 가능한 신속하게 처리할 수 있도록 하는 것

### 1. 사용자 관점

- **응답 시간 (Response Time)** : 사용자 데이터 입력 후, 출력이 이루어질 때까지의 소요 시간
- **반환 시간 (Turnaround Time)** : 프로그램 제출(혹은 시작) 후, 끝날 때까지 소요되는 총 시간
- **대기 시간 (Waiting Time)** : 프로세스들이 준비 상태로 대기열(Ready Queue)에서 기다린 시간의 총합

### 2. 시스템 관점

- **CPU 이용률 (CPU Utilization)** : 총 경과 시간 대비 CPU 가 순수하게 사용자 프로세스를 수행한 시간의 비
- **처리량 (Throughput)** : 단위 시간당 처리된 프로세스의 개수

<br>

## 프로세스의 상태

![img](https://t1.daumcdn.net/cfile/tistory/990DB03F5C7AC10303)

- **승인 (Admiited)** : 프로세스 생성이 가능하여 승인됨
- **스케줄러 디스패치 (Scheduler Dispatch, Scheduled)** : 준비 상태에 있는 프로세스 중 하나를 선택하여 실행
- **인터럽트 (Interrupt, Time-slice burst)** : 예외, 입출력, 이벤트 등이 발생하여 실행 중인 프로세스를 준비상태로 바꾸고, 해당 작업을 먼저 처리
- **입출력 또는 이벤트 대기 (I/O or Event Wait)** : 실행 중인 프로세스가 입출력, 이벤트를 처리해야 하는 경우, 입출력/이벤트가 모두 끝날 때까지 대기 상태로 만듬
- **입출력 또는 이벤트 완료 (I/O or Event Completion)** : 입출력/이벤트가 끝난 프로세스를 준비 상태로 전환하여 스케줄러에 의해 선택될 수 있도록 만듬

<br>

## 선점 / 비선점 스케줄링

### 1. 비선점 스케줄링 (Non-Preemptive)

> 실행 중인 프로세스가 자율적으로 CPU 를 반납할 때까지 CPU 를 계속 점유하여 실행

- 입/출력이 적은 계산 위주**(CPU Bound)** 프로세스가 다수 적재되어 있다면 **다른 프로세스들의 응답 시간은 매우 저조**
- 프로세스들이 입/출력 위주**(I/O Bound)** 라면 **CPU 를 어느 정도 규칙적으로 번갈아 할당**받을 수 있어서 응답 시간이 나쁘지 않음
- `I/O or Event Wait`, `Exit` 시에만 관여

### 2. 선점 스케줄링 (Preemptive)

> 자율적 CPU 반납은 물론 **타율적 CPU 반납**까지 이루어짐

- 어떤 프로세스도 **일정 시간(타임 퀀텀) 이상 동안 연속해서 CPU 를 점유할 수 없음**
- 계산 위주 프로세스가 많이 적재되어 있더라도, **모든 프로세스의 반응 시간 성능을 평균 이상으로 유지**할 수 있음
- `Interrupt`, `I/O or Event Completion`, `I/O or Event Wait`, `Exit` 에서 모두 관여

<br>

## CPU 스케줄링 종류

### 1. 비선점 스케줄링

#### 1) 선입 선처리 (FCFS: First-Come First-Served)

> 프로세스들이 Ready Queue 에 도착하는 순어데 따라 CPU 를 할당하는 방법

![image-20220320180638589](https://user-images.githubusercontent.com/87461594/159157139-2a4706ca-ec57-4eec-825b-9211deff0e09.png)

- CPU 버스트가 긴 **계산 위주 프로세스**가 먼저 도착하는 경우, CPU 버스트가 짧은 입/출력 위주 프로세스가 오래 기다려야 함

- 위와 같은 현상을 **호위 효과(Convoy Effect)** 라 부름

- 순서에 따라 **평균 대기 시간과 평균 응답 시간** 의 편차가 매우 커짐

  ```markdown
  P1 -> P2 -> P3:
  평균 대기 시간 = (0 + 24 + 27) / 3 = 17
  평균 응답 시간 = (24 + 27 + 30) / 3 = 27
  
  P3 -> P2 -> P1:
  평균 대기 시간 = (0 + 3 + 6) / 3 = 3
  평균 응답 시간 = (3 + 6 + 30) / 3 = 13
  ```

#### 2) 최단 작업 우선 (SJF: Shortest Job First)

> CPU 버스트가 가장 짧은 프로세스를 CPU 에 먼저 할당하는 방법

![image-20220320181205778](https://user-images.githubusercontent.com/87461594/159157157-870b8af4-1460-47da-beb6-64e399d716de.png)

- 평균 대기 시간과 평균 응답 시간이 FCFS 에 비해 개선됨

- 계산 위주의 **긴 프로세스에 CPU 가 할당된 상태에서 다수의 입/출력 위주 프로세스가 도착**한다면 마찬가지로 **호위 효과** 가 발생

  ```
  P4 -> P1 -> P3 -> P2:
  평균 대기 시간 = (0 + 3 + 9 + 16) / 4 = 7
  평균 응답 시간 = (3 + 9 + 16 + 24) / 4 = 13
  ```

#### 3) 우선순위 (Priority)

> 우선순위가 높은 프로세스가 먼저 선택되는 방법 (우선순위는 정수값으로 나타냄)

![image-20220320181623595](https://user-images.githubusercontent.com/87461594/159157170-cea745c6-24c0-4c21-a19a-fb38892f7e25.png)

- **내부적인 요소와 외부적인 요소를 바탕**으로 우선순위 선정
  - 내부적인 요소 : 제한 시간, 기억장소 요청량, I/O or CPU Burst 등
  - 외부적인 요소 : 프로세스의 중요성, 사용료를 많이 낸 사용자 등
- 우선순위가 낮은 프로세스의 순서가 무한정 연기되는 **Starvation (기아)** 가 발생할 수 있음
  - Ready Queue 에서 기다리는 동안 일정시간이 지나면 우선순위를 높여주는 **Aging** 기법으로 해결할 수 있음

#### 4) 최고 응답률 우선 (HRN: Highest Response-Ratio Next)

> SJF 스케줄링에 **Aging** 기법을 합친 비선점형 스케줄링 방법

- CPU 버스트가 긴 프로세스의 대기 시간이 길어지면 우선순위(응답률)를 높여 **Starvation (기아)** 문제를 해결

  ```markdown
  우선순위(응답률) = (준비 큐 대기 시간 + CPU 버스트 시간) / (CPU 버스트 시간) = 1 + ((준비 큐 대기 시간) / (CPU 버스트 시간))
  ```

---

### 2. 선점 스케줄링

#### 1) 최단 잔여 시간 우선 (SRTF: Shortest Remaining Time First)

> Ready Queue 에 새로운 프로세스가 도착하면, 다시 SJF 의 선정 과정을 진행하는 방법

![image-20220320185046924](https://user-images.githubusercontent.com/87461594/159157202-13f99544-3cac-46db-b13b-aaabca8caa23.png)

![image-20220320185056457](https://user-images.githubusercontent.com/87461594/159157207-ca1cb4a3-46db-4176-a276-3d7f4d18b2b5.png)

- 비선점 스케줄링의 **SJF 방식에 선점 스케줄링 방식을 도입**하여 단점을 보완
- **Arrival Time (도착 시간)** 이 다른 상황에서 도착하는 프로세스와 현재 Ready Queue 를 비교하여 CPU 할당
- 평균 대기 시간과 평균 응답 시간을 더욱 개선할 수 있음 (입/출력 프로세스의 우선순위를 그때그때 갱신 가능)
- 계산 위주의 프로세스 순서가 지속적으로 밀리면서 **Starvation (기아)** 발생 가능성이 커질 수 있음

#### 2) 라운드 로빈 (RR: Round Robin)

> 모든 프로세스에 동일한 최대 CPU 점유 시간(타임 퀀텀)을 설정하는 방법

![image-20220320183833100](https://user-images.githubusercontent.com/87461594/159157182-ff074d89-f4c9-4e1a-b918-5c3138eb802c.png)

- 처리 중인 프로세스의 CPU 실행 시간이 **타임 퀀텀을 초과하면 CPU 를 강제로 회수**하는 방식

- 모든 프로세스들에게 **CPU 가 할당될 기회가 동일**하게 주어지므로, **대화식 시스템 환경에 적합**

  > **대화식 시스템** : 시스템과 사용자가 모니터와 입력 장치를 통해 대화하듯이 일을 처리해 나가는 방식

- **적절한 타임 퀀텀 설정**이 매우 중요
  - 타임 퀀텀이 아주 작으면 CPU 할당이 교체될 때마다 일어나는 **컨텍스트 스위칭 횟수가 증가하여 시스템 부담을 증가**
  - 아주 크게 설정하는 경우 FCFS 스케줄링과 유사한 방식으로 후퇴할 수 있음

#### 3) 다단계 큐 (MQ: Multi-level Queue)

> 프로세스 특성별로 Ready Queue 를 여러 개 두어 우선순위를 부여하는 방법

![image-20220320184559120](https://user-images.githubusercontent.com/87461594/159157191-120340a5-5c63-46b2-b844-2abf8a2684ad.png)

- **높은 우선순위 큐들이 모두 비었을 때**만 다음 단계의 낮은 우선순위 큐에 CPU 를 할당
  - 시스템 프로세스 준비 큐 (우선순위 가장 높음)
  - 대화형(입/출력 위주) 프로세스 준비 큐 **[짧은 타임 퀀텀]**
  - 계산 위주 프로세스 준비 큐 **[긴 타임 퀀텀]**
  - 후면처리 프로세스 준비 큐 (우선순위 가장 낮음)
- 각 준비 큐에 해당 **프로세스의 특성을 반영**하는 **다른 타임 퀀텀, 스케줄링 전략을 적용**할 수 있음

#### 4) 다단계 피드백 큐 (MFQ: Multi-level Feedback Queue)

> 프로세스 진행 과정에서 그 특성이 변하면 이를 인지하여 해당 프로세스의 큐를 이동시키는 방법

![image-20220320184840021](https://user-images.githubusercontent.com/87461594/159157199-7257b60e-8449-4e1c-a214-14102b5836be.png)

- **계산 위주 단계와 입/출력 위주 단계를 반복**하는 응용 프로그램의 스케줄링을 유동적으로 관리
  - 프로세스가 타임 퀀텀을 소진하지 못하고 **CPU 를 자진 반납**하면, **입/출력 성향이 강해진 것으로 인식**
  - 반대로, 타임 퀀텀을 모두 소진한 후 **CPU 를 강제 회수**당하면, **계산 성향이 강해진 것으로 인식**

<br>

## [참고자료]

- https://github.com/gyoogle/tech-interview-for-developer/blob/master/Computer%20Science/Operating%20System/CPU%20Scheduling.md
- https://velog.io/@codemcd/%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9COS-6.-CPU-%EC%8A%A4%EC%BC%80%EC%A4%84%EB%A7%81
- https://boycoding.tistory.com/258
- https://hyunah030.tistory.com/4