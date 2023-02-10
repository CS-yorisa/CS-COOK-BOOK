# 싱글턴 패턴

## 리틀 싱글턴
- 하나의 객체를 만들기 위해 `new MyObject();`와 같은 방식으로 만들 수 있음
	- 하지만 일반적인 경우 특정 클래스의 객체는 무제한적으로 생성 가능

```Java
public MyClass {
	private MyClass() {}
}
```
- 생성자를 private으로 선언하면 외부에서 생성할 수 없고, 객체를 생성할 수 없을것으로 생각됨

```Java
public MyClass {
	public static MyClass getInstance() {}
}
```
- 정적 메소드를 호출하는 방식으로 작성할 수 있음

```Java
public MyClass {
	private MyClass() {}
	public static MyClass getInstance() {
		return new MyClass();
	}
}
```
- private 생성자를 정적 메소드로 호출하는 방식으로 구성할 수 있음

```Java
public class Singleton {
	private static Singleton uniqueInstance;

	private Singleton() {}

	public static Singletone getInstance() {
		if (uniqueInstance == null) {
			uniqueInstance = new Singletone();
		}
		return uniqueInstance;
	}
}
```
- 고전적인 싱글턴 패턴 구현
	- 클래스의 유일 인스턴스를 저장하는 정적 변수를 선언하고, 해당 인스턴스만 반환하는 방식으로 구현

## 초콜릿 보일러
```Java
public class ChocolateBoiler {
	private boolean empty;
	private boolean boiled;
	private static ChocolateBoiler uniqueInstance;
  
	private ChocolateBoiler() {
		empty = true;
		boiled = false;
	}
  
	public static ChocolateBoiler getInstance() {
		if (uniqueInstance == null) {
			System.out.println("Creating unique instance of Chocolate Boiler");
			uniqueInstance = new ChocolateBoiler();
		}
		System.out.println("Returning instance of Chocolate Boiler");
		return uniqueInstance;
	}

	public void fill() {
		if (isEmpty()) {
			empty = false;
			boiled = false;
			// fill the boiler with a milk/chocolate mixture
		}
	}
 
	public void drain() {
		if (!isEmpty() && isBoiled()) {
			// drain the boiled milk and chocolate
			empty = true;
		}
	}
 
	public void boil() {
		if (!isEmpty() && !isBoiled()) {
			// bring the contents to a boil
			boiled = true;
		}
	}
  
	public boolean isEmpty() {
		return empty;
	}
 
	public boolean isBoiled() {
		return boiled;
	}
}
```
- 초콜릿 공장에서 초콜릿을 끓이는 장치(초콜릿 보일러)를 컴퓨터로 제어
- 만약 초콜릿 보일러를 제어하는 인스턴스가 2개 이상 생성되면 문제가 발생될 수 있음

## 싱글턴 패턴
- 싱글턴 패턴 : 클래스 인스턴스를 하나만 만들고, 그 인스턴스로의 전역 접근 제공

## 멀티스레딩 문제