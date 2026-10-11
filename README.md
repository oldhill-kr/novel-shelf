# 소설 서고

소설 원고(`novels/`)를 읽어서 보여주는 정적 웹 페이지입니다. 서버·빌드 없이 `index.html` 하나와 데이터 파일로 동작합니다.

## 구조

```
index.html              보여주는 프로그램 (서고 → 작품 회차표 → 열람실)
novels/index.json       작품 목록과 표시 순서·색(a/b/c)
novels/<작품>/meta.json 제목, 장르, 줄거리, 회차 목록
novels/<작품>/NN.md     회차 본문 (빈 줄=문단, `* * *`=장면 전환)
novels/<작품>/cover.jpg 표지
```

## 새 회차 추가

1. `novels/<작품>/` 에 본문 `NN.md` 를 넣습니다.
2. 같은 폴더 `meta.json` 의 `episodes` 끝에 `{"file":"06.md","label":"6화","title":"제목","chars":글자수}` 를 추가합니다.
3. 커밋·푸시하면 끝.

## 새 작품 추가

`novels/<새이름>/` 에 `meta.json`, `cover.jpg`, 본문을 만들고 `novels/index.json` 에 `{"id":"<새이름>","color":"a"}` 를 추가합니다.

## 로컬에서 보기

`서고 열기.bat` 을 실행하면 http://127.0.0.1:8770 이 열립니다 (Python 필요). `index.html` 을 더블클릭으로 직접 열면 브라우저 보안 때문에 본문을 못 불러옵니다.

읽은 회차·이어 읽기·글자 크기는 각자 브라우저에만 저장됩니다.
