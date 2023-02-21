# Chapter 06. 커맨드 패턴 (호출 캡슐화하기)

> 커맨드 패턴 : https://refactoring.guru/ko/design-patterns/command

## Remind

### 1. 문제상황

![image](https://user-images.githubusercontent.com/87461594/219941674-e77a79d3-0766-4ef8-9cab-bf2db2288c7e.png)

![image](https://user-images.githubusercontent.com/87461594/219941684-575c848d-6718-4a67-8a50-0df6e410db64.png)

### 2. 해결책

![image](https://user-images.githubusercontent.com/87461594/219941805-87a08b48-7589-4667-9005-48dc7750465a.png)

![image](https://user-images.githubusercontent.com/87461594/219941815-da6b0628-7c1d-4a97-b055-8afba11eddbe.png)

### 3. 구조

![image](https://user-images.githubusercontent.com/87461594/219941836-f03e129f-7759-423c-8819-b02da9ac7227.png)

<br>

## 주식회사 홈 오토메이션, 만능 IOT 리모컨

> 프로그래밍이 가능한 7개의 슬롯과 각각의 ON/OFF 및 작업 취소 버튼이 있는 만능 리모컨 개발

### 커맨드 패턴의 동작 원리

![image](https://user-images.githubusercontent.com/87461594/219954161-ec3c7163-e728-4b38-be0e-51521287f319.png)

### 만능 IOT 리모컨의 구조

![image](https://user-images.githubusercontent.com/87461594/219947196-0780e385-0b19-4368-a5a7-75cb377f16f6.png)

![image](https://user-images.githubusercontent.com/87461594/219948497-397db29c-d97c-4436-8455-d3a0dc64d2de.png)

### 1. 리모컨, 장치 (Invoker, Receiver) 코드

#### RemoteControl (Invoker)

```java
public class RemoteControl {
    // 7개의 ON, OFF 명령을 배열에 저장
	Command[] onCommands;
	Command[] offCommands;
 
    // 생성자는 각 ON, OFF 배열의 인스턴스를 만들고 초기화
	public RemoteControl() {
		onCommands = new Command[7];
		offCommands = new Command[7];
 
   		// 비어있는 슬롯 설정
		Command noCommand = new NoCommand();
		for (int i = 0; i < 7; i++) {
			onCommands[i] = noCommand;
			offCommands[i] = noCommand;
		}
	}
    
    // 슬롯의 번호와 저장할 ON, OFF 커맨드 객체를 인자로 받음
	public void setCommand(int slot, Command onCommand, Command offCommand) {
		onCommands[slot] = onCommand;
		offCommands[slot] = offCommand;
	}
    
	public void onButtonWasPushed(int slot) {
		onCommands[slot].execute();
	}
 
	public void offButtonWasPushed(int slot) {
		offCommands[slot].execute();
	}
  
	public String toString() {
		StringBuffer stringBuff = new StringBuffer();
		stringBuff.append("\n------ Remote Control -------\n");
		for (int i = 0; i < onCommands.length; i++) {
			stringBuff.append("[slot " + i + "] " + onCommands[i].getClass().getName()
				+ "    " + offCommands[i].getClass().getName() + "\n");
		}
		return stringBuff.toString();
	}
}
```

#### Light (Receiver)

```java
public class Light {
	String location = "";

    // 생성자에서 Light 의 location 주입
	public Light(String location) {
		this.location = location;
	}

	public void on() {
		System.out.println(location + " light is on");
	}

	public void off() {
		System.out.println(location + " light is off");
	}
}
```

### 2. 커맨드 클래스

#### Command 인터페이스

```java
public interface Command {
	public void execute();
}
```

#### NoCommand

```java
// 비어있는 슬롯에 사용 (null object)
public class NoCommand implements Command {
	public void execute() { }
}
```

#### LightOnCommand

```java
public class LightOnCommand implements Command {
	Light light;

	public LightOnCommand(Light light) {
		this.light = light;
	}

	public void execute() {
		light.on();
	}
}
```

#### StereoOnWithCDCommand

```java
public class StereoOnWithCDCommand implements Command {
	Stereo stereo;
 
	public StereoOnWithCDCommand(Stereo stereo) {
		this.stereo = stereo;
	}
    
    // 다양항 메소드를 동시에 수행
	public void execute() {
		stereo.on();
		stereo.setCD();
		stereo.setVolume(11);
	}
}
```

### 3. 리모컨 테스트

#### RemoteLoader

```java
public class RemoteLoader {
 
	public static void main(String[] args) {
		RemoteControl remoteControl = new RemoteControl();
 
        // 장치를 각자의 위치에 맞게 생성
		Light livingRoomLight = new Light("Living Room");
		Light kitchenLight = new Light("Kitchen");
		CeilingFan ceilingFan= new CeilingFan("Living Room");
		GarageDoor garageDoor = new GarageDoor("Garage");
		Stereo stereo = new Stereo("Living Room");

        // 조명용 커맨드 객체
		LightOnCommand livingRoomLightOn = 
				new LightOnCommand(livingRoomLight);
		LightOffCommand livingRoomLightOff = 
				new LightOffCommand(livingRoomLight);
		LightOnCommand kitchenLightOn = 
				new LightOnCommand(kitchenLight);
		LightOffCommand kitchenLightOff = 
				new LightOffCommand(kitchenLight);
  
        // 선풍기를 켜고 끄는 커맨드 객체
		CeilingFanOnCommand ceilingFanOn = 
				new CeilingFanOnCommand(ceilingFan);
		CeilingFanOffCommand ceilingFanOff = 
				new CeilingFanOffCommand(ceilingFan);
 
        // 차고 문을 열고 닫는 커맨드 객체
		GarageDoorUpCommand garageDoorUp =
				new GarageDoorUpCommand(garageDoor);
		GarageDoorDownCommand garageDoorDown =
				new GarageDoorDownCommand(garageDoor);
 
        // 오디오를 켜고 끄는 커맨드 객체
		StereoOnWithCDCommand stereoOnWithCD =
				new StereoOnWithCDCommand(stereo);
		StereoOffCommand  stereoOff =
				new StereoOffCommand(stereo);
 
        // 리모컨 슬롯에 커맨드 로드
		remoteControl.setCommand(0, livingRoomLightOn, livingRoomLightOff);
		remoteControl.setCommand(1, kitchenLightOn, kitchenLightOff);
		remoteControl.setCommand(2, ceilingFanOn, ceilingFanOff);
		remoteControl.setCommand(3, stereoOnWithCD, stereoOff);
  
        // 리모컨 슬롯의 정보 출력
		System.out.println(remoteControl);
 
        // 슬롯의 ON, OFF 작동
		remoteControl.onButtonWasPushed(0);
		remoteControl.offButtonWasPushed(0);
		remoteControl.onButtonWasPushed(1);
		remoteControl.offButtonWasPushed(1);
		remoteControl.onButtonWasPushed(2);
		remoteControl.offButtonWasPushed(2);
		remoteControl.onButtonWasPushed(3);
		remoteControl.offButtonWasPushed(3);
	}
}
```

> ------ Remote Control -------
> [slot 0] headfirst.designpatterns.command.remote.LightOnCommand    headfirst.designpatterns.command.remote.LightOffCommand
> [slot 1] headfirst.designpatterns.command.remote.LightOnCommand    headfirst.designpatterns.command.remote.LightOffCommand
> [slot 2] headfirst.designpatterns.command.remote.CeilingFanOnCommand    headfirst.designpatterns.command.remote.CeilingFanOffCommand
> [slot 3] headfirst.designpatterns.command.remote.StereoOnWithCDCommand    headfirst.designpatterns.command.remote.StereoOffCommand
> [slot 4] headfirst.designpatterns.command.remote.NoCommand    headfirst.designpatterns.command.remote.NoCommand
> [slot 5] headfirst.designpatterns.command.remote.NoCommand    headfirst.designpatterns.command.remote.NoCommand
> [slot 6] headfirst.designpatterns.command.remote.NoCommand    headfirst.designpatterns.command.remote.NoCommand
>
> Living Room light is on
> Living Room light is off
> Kitchen light is on
> Kitchen light is off
> Living Room ceiling fan is on high
> Living Room ceiling fan is off
> Living Room stereo is on
> Living Room stereo is set for CD input
> Living Room stereo volume set to 11
> Living Room stereo is off

#### RemoteLoader (with Lambda)

```java
public class RemoteLoader {
 
	public static void main(String[] args) {
		RemoteControl remoteControl = new RemoteControl();
 
		Light livingRoomLight = new Light("Living Room");
		Light kitchenLight = new Light("Kitchen");
		CeilingFan ceilingFan= new CeilingFan("Living Room");
		GarageDoor garageDoor = new GarageDoor("Main house");
		Stereo stereo = new Stereo("Living Room");

        // 메소드 참조 표현식
		remoteControl.setCommand(0, livingRoomLight::on, livingRoomLight::off);
		remoteControl.setCommand(1, kitchenLight::on, kitchenLight::off);
		remoteControl.setCommand(2, ceilingFan::high, ceilingFan::off);
		
        // Lambda 표현식
		Command stereoOnWithCD = () -> { 
			stereo.on(); stereo.setCD(); stereo.setVolume(11);
		};
		remoteControl.setCommand(3, stereoOnWithCD, stereo::off);
		remoteControl.setCommand(4, garageDoor::up, garageDoor::down);
  
		System.out.println(remoteControl);
 
		remoteControl.onButtonWasPushed(0);
		remoteControl.offButtonWasPushed(0);
		remoteControl.onButtonWasPushed(1);
		remoteControl.offButtonWasPushed(1);
		remoteControl.onButtonWasPushed(2);
		remoteControl.offButtonWasPushed(2);
		remoteControl.onButtonWasPushed(3);
		remoteControl.offButtonWasPushed(3);
		remoteControl.onButtonWasPushed(4);  
		remoteControl.offButtonWasPushed(4);
		remoteControl.onButtonWasPushed(5);
	}
}
```

<br>

## 작업 취소 기능 추가

### 1. 커맨드, 장치, 리모컨 코드 수정

#### Command 인터페이스

```java
public interface Command {
	public void execute();
	public void undo(); // 작업 취소 메소드
}
```

#### LightOnCommand

```java
public class LightOnCommand implements Command {
	Light light;
	int level;
	public LightOnCommand(Light light) {
		this.light = light;
	}
 
	public void execute() {
        level = light.getLevel();
		light.on();
	}
 
    // execute 와 반대되는 작업 실행
	public void undo() {
		light.dim(level); // 추후 level 상태를 저장해서 활용 가능
	}
}
```

#### Light (Receiver)

```java
public class Light {
	String location;
	int level;

	public Light(String location) {
		this.location = location;
	}

	public void on() {
		level = 100;
		System.out.println("Light is on");
	}

	public void off() {
		level = 0;
		System.out.println("Light is off");
	}

	public void dim(int level) {
		this.level = level;
		if (level == 0) {
			off();
		}
		else {
			System.out.println("Light is dimmed to " + level + "%");
		}
	}

	public int getLevel() {
		return level;
	}
}
```

#### RemoteControlWithUndo (Invoker)

```java
public class RemoteControlWithUndo {
	Command[] onCommands;
	Command[] offCommands;
	Command undoCommand; // 마지막으로 사용한 커맨드 객체
 
	public RemoteControlWithUndo() {
		onCommands = new Command[7];
		offCommands = new Command[7];
 
		Command noCommand = new NoCommand();
		for(int i=0;i<7;i++) {
			onCommands[i] = noCommand;
			offCommands[i] = noCommand;
		}
		undoCommand = noCommand; // Null Object 로 동일하게 초기화
	}
  
	public void setCommand(int slot, Command onCommand, Command offCommand) {
		onCommands[slot] = onCommand;
		offCommands[slot] = offCommand;
	}
 
	public void onButtonWasPushed(int slot) {
		onCommands[slot].execute();
		undoCommand = onCommands[slot]; // 해당 객체를 undoCommand 에 저장
	}
 
	public void offButtonWasPushed(int slot) {
		offCommands[slot].execute();
		undoCommand = offCommands[slot]; // 해당 객체를 undoCommand 에 저장
	}
 
    // 작업 취소 실행
	public void undoButtonWasPushed() {
		undoCommand.undo();
	}
  
	public String toString() {
		StringBuffer stringBuff = new StringBuffer();
		stringBuff.append("\n------ Remote Control -------\n");
		for (int i = 0; i < onCommands.length; i++) {
			stringBuff.append("[slot " + i + "] " + onCommands[i].getClass().getName()
				+ "    " + offCommands[i].getClass().getName() + "\n");
		}
		stringBuff.append("[undo] " + undoCommand.getClass().getName() + "\n");
		return stringBuff.toString();
	}
}
```

### 2. 작업 취소 기능 테스트

#### RemoteLoader

```java
public class RemoteLoader {
 
	public static void main(String[] args) {
		RemoteControlWithUndo remoteControl = new RemoteControlWithUndo();
 
		Light livingRoomLight = new Light("Living Room");
 
		LightOnCommand livingRoomLightOn = 
				new LightOnCommand(livingRoomLight);
		LightOffCommand livingRoomLightOff = 
				new LightOffCommand(livingRoomLight);
 
		remoteControl.setCommand(0, livingRoomLightOn, livingRoomLightOff);
 
		remoteControl.onButtonWasPushed(0);
		remoteControl.offButtonWasPushed(0);
		System.out.println(remoteControl);
		remoteControl.undoButtonWasPushed(); // 작업 취소
		remoteControl.offButtonWasPushed(0);
		remoteControl.onButtonWasPushed(0);
		System.out.println(remoteControl);
		remoteControl.undoButtonWasPushed(); // 작업 취소
	}
}
```

> **Light is on**
> **Light is off**
>
> ------ Remote Control -------
> [slot 0] headfirst.designpatterns.command.undo.LightOnCommand    headfirst.designpatterns.command.undo.LightOffCommand
> [slot 1] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 2] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 3] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 4] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 5] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 6] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> **[undo] headfirst.designpatterns.command.undo.LightOffCommand**
>
> **Light is dimmed to 100%**
> **Light is off**
> **Light is on**
>
> ------ Remote Control -------
> [slot 0] headfirst.designpatterns.command.undo.LightOnCommand    headfirst.designpatterns.command.undo.LightOffCommand
> [slot 1] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 2] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 3] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 4] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 5] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> [slot 6] headfirst.designpatterns.command.undo.NoCommand    headfirst.designpatterns.command.undo.NoCommand
> **[undo] headfirst.designpatterns.command.undo.LightOnCommand**
>
> **Light is off**

