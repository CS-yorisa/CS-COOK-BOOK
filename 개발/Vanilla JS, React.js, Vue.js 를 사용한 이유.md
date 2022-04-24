[TOC]

# Vanilla JS, React.js, Vue.js 를 사용한 이유

<br>

## Vanilla JS

> 프레임워크 또는 라이브러리가 적용되지 않은 **순수한 자바스크립트**

- 스페인어 '콩'을 뜻하는 'Vainilla' 에서 왔으며 **'핵심, 근본이 되는' 이라는 의미**를 비유적으로 표현

- 문제를 해결하기 위해 라이브러리나 프레임워크를 사용하기 보다 **코어 API 나 유틸리티를 사용**

### Vanilla JS 의 필요성

> 다양한 JS 프레임워크와 라이브러리를 제공하고 있음에도 Vanilla JS 가 필요한 이유

- 이전의 웹 개발 환경에서는 자바스크립트가 여러 가지의 브라우저 (Chrome, Firefox, Safari 등) 에서 일관되게 동작하기 위해서는 **표준을 우회하는 코드를 작성**해야 했음
- 이러한 크로스 브라우징 문제를 해결하기 위해 **jQuery 를 활용**하게 됨

- 지금의 모던한 웹 개발 환경에서는 **발전된 ECMAScript 명세와 최신의 브라우저**를 바탕으로 **표준 자바스크립트만으로도 쉽게 개발**을 할 수 있게 됨

  > 명령어를 수행하는 속도 면에서도 Vanilla JS 가 다른 라이브러리보다 압도적으로 좋음

  ![img](https://blog.kakaocdn.net/dn/c1ChFy/btrcj0V6Bv7/K9JJuYG6sYtO8iZbJeB7Dk/img.png)

- 개발자의 상황에 따라 직접 **라이브러리**를 만들거나, 프레임워크에서 **예상하지 못한 오류**를 마주하는 경우 Vanilla JS 를 이해하고 작성할 수 있어야 함

- **대세 프레임워크는 그때그때 변화**하지만 기반이 되는 **Vanilla JS 는 유지**되기 때문에 배워둬서 손해보지 않음

<br>

## 프론트 프레임워크 활용

> Vanilla JS 대신 React, Vue 등을 사용하는 이유

### 1. 데이터의 변화를 화면에 적용하기 쉬움

- Vanilla JS 에서 DOM 의 데이터를 변화시키려면 작업이 복잡해짐

  - 어느 데이터가 **어느 DOM Element 에 적용되었는지 기억해야 함**
  - 데이터의 업데이트가 많이 일어날수록, **중복적으로 작성하는 코드**의 양이 많아짐

- React.js 에서는 state 를, Vue.js 에서는 data 를 변경하기만 하면 **DOM 은 알아서 업데이트** 가능

  - 데이터가 어디에 쓰였는지 모두 알지 못해도 상관없음

    > Vue.js 에서의 데이터 변화 적용

    ```vue
    <template>
      <div>
        <div>{{ nowTime }}</div>
        <button @click="clickBtn">현재 시간</button>
      </div>
    </template>
    
    <script>
    export default {
      name: 'Test',
      data () {
        return {
          nowTime : 0
        }
      },
      methods : {
        clickBtn : function() {
          this.nowTime = (new Date()).getTime();
        }
      }
    }
    </script>
    ```

### 2. 컴포넌트화 하기 쉬움

- Vanilla JS 를 사용하는 경우

  ```html
  <div>
    <img src="#" alt="카드 썸네일">
    <div>
      <h3>카드 타이틀</h3>
      <p>카드 설명</p>
    </div>
  </div>
  ```

  > 해당 카드를 반복해서 사용하기 위해 **JS 로 만드는 경우**

  ```js
  const card = document.createElement('div');
  const cardThumbnail = document.createElement('img');
  const cardBody = document.createElement('div');
  const cardBodyHeader = document.createElement('h3');
  const cardBodyDescription = document.createElement('p');
  card.appendChild(cardThumbnail);
  card.appendchild(cardBody);
  (...)
  ```

- Vue.js 를 통해 **카드 컴포넌트**를 만드는 경우

  ```vue
  <template>
    <div>
      <img :src="imgUrl" alt="카드 썸네일">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>  
  </template>
  
  <script>
    export default {
      name: 'Card',
      data() {
        return {
          imgUrl: '#',
          title: '카드 타이틀',
          description: '카드 설명',
        };
      },
    }
  </script>
  ```

<br>

## React.js

> Facebook 이 제공하는 컴포넌트 기반의 JS 라이브러리

- **Virtual DOM** 이라는 개념을 이용해 데이터의 상태 변화에 따라 선택적으로 UI 를 렌더링함

  > 최소한의 DOM 처리로 컴포넌트를 업데이트할 수 있음

- **컴포넌트를 기반**으로 UI 를 구성하며, 컴포넌트를 재사용하여 **개발 생산성을 향상**시킬 수 있음

- 컴포넌트는 **트리 형태**로 구성. 상위에서 하위 컴포넌트로 전달하는 **단방향**의 데이터 흐름

  > 데이터의 추적과 디버깅을 쉽게 해줌

### Virtual DOM

> 가상 DOM 이라는 DOM (Document Object Model) 트리를 모방한 가벼운 JS 객체를 통해 **직접 DOM 을 핸들링하지 않고 자바스크립트가 HTML 을 렌더링**하는 방법

![img](https://velog.velcdn.com/images%2Feunnbi%2Fpost%2F64be1a78-4542-4c0e-98c7-cd07e1e1c28a%2Fimage.png)

- 사용자 조작에 따라 동적으로 변화는 **대화형 웹에서 DOM 조작이 빈번**해질수록 **브라우저 성능이 낮아지는 문제**가 발생

  > 이러한 문제를 해결하기 위해 **DOM 을 최소한으로 조작**하고자 하는 시도

- React 는 메모리에 Virtual DOM 을 구성하여 데이터가 업데이트 되면 **전체 UI 를 가상돔에 렌더링**하고 **변경된 부분이 있을 때에만 실제 DOM 에 적용**시킴

- Virtual DOM 방식이 유행함에 따라 DOM 을 직접 조작하는 **jQuery 의 필요성이 줄어듬**

### React.js 의 필요성 (Vue.js 와 비교)

- **타입스크립트 (TypeScript) 와의 결합**이 매우 매끄러워 큰 보일러플레이트 없이 타입을 정확하게 기술 가능

  - **Redux 를 비롯한 다양한 툴**도 대부분 훌륭한 타입 지원을 제공
  - Vue.js 의 경우 2.5 버전 까지도 지원이 미흡했으며, **3.0 업데이트가 이루어지고 나서야 개선되고 있음**

- **단순한 컴포넌트 정의**에 용이함을 가지고 있음

  - **Vue.js** 의 경우 단순한 컴포넌트를 정의하더라도 **새로운 파일을 생성**하거나 **ComponentOptions**를 사용해야 함

    > ComponentOptions 를 사용하는 경우 플레인 문자열로 표현하는 탓에 많은 정보를 잃게 됨

    ```vue
    <template>
      <ul :id="$style.userList">
        <user-item
          v-for="user in users"
          :key="user.id"
          :user="user"
          :selected="user.id === selectedUserId"
        />
      </ul>
    </template>
    
    <script>
    const UserItem = {
      template: '<li :class="{ [styles.userItem]: true, [styles.selected]: selected }">{{ user.name }}</li>',
      props: ['user', 'selected']
    }
    
    (...)
    </script>
    ```

  - **React.js**는 **무상태 함수 컴포넌트 (Stateless Functional Component)** 를 사용하여 단순하게 표현 가능

    ```js
    import React, { Component } from 'react'
    import classNames from 'classnames'
    import * as styles from './UserList.css'
    
    const UserItem = ({ user, selected }) => (
      <li className={classNames(style.userItem, { [style.selected]: selected })}>
        { user.name }
      </li>
    )
    
    export default class UserList extends Component {
      render() {
        const { users } = this.props
        const { selectedUserId } = this.state
    
        return (
          <ul className={styles.userList}>
            {users.map(user => (
              <UserItem user={user} selected={this.selectedUserId === user.id} />
            )}
          </ul>
        )
      }
    }
    ```

- React.js 는 Vue.js 에 비해 **더 빠르고 담대한 개선**이 이루어짐

  > Vue.js 의 릴리즈는 상대적으로 느리게 이루어지며, 주로 마이너한 변경사항 위주인 경우가 많음
  > React.js 의 변화를 따라가는 경우도 많음

<br>

## Vue.js

> **React.js 와 Angular.js 의 장점**을 모두 가지고 있는 컴포넌트 기반 프레임워크

- Virtual DOM 으로 화면 요소를 변경 및 조작하고 최종 결과물을 실제 DOM 에 반영함

- MVVM 패턴을 기반한 화면단 라이브러리

  ![img](https://velog.velcdn.com/images%2Feunnbi%2Fpost%2F17fab37c-9469-4b6e-8db3-2e156bbe4554%2Fimage.png)

  > - Model (비즈니스 규칙, 데이터, 모델 클래스), View (사용자 인터페이스), ViewModel (모델과 뷰 사이의 인터페이스)
  > - ViewModel 은 Model 데이터를 View 에 바인딩하고, 명령어를 사용하여 모든 UI 의 동작들을 다룸
  >   (MVC 패턴에서 컨트롤러 역할처럼 데이터를 관리하고 액션을 처리)
  > - View 는 ViewModel 의 프로퍼티에 제어값을 바인딩하며 차례대로 Model 객체에 있는 데이터 노출

- **컴포넌트 기반의 프레임워크**로 컴포넌트를 재사용하고 이를 통해 개발 생산성을 향상시킴

### Vue.js 의 필요성 (React.js 와 비교)

- React.js 와 Angular.js 의 장점을 모두 가지고 있음

  > **Angular.js 의 장점** : 양방향 데이터 바인딩
  > **React.js 의 장점** : 단방향 데이터 흐름 (상위 -> 하위 컴포넌트), 가상 DOM 렌더링 방식

- React.js 에 비해 자유도가 낮지만, 그만큼 **정해진 틀 안에서는 보다 쉽게 활용**할 수 있음 (**러닝커브**가 낮음)

  - React.js 의 조건부 렌더링

    > '&& 연산자, 삼항 연산자 등' 선택지가 다양함

    ```js
    // && 연산자 방식
    <div>
    	{isVisible && <button>조건에 따라 사라질 버튼</button>}
    </div>
    
    // 삼항 연산자 방식
    <div>
    	{isVisible ? <button>조건에 따라 사라질 버튼</button> : null}
    </div>
    ```

  - Vue.js 의 조건부 렌더링

    > 선택지가 'v-if' 하나밖에 없음

    ```vue
    <div>
    	<button v-if="isVisible">조건에 따라 사라질 버튼</button>
    </div>
    ```

- React.js 에 비해 **미세하지만 속도가 더욱 빠름**

<br>

## [참고자료]

- https://velog.io/@eunnbi/VanilaJS-jQuery-React-Vue-%ED%8A%B9%EC%A7%95
- https://cpro95.tistory.com/530
- https://ahnheejong.name/articles/why-i-prefer-react-over-vuejs/
- https://bingbingba.tistory.com/10
- https://7942yongdae.tistory.com/127