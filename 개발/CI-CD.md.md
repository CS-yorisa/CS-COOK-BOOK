# CI/CD
- CI(Continuous Integration)과 CD(Continuous Delivery/Deployment)를 합쳐서 부르는 용어
    - 자동 빌드 + 자동 배포
- 개발 및 운영팀에서 발생하는 문제를 해결하는 솔루션

## 파이프라인
- 한 데이터 처리 단계의 출력이 다음 단계의 입력으로 이어지는 형태로 연결되는 구조
- 연결된 데이터 처리 단계는 여러 단계가 동시에, 병렬적으로 수행될 수 있음

## CI
- 지속적 통합
- 어플리케이션의 새로운 코드 변경 사항이 정기적으로 빌드 및 테스트 되어 공유 레포지토리에 통합되는 것
- 빌드 및 테스트 자동화 과정
- Git을 통하여 정기적으로 커밋 또는 머지에 실행되도록 할 수 있음
- 버그를 신속하게 찾아 해결, 소프트웨어 품질 개선, 새로운 업데이트의 검증 및 릴리즈 시간 단축을 목표로 함

## CD
- 지속적 제공/배포
- 공유 레포지토리에서 자동으로 Release
- CD는 개발자의 변경사항이 레포지토리를 넘어 고객에게 서비스됨을 의미
- 코드 변경이 이전 파이프라인(CI)를 성공적으로 통과하면, 수동 개입 없이 자동으로 배포하도록 하는 것

# CI/CD의 구현
- 대표적인 CI/CD SW로 Jenkins, Travis VI, Bamboo 등이 있음
- GitHub Action, GitLab CI/CD등을 활용하여서 구현할 수 있음

## Jenkins
- Java로 제작된 오픈소스 CI툴

## [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- GitLab CI/CD에서 build, test, deploy등을 지정하여 실행할 수 있음
```yml
stages:
 - build
 - deploy

build:
 stage: build
 only:
 - repository
 script:
 - docker-compose build
 tags:
 - first

deploy:
 stage: deploy
 only:
 - repository
 script:
 - docker-compose up -d
 tags:
 - first
```
- GitHub의 경우 [GitHub Actions](https://github.com/features/actions)으로 구현할 수 있음
```yml
name: Django CI

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:
 
	runs-on: ubuntu-latest
	strategy:
	  max-parallel: 4
	  matrix:
	    python-version: [3.9, 3.10.1]

	steps:
	- uses: actions/checkout@v2
	- name: Set up Python ${{ matrix.python-version }}
	uses: actions/setup-python@v2
	with: 
	python-version: ${{ matrix.python-version }}
	- name: Install Dependencies
	run: |
	python -m pip install --upgrade pip 
	pip install -r requirements.txt
	- name: Run Tests
	run: |
	python manage.py test
```
- 참조 : https://github.com/mintropy/django-github-action

# DevOps
- DevOps엔지니어는 프로세스, 툴, 방법 등을 도입하여 개발에서 배포, 유지관리, 업데이트에 이르는 소프트웨어 개발 전체에 걸쳐 요구 사항 간의 균형을 맞추는 작업
- DevOps에서는 프로세스의 통일 및 자동화가 핵심
- CI/CD를 포함하여 보안 등 작업을 함

# 참조
- https://www.redhat.com/ko/topics/devops/what-is-ci-cd
- https://www.redhat.com/ko/topics/devops/devops-engineer
- https://artist-developer.tistory.com/24