<br>

## 여러 동작 한 번에 처리

> 버튼 한 개를 통해 여러 동작을 처리하는 매크로 커맨드 구현

#### MacroCommand

```java
public class MacroCommand implements Command {
	Command[] commands;
 
    // Command 배열을 저장
	public MacroCommand(Command[] commands) {
		this.commands = commands;
	}
 
    // 매크로는 각 커맨드를 순서대로 실행
	public void execute() {
		for (int i = 0; i < commands.length; i++) {
			commands[i].execute();
		}
	}
 
    // 마지막 커맨드부터 반대로 작업 취소
	public void undo() {
		for (int i = commands.length -1; i >= 0; i--) {
			commands[i].undo();
		}
	}
}
```

#### RemoteLoader

```java
public class RemoteLoader {

	public static void main(String[] args) {

		RemoteControl remoteControl = new RemoteControl();

		Light light = new Light("Living Room");
		TV tv = new TV("Living Room");
		Stereo stereo = new Stereo("Living Room");
		Hottub hottub = new Hottub();
 
		LightOnCommand lightOn = new LightOnCommand(light);
		StereoOnCommand stereoOn = new StereoOnCommand(stereo);
		TVOnCommand tvOn = new TVOnCommand(tv);
		HottubOnCommand hottubOn = new HottubOnCommand(hottub);
		LightOffCommand lightOff = new LightOffCommand(light);
		StereoOffCommand stereoOff = new StereoOffCommand(stereo);
		TVOffCommand tvOff = new TVOffCommand(tv);
		HottubOffCommand hottubOff = new HottubOffCommand(hottub);

        // ON, OFF 커맨드용 배열 생성
		Command[] partyOn = { lightOn, stereoOn, tvOn, hottubOn};
		Command[] partyOff = { lightOff, stereoOff, tvOff, hottubOff};
  
        // 각 배열을 전달해서 ON, OFF 매크로 커맨드 생성
		MacroCommand partyOnMacro = new MacroCommand(partyOn);
		MacroCommand partyOffMacro = new MacroCommand(partyOff);
 
        // 매크로 커맨드를 버튼에 할당
		remoteControl.setCommand(0, partyOnMacro, partyOffMacro);
  
		System.out.println(remoteControl);
		System.out.println("--- Pushing Macro On---");
		remoteControl.onButtonWasPushed(0);
		System.out.println("--- Pushing Macro Off---");
		remoteControl.offButtonWasPushed(0);
	}
}
```

