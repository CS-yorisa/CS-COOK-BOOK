# Chapter 03. 데코레이터 패턴 (객체 꾸미기)

> 데코레이터 패턴 : https://refactoring.guru/ko/design-patterns/decorator

## Remind

### 1. 문제상황

![image](https://user-images.githubusercontent.com/87461594/215329981-054339de-1804-44b5-9b57-723ac8cecb8a.png)

### 2. 해결책

![image](https://user-images.githubusercontent.com/87461594/215329999-7070f9c5-ca25-4dd1-aea5-b618316e503f.png)

### 3. 구조

![image](https://user-images.githubusercontent.com/87461594/215330044-1985b203-7e78-45a6-994e-4e03556420a6.png)

<br>

## 초대형 커피 전문점, 스타버즈

> 다양한 음료와 첨가물(샷, 시럽, 우유, 휘핑크림 등)을 모두 포괄하는 주문 시스템 개발

- **음료(Beverage)** 는 Component 가 되어 다양한 음료(Concrete Component) 를 가짐
- **첨가물(Condiment)** 은 Decorator 가 되어 다양한 첨가물(Concrete Decorators) 를 가짐

![image](https://user-images.githubusercontent.com/87461594/216974543-8c584b62-05f2-4bd7-bc29-f05b0409e860.png)

### 가격이 계산되는 원리

![image](https://user-images.githubusercontent.com/87461594/216974725-7160b053-e32f-4aab-befd-da77413da6be.png)

### OCP(Open-Closed Principle)

- 새로운 음료와 첨가물의 추가에는 **열려있고(Open)** 기존 음료와 첨가물의 변경에는 **닫혀있도록(Closed)**

### 1. 커피 주문 시스템 코드

#### Beverage 추상 클래스

```java
public abstract class Beverage { // 추상 클래스
    
	String description = "Unknown Beverage";
  
	public String getDescription() {
		return description;
	}
 
	public abstract double cost(); // 서브클래스에서 구현
}
```

#### CondimentDecorator 추상 클래스

```java
// Beverage 객체가 들어갈 자리에 들어갈 수 있도록 Beverage 클래스를 확장
public abstract class CondimentDecorator extends Beverage {
    
	Beverage beverage; // 어떤 음료든 감쌀 수 있도록 Beverage 슈퍼클래스 유형 사용
    
	public abstract String getDescription();
}
```

> 추상 클래스 vs 인터페이스 : https://brunch.co.kr/@kd4/6

### 2. 음료 코드 (Component)

#### Espresso

```java
public class Espresso extends Beverage {
  
	public Espresso() {
		description = "Espresso"; // 생성자에서 상속받은 description 변수값을 설정
	}
  
	public double cost() {
		return 1.99; // 음료의 가격만 return
	}
}
```

#### HouseBlend

```java
public class HouseBlend extends Beverage {
    
	public HouseBlend() {
		description = "House Blend Coffee";
	}
 
	public double cost() {
		return .89;
	}
}
```

### 3. 첨가물 코드 (Decorator)

#### Mocha

```java
// Beverage 를 확장한 CondimentDecorator 를 다시 확장
public class Mocha extends CondimentDecorator {
    
    // 생성자에서 인스턴스 변수(beverage)에 감싸고자 하는 음료 객체를 전달
	public Mocha(Beverage beverage) {
		this.beverage = beverage;
	}
 
	public String getDescription() {
		return beverage.getDescription() + ", Mocha"; // 설명에 첨가되는 첨가물 설명 추가
	}
 
	public double cost() {
		return .20 + beverage.cost(); // 가격에 첨가물의 가격을 더해서 return
	}
}
```

### 4. 커피 주문 시스템 코드 테스트

#### StarbuzzCoffee

```java
public class StarbuzzCoffee {
 
	public static void main(String args[]) {
        
        // 아무것도 넣지 않은 에스프레소
		Beverage beverage = new Espresso();
		System.out.println(beverage.getDescription() 
				+ " $" + beverage.cost());
 
        // 다크 로스트에 모카2, 휘핑크림1 추가
		Beverage beverage2 = new DarkRoast();
		beverage2 = new Mocha(beverage2);
		beverage2 = new Mocha(beverage2);
		beverage2 = new Whip(beverage2);
		System.out.println(beverage2.getDescription() 
				+ " $" + beverage2.cost());
 
        // 하우스 블렌드에 두유1, 모카1, 휘핑크림1 추가
		Beverage beverage3 = new HouseBlend();
		beverage3 = new Soy(beverage3);
		beverage3 = new Mocha(beverage3);
		beverage3 = new Whip(beverage3);
		System.out.println(beverage3.getDescription() 
				+ " $" + beverage3.cost());
	}
}
```

> Espresso $1.99
> Dark Roast Coffee, Mocha, Mocha, Whip $1.49
> House Blend Coffee, Soy, Mocha, Whip $1.34

> 나중에 **팩토리와 빌더 패턴**을 통해 이런 객체를 더 나은 방법으로 만들 수 있음 (14장)

<br>

## 스타버즈 with Sizes

> 스타버즈 커피는 TALL(소), GRANDE(중), VENTI(대) 사이즈 개념을 도입하기로 함

- 사이즈 개념의 도입은 **커피 클래스 전체**에 영향을 미치게 됨
- 사이즈에 따라 **첨가물 가격**도 다르게 받을 계획

#### Beverage 추상 클래스

```java
public abstract class Beverage {
    // 음료의 사이즈를 enum 으로 관리
	public enum Size { TALL, GRANDE, VENTI };
	Size size = Size.TALL;
	String description = "Unknown Beverage";
  
	public String getDescription() {
		return description;
	}
	
    // 음료의 사이즈를 결정하고, 조회하는 메서드 추가
	public void setSize(Size size) {
		this.size = size;
	}
	
	public Size getSize() {
		return this.size;
	}
 
	public abstract double cost();
}
```

#### CondimentDecorator 추상 클래스

```java
public abstract class CondimentDecorator extends Beverage {
	public Beverage beverage;
	public abstract String getDescription();
	
    // 첨가물 가격 변경을 위해 음료의 사이즈를 조회
	public Size getSize() {
		return beverage.getSize();
	}
}
```

#### Soy (첨가물)

```java
public class Soy extends CondimentDecorator {
	public Soy(Beverage beverage) {
		this.beverage = beverage;
	}

	public String getDescription() {
		return beverage.getDescription() + ", Soy";
	}

    // 음료의 사이즈에 따라 첨가물의 가격을 다르게 책정
	public double cost() {
		double cost = beverage.cost();
		if (beverage.getSize() == Size.TALL) {
			cost += .10;
		} else if (beverage.getSize() == Size.GRANDE) {
			cost += .15;
		} else if (beverage.getSize() == Size.VENTI) {
			cost += .20;
		}
		return cost;
	}
}
```

> Espresso $1.99
> Dark Roast Coffee, Mocha, Mocha, Whip $1.49
> House Blend Coffee, Soy, Mocha, Whip $1.39

<br>

## 자바 I/O 데코레이터 만들기

> 입력 스트림에 있는 **대문자를 전부 소문자**로 바꿔 주는 데코레이터 만들기

> Java InputStream : https://lannstark.tistory.com/34

#### 새로운 I/O 데코레이터

```java
public class LowerCaseInputStream extends FilterInputStream {

	public LowerCaseInputStream(InputStream in) {
		super(in);
	}
 
    // 한 글자씩 읽으며 소문자로 변환
	public int read() throws IOException {
		int c = in.read();
		return (c == -1 ? c : Character.toLowerCase((char)c));
	}
		
	public int read(byte[] b, int offset, int len) throws IOException {
		int result = in.read(b, offset, len);
		for (int i = offset; i < offset+result; i++) {
			b[i] = (byte)Character.toLowerCase((char)b[i]);
		}
		return result;
	}
}
```

#### I/O 데코레이터 테스트

```java
public class InputTest {
	public static void main(String[] args) throws IOException {
		int c;
		InputStream in = null;
        // finally 를 통한 InputStream close
		try {
			in = 
				new LowerCaseInputStream( 
					new BufferedInputStream(
						new FileInputStream("test.txt")));

			while((c = in.read()) >= 0) {
				System.out.print((char)c);
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (in != null) { in.close(); }
		}
		System.out.println();
        // try 인자를 통한 InputStream close
		try (InputStream in2 = 
				new LowerCaseInputStream(
					new BufferedInputStream(
						new FileInputStream("test.txt")))) 
		{
			while((c = in2.read()) >= 0) {
				System.out.print((char)c);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
```

> i know the decorator pattern and how it's used in the java.io package.
> i know the decorator pattern and how it's used in the java.io package.

<br>

## 참고자료

- https://toihocdesignpattern.com/chuong-3-head-first-design-patterns-tieng-viet-decorator-pattern-doi-tuong-trang-tri.html