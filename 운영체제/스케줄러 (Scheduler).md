[TOC]

# 스케줄러 (Scheduler)

<br>

## 스케줄러(Scheduler)란?

> 시스템이 실행하고자 할 때 프로세서(CPU)를 프로그램에게 할당해주는 역할 담당

![img](https://s3.ap-south-1.amazonaws.com/afteracademy-server-uploads/what-is-longterm-shortterm-and-mediumterm-scheduler-longterm-shortterm-working.png)

- **작업 큐 (Job Queue)** : 현재 시스템 내의 모든 프로세스의 집합
  - 메모리는 한정되어 있는데 많은 프로세스가 한꺼번에 올라올 경우, **대용량 메모리(디스크)**에 임시로 저장하는데, 이 디스크를 Job Queue 또는 Job Pool 이라고 함
- **준비 큐 (Ready Queue)** : 메모리(RAM) 내에 있으면서 CPU를 할당받고 실행되기 위해 기다리는 프로세스의 집합
- **장치 큐 (Device Queue)** : 각각의 장치마다 서비스를 기다리는 프로세스의 집합

<br>

## 스케줄러의 종류

![img](https://media.vlpt.us/images/chullll/post/cc02fcc8-8fb5-455c-a331-552f217b5970/image.png)

<br>

### [장기 스케줄러 (Long-term Scheduler)]

![image-20220306121314595](https://user-images.githubusercontent.com/87461594/157400090-ec26db8f-496c-4e6e-8f51-09cccd46e503.png)

- **메모리와 디스크 사이의 스케줄링**을 담당하며, 상대적으로 **호출되는 빈도가 적음**
- Job Pool 로 부터 프로세스들을 선별하고 실행을 위해 **메모리에 적재**함
- **degree of Multiprogramming** 제어 (실행중인 프로세스의 수 제어)
- 프로세스의 상태 : **'시작 상태 (New)  ->  준비 상태 (Ready)'**

<br>

### [단기 스케줄러 (Short-term Scheduler)]

![image-20220306121715419](https://user-images.githubusercontent.com/87461594/157400122-3da7929f-8bf6-4832-af30-e4c95243829a.png)

- **CPU와 메모리 사이의 스케줄링**을 담당하며, 장기 스케줄러에 비해 **매우 많이 호출됨**
- 실행이 준비된 프로세스들 중 하나를 선별해 **CPU에게 할당**함
- 프로세스의 상태 : **'준비 상태 (Ready)  ->  작업 상태 (Running)'**

<br>

### [중기 스케줄러 (Medium-term Scheduler)]

![image-20220306122728906](https://user-images.githubusercontent.com/87461594/157400156-40ac94ce-07d2-4fda-b57d-c4d01598e939.png)

- **시분할 시스템**에서 추가로 사용하며, **메모리에 대한 가중을 완화**시켜주기 위해 도입

- CPU 를 차지하기 위한 경쟁이 심해질 때 우선순위가 낮은 프로세스를 잠시 정지한 뒤, 나중에 완화되면 다시 메모리로 불러옴 (Swapping)

  > Swap out : 프로세스를 잠시 정지시킴
  >
  > Swap in : 정지시켰던 프로세스를 다시 메모리로 불러옴

- 프로세스의 상태 : **'준비 상태 (Ready)  ->  정지 상태 (suspended)'**

<br>

## Virtual Memory Management

- 위에서 쓰인 스케줄러들은 **요즘에는 잘 쓰이지 않는 기법임**

- **Virtual Memory (가상 메모리)** 의 등장으로 모든 스케줄러를 메모리에 등록할 수 있게됨

  ![image-20220306124156437](https://user-images.githubusercontent.com/87461594/157400182-3760b31c-3801-4bee-8735-4258e8260069.png)

  - **실제 메모리 (RAM)** 에서 부족한 부분을 **하드디스크 (HDD) 로 확장**해서 쓸 수 있음
  - 더 많은 프로그램을 동시에 실행할 수 있음 (CPU 이용률과 처리율이 높아짐)
  - **Swapping에 필요한 입출력**이 줄어들기 때문에 프로그램들이 빠르게 실행됨

  > **MMU (Memory management unit)** 가 가상 메모리에 있는 프로그램을 실행시킬 때 필요한 부분을 실제 메모리로 옮겨주며, 이 과정을 **MAPPING** 이라고 함

<br>

## [참고자료]

- https://github.com/WooVictory/Ready-For-Tech-Interview/blob/master/Operating%20System/%EC%8A%A4%EC%BC%80%EC%A4%84%EB%9F%AC%EC%9D%98%20%EC%A2%85%EB%A5%98.md
- https://jhnyang.tistory.com/372
- https://kim6394.tistory.com/177
- https://yoon-dumbo.tistory.com/32
- https://afteracademy.com/blog/what-is-long-term-short-term-and-medium-term-scheduler
- https://velog.io/@chullll/Scheduler