> ------ Remote Control -------
> [slot 0] headfirst.designpatterns.command.party.MacroCommand    headfirst.designpatterns.command.party.MacroCommand
> [slot 1] headfirst.designpatterns.command.party.NoCommand    headfirst.designpatterns.command.party.NoCommand
> [slot 2] headfirst.designpatterns.command.party.NoCommand    headfirst.designpatterns.command.party.NoCommand
> [slot 3] headfirst.designpatterns.command.party.NoCommand    headfirst.designpatterns.command.party.NoCommand
> [slot 4] headfirst.designpatterns.command.party.NoCommand    headfirst.designpatterns.command.party.NoCommand
> [slot 5] headfirst.designpatterns.command.party.NoCommand    headfirst.designpatterns.command.party.NoCommand
> [slot 6] headfirst.designpatterns.command.party.NoCommand    headfirst.designpatterns.command.party.NoCommand
> [undo] headfirst.designpatterns.command.party.NoCommand
>
> --- Pushing Macro On---
> Light is on
> Living Room stereo is on
> Living Room TV is on
> Living Room TV channel is set for DVD
> Hottub is heating to a steaming 104 degrees
> Hottub is bubbling!
> --- Pushing Macro Off---
> Light is off
> Living Room stereo is off
> Living Room TV is off
> Hottub is cooling to 98 degrees

<br>

## 참고자료

- https://blog.yevgnenll.me/posts/what-is-command-pattern