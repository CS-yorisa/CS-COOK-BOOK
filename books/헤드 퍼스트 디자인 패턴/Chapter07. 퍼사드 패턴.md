# 퍼사드 패턴

- 같이 보기 : [2-5. 퍼사드](../디자인%20패턴에%20뛰어들기/2.%20구조%20패턴/2-5.%20퍼사드.md)

## 홈시어터 만들기

![](https://t1.daumcdn.net/cfile/tistory/99CD443A5C42874A07?original)

- 홈시어터를 위한 프로젝터, 자동 스크린, 서라운드 음향 등을 갖춘 시스템을 구성함
- 하지만, 실제 영화를 보는 과정에서는 더 다양한 작업들이 필요할 수 있음
	- 팝콘 기계를 준비하고, 조명을 끄고, 스크린을 내리고, 프로젝터를 켜고 ...
- 또한 영화가 끝난 후 모든 과정을 역으로 실행해야 함

## 퍼사드 작동 원리 알아보기


![](https://t1.daumcdn.net/cfile/tistory/9913893E5C4288F742?original)

- 퍼사드 클래스를 구현함으로써 훨씬 편리하게 사용할 수 있음
	- 복잡한 시스템을 수정하고자 한다면 직접 건들 수 있지만, 편리하게 사용하고자 한다면 퍼사드를 사용하면 됨

## 홈시어터 퍼사드 만들기

```java
public class HomeTheaterFacade {
	Amplifier amp;
	Tuner tuner;
	StreamingPlayer player;
	Projector projector;
	TheaterLights lights;
	Screen screen;
	PopcornPopper popper;

	public Home TheaterFacede(
			Amplifier amp,
			Tuner tuner,
			StreamingPlayer player,
			Projector projector,
			TheaterLights lights,
			Screen screen,
			PopcornPopper popper) {
		this.amp = amp;
		this.tuner = tuner;
		this.player = player;
		this.projector = projector;
		this.screen = screen;
		this.lights = lights;
		this.popper = popper;
	}

	// 기타 메서드
}
```

## 단순화된 인터페이스 만들기
```java
public void watchMovie(String movie) {
	popper.on();
	popper.pop();
	lights.dim(10);
	...
}
```

- 각 기기에 명령할 동작을 순서대로 선언함으로써 구현 가능

```java
public class HomeTheaterTestDrive {
	public static void main(String[] args) {
		// 구성 요소 초기화

		HomeTheaterFacade homeTheater = 
			new HomeTheaterFacade(amp, tuner, player, projector, screen, lights, popper);

		HomeTheater.watchMoview();
		...
	}
}
```

## 퍼사드 패턴의 정의

- **퍼사드 패턴** : 서브시스템에 있는 일련의 인터페이스를 통합 인터페이스러 묶어 줌, 고수준 인터페이스를 정의함으로써 서브 시스템을 편리하게 사용할 수 있게 함
	- facade : (건물의) 정면, (실제와는 다른) 표면, 허울
- **디자인 원칙** : 진자 절친에게만 이야기해야 한다
	- **최소 지식  원칙(Principle of Least Knowledge)** : 객체 사이의 상호작용은 될 수 있으면 아주 가까운 친구 사이에서만 허용하는 편이 좋음

## 친구를 만들지 않고 다른 객체에 영향력 행사하기

- 여러 객체와 친구가 되는 것을 피하기 위한 가이드 라인
	- 객체 자체
	- 메소드 매개변수로 전달된 객체
	- 메소드를 생성하거나 인스턴스를 만든 객체
	- 객체에 속한 구성 요소

```java
// 원칙을 따르지 않는 경우
public float getTemp() {
	Thermometer thermometer = station.getThermometer();
	return thermometer.getTemperature();
}
// 원칙을 따르는 경우
public float getTemp() {
	return station.getTemperature();
}
```

- 원칙을 따르지 않는 경우 station으로부터 객체를 받은 뒤 메소드를 호출
- 원칙을 따르는 경우 의존하는 클래스의 수를 줄일 수 있음

## 절친에게만 메소드 호출하기
```java
public class Car {
	Engin engin;
	// 기타 인스턴스 변수

	puclic Car() {
		// 초기화
	}

	public void start(Key key) {
		// 새로운 객체 생성
		Doors doors = new Doors()
		// 매개변수로 전달된 객체이므로, 클래스의 메서드 호출 가능 
		boolean authorized = key.turns();
		if (authorized) {
			engine.start();
			updateDashboardDisplay();
			doors.lock();
		}
	}
	public void updateDashboardDispaly() {
		// 디스플레이 갱신
	}
}
```

## 퍼사드 패턴과 최소 지식 원칙

![](https://infoqoch.github.io/assets/image/2023-02-23-fasade/2023-02-23-08-17-11.png)

- 클라이언트는 "친구"가 퍼사드 하나뿐
	- 퍼사드 인터페이스는 모든 서브시스템을 관리하여 클라이언트는 단순하면서 유연해질 수 있음
- 홈시어터의 구성요소를 업그래이드해도 클라이언트는 영향받지 않음
