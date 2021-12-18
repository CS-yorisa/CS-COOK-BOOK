두 방법 모두 함수 호출시 함수를 위한 별도의 임시공간이 생기며,

함수가 종료되면 해당 공간은 사라짐

## call by value (값에 의한 호출)

- 인자로 받은 값을 복사하여 처리
- 복사가 되기 때문에 메모리량이 늘어남 (많은 계산이 들어간다면 과부화의 원인)
- 원래의 값은 영향을 받지 않음

```cpp
#include <stdio.h>

void swap(int x, int y){
	int temp;
	temp = x;
	x = y;
	y = temp;
}

int main(){
	int a = 10, b = 20;
	swap(a, b);
	return 0;
}
```

## call by reference(참조에 의한 호출)

- 인자로 받은 값의 주소를 참조하여 직접 값에 영향
- 직접 참조하기 때문에 빠름
- 원래 값이 영향을 받게 됨

```cpp
#include <stdio.h>

void swap(int *x, int *y){
	int temp;
	temp = *x;
	*x = *y;
	*y = temp;
}

int main(){
	int a = 10, b = 20;
	swap(&a, &b);
	return 0;
}
```

## C, C++

C++에서는 주소값으로 call by reference 구현 가능

C에서는 call by reference가 지원되지 않지만 포인터로 swap 흉내낼 수 있음

## Java, JavaScript, Kotlin

JAVA에서 Call by reference는 해당 객체의 주소값을 직접 넘기는 것이 아닌 객체를 보는 또 다른 주소 값을 만들어서 넘김 (call by reference가 지원되지 않음)

⇒ 배열이나 리스트 같은 컨테이너 객체 내부의 원소 값들을 교환하는 것은 가능하다.

JavaScript, Kotlin 역시 call by reference는 지원되지 않지만 자바와 마찬가지로 배열내부의 원소 값을 교환하는 함수는 만들 수 있음

# 파이썬

## call-by-assignment

### immutable object

- int, float, str, tuple
- call by reference로 받지만 값이 변경 되면 call by value로 동작함
- 함수 내에서는 값이 바뀌어도 실제 값에는 영향이 없다

### mutable object

- list, dict, set
- call by reference로 동작해서 object reference가 전달되어 실제 값에 영향
