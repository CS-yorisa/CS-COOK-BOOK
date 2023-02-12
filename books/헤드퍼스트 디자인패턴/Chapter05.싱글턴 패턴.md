# 싱글턴 패턴
- 같이 보기 : [1-5. 싱글턴 패턴](books/디자인%20패턴에%20뛰어들기/1.%20생성%20패턴/1-5.%20싱글턴%20패턴.md)

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
	- 싱글턴 패턴을 실제로 적용할 때는 클래스에서 하나뿐인 인스턴스를 관리하도록 만들고, 추가 인스턴스를 만들지 못하도록 하면 됨
	- 어디서든 유일한 인스턴스에 접근할 수 있도록 전역 접근 지점을 제공

## 멀티스레딩 문제
```Java
ChocolateBoiler boiler = ChocolateBoiler.getInstance();
boiler.fill();
boiler.boil();
boiler.drain();
```

- 위와 같은 코드를 2개의 스레드에서 실행된다고 가정했을 때, 2개의 보일러 객체가 생성될 수 있음

```Java
public class Singleton {
	private static Singleton uniqueInstance;

	private Singleton() {}

	public static synchronized Singleton getInstance() {
		...
	}
}
```

- `synchronized` 키워드를 사용하여 해결할 수 있음

### 더 효율적인 멀티스레딩 문제 해결
- `getInstance()`의 속도가 중요하지 않다면 그냥 두기
	- 메소드 동기화를 하면 성능이 100배 정도 저하될 수 있음

```Java
public class Singleton {
	private static Singleton uniqueInstance = new Singleton();

	private Singleton() {}

	public static Singleton getInstance() {
		return uniqueInstance;
	}
}
```

- 인스턴스가 필요할 때는 생성하지 말고 처음부터 만들기
	- Singleton의 인스턴스 생성하고 계속 사용 및 관리가 성가시다면 처음부터 Singleton 인스턴스를 만드는 방법도 있음

```Java
public class Singleton {
	private volatile static Singleton uniqueInstance;

	private Singleton() {}

	public static Singleton getInstance() {
		if (uniqueInstance == null) {
			synchronized (Singleton.class) {
				if (uniqueInstance == null) {
					uniqueInstance = new Singleton();
				}
			}
		}
		return uniqueInstance
	}
}
```

- DCL(Double-Checked Locking)을 사용하여 `getInstace()`에서 동기화되는 부분을 줄이기
	- `volatile` 키워드를 사용하면 멀티스레딩을 쓰더라도 `uniqueInstance` 변수가 싱글턴 인스턴스로 초기화되는 과정이 올바르게 진행됨
	- 인스턴스가 생성되어 있는지 확인한 다음 생성되어 있지 않았을 때만 동기화할 수 있음
	- 처음에만 동기화를 하고 나중에는 동기화하지 않아도 됨
